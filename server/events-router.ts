import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as eventsDb from "./events-db";
import type { AccessibilityData } from "../shared/types";
import { notifyOwner } from "./_core/notification";
import { syncEventToClickUp, updateEventStatusInClickUp, addClickUpComment } from "./_core/clickup";
import { notifySubmitterStatusChange } from "./_core/email-notification";
import { notifyOrganizerStatusChange } from "./_core/organizer-email";
import { generateEventInstances, generateRecurringDates, type RecurrencePattern } from "./recurring-events";
import * as analyticsDb from "./analytics-db";
import * as organizerDb from "./organizer-db";
import { findPotentialDuplicates } from "./duplicate-detection";
import { getDb } from "./db";
import { events, eventToEventTypes } from "../drizzle/schema";
import { eq, inArray } from "drizzle-orm";

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
    busStopDistance: z.enum(["short", "moderate", "long", "unknown", "not-relevant"]).optional(),
    accessibleSidewalks: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    bikeRacks: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
    coveredBikeParking: z.enum(["yes", "no", "unknown", "not-relevant"]).optional(),
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
  municipality: z.string().optional(),
  neighborhoodCommunity: z.string().optional(),
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
  // Geolocation (Near Me)
  nearMe: z.boolean().optional(),
  userLatitude: z.number().optional(),
  userLongitude: z.number().optional(),
  radiusKm: z.number().optional(),
  sortBy: z.enum(["soonest", "latest", "name-az", "name-za", "distance"]).optional(),
  showArchived: z.boolean().optional(),
  hasUnreviewedEdit: z.boolean().optional(),
  status: z.enum(["pending", "published", "rejected", "needs-clarification", "closed"]).optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

const submitEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  province: z.string().min(1, "Province is required"),
  municipality: z.string().min(1, "City is required"),
  neighborhoodCommunity: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().nullable().optional(),
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
  publicContactName: z.string().optional(),
  publicContactEmail: z.string().email().optional().or(z.literal("")),
  publicContactPhone: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  organizerId: z.number().optional(),
  eventTypeIds: z.array(z.number()).optional().default([]),
});

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const eventsRouter = router({
  // Get feedback stats for multiple events (for Browse Events page)
  getFeedbackStats: publicProcedure
    .input(z.object({ eventIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      const { getFeedbackStatsForEvents } = await import("./feedback-stats-db");
      const statsMap = await getFeedbackStatsForEvents(input.eventIds);
      
      // Convert Map to plain object for tRPC serialization
      const result: Record<number, { totalFeedback: number; attendedCount: number; avgAccuracy: number | null }> = {};
      statsMap.forEach((stats, eventId) => {
        result[eventId] = stats;
      });
      return result;
    }),

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

  // Admin: Get edit history for an event
  getEditHistory: adminProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return await eventsDb.getEventEditHistory(input.id);
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
      // Check if organizer is verified for auto-approval
    let initialStatus: "pending" | "published" = "pending";
    if (input.organizerId) {
      const organizer = await organizerDb.getOrganizerById(input.organizerId);
      if (organizer?.isVerified === 1) {
        initialStatus = "published";
      }
    }
    
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
          status: initialStatus,
        };
        
        const eventId = await eventsDb.createEvent(instanceData);
        
        // Associate event types if provided
        if (input.eventTypeIds && input.eventTypeIds.length > 0) {
          await eventsDb.associateEventTypes(eventId, input.eventTypeIds);
        }
        
        eventIds.push(eventId);
      }
      
      // Notify admin
      try {
        await notifyOwner({
          title: "New Recurring Event Submission",
          content: `A recurring event "${input.name}" with ${instances.length} occurrences has been submitted for review in ${input.municipality}, ${input.province}.`,
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
      status: initialStatus,
    };

    const eventId = await eventsDb.createEvent(eventData);
    
    // Associate event types if provided
    if (input.eventTypeIds && input.eventTypeIds.length > 0) {
      await eventsDb.associateEventTypes(eventId, input.eventTypeIds);
    }
    
    // Notify admin of new submission
    try {
      await notifyOwner({
        title: "New Event Submission",
        content: `A new event "${input.name}" has been submitted for review in ${input.municipality}, ${input.province}.`,
      });
    } catch (error) {
      console.error("Failed to send notification:", error);
      // Don't fail the submission if notification fails
    }
    
    // Sync to ClickUp
    try {
      const clickupResult = await syncEventToClickUp({
        eventId,
        eventName: input.name,
        organizerName: input.organizerName || null,
        organizerEmail: input.organizerEmail || "",
        organizerPhone: input.organizerPhone || null,
        eventDate: input.startDate,
        submissionDate: new Date(),
        status: initialStatus,
        description: input.description,
        venue: input.venue || "Not specified",
        address: input.address || "Not specified",
        municipality: input.municipality,
      });
      
      // Store ClickUp task ID for future status updates
      if (clickupResult.success && clickupResult.taskId) {
        await eventsDb.updateEventClickUpTaskId(eventId, clickupResult.taskId);
      }
    } catch (error) {
      console.error("Failed to sync to ClickUp:", error);
      // Don't fail the submission if ClickUp sync fails
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
        status: z.enum(["published", "rejected", "needs-clarification", "closed", "pending"]),
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
        
        // Update ClickUp task status if task ID exists
        if (event.clickupTaskId) {
          try {
            // Only sync to ClickUp for review statuses, not for closed/pending
            if (input.status !== "closed" && input.status !== "pending") {
              await updateEventStatusInClickUp(event.clickupTaskId, input.status);
            }
            
            // Add review notes as a comment if provided
            if (input.reviewNotes) {
              const statusLabels = {
                published: "✅ Approved",
                rejected: "❌ Rejected",
                "needs-clarification": "⚠️ Needs Clarification",
                closed: "🔒 Closed",
                pending: "⏳ Moved to Pending",
              };
              
              const commentText = `**${statusLabels[input.status]}**\n\n${input.reviewNotes}`;
              await addClickUpComment(event.clickupTaskId, commentText);
            }
          } catch (error) {
            console.error("Failed to update ClickUp task status:", error);
            // Don't fail the status update if ClickUp sync fails
          }
        }
      }
      
      return { success: true };
    }),

  // Admin: Update event
  update: adminProcedure
    .input(
      z.object({
        id: z.number(),
        data: submitEventSchema.partial().extend({
          // Override municipality to allow empty string in updates (will keep existing value)
          municipality: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Get current event data before updating
      const currentEvent = await eventsDb.getEventById(input.id);
      
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

      // Track changed fields for history
      const changedFields: any = {};
      if (currentEvent) {
        const eventData = currentEvent as any;
        Object.keys(updateData).forEach(key => {
          if (updateData[key] !== eventData[key]) {
            changedFields[key] = {
              old: eventData[key],
              new: updateData[key],
            };
          }
        });
      }

      // Handle event type updates separately
      const eventTypeIds = updateData.eventTypeIds;
      delete updateData.eventTypeIds; // Remove from main update data
      
      // Update the event
      await eventsDb.updateEvent(input.id, updateData);
      
      // Update event types if provided
      if (eventTypeIds !== undefined) {
        await eventsDb.updateEventTypes(input.id, eventTypeIds);
      }
      
      // Log the edit to history if there were changes
      if (Object.keys(changedFields).length > 0) {
        await eventsDb.logEventEdit(
          input.id,
          ctx.user.id,
          ctx.user.name || ctx.user.email || "Admin",
          changedFields
        );
      }
      
      return { success: true };
    }),

  // Admin: Delete event
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await eventsDb.deleteEvent(input.id);
    return { success: true };
  }),

  // Admin: Approve pending edit
  approvePendingEdit: adminProcedure
    .input(z.object({ eventId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const event = await eventsDb.getEventById(input.eventId);
      
      if (!event || !event.hasUnreviewedEdit || !event.pendingEditData) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No pending edit found for this event",
        });
      }
      
      // Parse pending edit data
      const pendingEdit = JSON.parse(event.pendingEditData);
      
      // Apply pending changes to main event fields
      await eventsDb.updateEvent(input.eventId, {
        ...pendingEdit,
        hasUnreviewedEdit: 0,
        pendingEditData: null,
        reviewedBy: ctx.user.id,
        updatedAt: new Date(),
      });
      
      // Notify organizer that edit was approved
      if (event.organizerId) {
        const organizerDb = await import("./organizer-db");
        const organizer = await organizerDb.getOrganizerById(event.organizerId);
        if (organizer) {
          await notifyOrganizerStatusChange({
            organizerEmail: organizer.email,
            organizerName: organizer.name,
            eventName: event.name,
            eventId: event.id,
            status: "published",
            reviewNotes: "Your edits have been approved and are now live.",
          });
        }
      }
      
      return { success: true };
    }),

  // Admin: Reject pending edit
  rejectPendingEdit: adminProcedure
    .input(z.object({ 
      eventId: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const event = await eventsDb.getEventById(input.eventId);
      
      if (!event || !event.hasUnreviewedEdit) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No pending edit found for this event",
        });
      }
      
      // Clear pending edit data
      await eventsDb.updateEvent(input.eventId, {
        hasUnreviewedEdit: 0,
        pendingEditData: null,
        updatedAt: new Date(),
      });
      
      // Notify organizer that edit was rejected
      if (event.organizerId) {
        const organizerDb = await import("./organizer-db");
        const organizer = await organizerDb.getOrganizerById(event.organizerId);
        if (organizer) {
          await notifyOrganizerStatusChange({
            organizerEmail: organizer.email,
            organizerName: organizer.name,
            eventName: event.name,
            eventId: event.id,
            status: "needs-clarification",
            reviewNotes: input.reason || "Your proposed edits could not be approved. Please review and try again.",
          });
        }
      }
      
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

  // Admin: Bulk import events from CSV
  bulkImport: adminProcedure
    .input(
      z.object({
        events: z.array(
          z.object({
            name: z.string(),
            description: z.string(),
            province: z.string(),
            municipality: z.string(),
            neighborhoodCommunity: z.string().optional(),
            venue: z.string().optional(),
            address: z.string().optional(),
            startDate: z.string(), // ISO date string
            startTime: z.string().optional(), // HH:MM format
            endDate: z.string().optional(),
            endTime: z.string().optional(), // HH:MM format
            duration: z.string().optional(), // e.g., "2 hours", "3 days"
            timeOfDay: z.enum(["morning", "afternoon", "evening", "all-day"]).optional(),
            isRecurring: z.boolean(),
            recurrenceType: z.enum(["one-time", "weekly", "monthly", "seasonal"]).optional(),
            isFree: z.boolean(),
            costMin: z.number().optional(),
            costMax: z.number().optional(),
            costType: z.enum(["fixed", "range", "donation", "pay-what-you-can", "sliding-scale"]).optional(),
            kidsFree: z.boolean(),
            freeCompanion: z.boolean(),
            allAges: z.boolean(),
            familyFriendly: z.boolean(),
            youngChildren: z.boolean(),
            kids: z.boolean(),
            teens: z.boolean(),
            adults: z.boolean(),
            adultsOnly: z.boolean(),
            seniors: z.boolean(),
            isIndoor: z.boolean(),
            isOutdoor: z.boolean(),
            isMixed: z.boolean(),
            shortDuration: z.boolean(),
            dropIn: z.boolean(),
            canReenter: z.boolean(),
            accessibility: z.string(), // JSON string
            organizerName: z.string().optional(),
            organizerType: z.enum(["business", "nonprofit", "community", "municipality", "school-library", "other"]).optional(),
            organizerEmail: z.string().optional(),
            organizerPhone: z.string().optional(),
            organizerWebsite: z.string().optional(),
            displayOrganizerInfo: z.boolean(),
            publicContactName: z.string().optional(),
            publicContactEmail: z.string().optional(),
            publicContactPhone: z.string().optional(),
            notes: z.string().optional(),
            eventTypeIds: z.string().optional(), // Comma-separated IDs
            imageUrl: z.string().optional(),
            imageData: z.string().optional(), // Base64 image from ZIP
            imageFileName: z.string().optional(), // Original filename from ZIP
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const results = {
        success: [] as number[],
        failed: [] as { index: number; error: string }[],
      };

      for (let i = 0; i < input.events.length; i++) {
        const event = input.events[i];
        try {
          // Handle image upload if imageData is provided (from ZIP)
          let imageUrl = event.imageUrl;
          if (event.imageData && !imageUrl) {
            try {
              const uploadRouter = await import("./upload-router");
              // Extract base64 data
              const base64Data = event.imageData.replace(/^data:image\/\w+;base64,/, "");
              const buffer = Buffer.from(base64Data, "base64");
              
              // Process and upload image
              const { processEventImage } = await import("./imageProcessing");
              const { storagePut } = await import("./storage");
              const { nanoid } = await import("nanoid");
              
              const processedBuffer = await processEventImage(buffer);
              const randomSuffix = nanoid(10);
              const fileKey = `event-images/${Date.now()}-${randomSuffix}.jpg`;
              const { url } = await storagePut(fileKey, processedBuffer, "image/jpeg");
              
              imageUrl = url;
              console.log(`[Bulk Import] Uploaded image for event: ${event.name}`);
            } catch (error) {
              console.error(`[Bulk Import] Failed to upload image for event ${event.name}:`, error);
              // Continue without image if upload fails
            }
          }
          
          const eventData = {
            ...event,
            imageUrl,
            startDate: new Date(event.startDate),
            endDate: event.endDate ? new Date(event.endDate) : null,
            costMin: event.costMin || null,
            costMax: event.costMax || null,
            submittedBy: ctx.user.id,
            organizerId: null,
            status: "published" as const, // Auto-publish admin imports
            publishedAt: new Date(),
            reviewedBy: ctx.user.id,
          };

          const eventId = await eventsDb.createEvent(eventData);

          // Sync to ClickUp
          try {
            const clickupResult = await syncEventToClickUp({
              eventId,
              eventName: event.name,
              organizerName: event.organizerName || null,
              organizerEmail: event.organizerEmail || "",
              organizerPhone: event.organizerPhone || null,
              eventDate: new Date(event.startDate),
              submissionDate: new Date(),
              status: "published",
              description: event.description,
              venue: event.venue || "Not specified",
              address: event.address || "Not specified",
              municipality: event.municipality,
            });

            if (clickupResult.success && clickupResult.taskId) {
              await eventsDb.updateEventClickUpTaskId(eventId, clickupResult.taskId);
            }
          } catch (error) {
            console.error("Failed to sync to ClickUp:", error);
            // Don't fail the import if ClickUp sync fails
          }

          results.success.push(eventId);
        } catch (error) {
          results.failed.push({
            index: i,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return results;
    }),

  // Admin: Export all events to CSV
  exportAll: adminProcedure.query(async () => {
    const events = await eventsDb.getAllEvents();
    
    // Convert events to CSV format
    const headers = [
      "name", "description", "province", "municipality", "neighborhoodCommunity",
      "venue", "address", "startDate", "endDate", "timeOfDay", "isRecurring", "recurrenceType",
      "isFree", "costMin", "costMax", "costType", "kidsFree", "freeCompanion",
      "allAges", "familyFriendly", "youngChildren", "kids", "teens", "adultsOnly", "seniors",
      "isIndoor", "isOutdoor", "shortDuration", "dropIn", "canReenter",
      "accessibility", "organizerName", "organizerType", "organizerEmail", "organizerPhone",
      "organizerWebsite", "displayOrganizerInfo", "notes", "imageUrl"
    ];

    const rows = events.map(event => [
      event.name,
      event.description,
      event.province,
      event.municipality,
      event.neighborhoodCommunity || "",
      event.venue || "",
      event.address || "",
      event.startDate ? new Date(event.startDate).toISOString() : "",
      event.endDate ? new Date(event.endDate).toISOString() : "",
      event.timeOfDay || "",
      event.isRecurring ? "true" : "false",
      event.recurrenceType || "one-time",
      event.isFree ? "true" : "false",
      event.costMin || "",
      event.costMax || "",
      event.costType || "",
      event.kidsFree ? "true" : "false",
      event.freeCompanion ? "true" : "false",
      event.allAges ? "true" : "false",
      event.familyFriendly ? "true" : "false",
      event.youngChildren ? "true" : "false",
      event.kids ? "true" : "false",
      event.teens ? "true" : "false",
      event.adultsOnly ? "true" : "false",
      event.seniors ? "true" : "false",
      event.isIndoor ? "true" : "false",
      event.isOutdoor ? "true" : "false",
      event.shortDuration ? "true" : "false",
      event.dropIn ? "true" : "false",
      event.canReenter ? "true" : "false",
      event.accessibility || "{}",
      event.organizerName || "",
      event.organizerType || "",
      event.organizerEmail || "",
      event.organizerPhone || "",
      event.organizerWebsite || "",
      event.displayOrganizerInfo ? "true" : "false",
      event.notes || "",
      event.imageUrl || ""
    ]);

    // Escape CSV values
    const escapeCsvValue = (value: any): string => {
      const str = String(value || "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(escapeCsvValue).join(","))
    ].join("\n");

    return { csv: csvContent, count: events.length };
  }),

  // Admin: Export selected events by IDs to CSV
  exportByIds: adminProcedure
    .input(
      z.object({
        eventIds: z.array(z.number()),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch events by IDs
      const selectedEvents = await db
        .select()
        .from(events)
        .where(inArray(events.id, input.eventIds));

      // Convert events to CSV format (same as exportAll)
      const headers = [
        "name", "description", "province", "municipality", "neighborhoodCommunity",
        "venue", "address", "startDate", "endDate", "timeOfDay", "isRecurring", "recurrenceType",
        "isFree", "costMin", "costMax", "costType", "kidsFree", "freeCompanion",
        "allAges", "familyFriendly", "youngChildren", "kids", "teens", "adultsOnly", "seniors",
        "isIndoor", "isOutdoor", "shortDuration", "dropIn", "canReenter",
        "accessibility", "organizerName", "organizerType", "organizerEmail", "organizerPhone",
        "organizerWebsite", "displayOrganizerInfo", "notes", "imageUrl"
      ];

      const rows = selectedEvents.map(event => [
        event.name,
        event.description,
        event.province,
        event.municipality,
        event.neighborhoodCommunity || "",
        event.venue || "",
        event.address || "",
        event.startDate ? new Date(event.startDate).toISOString() : "",
        event.endDate ? new Date(event.endDate).toISOString() : "",
        event.timeOfDay || "",
        event.isRecurring ? "true" : "false",
        event.recurrenceType || "one-time",
        event.isFree ? "true" : "false",
        event.costMin || "",
        event.costMax || "",
        event.costType || "",
        event.kidsFree ? "true" : "false",
        event.freeCompanion ? "true" : "false",
        event.allAges ? "true" : "false",
        event.familyFriendly ? "true" : "false",
        event.youngChildren ? "true" : "false",
        event.kids ? "true" : "false",
        event.teens ? "true" : "false",
        event.adultsOnly ? "true" : "false",
        event.seniors ? "true" : "false",
        event.isIndoor ? "true" : "false",
        event.isOutdoor ? "true" : "false",
        event.shortDuration ? "true" : "false",
        event.dropIn ? "true" : "false",
        event.canReenter ? "true" : "false",
        event.accessibility || "{}",
        event.organizerName || "",
        event.organizerType || "",
        event.organizerEmail || "",
        event.organizerPhone || "",
        event.organizerWebsite || "",
        event.displayOrganizerInfo ? "true" : "false",
        event.notes || "",
        event.imageUrl || ""
      ]);

      // Escape CSV values
      const escapeCsvValue = (value: any): string => {
        const str = String(value || "");
        if (str.includes(",") || str.includes('"') || str.includes("\n")) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(escapeCsvValue).join(","))
      ].join("\n");

      return { csv: csvContent, count: selectedEvents.length };
    }),

  /**
   * Batch update multiple events
   */
  batchUpdate: adminProcedure
    .input(
      z.object({
        eventIds: z.array(z.number()),
        updates: z.object({
          nameFind: z.string().optional(),
          nameReplace: z.string().optional(),
          venue: z.string().optional(),
          province: z.string().optional(),
          municipality: z.string().optional(),
          neighborhoodCommunity: z.string().optional(),
          organizerName: z.string().optional(),
          organizerEmail: z.string().email().optional(),
          organizerPhone: z.string().optional(),
          organizerWebsite: z.string().url().optional(),
          status: z.enum(["pending", "published", "rejected", "needs-clarification", "closed"]).optional(),
          startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
          endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
          eventTypeIds: z.array(z.number()).optional(),
          accessibility: z.array(z.string()).optional(),
          // Cost fields
          isFree: z.boolean().optional(),
          costType: z.enum(["fixed", "range", "donation", "pay-what-you-can", "sliding-scale"]).optional(),
          costMin: z.number().optional(),
          costMax: z.number().optional(),
          fixedPrice: z.number().optional(),
          kidsFree: z.boolean().optional(),
          // Age groups
          ageGroups: z.array(z.string()).optional(),
          // Image (base64 encoded)
          imageData: z.string().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let updatedCount = 0;

      // Handle name find & replace separately
      if (input.updates.nameFind && input.updates.nameReplace) {
        const eventsToUpdate = await db
          .select({ id: events.id, name: events.name })
          .from(events)
          .where(inArray(events.id, input.eventIds));

        for (const event of eventsToUpdate) {
          const newName = event.name.replace(
            new RegExp(input.updates.nameFind, 'g'),
            input.updates.nameReplace
          );
          if (newName !== event.name) {
            await db
              .update(events)
              .set({ name: newName })
              .where(eq(events.id, event.id));
            updatedCount++;
          }
        }
      }

      // Handle time updates separately (update time portion while preserving date)
      if (input.updates.startTime || input.updates.endTime) {
        const eventsToUpdate = await db
          .select({ id: events.id, startDate: events.startDate, endDate: events.endDate })
          .from(events)
          .where(inArray(events.id, input.eventIds));

        for (const event of eventsToUpdate) {
          const timeUpdates: any = {};
          
          // Update start time if provided
          if (input.updates.startTime) {
            const [hours, minutes] = input.updates.startTime.split(':').map(Number);
            const newStartDate = new Date(event.startDate);
            newStartDate.setHours(hours, minutes, 0, 0);
            timeUpdates.startDate = newStartDate;
          }
          
          // Update end time if provided
          if (input.updates.endTime && event.endDate) {
            const [hours, minutes] = input.updates.endTime.split(':').map(Number);
            const newEndDate = new Date(event.endDate);
            newEndDate.setHours(hours, minutes, 0, 0);
            timeUpdates.endDate = newEndDate;
          }
          
          if (Object.keys(timeUpdates).length > 0) {
            await db
              .update(events)
              .set(timeUpdates)
              .where(eq(events.id, event.id));
            updatedCount++;
          }
        }
      }

      // Build update object for other fields
      const updateData: any = {};
      if (input.updates.venue !== undefined) updateData.venue = input.updates.venue;
      if (input.updates.province !== undefined) updateData.province = input.updates.province;
      if (input.updates.municipality !== undefined) updateData.municipality = input.updates.municipality;
      if (input.updates.neighborhoodCommunity !== undefined) updateData.neighborhoodCommunity = input.updates.neighborhoodCommunity;
      if (input.updates.organizerName !== undefined) updateData.organizerName = input.updates.organizerName;
      if (input.updates.organizerEmail !== undefined) updateData.organizerEmail = input.updates.organizerEmail;
      if (input.updates.organizerPhone !== undefined) updateData.organizerPhone = input.updates.organizerPhone;
      if (input.updates.organizerWebsite !== undefined) updateData.organizerWebsite = input.updates.organizerWebsite;
      if (input.updates.status !== undefined) updateData.status = input.updates.status;
      
      // Cost fields
      if (input.updates.isFree !== undefined) updateData.isFree = input.updates.isFree;
      if (input.updates.costType !== undefined) updateData.costType = input.updates.costType;
      if (input.updates.costMin !== undefined) updateData.costMin = input.updates.costMin;
      if (input.updates.costMax !== undefined) updateData.costMax = input.updates.costMax;
      if (input.updates.fixedPrice !== undefined) updateData.fixedPrice = input.updates.fixedPrice;
      if (input.updates.kidsFree !== undefined) updateData.kidsFree = input.updates.kidsFree;

      // Update all events with standard fields
      if (Object.keys(updateData).length > 0) {
        await db
          .update(events)
          .set(updateData)
          .where(inArray(events.id, input.eventIds));
        // If we updated standard fields and haven't counted name updates, count all events
        if (updatedCount === 0) {
          updatedCount = input.eventIds.length;
        }
      }

      // Handle event types update (replace existing)
      if (input.updates.eventTypeIds !== undefined) {
        // First, delete all existing event type associations for these events
        await db
          .delete(eventToEventTypes)
          .where(inArray(eventToEventTypes.eventId, input.eventIds));
        
        // Then, insert new event type associations
        if (input.updates.eventTypeIds.length > 0) {
          const insertData = input.eventIds.flatMap(eventId =>
            input.updates.eventTypeIds!.map(typeId => ({
              eventId,
              eventTypeId: typeId,
            }))
          );
          await db.insert(eventToEventTypes).values(insertData);
        }
        
        if (updatedCount === 0) {
          updatedCount = input.eventIds.length;
        }
      }

      // Handle age groups update (replace existing)
      if (input.updates.ageGroups !== undefined) {
        const ageGroupData: any = {
          allAges: input.updates.ageGroups.includes('allAges'),
          familyFriendly: input.updates.ageGroups.includes('familyFriendly'),
          youngChildren: input.updates.ageGroups.includes('youngChildren'),
          kids: input.updates.ageGroups.includes('kids'),
          teens: input.updates.ageGroups.includes('teens'),
          adults: input.updates.ageGroups.includes('adults'),
          adultsOnly: input.updates.ageGroups.includes('adultsOnly'),
          seniors: input.updates.ageGroups.includes('seniors'),
        };
        
        await db
          .update(events)
          .set(ageGroupData)
          .where(inArray(events.id, input.eventIds));
        
        if (updatedCount === 0) {
          updatedCount = input.eventIds.length;
        }
      }

      // Handle image upload (applies to all selected events)
      if (input.updates.imageData) {
        try {
          const { processEventImage } = await import("./imageProcessing");
          const { storagePut } = await import("./storage");
          const { nanoid } = await import("nanoid");
          
          // Extract base64 data and convert to buffer
          const base64Data = input.updates.imageData.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(base64Data, "base64");
          
          // Process and upload image
          const processedBuffer = await processEventImage(buffer);
          const randomSuffix = nanoid(10);
          const fileKey = `event-images/${Date.now()}-${randomSuffix}.jpg`;
          const { url } = await storagePut(fileKey, processedBuffer, "image/jpeg");
          
          // Update all selected events with the new image URL
          await db
            .update(events)
            .set({ imageUrl: url })
            .where(inArray(events.id, input.eventIds));
          
          if (updatedCount === 0) {
            updatedCount = input.eventIds.length;
          }
        } catch (error) {
          console.error("[Batch Update] Failed to upload image:", error);
          throw new Error("Failed to upload image");
        }
      }

      // Handle accessibility update (replace existing)
      if (input.updates.accessibility !== undefined) {
        const accessibilityData: any = {
          wheelchairAccessible: input.updates.accessibility.includes('wheelchairAccessible'),
          signLanguage: input.updates.accessibility.includes('signLanguage'),
          closedCaptioning: input.updates.accessibility.includes('closedCaptioning'),
          audioDescription: input.updates.accessibility.includes('audioDescription'),
          accessibleParking: input.updates.accessibility.includes('accessibleParking'),
          accessibleRestrooms: input.updates.accessibility.includes('accessibleRestrooms'),
          serviceAnimalsWelcome: input.updates.accessibility.includes('serviceAnimalsWelcome'),
          sensoryFriendly: input.updates.accessibility.includes('sensoryFriendly'),
          mobilityAids: input.updates.accessibility.includes('mobilityAids'),
          braillePrograms: input.updates.accessibility.includes('braillePrograms'),
          quietSpace: input.updates.accessibility.includes('quietSpace'),
          lowSensoryLighting: input.updates.accessibility.includes('lowSensoryLighting'),
        };
        
        await db
          .update(events)
          .set(accessibilityData)
          .where(inArray(events.id, input.eventIds));
        
        if (updatedCount === 0) {
          updatedCount = input.eventIds.length;
        }
      }

      return { success: true, updatedCount };
    }),

  /**
   * Record a tag click for analytics
   */
  recordTagClick: publicProcedure
    .input(z.object({ eventTypeId: z.number(), sessionId: z.string().optional() }))
    .mutation(async ({ input }) => {
      await eventsDb.recordTagClick(input.eventTypeId, input.sessionId);
      return { success: true };
    }),

  /**
   * Get tag analytics (admin only)
   */
  getTagAnalytics: adminProcedure.query(async () => {
    return await eventsDb.getTagAnalytics();
  }),

  /**
   * Get popular tags for homepage
   */
  getPopularTags: publicProcedure
    .input(z.object({ limit: z.number().optional().default(8) }))
    .query(async ({ input }) => {
      return await eventsDb.getPopularTags(input.limit);
    }),

  /**
   * Get nearby events based on user's geolocation
   */
  nearbyEvents: publicProcedure
    .input(
      z.object({
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        radiusKm: z.number().optional().default(50), // Default 50km radius
        limit: z.number().optional().default(20),
      })
    )
    .query(async ({ input }) => {
      return await eventsDb.getNearbyEvents(
        input.latitude,
        input.longitude,
        input.radiusKm,
        input.limit
      );
    }),
});

