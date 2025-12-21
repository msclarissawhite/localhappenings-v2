import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Event Filtering Tests
 * 
 * Tests the comprehensive event filtering system including:
 * - Location filtering (province, municipality)
 * - Date filtering (date range, time of day)
 * - Accessibility filtering (wheelchair, sensory, stroller, etc.)
 * - Cost filtering (free, paid, kids free)
 * - Age group filtering
 * - Environment filtering (indoor/outdoor)
 * - Combined multi-filter scenarios
 */

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Event Filtering System", () => {
  describe("Location Filtering", () => {
    it("should filter events by province", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        province: "Nova Scotia",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      // All returned events should be from Nova Scotia
      if (result.events.length > 0) {
        expect(result.events.every(e => e.province === "Nova Scotia")).toBe(true);
      }
    });

    it("should filter events by municipality", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        municipality: "Halifax",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.municipality === "Halifax")).toBe(true);
      }
    });

    it("should filter events by province AND municipality", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        province: "Nova Scotia",
        municipality: "Dartmouth",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => 
          e.province === "Nova Scotia" && e.municipality === "Dartmouth"
        )).toBe(true);
      }
    });
  });

  describe("Date Filtering", () => {
    it("should filter events by date range", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const startDate = new Date("2025-06-01");
      const endDate = new Date("2025-06-30");

      const result = await caller.events.list({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => {
          const eventDate = new Date(e.startDate);
          return eventDate >= startDate && eventDate <= endDate;
        })).toBe(true);
      }
    });

    it("should filter events by time of day (morning)", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        timeOfDay: "morning",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => {
          const hour = new Date(e.startDate).getHours();
          return hour >= 5 && hour < 12;
        })).toBe(true);
      }
    });

    it("should filter events by time of day (evening)", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        timeOfDay: "evening",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => {
          const hour = new Date(e.startDate).getHours();
          return hour >= 17 && hour < 22;
        })).toBe(true);
      }
    });
  });

  describe("Accessibility Filtering", () => {
    it("should filter wheelchair-accessible events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        wheelchairEntrance: "yes",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.wheelchairEntrance === "yes")).toBe(true);
      }
    });

    it("should filter sensory-friendly events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        sensoryFriendly: "yes",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.sensoryFriendly === "yes")).toBe(true);
      }
    });

    it("should filter stroller-accessible events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        strollerAccessible: "yes",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.strollerAccessible === "yes")).toBe(true);
      }
    });

    it("should filter quiet environment events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        quietEnvironment: "yes",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.quietEnvironment === "yes")).toBe(true);
      }
    });
  });

  describe("Cost Filtering", () => {
    it("should filter free events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        isFree: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.isFree === true)).toBe(true);
      }
    });

    it("should filter paid events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        isFree: false,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.isFree === false)).toBe(true);
      }
    });

    it("should filter kids free events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        kidsFree: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.kidsFree === true)).toBe(true);
      }
    });
  });

  describe("Age Group Filtering", () => {
    it("should filter all ages events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        allAges: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.allAges === true)).toBe(true);
      }
    });

    it("should filter young children events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        youngChildren: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.youngChildren === true)).toBe(true);
      }
    });

    it("should filter kids events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        kids: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.kids === true)).toBe(true);
      }
    });

    it("should filter adults events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        adults: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.adults === true)).toBe(true);
      }
    });
  });

  describe("Environment Filtering", () => {
    it("should filter indoor events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        indoor: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.indoor === true)).toBe(true);
      }
    });

    it("should filter outdoor events", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        outdoor: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => e.outdoor === true)).toBe(true);
      }
    });
  });

  describe("Combined Filtering Scenarios", () => {
    it("should filter by location + accessibility", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        municipality: "Halifax",
        wheelchairEntrance: "yes",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => 
          e.municipality === "Halifax" && e.wheelchairEntrance === "yes"
        )).toBe(true);
      }
    });

    it("should filter by cost + age group", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        isFree: true,
        youngChildren: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => 
          e.isFree === true && e.youngChildren === true
        )).toBe(true);
      }
    });

    it("should filter by environment + cost + age", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        indoor: true,
        isFree: true,
        allAges: true,
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => 
          e.indoor === true && e.isFree === true && e.allAges === true
        )).toBe(true);
      }
    });

    it("should handle complex multi-accessibility filters", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      if (result.events.length > 0) {
        expect(result.events.every(e => 
          e.wheelchairEntrance === "yes" &&
          e.stepFreeEntry === "yes" &&
          e.accessibleWashrooms === "yes"
        )).toBe(true);
      }
    });
  });

  describe("Text Search", () => {
    it("should search events by query", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        query: "workshop",
        limit: 50,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      // Results should contain the search term in name, description, venue, or municipality
      if (result.events.length > 0) {
        expect(result.events.every(e => {
          const searchableText = `${e.name} ${e.description} ${e.venue} ${e.municipality}`.toLowerCase();
          return searchableText.includes("workshop");
        })).toBe(true);
      }
    });
  });

  describe("Pagination", () => {
    it("should respect limit parameter", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.events.list({
        limit: 5,
        offset: 0,
      });

      expect(Array.isArray(result.events)).toBe(true);
      expect(result.events.length).toBeLessThanOrEqual(5);
    });

    it("should respect offset parameter", async () => {
      const ctx = createTestContext();
      const caller = appRouter.createCaller(ctx);

      const firstPage = await caller.events.list({
        limit: 5,
        offset: 0,
      });

      const secondPage = await caller.events.list({
        limit: 5,
        offset: 5,
      });

      expect(Array.isArray(firstPage.events)).toBe(true);
      expect(Array.isArray(secondPage.events)).toBe(true);

      // If both pages have results, they should be different
      if (firstPage.events.length > 0 && secondPage.events.length > 0) {
        const firstPageIds = firstPage.events.map(e => e.id);
        const secondPageIds = secondPage.events.map(e => e.id);
        const overlap = firstPageIds.some(id => secondPageIds.includes(id));
        expect(overlap).toBe(false);
      }
    });
  });
});
