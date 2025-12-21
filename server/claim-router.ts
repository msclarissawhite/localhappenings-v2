import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { getUnclaimedEvents } from "./unclaimed-events-db";
import { events, eventClaimTokens, organizers } from "../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { randomBytes } from "crypto";

export const claimRouter = router({
  /**
   * Admin: Get all unclaimed published events
   */
  getUnclaimedEvents: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }
    return await getUnclaimedEvents();
  }),

  /**
   * Admin: Create claim token for organizer and assign events
   */
  createClaimToken: protectedProcedure
    .input(
      z.object({
        organizerEmail: z.string().email(),
        eventIds: z.array(z.number()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can create claim tokens
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Generate random token
      const token = randomBytes(32).toString("hex");

      // Set expiration to 30 days from now
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      // Create claim token
      await db.insert(eventClaimTokens).values({
        token,
        organizerEmail: input.organizerEmail,
        eventIds: JSON.stringify(input.eventIds),
        claimed: 0,
        expiresAt,
      });

      // Return claim URL
      const claimUrl = `${process.env.VITE_APP_URL}/claim/${token}`;
      
      return {
        success: true,
        token,
        claimUrl,
        eventCount: input.eventIds.length,
      };
    }),

  /**
   * Public: Get claim token details (for claim page)
   */
  getClaimToken: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [claimToken] = await db
        .select()
        .from(eventClaimTokens)
        .where(eq(eventClaimTokens.token, input.token))
        .limit(1);

      if (!claimToken) {
        throw new Error("Invalid or expired claim token");
      }

      // Check if expired
      if (new Date() > new Date(claimToken.expiresAt)) {
        throw new Error("This claim link has expired");
      }

      // Check if already claimed
      if (claimToken.claimed === 1) {
        throw new Error("This claim link has already been used");
      }

      // Get event details
      const eventIds = JSON.parse(claimToken.eventIds) as number[];
      const eventList = await db
        .select({
          id: events.id,
          name: events.name,
          startDate: events.startDate,
          municipality: events.municipality,
        })
        .from(events)
        .where(inArray(events.id, eventIds));

      return {
        organizerEmail: claimToken.organizerEmail,
        events: eventList,
        expiresAt: claimToken.expiresAt,
      };
    }),

  /**
   * Public: Claim events (called after organizer logs in via magic link)
   */
  claimEvents: publicProcedure
    .input(z.object({ token: z.string(), organizerEmail: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [claimToken] = await db
        .select()
        .from(eventClaimTokens)
        .where(eq(eventClaimTokens.token, input.token))
        .limit(1);

      if (!claimToken) {
        throw new Error("Invalid claim token");
      }

      // Verify email matches
      if (claimToken.organizerEmail !== input.organizerEmail) {
        throw new Error("Email does not match claim token");
      }

      // Check if expired
      if (new Date() > new Date(claimToken.expiresAt)) {
        throw new Error("This claim link has expired");
      }

      // Check if already claimed
      if (claimToken.claimed === 1) {
        throw new Error("Events already claimed");
      }

      // Get or create organizer record
      let [organizer] = await db
        .select()
        .from(organizers)
        .where(eq(organizers.email, input.organizerEmail))
        .limit(1);

      if (!organizer) {
        // Create new organizer
        const [newOrganizer] = await db
          .insert(organizers)
          .values({
            email: input.organizerEmail,
            isVerified: 0, // Pending verification
          })
          .$returningId();
        
        [organizer] = await db
          .select()
          .from(organizers)
          .where(eq(organizers.id, newOrganizer.id))
          .limit(1);
      }

      // Assign events to organizer
      const eventIds = JSON.parse(claimToken.eventIds) as number[];
      await db
        .update(events)
        .set({
          organizerId: organizer.id,
          organizerEmail: input.organizerEmail,
        })
        .where(inArray(events.id, eventIds));

      // Mark token as claimed
      await db
        .update(eventClaimTokens)
        .set({
          claimed: 1,
          claimedAt: new Date(),
        })
        .where(eq(eventClaimTokens.id, claimToken.id));

      return {
        success: true,
        eventCount: eventIds.length,
        organizerId: organizer.id,
      };
    }),

  /**
   * Admin: List all claim tokens
   */
  listClaimTokens: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const tokens = await db
      .select()
      .from(eventClaimTokens)
      .orderBy(eventClaimTokens.createdAt);

    return tokens.map((token) => ({
      ...token,
      eventIds: JSON.parse(token.eventIds) as number[],
    }));
  }),
});
