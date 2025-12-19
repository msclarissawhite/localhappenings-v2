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
        city: z.string().optional(),
        neighborhood: z.string().optional(),
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
      
      // Reset status to pending for re-approval
      updateData.status = "pending";
      updateData.updatedAt = new Date();
      
      await eventsDb.updateEvent(eventId, updateData);
      
      // Notify owner of edit
      await notifyOwner({
        title: "Event Edited",
        content: `Event "${event.name}" has been edited by organizer and is pending re-approval.`,
      });
      
      return { success: true };
    }),
});
