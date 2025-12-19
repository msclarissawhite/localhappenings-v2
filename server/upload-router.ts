import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

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
        const buffer = Buffer.from(base64Data, "base64");

        // Generate unique file key with random suffix to prevent enumeration
        const fileExtension = input.fileName.split(".").pop() || "jpg";
        const randomSuffix = nanoid(10);
        const fileKey = `event-images/${Date.now()}-${randomSuffix}.${fileExtension}`;

        // Upload to S3
        const { url } = await storagePut(fileKey, buffer, input.mimeType);

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
