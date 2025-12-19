import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the storage module
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: "https://example.com/test-image.jpg",
    key: "event-images/test-123.jpg",
  }),
}));

function createMockContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("upload.uploadImage", () => {
  it("successfully uploads an image and returns URL", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA==";

    const result = await caller.upload.uploadImage({
      imageData: base64Image,
      fileName: "test-image.jpg",
      mimeType: "image/jpeg",
    });

    expect(result.success).toBe(true);
    expect(result.url).toBe("https://example.com/test-image.jpg");
    expect(result.fileKey).toContain("event-images/");
  });

  it("generates unique file keys with timestamps", async () => {
    const ctx = createMockContext();
    const caller = appRouter.createCaller(ctx);

    const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA==";

    const result = await caller.upload.uploadImage({
      imageData: base64Image,
      fileName: "another-test.jpg",
      mimeType: "image/jpeg",
    });

    // File key should contain timestamp and random suffix
    expect(result.fileKey).toContain("event-images/");
    expect(result.fileKey).toMatch(/\d+-[a-zA-Z0-9]+/);
    expect(result.fileKey).toMatch(/\.jpg$/);
  });
});
