import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { eventTemplates } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const eventTemplatesRouter = router({
  /**
   * Create a new event template
   */
  create: protectedProcedure
    .input(
      z.object({
        templateName: z.string().min(1, "Template name is required"),
        description: z.string().optional(),
        templateData: z.any(), // Event data as JSON
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [template] = await db.insert(eventTemplates).values({
        userId: ctx.user.id,
        templateName: input.templateName,
        description: input.description || null,
        templateData: input.templateData,
      });

      return {
        success: true,
        templateId: template.insertId,
      };
    }),

  /**
   * List all templates for the current user
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const templates = await db
      .select()
      .from(eventTemplates)
      .where(eq(eventTemplates.userId, ctx.user.id))
      .orderBy(desc(eventTemplates.updatedAt));

    return templates;
  }),

  /**
   * Get a single template by ID
   */
  get: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [template] = await db
        .select()
        .from(eventTemplates)
        .where(
          and(
            eq(eventTemplates.id, input.templateId),
            eq(eventTemplates.userId, ctx.user.id)
          )
        );

      if (!template) {
        throw new Error("Template not found or you don't have permission to access it");
      }

      return template;
    }),

  /**
   * Update an existing template
   */
  update: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        templateName: z.string().min(1).optional(),
        description: z.string().optional(),
        templateData: z.any().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const [existing] = await db
        .select()
        .from(eventTemplates)
        .where(
          and(
            eq(eventTemplates.id, input.templateId),
            eq(eventTemplates.userId, ctx.user.id)
          )
        );

      if (!existing) {
        throw new Error("Template not found or you don't have permission to update it");
      }

      // Build update object
      const updates: any = {};
      if (input.templateName !== undefined) updates.templateName = input.templateName;
      if (input.description !== undefined) updates.description = input.description;
      if (input.templateData !== undefined) updates.templateData = input.templateData;

      await db
        .update(eventTemplates)
        .set(updates)
        .where(eq(eventTemplates.id, input.templateId));

      return { success: true };
    }),

  /**
   * Delete a template
   */
  delete: protectedProcedure
    .input(z.object({ templateId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const [existing] = await db
        .select()
        .from(eventTemplates)
        .where(
          and(
            eq(eventTemplates.id, input.templateId),
            eq(eventTemplates.userId, ctx.user.id)
          )
        );

      if (!existing) {
        throw new Error("Template not found or you don't have permission to delete it");
      }

      await db
        .delete(eventTemplates)
        .where(eq(eventTemplates.id, input.templateId));

      return { success: true };
    }),
});
