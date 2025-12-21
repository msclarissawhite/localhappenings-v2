import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eventFeedback } from "../drizzle/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { detectSpam } from "./spam-detection";
import { triggerSpamDigest } from "./spam-digest";
import { syncFeedbackToClickUp } from "./clickup-feedback-sync";

export const feedbackRouter = router({
  /**
   * Submit feedback for an event (public, anonymous)
   */
  submit: publicProcedure
    .input(
      z.object({
        eventId: z.number(),
        attended: z.boolean(),
        accuracyRating: z.number().min(1).max(5).optional(),
        helpfulDetails: z.array(z.string()).optional(),
        inaccurateDetails: z.array(z.string()).optional(),
        comments: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Run spam detection
      const spamCheck = await detectSpam(input.eventId, input.comments);
      
      // Insert feedback with spam flag
      const [feedback] = await db.insert(eventFeedback).values({
        eventId: input.eventId,
        attended: input.attended ? 1 : 0,
        accuracyRating: input.accuracyRating,
        helpfulDetails: input.helpfulDetails ? JSON.stringify(input.helpfulDetails) : null,
        isSpam: spamCheck.isSpam ? 1 : 0,
        spamReason: spamCheck.reason || null,
        inaccurateDetails: input.inaccurateDetails ? JSON.stringify(input.inaccurateDetails) : null,
        comments: input.comments,
        syncedToClickUp: 0,
      });

      // Trigger ClickUp sync asynchronously (don't wait for it)
      const feedbackData = {
        id: feedback.insertId,
        eventId: input.eventId,
        attended: input.attended ? 1 : 0,
        accuracyRating: input.accuracyRating || null,
        helpfulDetails: input.helpfulDetails ? JSON.stringify(input.helpfulDetails) : null,
        inaccurateDetails: input.inaccurateDetails ? JSON.stringify(input.inaccurateDetails) : null,
        comments: input.comments || null,
        submittedAt: new Date(),
      };
      
      syncFeedbackToClickUp(feedbackData).catch((error) => {
        console.error("[Feedback] Failed to sync to ClickUp:", error);
      });

      return { success: true, feedbackId: feedback.insertId };
    }),

  /**
   * Get all feedback for an event (admin only)
   */
  getForEvent: protectedProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Only admins can view individual feedback
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const feedbackList = await db
        .select()
        .from(eventFeedback)
        .where(eq(eventFeedback.eventId, input.eventId))
        .orderBy(sql`submittedAt DESC`);

      return feedbackList;
    }),

  /**
   * Delete feedback (admin only, for spam/harassment)
   */
  delete: protectedProcedure
    .input(z.object({ feedbackId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can delete feedback
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(eventFeedback).where(eq(eventFeedback.id, input.feedbackId));

      return { success: true };
    }),

  /**
   * Get feedback statistics for an event (public)
   */
  getStats: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const stats = await db
        .select({
          totalFeedback: sql<number>`COUNT(*)`,
          attendedCount: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
          avgAccuracy: sql<number>`AVG(CASE WHEN attended = 1 THEN accuracyRating ELSE NULL END)`,
        })
        .from(eventFeedback)
        .where(eq(eventFeedback.eventId, input.eventId));

      return stats[0] || { totalFeedback: 0, attendedCount: 0, avgAccuracy: null };
    }),



  /**
   * Get feedback that needs ClickUp sync (admin only, for background job)
   */
  getPendingSync: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const pending = await db
      .select()
      .from(eventFeedback)
      .where(eq(eventFeedback.syncedToClickUp, 0))
      .limit(50); // Process in batches

    return pending.map((f) => ({
      ...f,
      attended: f.attended === 1,
      syncedToClickUp: f.syncedToClickUp === 1,
      helpfulDetails: f.helpfulDetails ? JSON.parse(f.helpfulDetails as string) : [],
      inaccurateDetails: f.inaccurateDetails ? JSON.parse(f.inaccurateDetails as string) : [],
    }));
  }),

  /**
   * Mark feedback as synced to ClickUp (admin only)
   */
  markSynced: protectedProcedure
    .input(z.object({ feedbackId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      await db
        .update(eventFeedback)
        .set({
          syncedToClickUp: 1,
          clickUpSyncedAt: new Date(),
        })
        .where(eq(eventFeedback.id, input.feedbackId));

      return { success: true };
    }),

  /**
   * List all feedback with event context and filtering (admin moderation)
   */
  listAll: protectedProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        minRating: z.number().min(1).max(5).optional(),
        maxRating: z.number().min(1).max(5).optional(),
        showSpamOnly: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = sql`
        SELECT 
          f.id,
          f.eventId,
          e.name as eventName,
          e.startDate as eventDate,
          e.organizerName,
          f.attended,
          f.accuracyRating,
          f.helpfulDetails,
          f.inaccurateDetails,
          f.comments,
          f.submittedAt,
          f.isSpam,
          f.spamReason
        FROM eventFeedback f
        LEFT JOIN events e ON f.eventId = e.id
        WHERE 1=1
      `;

      const conditions = [];
      if (input?.showSpamOnly) {
        conditions.push(sql`f.isSpam = 1`);
      }
      if (input?.eventId) {
        conditions.push(sql`f.eventId = ${input.eventId}`);
      }
      if (input?.startDate) {
        conditions.push(sql`f.submittedAt >= ${new Date(input.startDate)}`);
      }
      if (input?.endDate) {
        conditions.push(sql`f.submittedAt <= ${new Date(input.endDate)}`);
      }
      if (input?.minRating !== undefined) {
        conditions.push(sql`f.accuracyRating >= ${input.minRating}`);
      }
      if (input?.maxRating !== undefined) {
        conditions.push(sql`f.accuracyRating <= ${input.maxRating}`);
      }

      if (conditions.length > 0) {
        query = sql`${query} AND ${sql.join(conditions, sql` AND `)}`;
      }

      query = sql`${query} ORDER BY f.submittedAt DESC`;

      const result: any = await db.execute(query);
      return (result[0] || []) as any[];
    }),

  /**
   * Bulk delete multiple feedback entries (admin only)
   */
  bulkDelete: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      if (input.ids.length === 0) {
        return { success: true, count: 0 };
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Use drizzle's inArray for type-safe bulk delete
      const { inArray } = await import('drizzle-orm');
      await db.delete(eventFeedback).where(inArray(eventFeedback.id, input.ids));

      return { success: true, count: input.ids.length };
    }),

  /**
   * Get overall feedback statistics (admin only)
   */
  overallStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select({
        total: sql<number>`count(*)`,
        attended: sql<number>`sum(case when ${eventFeedback.attended} = 1 then 1 else 0 end)`,
        avgRating: sql<number>`avg(${eventFeedback.accuracyRating})`,
      })
      .from(eventFeedback);

    return result[0] || { total: 0, attended: 0, avgRating: null };
  }),

  /**
   * Get basic feedback analytics (admin only)
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Overall stats
    const [overallStats] = await db
      .select({
        totalFeedback: sql<number>`COUNT(*)`,
        totalAttended: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
        avgRating: sql<number>`AVG(CASE WHEN attended = 1 AND accuracyRating IS NOT NULL THEN accuracyRating ELSE NULL END)`,
        spamCount: sql<number>`SUM(CASE WHEN isSpam = 1 THEN 1 ELSE 0 END)`,
      })
      .from(eventFeedback);

    // Top rated events (by average accuracy)
    const topEvents = await db
      .select({
        eventId: eventFeedback.eventId,
        eventName: sql<string>`e.name`,
        avgRating: sql<number>`AVG(CASE WHEN ${eventFeedback.attended} = 1 AND ${eventFeedback.accuracyRating} IS NOT NULL THEN ${eventFeedback.accuracyRating} ELSE NULL END)`,
        feedbackCount: sql<number>`COUNT(*)`,
        attendedCount: sql<number>`SUM(CASE WHEN ${eventFeedback.attended} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(eventFeedback)
      .leftJoin(sql`events e`, sql`e.id = ${eventFeedback.eventId}`)
      .groupBy(eventFeedback.eventId, sql`e.name`)
      .having(sql`COUNT(*) >= 3`) // At least 3 feedback submissions
      .orderBy(sql`AVG(CASE WHEN ${eventFeedback.attended} = 1 AND ${eventFeedback.accuracyRating} IS NOT NULL THEN ${eventFeedback.accuracyRating} ELSE NULL END) DESC`)
      .limit(10);

    // Recent feedback (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [recentStats] = await db
      .select({
        count: sql<number>`COUNT(*)`,
        attended: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
      })
      .from(eventFeedback)
      .where(gte(eventFeedback.submittedAt, thirtyDaysAgo));

    return {
      overall: {
        totalFeedback: Number(overallStats.totalFeedback) || 0,
        totalAttended: Number(overallStats.totalAttended) || 0,
        avgRating: overallStats.avgRating ? parseFloat(Number(overallStats.avgRating).toFixed(2)) : null,
        spamCount: Number(overallStats.spamCount) || 0,
        attendanceRate: overallStats.totalFeedback
          ? parseFloat(((Number(overallStats.totalAttended) / Number(overallStats.totalFeedback)) * 100).toFixed(1))
          : 0,
      },
      topEvents: topEvents.map((e) => ({
        eventId: e.eventId,
        eventName: e.eventName,
        avgRating: e.avgRating ? parseFloat(Number(e.avgRating).toFixed(2)) : null,
        feedbackCount: Number(e.feedbackCount),
        attendedCount: Number(e.attendedCount),
      })),
      recent: {
        count: Number(recentStats.count) || 0,
        attended: Number(recentStats.attended) || 0,
      },
    };
  }),

  /**
   * Manually trigger spam digest email (admin only, for testing)
   */
  triggerSpamDigest: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const success = await triggerSpamDigest();
    return { success };
  }),

  /**
   * Export feedback data as CSV (admin only)
   */
  exportCSV: protectedProcedure
    .input(
      z.object({
        eventId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        showSpamOnly: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = sql`
        SELECT 
          f.id,
          f.eventId,
          e.name as eventName,
          e.startDate as eventDate,
          e.organizerName,
          f.attended,
          f.accuracyRating,
          f.helpfulDetails,
          f.inaccurateDetails,
          f.comments,
          f.submittedAt,
          f.isSpam,
          f.spamReason
        FROM eventFeedback f
        LEFT JOIN events e ON f.eventId = e.id
        WHERE 1=1
      `;

      const conditions = [];
      if (input?.showSpamOnly) {
        conditions.push(sql`f.isSpam = 1`);
      }
      if (input?.eventId) {
        conditions.push(sql`f.eventId = ${input.eventId}`);
      }
      if (input?.startDate) {
        conditions.push(sql`f.submittedAt >= ${new Date(input.startDate)}`);
      }
      if (input?.endDate) {
        conditions.push(sql`f.submittedAt <= ${new Date(input.endDate)}`);
      }

      if (conditions.length > 0) {
        query = sql`${query} AND ${sql.join(conditions, sql` AND `)}`;
      }

      query = sql`${query} ORDER BY f.submittedAt DESC`;

      const result: any = await db.execute(query);
      const feedbackList = (result[0] || []) as any[];

      // Convert to CSV format
      const headers = [
        "Feedback ID",
        "Event ID",
        "Event Name",
        "Event Date",
        "Organizer",
        "Attended",
        "Rating",
        "Helpful Details",
        "Inaccurate Details",
        "Comments",
        "Submitted At",
      ];

      const rows = feedbackList.map((f: any) => [
        f.id,
        f.eventId,
        f.eventName || "Unknown",
        f.eventDate ? new Date(f.eventDate).toISOString().split("T")[0] : "",
        f.organizerName || "Unknown",
        f.attended === 1 ? "Yes" : "No",
        f.accuracyRating || "N/A",
        f.helpfulDetails || "[]",
        f.inaccurateDetails || "[]",
        (f.comments || "").replace(/"/g, '""'), // Escape quotes
        f.submittedAt ? new Date(f.submittedAt).toISOString() : "",
      ]);

      const csvContent = [
        headers.map((h) => `"${h}"`).join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      return { csv: csvContent };
    }),
});
