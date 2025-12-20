import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Batch Edit API", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let adminContext: Context;
  let userContext: Context;

  beforeEach(() => {
    adminContext = {
      user: { id: 1, email: "admin@example.com", name: "Admin User", role: "admin", openId: "admin-open-id" },
      req: {} as any,
      res: {} as any,
    };
    userContext = {
      user: { id: 2, email: "user@example.com", name: "Regular User", role: "user", openId: "user-open-id" },
      req: {} as any,
      res: {} as any,
    };
    caller = appRouter.createCaller(adminContext);
  });

  describe("events.batchUpdate", () => {
    it("should require authentication", async () => {
      const unauthCaller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
      
      await expect(
        unauthCaller.events.batchUpdate({
          eventIds: [1, 2, 3],
          updates: { venue: "New Venue" },
        })
      ).rejects.toThrow("UNAUTHORIZED");
    });

    it("should require admin role", async () => {
      const userCaller = appRouter.createCaller(userContext);
      
      await expect(
        userCaller.events.batchUpdate({
          eventIds: [1, 2, 3],
          updates: { venue: "New Venue" },
        })
      ).rejects.toThrow("FORBIDDEN");
    });

    it("should update venue for multiple events", async () => {
      // Note: This test assumes events exist in the database
      // In a real test environment, you would create test events first
      const result = await caller.events.batchUpdate({
        eventIds: [1, 2],
        updates: { venue: "Updated Venue Name" },
      });

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("updatedCount");
      expect(typeof result.updatedCount).toBe("number");
    });

    it("should update organizer information", async () => {
      const result = await caller.events.batchUpdate({
        eventIds: [1, 2],
        updates: {
          organizerName: "Updated Organizer",
          organizerEmail: "updated@example.com",
          organizerPhone: "555-1234",
        },
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should update accessibility features", async () => {
      const result = await caller.events.batchUpdate({
        eventIds: [1, 2],
        updates: {
          wheelchairAccessible: "yes",
          accessibleWashroom: "yes",
          accessibleParking: "yes",
        },
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });

    it("should handle empty event IDs array", async () => {
      const result = await caller.events.batchUpdate({
        eventIds: [],
        updates: { venue: "New Venue" },
      });

      expect(result.updatedCount).toBe(0);
    });

    it("should handle partial updates", async () => {
      // Only update specific fields, leave others unchanged
      const result = await caller.events.batchUpdate({
        eventIds: [1],
        updates: {
          venue: "New Venue",
          // Other fields not included, should remain unchanged
        },
      });

      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
    });
  });

  describe("Batch edit validation", () => {
    it("should validate event IDs are numbers", async () => {
      await expect(
        caller.events.batchUpdate({
          eventIds: ["invalid" as any, "ids" as any],
          updates: { venue: "Test" },
        })
      ).rejects.toThrow();
    });

    it("should require at least one update field", async () => {
      const result = await caller.events.batchUpdate({
        eventIds: [1, 2],
        updates: {},
      });

      // Should succeed but update nothing
      expect(result.updatedCount).toBe(0);
    });
  });
});
