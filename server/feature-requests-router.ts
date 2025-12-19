import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getAllFeatureRequests,
  getFeatureRequestById,
  createFeatureRequest,
  updateFeatureRequestStatus,
  upvoteFeatureRequest,
  removeUpvote,
  updateClickUpDetails,
} from "./feature-requests-db";
import { createClickUpTask, updateClickUpUpvotes, updateClickUpStatus } from "./clickup-integration";
import { TRPCError } from "@trpc/server";

export const featureRequestsRouter = router({
  /**
   * List all feature requests (public, but shows upvote status if logged in)
   */
  list: publicProcedure.query(async ({ ctx }) => {
    const userId = ctx.user?.id;
    return await getAllFeatureRequests(userId);
  }),

  /**
   * Get a single feature request by ID
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const request = await getFeatureRequestById(input.id);
      if (!request) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Feature request not found" });
      }
      return request;
    }),

  /**
   * Submit a new feature request (public - can be anonymous or authenticated)
   */
  submit: publicProcedure
    .input(
      z.object({
        title: z.string().min(5).max(255),
        description: z.string().min(20),
        submitterName: z.string().optional(),
        submitterEmail: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.user?.id;
      
      // If not authenticated, require name and email
      if (!userId && (!input.submitterName || !input.submitterEmail)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Name and email are required for anonymous submissions",
        });
      }

      const id = await createFeatureRequest({
        title: input.title,
        description: input.description,
        userId,
        submitterName: input.submitterName,
        submitterEmail: input.submitterEmail,
      });

      // Create ClickUp task
      try {
        const submitterInfo = userId 
          ? `User ID: ${userId}`
          : `${input.submitterName} (${input.submitterEmail})`;
        
        const { taskId, taskUrl } = await createClickUpTask({
          title: input.title,
          description: input.description,
          submitterInfo,
        });

        // Update feature request with ClickUp details
        await updateClickUpDetails(id, taskId, taskUrl);
      } catch (error) {
        console.error("Failed to create ClickUp task:", error);
        // Continue anyway - feature request is still created
      }

      return { id };
    }),

  /**
   * Upvote a feature request (requires authentication)
   */
  upvote: protectedProcedure
    .input(z.object({ featureRequestId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        await upvoteFeatureRequest(input.featureRequestId, ctx.user.id);
        
        // Sync upvote count to ClickUp
        try {
          const request = await getFeatureRequestById(input.featureRequestId);
          if (request?.clickupTaskId) {
            await updateClickUpUpvotes(request.clickupTaskId, request.upvoteCount);
          }
        } catch (error) {
          console.error("Failed to sync upvotes to ClickUp:", error);
        }
        
        return { success: true };
      } catch (error: any) {
        if (error.message === "Already upvoted") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You have already upvoted this request",
          });
        }
        throw error;
      }
    }),

  /**
   * Remove upvote from a feature request (requires authentication)
   */
  removeUpvote: protectedProcedure
    .input(z.object({ featureRequestId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await removeUpvote(input.featureRequestId, ctx.user.id);
      return { success: true };
    }),

  /**
   * Update feature request status (admin only)
   */
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "under_review", "planned", "in_progress", "completed", "declined"]),
        adminNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      await updateFeatureRequestStatus(input.id, input.status, input.adminNotes);
      
      // Sync status to ClickUp
      try {
        const request = await getFeatureRequestById(input.id);
        if (request?.clickupTaskId) {
          await updateClickUpStatus(request.clickupTaskId, input.status);
        }
      } catch (error) {
        console.error("Failed to sync status to ClickUp:", error);
      }
      
      return { success: true };
    }),
});
