import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eventFeedback } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";
import { syncFeedbackToClickUp } from "./clickup-feedback-sync";

export const feedbackRouter = router({
  /**
   * Submit feedback for an event (public, anonymous)
   */
  submit: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        attended: z.boolean(),
        accuracyRating: z.number().min(1).max(5).optional(),
        helpfulDetails: z.array(z.string()).optional(),
        inaccurateDetails: z.array(z.string()).optional(),
        comments: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Insert feedback
      const [feedback] = await db.insert(eventFeedback).values({
        eventId: input.eventId,
        attended: input.attended ? 1 : 0,
        accuracyRating: input.accuracyRating,
        helpfulDetails: input.helpfulDetails ? JSON.stringify(input.helpfulDetails) : null,
        inaccurateDetails: input.inaccurateDetails ? JSON.stringify(input.inaccurateDetails) : null,
        comments: input.comments,
        syncedToClickUp: 0,
      });

      // Trigger ClickUp sync asynchronously (don't wait for it)
      const feedbackData = {
        id: feedback.insertId,
        eventId: input.eventId,
        attended: input.attended ? 1 : 0,
        accuracyRating: input.accuracyRating || null,
        helpfulDetails: input.helpfulDetails ? JSON.stringify(input.helpfulDetails) : null,
        inaccurateDetails: input.inaccurateDetails ? JSON.stringify(input.inaccurateDetails) : null,
        comments: input.comments || null,
        submittedAt: new Date(),
      };
      
      syncFeedbackToClickUp(feedbackData).catch((error) => {
        console.error("[Feedback] Failed to sync to ClickUp:", error);
      });

      return { success: true, feedbackId: feedback.insertId };
    }),

  /**
   * Get feedback statistics for an event (public)
   */
  getStats: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const stats = await db
        .select({
          totalFeedback: sql<number>`COUNT(*)`,
          attendedCount: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
          avgAccuracy: sql<number>`AVG(CASE WHEN attended = 1 THEN accuracyRating ELSE NULL END)`,
        })
        .from(eventFeedback)
        .where(eq(eventFeedback.eventId, input.eventId));

      return stats[0] || { totalFeedback: 0, attendedCount: 0, avgAccuracy: null };
    }),

  /**
   * Get all feedback for an event (admin only)
   */
  getForEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Only admins can view individual feedback
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const feedback = await db
        .select()
        .from(eventFeedback)
        .where(eq(eventFeedback.eventId, input.eventId))
        .orderBy(sql`submittedAt DESC`);

      // Parse JSON fields
      return feedback.map((f) => ({
        ...f,
        attended: f.attended === 1,
        syncedToClickUp: f.syncedToClickUp === 1,
        helpfulDetails: f.helpfulDetails ? JSON.parse(f.helpfulDetails as string) : [],
        inaccurateDetails: f.inaccurateDetails ? JSON.parse(f.inaccurateDetails as string) : [],
      }));
    }),

  /**
   * Get feedback that needs ClickUp sync (admin only, for background job)
   */
  getPendingSync: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const pending = await db
      .select()
      .from(eventFeedback)
      .where(eq(eventFeedback.syncedToClickUp, 0))
      .limit(50); // Process in batches

    return pending.map((f) => ({
      ...f,
      attended: f.attended === 1,
      syncedToClickUp: f.syncedToClickUp === 1,
      helpfulDetails: f.helpfulDetails ? JSON.parse(f.helpfulDetails as string) : [],
      inaccurateDetails: f.inaccurateDetails ? JSON.parse(f.inaccurateDetails as string) : [],
    }));
  }),

  /**
   * Mark feedback as synced to ClickUp (admin only)
   */
  markSynced: protectedProcedure
    .input(z.object({ feedbackId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(eventFeedback)
        .set({
          syncedToClickUp: 1,
          clickUpSyncedAt: new Date(),
        })
        .where(eq(eventFeedback.id, input.feedbackId));

      return { success: true };
    }),
});
