import { z } from "zod";
import { router, publicProcedure } from "./_core/trpc";

// Accessibility schema (same as events)
const accessibilitySchema = z.object({
  caregiver: z.object({
    changeTablesPresent: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    nursingFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    strollerSpace: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  mobility: z.object({
    wheelchairEntrance: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    stepFreeEntry: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    accessibleWashrooms: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  sensory: z.object({
    sensoryFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    quietRoom: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    quietEnvironment: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  cognitive: z.object({
    signLanguage: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    visualAids: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  social: z.object({
    genderNeutralWashrooms: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    lgbtqiaFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    scentFree: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
});

export const savedLocationsRouter = router({
  /**
   * Get all saved locations for the current organizer
   */
  getAll: publicProcedure
    .input(z.object({
      organizerId: z.number(),
    }))
    .query(async ({ input }) => {
      const { getSavedLocationsByOrganizerId } = await import("./saved-locations-db");
      return await getSavedLocationsByOrganizerId(input.organizerId);
    }),

  /**
   * Get a single saved location by ID
   */
  getById: publicProcedure
    .input(z.object({
      id: z.number(),
      organizerId: z.number(),
    }))
    .query(async ({ input }) => {
      const { getSavedLocationById } = await import("./saved-locations-db");
      return await getSavedLocationById(input.id, input.organizerId);
    }),

  /**
   * Create a new saved location
   */
  create: publicProcedure
    .input(z.object({
      organizerId: z.number(),
      name: z.string().min(1, "Location name is required"),
      province: z.string().min(1, "Province is required"),
      municipality: z.string().min(1, "Municipality is required"),
      neighborhoodCommunity: z.string().optional(),
      venue: z.string().optional(),
      address: z.string().optional(),
      accessibility: accessibilitySchema,
      isIndoor: z.boolean().optional(),
      isOutdoor: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { createSavedLocation } = await import("./saved-locations-db");
      
      const location = await createSavedLocation({
        organizerId: input.organizerId,
        name: input.name,
        province: input.province,
        municipality: input.municipality,
        neighborhoodCommunity: input.neighborhoodCommunity || null,
        venue: input.venue || null,
        address: input.address || null,
        accessibility: JSON.stringify(input.accessibility),
        isIndoor: input.isIndoor ? 1 : 0,
        isOutdoor: input.isOutdoor ? 1 : 0,
      });
      
      return { success: true, location };
    }),

  /**
   * Update an existing saved location
   */
  update: publicProcedure
    .input(z.object({
      id: z.number(),
      organizerId: z.number(),
      name: z.string().min(1, "Location name is required").optional(),
      province: z.string().optional(),
      municipality: z.string().optional(),
      neighborhoodCommunity: z.string().optional(),
      venue: z.string().optional(),
      address: z.string().optional(),
      accessibility: accessibilitySchema.optional(),
      isIndoor: z.boolean().optional(),
      isOutdoor: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { updateSavedLocation } = await import("./saved-locations-db");
      
      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.province !== undefined) updateData.province = input.province;
      if (input.municipality !== undefined) updateData.municipality = input.municipality;
      if (input.neighborhoodCommunity !== undefined) updateData.neighborhoodCommunity = input.neighborhoodCommunity || null;
      if (input.venue !== undefined) updateData.venue = input.venue || null;
      if (input.address !== undefined) updateData.address = input.address || null;
      if (input.accessibility !== undefined) updateData.accessibility = JSON.stringify(input.accessibility);
      if (input.isIndoor !== undefined) updateData.isIndoor = input.isIndoor ? 1 : 0;
      if (input.isOutdoor !== undefined) updateData.isOutdoor = input.isOutdoor ? 1 : 0;
      
      await updateSavedLocation(input.id, input.organizerId, updateData);
      
      return { success: true };
    }),

  /**
   * Set a location as the default
   */
  setDefault: publicProcedure
    .input(z.object({
      id: z.number(),
      organizerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { setDefaultLocation } = await import("./saved-locations-db");
      await setDefaultLocation(input.id, input.organizerId);
      return { success: true };
    }),

  /**
   * Get the default location for an organizer
   */
  getDefault: publicProcedure
    .input(z.object({
      organizerId: z.number(),
    }))
    .query(async ({ input }) => {
      const { getDefaultLocation } = await import("./saved-locations-db");
      return await getDefaultLocation(input.organizerId);
    }),

  /**
   * Delete a saved location
   */
  delete: publicProcedure
    .input(z.object({
      id: z.number(),
      organizerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { deleteSavedLocation } = await import("./saved-locations-db");
      await deleteSavedLocation(input.id, input.organizerId);
      return { success: true };
    }),
});
