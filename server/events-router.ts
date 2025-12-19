import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as eventsDb from "./events-db";
import type { AccessibilityData } from "../shared/types";
import { notifyOwner } from "./_core/notification";

// Validation schemas
const accessibilitySchema = z.object({
  caregiver: z.object({
    changeTablesPresent: z.enum(["yes", "no", "unknown"]).optional(),
    changeTablesAllWashrooms: z.enum(["yes", "no", "unknown"]).optional(),
    nursingFriendly: z.enum(["yes", "no", "unknown"]).optional(),
    privateFeedingArea: z.enum(["yes", "no", "unknown"]).optional(),
    bottleWarming: z.enum(["yes", "no", "unknown"]).optional(),
    highChairs: z.enum(["yes", "no", "unknown"]).optional(),
    strollerSpace: z.enum(["yes", "no", "unknown"]).optional(),
    storage: z.enum(["yes", "no", "unknown"]).optional(),
  }).optional(),
  mobility: z.object({
    strollerAccessible: z.enum(["yes", "no", "unknown"]).optional(),
    wheelchairEntrance: z.enum(["yes", "no", "unknown"]).optional(),
    stepFreeEntry: z.enum(["yes", "no", "unknown"]).optional(),
    elevatorAccess: z.enum(["yes", "no", "unknown"]).optional(),
    wideDoorways: z.enum(["yes", "no", "unknown"]).optional(),
    accessibleSeating: z.enum(["yes", "no", "unknown"]).optional(),
    accessibleWashrooms: z.enum(["yes", "no", "unknown"]).optional(),
    accessibleParking: z.enum(["yes", "no", "unknown"]).optional(),
    terrainInfo: z.enum(["flat", "gravel", "hills", "unknown"]).optional(),
    parkingDistance: z.enum(["short", "moderate", "long", "unknown"]).optional(),
  }).optional(),
  sensory: z.object({
    sensoryFriendly: z.enum(["yes", "no", "unknown"]).optional(),
    quietEnvironment: z.enum(["yes", "no", "unknown"]).optional(),
    loudNoises: z.enum(["yes", "no", "unknown"]).optional(),
    flashingLights: z.enum(["yes", "no", "unknown"]).optional(),
    crowdLevel: z.enum(["spacious", "moderate", "crowded", "unknown"]).optional(),
    quietRoom: z.enum(["yes", "no", "unknown"]).optional(),
    sensoryTimeSlot: z.enum(["yes", "no", "unknown"]).optional(),
    predictableSchedule: z.enum(["yes", "no", "unknown"]).optional(),
  }).optional(),
  cognitive: z.object({
    clearSignage: z.enum(["yes", "no", "unknown"]).optional(),
    simpleInstructions: z.enum(["yes", "no", "unknown"]).optional(),
    writtenMaterials: z.enum(["yes", "no", "unknown"]).optional(),
    aslInterpretation: z.enum(["yes", "no", "unknown"]).optional(),
    liveCaptions: z.enum(["yes", "no", "unknown"]).optional(),
    multilingualSupport: z.enum(["yes", "no", "unknown"]).optional(),
  }).optional(),
  social: z.object({
    genderNeutralWashrooms: z.enum(["yes", "no", "unknown"]).optional(),
    lgbtqiaFriendly: z.enum(["yes", "no", "unknown"]).optional(),
    maskFriendly: z.enum(["yes", "no", "unknown"]).optional(),
    scentFree: z.enum(["yes", "no", "unknown"]).optional(),
    alcoholFree: z.enum(["yes", "no", "unknown"]).optional(),
    substanceFree: z.enum(["yes", "no", "unknown"]).optional(),
    traumaInformed: z.enum(["yes", "no", "unknown"]).optional(),
  }).optional(),
});

const eventFiltersSchema = z.object({
  province: z.string().optional(),
  city: z.string().optional(),
  neighborhood: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "all-day"]).optional(),
  isRecurring: z.boolean().optional(),
  today: z.boolean().optional(),
  tomorrow: z.boolean().optional(),
  thisWeekend: z.boolean().optional(),
  thisWeek: z.boolean().optional(),
  thisMonth: z.boolean().optional(),
  isFree: z.boolean().optional(),
  costMax: z.number().optional(),
  familyFriendly: z.boolean().optional(),
  youngChildren: z.boolean().optional(),
  kids: z.boolean().optional(),
  teens: z.boolean().optional(),
  seniors: z.boolean().optional(),
  isIndoor: z.boolean().optional(),
  isOutdoor: z.boolean().optional(),
  eventTypeIds: z.array(z.number()).optional(),
  sortBy: z.enum(["soonest", "latest", "name-az", "name-za"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const submitEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  neighborhood: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "all-day"]).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(["one-time", "weekly", "monthly", "seasonal"]).default("one-time"),
  isFree: z.boolean().default(false),
  costMin: z.number().optional(),
  costMax: z.number().optional(),
  costType: z.enum(["fixed", "range", "donation", "pay-what-you-can", "sliding-scale"]).optional(),
  kidsFree: z.boolean().default(false),
  freeCompanion: z.boolean().default(false),
  allAges: z.boolean().default(false),
  familyFriendly: z.boolean().default(false),
  youngChildren: z.boolean().default(false),
  kids: z.boolean().default(false),
  teens: z.boolean().default(false),
  adultsOnly: z.boolean().default(false),
  seniors: z.boolean().default(false),
  isIndoor: z.boolean().default(false),
  isOutdoor: z.boolean().default(false),
  shortDuration: z.boolean().default(false),
  dropIn: z.boolean().default(false),
  canReenter: z.boolean().default(false),
  accessibility: accessibilitySchema,
  organizerName: z.string().optional(),
  organizerType: z.enum(["business", "nonprofit", "community", "municipality", "school-library", "other"]).optional(),
  organizerEmail: z.string().email().optional().or(z.literal("")),
  organizerPhone: z.string().optional(),
  organizerWebsite: z.string().url().optional().or(z.literal("")),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const eventsRouter = router({
  // Public: List events with filters
  list: publicProcedure.input(eventFiltersSchema).query(async ({ input }) => {
    return await eventsDb.getEvents(input);
  }),

  // Public: Get single event
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const event = await eventsDb.getEventById(input.id);
    if (!event) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
    }
    return event;
  }),

  // Public: Get event types
  getEventTypes: publicProcedure.query(async () => {
    return await eventsDb.getAllEventTypes();
  }),

  // Public: Get locations for filters
  getLocations: publicProcedure.query(async () => {
    return await eventsDb.getLocations();
  }),

  // Public: Submit event
  submit: publicProcedure.input(submitEventSchema).mutation(async ({ input, ctx }) => {
    const eventData = {
      ...input,
      isRecurring: input.isRecurring ? 1 : 0,
      isFree: input.isFree ? 1 : 0,
      kidsFree: input.kidsFree ? 1 : 0,
      freeCompanion: input.freeCompanion ? 1 : 0,
      allAges: input.allAges ? 1 : 0,
      familyFriendly: input.familyFriendly ? 1 : 0,
      youngChildren: input.youngChildren ? 1 : 0,
      kids: input.kids ? 1 : 0,
      teens: input.teens ? 1 : 0,
      adultsOnly: input.adultsOnly ? 1 : 0,
      seniors: input.seniors ? 1 : 0,
      isIndoor: input.isIndoor ? 1 : 0,
      isOutdoor: input.isOutdoor ? 1 : 0,
      shortDuration: input.shortDuration ? 1 : 0,
      dropIn: input.dropIn ? 1 : 0,
      canReenter: input.canReenter ? 1 : 0,
      accessibility: JSON.stringify(input.accessibility),
      submittedBy: ctx.user?.id || null,
      status: "pending" as const,
    };

    const eventId = await eventsDb.createEvent(eventData);
    
    // Notify admin of new submission
    try {
      await notifyOwner({
        title: "New Event Submission",
        content: `A new event "${input.name}" has been submitted for review in ${input.city}, ${input.province}.`,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the submission if notification fails
    }
    
    return { success: true, eventId };
  }),

  // Admin: Get pending events
  getPending: adminProcedure.query(async () => {
    return await eventsDb.getPendingEvents();
  }),

  // Admin: Update event status
  updateStatus: adminProcedure
    .input(
      z.object({
        eventId: z.number(),
        status: z.enum(["published", "rejected", "needs-clarification"]),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await eventsDb.updateEventStatus(input.eventId, input.status, ctx.user.id, input.reviewNotes);
      return { success: true };
    }),

  // Admin: Update event
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: submitEventSchema.partial(),
      })
    )
    .mutation(async ({ input }) => {
      const updateData: any = { ...input.data };
      
      // Convert booleans to integers
      const boolFields = [
        "isRecurring", "isFree", "kidsFree", "freeCompanion", "allAges",
        "familyFriendly", "youngChildren", "kids", "teens", "adultsOnly",
        "seniors", "isIndoor", "isOutdoor", "shortDuration", "dropIn", "canReenter"
      ];
      
      boolFields.forEach(field => {
        if (field in updateData && typeof updateData[field] === "boolean") {
          updateData[field] = updateData[field] ? 1 : 0;
        }
      });
      
      if (updateData.accessibility) {
        updateData.accessibility = JSON.stringify(updateData.accessibility);
      }

      await eventsDb.updateEvent(input.id, updateData);
      return { success: true };
    }),

  // Admin: Delete event
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await eventsDb.deleteEvent(input.id);
    return { success: true };
  }),

  // Public: Get collections
  getCollections: publicProcedure.query(async () => {
    return await eventsDb.getCollections();
  }),

  // Public: Get collection events
  getCollectionEvents: publicProcedure.input(z.object({ collectionId: z.number() })).query(async ({ input }) => {
    return await eventsDb.getCollectionEvents(input.collectionId);
  }),
});
