import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { getDb } from "./db";
import { users } from "../drizzle/schema";

describe("Bulk Upload CSV Fields", () => {
  let adminUserId: number;

  beforeAll(async () => {
    // Create admin user for testing
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const [result] = await db
      .insert(users)
      .values({
        openId: `test-admin-bulk-${Date.now()}`,
        name: "Test Admin",
        role: "admin",
        loginMethod: "email",
      });

    adminUserId = Number(result.insertId);
  });

  it("should accept all new CSV fields in bulk upload", async () => {
    const caller = appRouter.createCaller({
      user: { id: adminUserId, role: "admin" },
    } as Context);

    const testEvent = {
      name: "CSV Test Event",
      description: "Testing all new CSV fields",
      province: "Nova Scotia",
      municipality: "Halifax",
      neighborhoodCommunity: "Downtown",
      venue: "Test Venue",
      address: "123 Test St, Halifax, NS",
      startDate: "2025-06-01",
      startTime: "14:00",
      endDate: "2025-06-01",
      endTime: "16:00",
      duration: "2 hours",
      timeOfDay: "afternoon" as const,
      isRecurring: false,
      recurrenceType: "one-time" as const,
      isFree: false,
      costMin: 1000,
      costMax: 2000,
      costType: "range" as const,
      kidsFree: true,
      freeCompanion: false,
      allAges: true,
      familyFriendly: true,
      youngChildren: true,
      kids: true,
      teens: true,
      adults: true,
      adultsOnly: false,
      seniors: true,
      isIndoor: true,
      isOutdoor: false,
      isMixed: false,
      shortDuration: true,
      dropIn: true,
      canReenter: false,
      accessibility: JSON.stringify({
        wheelchairAccessible: "yes",
        accessibleParking: "yes",
        strollerAccessible: "yes",
      }),
      organizerName: "Test Organizer",
      organizerType: "nonprofit" as const,
      organizerEmail: "test@example.com",
      organizerPhone: "(902) 555-0100",
      organizerWebsite: "https://test.example.com",
      displayOrganizerInfo: true,
      publicContactName: "Public Contact",
      publicContactEmail: "public@example.com",
      publicContactPhone: "(902) 555-0200",
      notes: "Test notes",
      eventTypeIds: "1,2,3",
    };

    const result = await caller.events.bulkImport({
      events: [testEvent],
    });

    expect(result.success).toHaveLength(1);
    expect(result.failed).toHaveLength(0);
    expect(result.success[0]).toBeTypeOf("number");
  });

  it("should handle events without optional time fields", async () => {
    const caller = appRouter.createCaller({
      user: { id: adminUserId, role: "admin" },
    } as Context);

    const testEvent = {
      name: "CSV Test Event No Times",
      description: "Testing event without time fields",
      province: "Nova Scotia",
      municipality: "Halifax",
      startDate: "2025-07-01",
      // No startTime, endTime, duration
      timeOfDay: "all-day" as const,
      isRecurring: false,
      isFree: true,
      kidsFree: false,
      freeCompanion: false,
      allAges: true,
      familyFriendly: true,
      youngChildren: false,
      kids: false,
      teens: false,
      adults: true,
      adultsOnly: false,
      seniors: false,
      isIndoor: false,
      isOutdoor: true,
      isMixed: false,
      shortDuration: false,
      dropIn: true,
      canReenter: true,
      accessibility: JSON.stringify({}),
      displayOrganizerInfo: false,
    };

    const result = await caller.events.bulkImport({
      events: [testEvent],
    });

    expect(result.success).toHaveLength(1);
    expect(result.failed).toHaveLength(0);
  });

  it("should handle mixed indoor/outdoor events", async () => {
    const caller = appRouter.createCaller({
      user: { id: adminUserId, role: "admin" },
    } as Context);

    const testEvent = {
      name: "Mixed Environment Event",
      description: "Testing isMixed field",
      province: "Nova Scotia",
      municipality: "Halifax",
      startDate: "2025-08-01",
      timeOfDay: "morning" as const,
      isRecurring: false,
      isFree: true,
      kidsFree: false,
      freeCompanion: false,
      allAges: true,
      familyFriendly: true,
      youngChildren: true,
      kids: true,
      teens: false,
      adults: true,
      adultsOnly: false,
      seniors: false,
      isIndoor: true,
      isOutdoor: true,
      isMixed: true, // Testing new field
      shortDuration: false,
      dropIn: false,
      canReenter: false,
      accessibility: JSON.stringify({}),
      displayOrganizerInfo: false,
    };

    const result = await caller.events.bulkImport({
      events: [testEvent],
    });

    expect(result.success).toHaveLength(1);
    expect(result.failed).toHaveLength(0);
  });

  it("should handle public contact fields separately from organizer info", async () => {
    const caller = appRouter.createCaller({
      user: { id: adminUserId, role: "admin" },
    } as Context);

    const testEvent = {
      name: "Public Contact Test",
      description: "Testing public contact fields",
      province: "Nova Scotia",
      municipality: "Halifax",
      startDate: "2025-09-01",
      timeOfDay: "afternoon" as const,
      isRecurring: false,
      isFree: true,
      kidsFree: false,
      freeCompanion: false,
      allAges: true,
      familyFriendly: false,
      youngChildren: false,
      kids: false,
      teens: false,
      adults: true,
      adultsOnly: false,
      seniors: true,
      isIndoor: true,
      isOutdoor: false,
      isMixed: false,
      shortDuration: false,
      dropIn: false,
      canReenter: false,
      accessibility: JSON.stringify({}),
      organizerName: "Private Organizer",
      organizerEmail: "private@example.com",
      organizerPhone: "(902) 555-1000",
      displayOrganizerInfo: false,
      publicContactName: "Public Info Desk",
      publicContactEmail: "info@example.com",
      publicContactPhone: "(902) 555-2000",
    };

    const result = await caller.events.bulkImport({
      events: [testEvent],
    });

    expect(result.success).toHaveLength(1);
    expect(result.failed).toHaveLength(0);
  });
});
