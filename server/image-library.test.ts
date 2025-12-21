import { describe, it, expect, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Image Library API", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let mockContext: Context;

  beforeEach(() => {
    mockContext = {
      user: { id: 1, email: "test@example.com", name: "Test User", role: "user", openId: "test-open-id" },
      req: {} as any,
      res: {} as any,
    };
    caller = appRouter.createCaller(mockContext);
  });

  describe("imageLibrary.upload", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.imageLibrary.upload({
          imageData: "base64-image-data",
          fileName: "test.jpg",
          mimeType: "image/jpeg",
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should upload image and return URL", async () => {
      const result = await caller.imageLibrary.upload({
        imageData: "base64-test-data",
        fileName: "test-image.jpg",
        mimeType: "image/jpeg",
      });

      expect(result).toHaveProperty("imageId");
      expect(result).toHaveProperty("imageUrl");
      expect(typeof result.imageId).toBe("number");
      expect(typeof result.imageUrl).toBe("string");
      expect(result.imageUrl).toContain("https://");
    });
  });

  describe("imageLibrary.list", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(unauthCaller.imageLibrary.list()).rejects.toThrow("UNAUTHORIZED");
    });

    it("should return empty array for user with no images", async () => {
      const result = await caller.imageLibrary.list();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return user's images after upload", async () => {
      // Upload an image first
      await caller.imageLibrary.upload({
        imageData: "base64-test-data",
        fileName: "test.jpg",
        mimeType: "image/jpeg",
      });

      const result = await caller.imageLibrary.list();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty("id");
        expect(result[0]).toHaveProperty("imageUrl");
        expect(result[0]).toHaveProperty("fileName");
        expect(result[0]).toHaveProperty("createdAt");
      }
    });
  });

  describe("imageLibrary.delete", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.imageLibrary.delete({ imageId: 1 })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should delete user's own image", async () => {
      // Upload an image first
      const uploadResult = await caller.imageLibrary.upload({
        imageData: "base64-test-data",
        fileName: "to-delete.jpg",
        mimeType: "image/jpeg",
      });

      // Delete it
      const deleteResult = await caller.imageLibrary.delete({ imageId: uploadResult.imageId });
      
      expect(deleteResult).toHaveProperty("success");
      expect(deleteResult.success).toBe(true);
    });

    it("should not allow deleting another user's image", async () => {
      // Upload as user 1
      const uploadResult = await caller.imageLibrary.upload({
        imageData: "base64-test-data",
        fileName: "user1-image.jpg",
        mimeType: "image/jpeg",
      });

      // Try to delete as user 2
      const user2Context: Context = {
        user: { id: 2, email: "user2@example.com", name: "User 2", role: "user", openId: "user2-open-id" },
        req: {} as any,
        res: {} as any,
      };
      const user2Caller = appRouter.createCaller(user2Context);

      await expect(
        user2Caller.imageLibrary.delete({ imageId: uploadResult.imageId })
      ).rejects.toThrow();
    });
  });
});
