import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import * as seriesDb from "./series-db";
import { findOrganizerByEmail } from "./organizer-db";

export const seriesRouter = router({
  /**
   * Get all series for the logged-in organizer
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    // Get organizer by email
    const organizer = await findOrganizerByEmail(ctx.user.email || "");
    if (!organizer) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Organizer account not found",
      });
    }

    return await seriesDb.getSeriesByOrganizer(organizer.id);
  }),

  /**
   * Get a single series by ID (with event count)
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const series = await seriesDb.getSeriesById(input.id);
      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      const eventCount = await seriesDb.countEventsBySeries(input.id);
      return { ...series, eventCount };
    }),

  /**
   * Get a single series by slug (with events)
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const series = await seriesDb.getSeriesBySlug(input.slug);
      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      const seriesEvents = await seriesDb.getEventsBySeries(series.id);
      return { ...series, events: seriesEvents };
    }),

  /**
   * Create a new series
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Series name is required"),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get organizer by email
      const organizer = await findOrganizerByEmail(ctx.user.email || "");
      if (!organizer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organizer account not found",
        });
      }

      // Generate slug from name
      let slug = seriesDb.generateSlug(input.name);
      let slugSuffix = 1;

      // Ensure slug is unique
      while (!(await seriesDb.isSlugAvailable(slug))) {
        slug = `${seriesDb.generateSlug(input.name)}-${slugSuffix}`;
        slugSuffix++;
      }

      const seriesId = await seriesDb.createSeries({
        name: input.name,
        description: input.description,
        slug,
        organizerId: organizer.id,
        imageUrl: input.imageUrl,
      });

      return { id: seriesId, slug };
    }),

  /**
   * Update a series
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "Series name is required").optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        isActive: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get organizer by email
      const organizer = await findOrganizerByEmail(ctx.user.email || "");
      if (!organizer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organizer account not found",
        });
      }

      // Verify ownership
      const series = await seriesDb.getSeriesById(input.id);
      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      if (series.organizerId !== organizer.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own series",
        });
      }

      // If name is being updated, regenerate slug
      let slug: string | undefined;
      if (input.name && input.name !== series.name) {
        slug = seriesDb.generateSlug(input.name);
        let slugSuffix = 1;

        // Ensure slug is unique (excluding current series)
        while (!(await seriesDb.isSlugAvailable(slug, input.id))) {
          slug = `${seriesDb.generateSlug(input.name)}-${slugSuffix}`;
          slugSuffix++;
        }
      }

      await seriesDb.updateSeries(input.id, {
        name: input.name,
        description: input.description,
        slug,
        imageUrl: input.imageUrl,
        isActive: input.isActive,
      });

      return { success: true };
    }),

  /**
   * Delete a series
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Get organizer by email
      const organizer = await findOrganizerByEmail(ctx.user.email || "");
      if (!organizer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organizer account not found",
        });
      }

      // Verify ownership
      const series = await seriesDb.getSeriesById(input.id);
      if (!series) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Series not found",
        });
      }

      if (series.organizerId !== organizer.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only delete your own series",
        });
      }

      await seriesDb.deleteSeries(input.id);
      return { success: true };
    }),

  /**
   * Link an event to a series
   */
  linkEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        seriesId: z.number().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get organizer by email
      const organizer = await findOrganizerByEmail(ctx.user.email || "");
      if (!organizer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Organizer account not found",
        });
      }

      // If seriesId is provided, verify ownership of the series
      if (input.seriesId) {
        const series = await seriesDb.getSeriesById(input.seriesId);
        if (!series) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Series not found",
          });
        }

        if (series.organizerId !== organizer.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only link events to your own series",
          });
        }
      }

      await seriesDb.linkEventToSeries(input.eventId, input.seriesId);
      return { success: true };
    }),
});
