import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { homepageBanners } from "../drizzle/schema";
import { eq, and, lte, gte, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const bannerSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().min(1, "Description is required"),
  bgGradient: z.string().min(1, "Background gradient is required"),
  textColor: z.string().min(1, "Text color is required"),
  icon: z.string().optional(),
  eventTypeIds: z.array(z.number()).optional(),
  provinces: z.array(z.string()).optional(),
  municipalities: z.array(z.string()).optional(),
  startDate: z.string().optional(), // ISO date string
  endDate: z.string().optional(), // ISO date string
  isActive: z.number().default(1),
  sortOrder: z.number().default(0),
  activeMonths: z.array(z.number()).optional(), // Array of month numbers (0-11)
});

export const bannerRouter = router({
  // Get active banners for homepage (public)
  getActive: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const currentMonth = new Date().getMonth(); // 0-11
    
    const banners = await db
      .select()
      .from(homepageBanners)
      .where(eq(homepageBanners.isActive, 1))
      .orderBy(homepageBanners.sortOrder);
    
    // Filter banners based on date range and active months
    const activeBanners = banners.filter((banner: any) => {
      // Check date range if specified
      if (banner.startDate && banner.endDate) {
        const start = new Date(banner.startDate).toISOString().split('T')[0];
        const end = new Date(banner.endDate).toISOString().split('T')[0];
        if (currentDate < start || currentDate > end) {
          return false;
        }
      }
      
      // Check active months if specified
      if (banner.activeMonths && Array.isArray(banner.activeMonths)) {
        if (!banner.activeMonths.includes(currentMonth)) {
          return false;
        }
      }
      
      return true;
    });
    
    return activeBanners;
  }),

  // Get all banners for admin management
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
    }
    
    const db = await getDb();
    if (!db) return [];
    
    return await db
      .select()
      .from(homepageBanners)
      .orderBy(homepageBanners.sortOrder);
  }),

  // Create new banner
  create: protectedProcedure
    .input(bannerSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const [banner] = await db.insert(homepageBanners).values({
        ...input,
        startDate: input.startDate ? new Date(input.startDate) : null,
        endDate: input.endDate ? new Date(input.endDate) : null,
      });
      
      return banner;
    }),

  // Update banner
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: bannerSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      const updateData: any = { ...input.data };
      if (input.data.startDate) {
        updateData.startDate = new Date(input.data.startDate);
      }
      if (input.data.endDate) {
        updateData.endDate = new Date(input.data.endDate);
      }
      
      await db
        .update(homepageBanners)
        .set(updateData)
        .where(eq(homepageBanners.id, input.id));
      
      return { success: true };
    }),

  // Delete banner
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .delete(homepageBanners)
        .where(eq(homepageBanners.id, input.id));
      
      return { success: true };
    }),

  // Toggle active status
  toggleActive: protectedProcedure
    .input(z.object({ id: z.number(), isActive: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      await db
        .update(homepageBanners)
        .set({ isActive: input.isActive })
        .where(eq(homepageBanners.id, input.id));
      
      return { success: true };
    }),

  // Reorder banners
  reorder: protectedProcedure
    .input(z.array(z.object({ id: z.number(), sortOrder: z.number() })))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
      }
      
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });
      
      // Update sort order for each banner
      for (const item of input) {
        await db
          .update(homepageBanners)
          .set({ sortOrder: item.sortOrder })
          .where(eq(homepageBanners.id, item.id));
      }
      
      return { success: true };
    }),
});
