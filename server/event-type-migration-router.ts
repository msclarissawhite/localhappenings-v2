/**
 * Event Type Migration tRPC Router
 * 
 * Provides API endpoints for the admin bulk reassignment tool
 */

import { z } from "zod";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import {
  getEventsByDeprecatedTypes,
  getDeprecatedTypeUsageCounts,
  migrateEventTypes,
  getEventTypes,
} from "./event-type-migration-db";
import { migrationSuggestions } from "../shared/event-type-migration-suggestions";

export const eventTypeMigrationRouter = router({
  /**
   * Get all migration suggestions (mapping of deprecated types to replacements)
   */
  getMigrationSuggestions: publicProcedure.query(async () => {
    return migrationSuggestions;
  }),

  /**
   * Get events grouped by deprecated type
   * Returns events currently using deprecated types
   */
  getEventsByDeprecatedTypes: adminProcedure.query(async () => {
    return await getEventsByDeprecatedTypes();
  }),

  /**
   * Get count of events using each deprecated type
   */
  getDeprecatedTypeUsageCounts: adminProcedure.query(async () => {
    return await getDeprecatedTypeUsageCounts();
  }),

  /**
   * Get all event types for a specific event
   */
  getEventTypes: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      return await getEventTypes(input.eventId);
    }),

  /**
   * Migrate events from deprecated type to new types
   */
  migrateEvents: adminProcedure
    .input(
      z.object({
        eventIds: z.array(z.number()).min(1, "Must select at least one event"),
        deprecatedTypeId: z.number(),
        newTypeIds: z.array(z.number()).min(1, "Must select at least one replacement type"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await migrateEventTypes(
        input.eventIds,
        input.deprecatedTypeId,
        input.newTypeIds
      );

      return {
        success: true,
        ...result,
      };
    }),
});
