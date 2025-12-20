import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  findOrganizerByEmail,
  upsertOrganizer,
  createMagicLinkToken,
  verifyMagicLinkToken,
  getOrganizerEvents,
} from "./organizer-db";
import { notifyOwner } from "./_core/notification";
import { sendMagicLinkEmail } from "./_core/resend-email";

export const organizerRouter = router({
  /**
   * Request magic link - sends email with login link
   */
  requestMagicLink: publicProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { email, name } = input;
      
      // Find or create organizer
      let organizer = await findOrganizerByEmail(email);
      
      if (!organizer) {
        organizer = await upsertOrganizer({
          email,
          name: name || null,
          isVerified: 0,
        });
      }
      
      // Generate magic link token
      const token = await createMagicLinkToken(organizer.id);
      
      // Send magic link via Resend
      const magicLink = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/organizer/verify?token=${token}`;
      
      const emailSent = await sendMagicLinkEmail({
        to: email,
        name: name || null,
        magicLink,
      });
      
      // Fallback to owner notification if Resend not configured or fails
      if (!emailSent) {
        await notifyOwner({
          title: `Magic Link Request from ${email}`,
          content: `Organizer ${email} requested a magic link. Link: ${magicLink}\n\nResend not configured - please forward this link manually.`,
        });
      }
      
      return {
        success: true,
        message: "Magic link sent! Check your email.",
        // In development, return the link for testing
        ...(process.env.NODE_ENV === 'development' && { magicLink }),
      };
    }),

  /**
   * Verify magic link token and log in organizer
   */
  verifyMagicLink: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const organizer = await verifyMagicLinkToken(input.token);
      
      if (!organizer) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired magic link",
        });
      }
      
      // In a real app, you'd set a session cookie here
      // For now, we'll return the organizer data
      return {
        success: true,
        organizer: {
          id: organizer.id,
          email: organizer.email,
          name: organizer.name,
        },
      };
    }),

  /**
   * Get current organizer's events
   */
  getMyEvents: publicProcedure
    .input(z.object({
      organizerId: z.number(),
    }))
    .query(async ({ input }) => {
      const events = await getOrganizerEvents(input.organizerId);
      return events;
    }),

  /**
   * Update event (organizer can edit their own events)
   */
  updateEvent: publicProcedure
    .input(z.object({
      eventId: z.number(),
      organizerId: z.number(),
      data: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        province: z.string().optional(),
        municipality: z.string().optional(),
        neighborhoodCommunity: z.string().optional(),
        venue: z.string().optional(),
        address: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isFree: z.boolean().optional(),
        costType: z.string().optional(),
        costMin: z.number().optional(),
        costMax: z.number().optional(),
        kidsFree: z.boolean().optional(),
        freeCompanion: z.boolean().optional(),
        allAges: z.boolean().optional(),
        familyFriendly: z.boolean().optional(),
        youngChildren: z.boolean().optional(),
        kids: z.boolean().optional(),
        teens: z.boolean().optional(),
        adultsOnly: z.boolean().optional(),
        seniors: z.boolean().optional(),
        isIndoor: z.boolean().optional(),
        isOutdoor: z.boolean().optional(),
        accessibility: z.any().optional(),
        organizerName: z.string().optional(),
        organizerEmail: z.string().optional(),
        organizerPhone: z.string().optional(),
        notes: z.string().optional(),
      }),
    }))
    .mutation(async ({ input }) => {
      const { eventId, organizerId, data } = input;
      
      // Import eventsDb here to avoid circular dependency
      const eventsDb = await import("./events-db");
      
      // Verify the event belongs to this organizer
      const event = await eventsDb.getEventById(eventId);
      if (!event || event.organizerId !== organizerId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You can only edit your own events",
        });
      }
      
      // Prepare update data
      const updateData: any = { ...data };
      
      // Convert booleans to integers for MySQL
      const boolFields = [
        "isFree", "kidsFree", "freeCompanion", "allAges",
        "familyFriendly", "youngChildren", "kids", "teens", "adultsOnly",
        "seniors", "isIndoor", "isOutdoor"
      ];
      
      boolFields.forEach(field => {
        if (field in updateData && typeof updateData[field] === "boolean") {
          updateData[field] = updateData[field] ? 1 : 0;
        }
      });
      
      if (updateData.accessibility) {
        updateData.accessibility = JSON.stringify(updateData.accessibility);
      }
      
      // Check if organizer is verified for auto-approval
      const { getOrganizerById } = await import("./organizer-db");
      const organizer = await getOrganizerById(organizerId);
      
      if (organizer?.isVerified === 1) {
        // Verified organizer: Apply changes immediately
        updateData.updatedAt = new Date();
        await eventsDb.updateEvent(eventId, updateData);
        
        return { success: true, requiresApproval: false };
      } else {
        // Unverified organizer: Store changes in pendingEditData
        // Keep event published but flag it as having unreviewed edits
        const pendingEdit = {
          ...updateData,
          editedAt: new Date().toISOString(),
        };
        
        await eventsDb.updateEvent(eventId, {
          hasUnreviewedEdit: 1,
          pendingEditData: JSON.stringify(pendingEdit),
          updatedAt: new Date(),
        });
        
        // Notify owner of pending edit
        await notifyOwner({
          title: "Event Edit Pending Review",
          content: `Event "${event.name}" has been edited by unverified organizer and requires your approval. The original event remains published.`,
        });
        
        return { success: true, requiresApproval: true };
      }
    }),

  /**
   * Toggle organizer verification status (admin only)
   */
  toggleVerification: publicProcedure
    .input(z.object({
      organizerId: z.number(),
      isVerified: z.boolean(),
    }))
    .mutation(async ({ input }) => {
      const { toggleOrganizerVerification } = await import("./organizer-db");
      await toggleOrganizerVerification(input.organizerId, input.isVerified);
      return { success: true };
    }),

  /**
   * Get all organizers (admin only)
   */
  getAllOrganizers: publicProcedure
    .query(async () => {
      const { getAllOrganizers } = await import("./organizer-db");
      return await getAllOrganizers();
    }),

  /**
   * Close an event (organizer only)
   * Marks event as closed so it no longer appears in public listings
   */
  closeEvent: publicProcedure
    .input(z.object({
      eventId: z.number(),
      organizerId: z.number(),
    }))
    .mutation(async ({ input }) => {
      const { eventId, organizerId } = input;
      
      // Verify organizer owns this event
      const { getDb } = await import("./db");
      const { events, organizers } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      }
      
      const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
      if (!event || event.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Event not found" });
      }
      
      const organizer = await db.select().from(organizers).where(eq(organizers.id, organizerId)).limit(1);
      if (!organizer || organizer.length === 0) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Organizer not found" });
      }
      
      // Check if organizer owns this event (by matching email)
      if (event[0].organizerEmail !== organizer[0].email) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You can only close your own events" });
      }
      
      // Update event status to closed
      await db.update(events)
        .set({ status: "closed" })
        .where(eq(events.id, eventId));
      
      // Notify admin
      await notifyOwner({
        title: "Event Closed",
        content: `Organizer ${organizer[0].name || organizer[0].email} closed event: ${event[0].name}`,
      });
      
      return { success: true };
    }),
});
