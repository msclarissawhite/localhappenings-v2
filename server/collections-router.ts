import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { collections } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const collectionsRouter = router({
  /**
   * List all collections (admin only)
   */
  listAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(collections)
      .orderBy(collections.sortOrder, collections.createdAt);
  }),

  /**
   * Get active collections (public)
   */
  listActive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return await db
      .select()
      .from(collections)
      .where(eq(collections.isActive, 1))
      .orderBy(collections.sortOrder);
  }),

  /**
   * Get collection by slug (public)
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [collection] = await db
        .select()
        .from(collections)
        .where(eq(collections.slug, input.slug));

      return collection || null;
    }),

  /**
   * Create collection (admin only)
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().default(0),
        eventTypeIds: z.array(z.number()).optional(),
        provinces: z.array(z.string()).optional(),
        municipalities: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check for duplicate slug
      const [existing] = await db
        .select()
        .from(collections)
        .where(eq(collections.slug, input.slug));

      if (existing) {
        throw new Error("A collection with this slug already exists");
      }

      const [result] = await db.insert(collections).values({
        name: input.name,
        slug: input.slug,
        description: input.description || undefined,
        imageUrl: input.imageUrl || undefined,
        sortOrder: input.sortOrder,
        eventTypeIds: input.eventTypeIds || undefined,
        provinces: input.provinces || undefined,
        municipalities: input.municipalities || undefined,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        isActive: 0, // Inactive by default
      });

      return { success: true, id: result.insertId };
    }),

  /**
   * Update collection (admin only)
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/).optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
        eventTypeIds: z.array(z.number()).optional(),
        provinces: z.array(z.string()).optional(),
        municipalities: z.array(z.string()).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check for duplicate slug if changing slug
      if (input.slug) {
        const [existing] = await db
          .select()
          .from(collections)
          .where(eq(collections.slug, input.slug));

        if (existing && existing.id !== input.id) {
          throw new Error("A collection with this slug already exists");
        }
      }

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.slug !== undefined) updateData.slug = input.slug;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.imageUrl !== undefined) updateData.imageUrl = input.imageUrl;
      if (input.sortOrder !== undefined) updateData.sortOrder = input.sortOrder;
      if (input.isActive !== undefined) updateData.isActive = input.isActive ? 1 : 0;
      if (input.eventTypeIds !== undefined) updateData.eventTypeIds = input.eventTypeIds;
      if (input.provinces !== undefined) updateData.provinces = input.provinces;
      if (input.municipalities !== undefined) updateData.municipalities = input.municipalities;
      if (input.startDate !== undefined) updateData.startDate = input.startDate;
      if (input.endDate !== undefined) updateData.endDate = input.endDate;

      await db
        .update(collections)
        .set(updateData)
        .where(eq(collections.id, input.id));

      return { success: true };
    }),

  /**
   * Delete collection (admin only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(collections).where(eq(collections.id, input.id));

      return { success: true };
    }),

  /**
   * Toggle collection active status (admin only)
   */
  toggleActive: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }

      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [collection] = await db
        .select()
        .from(collections)
        .where(eq(collections.id, input.id));

      if (!collection) {
        throw new Error("Collection not found");
      }

      await db
        .update(collections)
        .set({ isActive: collection.isActive === 1 ? 0 : 1 })
        .where(eq(collections.id, input.id));

      return { success: true, isActive: collection.isActive === 0 };
    }),
});
