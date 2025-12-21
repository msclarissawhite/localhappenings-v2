import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getOrganizerFeedbackStats, getOrganizerEventFeedback } from "./organizer-feedback-stats-db";

export const organizerAnalyticsRouter = router({
  /**
   * Get aggregated feedback stats for all organizers (admin only)
   */
  getFeedbackStats: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view organizer analytics
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    return await getOrganizerFeedbackStats();
  }),

  /**
   * Get feedback breakdown by event for a specific organizer (admin only)
   */
  getEventFeedback: protectedProcedure
    .input(z.object({ organizerName: z.string() }))
    .query(async ({ ctx, input }) => {
      // Only admins can view organizer analytics
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      return await getOrganizerEventFeedback(input.organizerName);
    }),
});
