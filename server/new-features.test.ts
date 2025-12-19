import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

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

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Event Submission with Organizer Validation", () => {
  it("should accept submission with organizer name and email", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Test Event",
      description: "A test event",
      province: "Nova Scotia",
      city: "Halifax",
      startDate: new Date("2025-12-25"),
      organizerName: "Test Organizer",
      organizerEmail: "organizer@example.com",
      displayOrganizerInfo: true,
      accessibility: {},
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);
    expect(result.eventId).toBeGreaterThan(0);
  });

  it("should accept submission with organizer name and phone", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const eventData = {
      name: "Test Event 2",
      description: "Another test event",
      province: "Nova Scotia",
      city: "Dartmouth",
      startDate: new Date("2025-12-26"),
      organizerName: "Test Organizer 2",
      organizerPhone: "902-555-1234",
      displayOrganizerInfo: false,
      accessibility: {},
    };

    const result = await caller.events.submit(eventData);
    expect(result.success).toBe(true);
    expect(result.eventId).toBeGreaterThan(0);
  });
});

describe("Event Search Functionality", () => {
  it("should filter events by search term", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Search for events with "Story" in the name
    const results = await caller.events.list({ search: "Story" });
    
    // Should return events that match the search term
    expect(Array.isArray(results)).toBe(true);
    
    // If results exist, verify they contain the search term
    if (results.length > 0) {
      const hasMatch = results.some(event => 
        event.name?.toLowerCase().includes("story") ||
        event.description?.toLowerCase().includes("story")
      );
      expect(hasMatch).toBe(true);
    }
  });

  it("should return empty array for non-existent search term", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.events.list({ search: "NONEXISTENT_SEARCH_TERM_12345" });
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });
});

describe("Event Filtering", () => {
  it("should filter events by province", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.events.list({ province: "Nova Scotia" });
    expect(Array.isArray(results)).toBe(true);
    
    // All results should be from Nova Scotia
    results.forEach(event => {
      expect(event.province).toBe("Nova Scotia");
    });
  });

  it("should filter events by city", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.events.list({ city: "Halifax" });
    expect(Array.isArray(results)).toBe(true);
    
    // All results should be from Halifax
    results.forEach(event => {
      expect(event.city).toBe("Halifax");
    });
  });

  it("should filter free events", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.events.list({ isFree: true });
    expect(Array.isArray(results)).toBe(true);
    
    // All results should be free
    results.forEach(event => {
      expect(event.isFree).toBe(1);
    });
  });
});
