import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "./db";
import { organizers, organizerNotes, emailTemplates, events } from "../drizzle/schema";
import { eq, and, sql, desc, gte, count } from "drizzle-orm";

/**
 * Organizer Management Router
 * Admin-only procedures for managing organizers, notes, and email templates
 */

export const organizerManagementRouter = router({
  /**
   * Get all organizers with enhanced statistics
   */
  getAllOrganizers: publicProcedure
    .input(z.object({
      verificationFilter: z.enum(["all", "verified", "unverified"]).optional(),
      typeFilter: z.string().optional(),
      activityDays: z.number().optional(), // Filter by last activity (30, 60, 90 days)
      searchQuery: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Build WHERE conditions
      const conditions = [];
      
      if (input.verificationFilter === "verified") {
        conditions.push(eq(organizers.isVerified, 1));
      } else if (input.verificationFilter === "unverified") {
        conditions.push(eq(organizers.isVerified, 0));
      }

      if (input.typeFilter && input.typeFilter !== "all") {
        conditions.push(eq(organizers.organizerType, input.typeFilter as any));
      }

      if (input.activityDays) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - input.activityDays);
        conditions.push(gte(organizers.updatedAt, cutoffDate));
      }

      // Get organizers with event counts and stats
      const organizersList = await db
        .select({
          id: organizers.id,
          name: organizers.name,
          email: organizers.email,
          phone: organizers.phone,
          website: organizers.website,
          organizerType: organizers.organizerType,
          isVerified: organizers.isVerified,
          createdAt: organizers.createdAt,
          updatedAt: organizers.updatedAt,
          totalEvents: sql<number>`(
            SELECT COUNT(*) FROM events WHERE events.organizerId = ${organizers.id}
          )`,
          approvedEvents: sql<number>`(
            SELECT COUNT(*) FROM events 
            WHERE events.organizerId = ${organizers.id} AND events.status = 'published'
          )`,
          pendingEvents: sql<number>`(
            SELECT COUNT(*) FROM events 
            WHERE events.organizerId = ${organizers.id} AND events.status = 'pending'
          )`,
          rejectedEvents: sql<number>`(
            SELECT COUNT(*) FROM events 
            WHERE events.organizerId = ${organizers.id} AND events.status = 'rejected'
          )`,
          lastSubmission: sql<Date | null>`(
            SELECT MAX(events.createdAt) FROM events WHERE events.organizerId = ${organizers.id}
          )`,
          flagCount: sql<number>`(
            SELECT COUNT(*) FROM organizerNotes 
            WHERE organizerNotes.organizerId = ${organizers.id} AND organizerNotes.isFlagged = 1
          )`,
        })
        .from(organizers)
        .where(conditions.length > 0 ? and(...conditions) : undefined);

      // Filter by search query if provided
      let filteredOrganizers = organizersList;
      if (input.searchQuery) {
        const query = input.searchQuery.toLowerCase();
        filteredOrganizers = organizersList.filter(org =>
          org.name.toLowerCase().includes(query) ||
          org.email.toLowerCase().includes(query)
        );
      }

      // Calculate approval rate for each organizer
      const organizersWithStats = filteredOrganizers.map(org => ({
        ...org,
        approvalRate: org.totalEvents > 0 
          ? Math.round((org.approvedEvents / org.totalEvents) * 100) 
          : 0,
      }));

      return organizersWithStats;
    }),

  /**
   * Get organizer details with full history
   */
  getOrganizerDetails: publicProcedure
    .input(z.object({ organizerId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [organizer] = await db.select().from(organizers).where(eq(organizers.id, input.organizerId));
      if (!organizer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organizer not found" });
      }

      // Get all events by this organizer
      const organizerEvents = await db.select().from(events).where(eq(events.organizerId, input.organizerId));

      // Get all notes about this organizer
      const notes = await db.select().from(organizerNotes).where(eq(organizerNotes.organizerId, input.organizerId)).orderBy(desc(organizerNotes.createdAt));

      return {
        organizer,
        events: organizerEvents,
        notes,
      };
    }),

  /**
   * Bulk update organizer verification status
   */
  bulkUpdateVerification: publicProcedure
    .input(z.object({
      organizerIds: z.array(z.number()),
      isVerified: z.boolean(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      for (const organizerId of input.organizerIds) {
        await db.update(organizers)
          .set({ isVerified: input.isVerified ? 1 : 0 })
          .where(eq(organizers.id, organizerId));
      }

      return { success: true, count: input.organizerIds.length };
    }),

  /**
   * Add admin note about an organizer
   */
  addOrganizerNote: publicProcedure
    .input(z.object({
      organizerId: z.number(),
      note: z.string(),
      isFlagged: z.boolean().optional(),
      flagReason: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [newNote] = await db.insert(organizerNotes).values({
        organizerId: input.organizerId,
        adminId: ctx.user.id,
        note: input.note,
        isFlagged: input.isFlagged ? 1 : 0,
        flagReason: input.flagReason || null,
      });

      return { success: true, noteId: newNote.insertId };
    }),

  /**
   * Get all admin notes for an organizer
   */
  getOrganizerNotes: publicProcedure
    .input(z.object({ organizerId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const notes = await db.select().from(organizerNotes)
        .where(eq(organizerNotes.organizerId, input.organizerId))
        .orderBy(desc(organizerNotes.createdAt));

      return notes;
    }),

  /**
   * Delete admin note
   */
  deleteOrganizerNote: publicProcedure
    .input(z.object({ noteId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(organizerNotes).where(eq(organizerNotes.id, input.noteId));

      return { success: true };
    }),

  /**
   * Get organizer analytics
   */
  getOrganizerAnalytics: publicProcedure
    .query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      // Top organizers by event count
      const topOrganizers = await db
        .select({
          id: organizers.id,
          name: organizers.name,
          email: organizers.email,
          eventCount: sql<number>`COUNT(${events.id})`,
        })
        .from(organizers)
        .leftJoin(events, eq(events.organizerId, organizers.id))
        .groupBy(organizers.id)
        .orderBy(desc(sql`COUNT(${events.id})`))
        .limit(10);

      // New organizers this month
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newOrganizersCount = await db
        .select({ count: count() })
        .from(organizers)
        .where(gte(organizers.createdAt, thirtyDaysAgo));

      // Organizers by type
      const organizersByType = await db
        .select({
          type: organizers.organizerType,
          count: count(),
        })
        .from(organizers)
        .groupBy(organizers.organizerType);

      // Organizers by province (from their events)
      const organizersByProvince = await db
        .select({
          province: events.province,
          count: sql<number>`COUNT(DISTINCT ${events.organizerId})`,
        })
        .from(events)
        .where(sql`${events.organizerId} IS NOT NULL`)
        .groupBy(events.province);

      return {
        topOrganizers,
        newOrganizersThisMonth: newOrganizersCount[0]?.count || 0,
        organizersByType,
        organizersByProvince,
      };
    }),

  /**
   * Email Templates CRUD
   */
  
  // Get all email templates
  getAllEmailTemplates: publicProcedure
    .query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const templates = await db.select().from(emailTemplates).orderBy(desc(emailTemplates.updatedAt));
      return templates;
    }),

  // Create email template
  createEmailTemplate: publicProcedure
    .input(z.object({
      name: z.string(),
      subject: z.string(),
      body: z.string(),
      category: z.enum(["welcome", "clarification", "rejection", "general", "reminder", "announcement"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const [newTemplate] = await db.insert(emailTemplates).values(input);

      return { success: true, templateId: newTemplate.insertId };
    }),

  // Update email template
  updateEmailTemplate: publicProcedure
    .input(z.object({
      id: z.number(),
      name: z.string(),
      subject: z.string(),
      body: z.string(),
      category: z.enum(["welcome", "clarification", "rejection", "general", "reminder", "announcement"]),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.update(emailTemplates)
        .set({
          name: input.name,
          subject: input.subject,
          body: input.body,
          category: input.category,
        })
        .where(eq(emailTemplates.id, input.id));

      return { success: true };
    }),

  // Delete email template
  deleteEmailTemplate: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      await db.delete(emailTemplates).where(eq(emailTemplates.id, input.id));

      return { success: true };
    }),
});
