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
      
      // In a real app, you'd send an email here
      // For now, we'll use the notification system to send to owner
      const magicLink = `${process.env.VITE_APP_URL || 'http://localhost:3000'}/organizer/verify?token=${token}`;
      
      await notifyOwner({
        title: `Magic Link Request from ${email}`,
        content: `Organizer ${email} requested a magic link. Link: ${magicLink}\n\nThis is a temporary notification - in production, this would be sent directly to the organizer's email.`,
      });
      
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
});
