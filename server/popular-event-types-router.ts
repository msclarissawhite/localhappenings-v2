/**
 * Popular Event Types tRPC Router
 */

import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";
import {
  getPopularEventTypes,
  getPopularEventTypesByCategory,
  getAllEventTypeUsageCounts,
} from "./popular-event-types-db";

export const popularEventTypesRouter = router({
  /**
   * Get most popular event types overall
   */
  getPopular: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(10),
    }).optional())
    .query(async ({ input }) => {
      const limit = input?.limit || 10;
      return await getPopularEventTypes(limit);
    }),

  /**
   * Get popular event types by category
   */
  getPopularByCategory: publicProcedure
    .input(z.object({
      category: z.string(),
      limit: z.number().min(1).max(20).default(5),
    }))
    .query(async ({ input }) => {
      return await getPopularEventTypesByCategory(input.category, input.limit);
    }),

  /**
   * Get usage counts for all event types (admin analytics)
   */
  getAllUsageCounts: publicProcedure
    .query(async () => {
      return await getAllEventTypeUsageCounts();
    }),
});
