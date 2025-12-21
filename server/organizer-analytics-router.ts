import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getOrganizerFeedbackStats, getOrganizerEventFeedback } from "./organizer-feedback-stats-db";

export const organizerAnalyticsRouter = router({
  /**
   * Get aggregated feedback stats for all organizers (admin only)
   */
  getFeedbackStats: protectedProcedure
    .input(z.object({ 
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }).optional())
    .query(async ({ ctx, input }) => {
    // Only admins can view organizer analytics
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const dateRange = input ? {
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined
    } : undefined;
    
    return await getOrganizerFeedbackStats(dateRange);
  }),

  /**
   * Get feedback breakdown by event for a specific organizer (admin only)
   */
  getEventFeedback: protectedProcedure
    .input(z.object({ 
      organizerName: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
      // Only admins can view organizer analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const dateRange = {
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined
      };
      
      return await getOrganizerEventFeedback(input.organizerName, dateRange);
    }),
});
