import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import { processEventImage, getImageMetadata } from "./imageProcessing";

export const uploadRouter = router({
  /**
   * Upload an image to S3 and return the public URL
   * Accepts base64 encoded image data
   */
  uploadImage: publicProcedure
    .input(
      z.object({
        imageData: z.string(), // base64 encoded image
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Decode base64 to buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const originalBuffer = Buffer.from(base64Data, "base64");

        // Get original image metadata for logging
        const metadata = await getImageMetadata(originalBuffer);
        console.log(`Processing image: ${metadata.width}x${metadata.height} ${metadata.format} (${Math.round(metadata.size! / 1024)}KB)`);

        // Process image with Sharp (resize to 1200×630px, optimize)
        const processedBuffer = await processEventImage(originalBuffer);
        console.log(`Processed to: 1200x630 JPEG (${Math.round(processedBuffer.length / 1024)}KB)`);

        // Generate unique file key with random suffix to prevent enumeration
        // Always use .jpg extension since Sharp outputs JPEG
        const randomSuffix = nanoid(10);
        const fileKey = `event-images/${Date.now()}-${randomSuffix}.jpg`;

        // Upload processed image to S3
        const { url } = await storagePut(fileKey, processedBuffer, "image/jpeg");

        return {
          success: true,
          url,
          fileKey,
        };
      } catch (error) {
        console.error("Image upload error:", error);
        throw new Error("Failed to upload image");
      }
    }),
});
