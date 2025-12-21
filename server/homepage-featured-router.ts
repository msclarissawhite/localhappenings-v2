import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { homepageFeaturedEvents, events } from "../drizzle/schema";
import { eq, desc, asc, and, gte } from "drizzle-orm";

export const homepageFeaturedRouter = router({
  /**
   * Get featured events for homepage carousel
   * Returns manually curated events if available, otherwise falls back to closest upcoming events
   */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    // First, try to get manually curated featured events
    const featured = await db
      .select({
        id: homepageFeaturedEvents.id,
        eventId: homepageFeaturedEvents.eventId,
        subtitle: homepageFeaturedEvents.subtitle,
        sortOrder: homepageFeaturedEvents.sortOrder,
        event: events,
      })
      .from(homepageFeaturedEvents)
      .innerJoin(events, eq(homepageFeaturedEvents.eventId, events.id))
      .where(
        and(
          eq(events.status, "published"),
          gte(events.startDate, new Date())
        )
      )
      .orderBy(asc(homepageFeaturedEvents.sortOrder));
    
    // If we have curated events, return them with subtitles
    if (featured.length > 0) {
      return featured.map(f => ({ ...f.event, subtitle: f.subtitle }));
    }
    
    // Otherwise, fall back to closest upcoming events
    const upcomingEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.status, "published"),
          gte(events.startDate, new Date())
        )
      )
      .orderBy(asc(events.startDate))
      .limit(5);
    
    return upcomingEvents;
  }),

  /**
   * Get all featured events (admin only)
   */
  listAll: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
    
    const featured = await db
      .select({
        id: homepageFeaturedEvents.id,
        eventId: homepageFeaturedEvents.eventId,
        subtitle: homepageFeaturedEvents.subtitle,
        sortOrder: homepageFeaturedEvents.sortOrder,
        event: events,
      })
      .from(homepageFeaturedEvents)
      .innerJoin(events, eq(homepageFeaturedEvents.eventId, events.id))
      .orderBy(asc(homepageFeaturedEvents.sortOrder));
    
    return featured;
  }),

  /**
   * Add event to featured carousel
   */
  add: adminProcedure
    .input(z.object({
      eventId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Check if event exists and is published
      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, input.eventId))
        .limit(1);
      
      if (event.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Event not found",
        });
      }
      
      if (event[0].status !== "published") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only published events can be featured",
        });
      }
      
      // Check if already featured
      const existing = await db
        .select()
        .from(homepageFeaturedEvents)
        .where(eq(homepageFeaturedEvents.eventId, input.eventId))
        .limit(1);
      
      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Event is already featured",
        });
      }
      
      // Get max sort order
      const maxSort = await db
        .select({ sortOrder: homepageFeaturedEvents.sortOrder })
        .from(homepageFeaturedEvents)
        .orderBy(desc(homepageFeaturedEvents.sortOrder))
        .limit(1);
      
      const nextSortOrder = maxSort.length > 0 ? maxSort[0].sortOrder + 1 : 0;
      
      // Add to featured
      await db.insert(homepageFeaturedEvents).values({
        eventId: input.eventId,
        sortOrder: nextSortOrder,
      });
      
      return { success: true };
    }),

  /**
   * Remove event from featured carousel
   */
  remove: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .delete(homepageFeaturedEvents)
        .where(eq(homepageFeaturedEvents.id, input.id));
      
      return { success: true };
    }),

  /**
   * Reorder featured events
   */
  reorder: adminProcedure
    .input(z.object({
      items: z.array(z.object({
        id: z.number(),
        sortOrder: z.number(),
      })),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Update each item's sort order
      for (const item of input.items) {
        await db
          .update(homepageFeaturedEvents)
          .set({ sortOrder: item.sortOrder })
          .where(eq(homepageFeaturedEvents.id, item.id));
      }
      
      return { success: true };
    }),

  /**
   * Update subtitle for a featured event
   */
  updateSubtitle: adminProcedure
    .input(z.object({
      id: z.number(),
      subtitle: z.string().nullable(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .update(homepageFeaturedEvents)
        .set({ subtitle: input.subtitle })
        .where(eq(homepageFeaturedEvents.id, input.id));
      
      return { success: true };
    }),
});
