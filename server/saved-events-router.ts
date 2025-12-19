import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  saveEvent,
  unsaveEvent,
  getUserSavedEvents,
  isEventSaved,
} from "./saved-events-db";

export const savedEventsRouter = router({
  /**
   * Save/bookmark an event
   */
  save: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        reminderPreference: z.enum(["none", "24h", "48h", "both"]).default("24h"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await saveEvent(ctx.user.id, input.eventId, input.reminderPreference);
      return { success: true };
    }),

  /**
   * Remove a saved event
   */
  unsave: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await unsaveEvent(ctx.user.id, input.eventId);
      return { success: true };
    }),

  /**
   * Get all saved events for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return await getUserSavedEvents(ctx.user.id);
  }),

  /**
   * Check if an event is saved
   */
  isSaved: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await isEventSaved(ctx.user.id, input.eventId);
    }),
});
