import sharp from "sharp";

/**
 * Process and optimize event images for Local Happenings
 * 
 * Automatically resizes images to 1200×630px (1.91:1 aspect ratio)
 * optimized for both desktop and mobile viewing, plus social media sharing.
 * 
 * @param imageBuffer - Original image buffer (any size, PNG/JPG/WebP)
 * @returns Processed image buffer (JPEG, 1200×630px, 85% quality)
 */
export async function processEventImage(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const processedImage = await sharp(imageBuffer)
      .resize(1200, 630, {
        fit: "cover",        // Crop to exact dimensions
        position: "center",  // Center the crop
        withoutEnlargement: false, // Allow upscaling if needed
      })
      .jpeg({
        quality: 85,         // Good balance of quality vs file size
        progressive: true,   // Progressive JPEG for faster loading
        mozjpeg: true,       // Use mozjpeg for better compression
      })
      .toBuffer();

    return processedImage;
  } catch (error) {
    console.error("Error processing image with Sharp:", error);
    throw new Error("Failed to process image. Please ensure the file is a valid image format.");
  }
}

/**
 * Get metadata about an image (dimensions, format, size)
 * Useful for validation before processing
 */
export async function getImageMetadata(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: metadata.size,
    };
  } catch (error) {
    console.error("Error reading image metadata:", error);
    throw new Error("Failed to read image metadata. Please ensure the file is a valid image.");
  }
}
