import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as eventsDb from "./events-db";
import type { AccessibilityData } from "../shared/types";
import { notifyOwner } from "./_core/notification";
import { notifySubmitterStatusChange } from "./_core/email-notification";
import { notifyOrganizerStatusChange } from "./_core/organizer-email";
import { generateEventInstances, generateRecurringDates, type RecurrencePattern } from "./recurring-events";
import * as analyticsDb from "./analytics-db";
import { findPotentialDuplicates } from "./duplicate-detection";

// Validation schemas
const accessibilitySchema = z.object({
  caregiver: z.object({
    changeTablesPresent: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    changeTablesAllWashrooms: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    nursingFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    privateFeedingArea: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    bottleWarming: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    highChairs: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    strollerSpace: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    storage: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  mobility: z.object({
    strollerAccessible: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    wheelchairEntrance: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    stepFreeEntry: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    elevatorAccess: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    wideDoorways: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    accessibleSeating: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    accessibleWashrooms: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    accessibleParking: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    terrainInfo: z.enum(["flat", "gravel", "hills", "unknown", "not-relevant"]).optional(),
    parkingDistance: z.enum(["short", "moderate", "long", "unknown", "not-relevant"]).optional(),
  }).optional(),
  sensory: z.object({
    sensoryFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    quietEnvironment: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    loudNoises: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    flashingLights: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    crowdLevel: z.enum(["spacious", "moderate", "crowded", "unknown", "not-relevant"]).optional(),
    quietRoom: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    sensoryTimeSlot: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    predictableSchedule: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  cognitive: z.object({
    clearSignage: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    simpleInstructions: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    writtenMaterials: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    aslInterpretation: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    liveCaptions: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    multilingualSupport: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
  social: z.object({
    genderNeutralWashrooms: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    lgbtqiaFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    maskFriendly: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    scentFree: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    alcoholFree: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    substanceFree: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    traumaInformed: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
  }).optional(),
});

const eventFiltersSchema = z.object({
  search: z.string().optional(),
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
  allAges: z.boolean().optional(),
  familyFriendly: z.boolean().optional(),
  youngChildren: z.boolean().optional(),
  kids: z.boolean().optional(),
  teens: z.boolean().optional(),
  adultsOnly: z.boolean().optional(),
  seniors: z.boolean().optional(),
  isIndoor: z.boolean().optional(),
  isOutdoor: z.boolean().optional(),
  changeTablesPresent: z.boolean().optional(),
  nursingFriendly: z.boolean().optional(),
  strollerSpace: z.boolean().optional(),
  wheelchairEntrance: z.boolean().optional(),
  stepFreeEntry: z.boolean().optional(),
  accessibleWashrooms: z.boolean().optional(),
  sensoryFriendly: z.boolean().optional(),
  quietRoom: z.boolean().optional(),
  quietEnvironment: z.boolean().optional(),
  genderNeutralWashrooms: z.boolean().optional(),
  lgbtqiaFriendly: z.boolean().optional(),
  scentFree: z.boolean().optional(),
  eventTypeIds: z.array(z.number()).optional(),
  sortBy: z.enum(["soonest", "latest", "name-az", "name-za"]).optional(),
  showArchived: z.boolean().optional(),
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
  recurrencePattern: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]),
    interval: z.number().min(1).default(1),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    endDate: z.date().optional(),
    occurrences: z.number().min(1).max(100).optional(),
  }).optional(),
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
  organizerId: z.number().optional(),
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

  // Check for potential duplicates
  checkDuplicates: protectedProcedure
    .input(
      z.object({
        eventId: z.number(),
        name: z.string(),
        startDate: z.date(),
        province: z.string(),
        municipality: z.string(),
        venue: z.string().optional().nullable(),
      })
    )
    .query(async ({ input }) => {
      const duplicates = await findPotentialDuplicates(
        input.eventId,
        input.name,
        input.startDate,
        input.province,
        input.municipality,
        input.venue
      );
      return duplicates;
    }),

  // Preview recurring event dates
  previewRecurring: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        recurrencePattern: z
          .object({
            frequency: z.enum(["daily", "weekly", "monthly"]),
            interval: z.number().min(1).default(1),
            daysOfWeek: z.array(z.number()).optional(),
            endDate: z.date().optional(),
            occurrences: z.number().min(1).max(100).optional(),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      if (!input.recurrencePattern) {
        return [];
      }

      const dates = generateRecurringDates({
        startDate: input.startDate,
        pattern: input.recurrencePattern,
      });

      // Return ISO strings for easier frontend handling
      return dates.map(date => date.toISOString());
    }),

  // Get event by ID
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await eventsDb.getEventById(input.id);
  }),

  // Admin: Get analytics
  analytics: adminProcedure.query(async () => {
    return await analyticsDb.getAnalytics();
  }),

  // Public: Get event types
  getEventTypes: publicProcedure.query(async () => {
    return await eventsDb.getAllEventTypes();
  }),

  // Public: Get locations for filters
  getLocations: publicProcedure.query(async () => {
    return await eventsDb.getLocations();
  }),

  // Public: Submit event (supports recurring events)
  submit: publicProcedure.input(submitEventSchema).mutation(async ({ input, ctx }) => {
    // Check if this is a recurring event
    if (input.isRecurring && input.recurrencePattern) {
      // Generate multiple event instances
      const recurringGroupId = `recurring-${Date.now()}`;
      const instances = generateEventInstances(
        {
          ...input,
          recurringGroupId,
        },
        {
          startDate: new Date(input.startDate),
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          pattern: input.recurrencePattern,
        }
      );
      
      // Submit all instances
      const eventIds: number[] = [];
      for (const instance of instances) {
        const instanceData = {
          ...instance,
          isFree: instance.isFree ? 1 : 0,
          kidsFree: instance.kidsFree ? 1 : 0,
          freeCompanion: instance.freeCompanion ? 1 : 0,
          allAges: instance.allAges ? 1 : 0,
          familyFriendly: instance.familyFriendly ? 1 : 0,
          youngChildren: instance.youngChildren ? 1 : 0,
          kids: instance.kids ? 1 : 0,
          teens: instance.teens ? 1 : 0,
          adultsOnly: instance.adultsOnly ? 1 : 0,
          seniors: instance.seniors ? 1 : 0,
          isIndoor: instance.isIndoor ? 1 : 0,
          isOutdoor: instance.isOutdoor ? 1 : 0,
          shortDuration: instance.shortDuration ? 1 : 0,
          dropIn: instance.dropIn ? 1 : 0,
          canReenter: instance.canReenter ? 1 : 0,
          accessibility: JSON.stringify(instance.accessibility),
          submittedBy: ctx.user?.id || null,
          organizerId: input.organizerId || null,
          status: "pending" as const,
        };
        
        const eventId = await eventsDb.createEvent(instanceData);
        eventIds.push(eventId);
      }
      
      // Notify admin
      try {
        await notifyOwner({
          title: "New Recurring Event Submission",
          content: `A recurring event "${input.name}" with ${instances.length} occurrences has been submitted for review in ${input.city}, ${input.province}.`,
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
      }
      
      return { success: true, eventIds, count: eventIds.length };
    }
    
    // Single event submission
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
      organizerId: input.organizerId || null,
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
      // Get event details before updating status
      const event = await eventsDb.getEventById(input.eventId);
      
      await eventsDb.updateEventStatus(input.eventId, input.status, ctx.user.id, input.reviewNotes);
      
      // Send notification to admin about status change (who can then contact submitter)
      if (event) {
        try {
          await notifySubmitterStatusChange(
            event.name,
            event.organizerEmail,
            event.organizerPhone,
            input.status,
            input.reviewNotes
          );
          
          // If event has an organizer, also notify them
          if (event.organizerId) {
            const organizerDb = await import("./organizer-db");
            const organizer = await organizerDb.getOrganizerById(event.organizerId);
            if (organizer) {
              await notifyOrganizerStatusChange({
                organizerEmail: organizer.email,
                organizerName: organizer.name,
                eventName: event.name,
                eventId: event.id,
                status: input.status,
                reviewNotes: input.reviewNotes,
              });
            }
          }
        } catch (error) {
          console.error("Failed to send status notification:", error);
          // Don't fail the status update if notification fails
        }
      }
      
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
