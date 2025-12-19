import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";

describe("Organizer Magic Link", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    caller = appRouter.createCaller({
      user: null,
    });
  });

  it("should generate magic link with correct deployed URL", async () => {
    const result = await caller.organizer.requestMagicLink({
      email: "test-organizer@example.com",
      name: "Test Organizer",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Magic link sent! Check your email.");
    
    // In development mode, the magic link should be returned
    if (process.env.NODE_ENV === "development" && result.magicLink) {
      // Verify the magic link uses the deployed URL, not localhost
      expect(result.magicLink).toContain(process.env.VITE_APP_URL || "");
      expect(result.magicLink).toContain("/organizer/verify?token=");
      expect(result.magicLink).not.toContain("localhost");
      
      console.log("✅ Magic link generated correctly:", result.magicLink);
    }
  });

  it("should verify that VITE_APP_URL environment variable is set", () => {
    expect(process.env.VITE_APP_URL).toBeDefined();
    expect(process.env.VITE_APP_URL).not.toBe("");
    expect(process.env.VITE_APP_URL).toContain("https://");
    
    console.log("✅ VITE_APP_URL is set to:", process.env.VITE_APP_URL);
  });
});
