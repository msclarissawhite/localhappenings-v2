import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { processEventImage, getImageMetadata } from "./imageProcessing";
import { nanoid } from "nanoid";
import { getDb } from "./db";
import { organizerImages } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const imageLibraryRouter = router({
  /**
   * Upload an image to the organizer's image library
   * Images are processed with Sharp and stored in S3
   */
  upload: protectedProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
        mimeType: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Decode base64 to buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const originalBuffer = Buffer.from(base64Data, "base64");

        // Get original image metadata for logging
        const metadata = await getImageMetadata(originalBuffer);
        console.log(`[Image Library] Processing: ${metadata.width}x${metadata.height} ${metadata.format} (${Math.round(metadata.size! / 1024)}KB)`);

        // Process image with Sharp (resize to 1200×630px, optimize)
        const processedBuffer = await processEventImage(originalBuffer);
        console.log(`[Image Library] Processed to: 1200x630 JPEG (${Math.round(processedBuffer.length / 1024)}KB)`);

        // Generate unique file key
        const randomSuffix = nanoid(10);
        const fileKey = `organizer-library/${ctx.user.id}/${Date.now()}-${randomSuffix}.jpg`;

        // Upload processed image to S3
        const { url } = await storagePut(fileKey, processedBuffer, "image/jpeg");

        // Save to database
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const [image] = await db.insert(organizerImages).values({
          userId: ctx.user.id,
          url,
          fileKey,
          fileName: input.fileName,
          description: input.description || null,
        });

        return {
          success: true,
          image: {
            id: image.insertId,
            url,
            fileKey,
            fileName: input.fileName,
            description: input.description,
          },
        };
      } catch (error) {
        console.error("[Image Library] Upload error:", error);
        throw new Error("Failed to upload image to library");
      }
    }),

  /**
   * List all images in the organizer's library
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    
    const images = await db
      .select()
      .from(organizerImages)
      .where(eq(organizerImages.userId, ctx.user.id))
      .orderBy(desc(organizerImages.uploadedAt));

    return images;
  }),

  /**
   * Delete an image from the library
   * Note: This doesn't delete from S3, only removes the database record
   * S3 cleanup can be handled separately with lifecycle policies
   */
  delete: protectedProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      // Verify the image belongs to the user
      const [image] = await db
        .select()
        .from(organizerImages)
        .where(
          and(
            eq(organizerImages.id, input.imageId),
            eq(organizerImages.userId, ctx.user.id)
          )
        );

      if (!image) {
        throw new Error("Image not found or you don't have permission to delete it");
      }

      // Delete from database
      await db
        .delete(organizerImages)
        .where(eq(organizerImages.id, input.imageId));

      return { success: true };
    }),
});
