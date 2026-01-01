/**
 * Event Type Migration Tests
 * 
 * Tests the admin bulk reassignment tool for migrating events from deprecated types
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  getEventsByDeprecatedTypes,
  getDeprecatedTypeUsageCounts,
  migrateEventTypes,
  getEventTypes,
} from "./event-type-migration-db";
import { events, eventTypes, eventToEventTypes } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Event Type Migration", () => {
  let testEventId: number;
  let deprecatedTypeId: number;
  let newTypeId1: number;
  let newTypeId2: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    // Create a deprecated event type for testing
    const [deprecatedType] = await db
      .insert(eventTypes)
      .values({
        name: "Test Deprecated Type",
        category: "community-social",
        isDeprecated: 1,
      })
      .$returningId();
    deprecatedTypeId = deprecatedType.id;

    // Create new replacement types
    const [newType1] = await db
      .insert(eventTypes)
      .values({
        name: "Test Specific Type 1",
        category: "community-social",
        isDeprecated: 0,
      })
      .$returningId();
    newTypeId1 = newType1.id;

    const [newType2] = await db
      .insert(eventTypes)
      .values({
        name: "Test Specific Type 2",
        category: "community-social",
        isDeprecated: 0,
      })
      .$returningId();
    newTypeId2 = newType2.id;

    // Create a test event
    const [event] = await db
      .insert(events)
      .values({
        name: "Test Event for Migration",
        description: "Test event description for migration testing",
        startDate: new Date("2026-06-01T10:00:00Z"),
        endDate: new Date("2026-06-01T12:00:00Z"),
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Test Venue",
        organizerName: "Test Organizer",
        organizerEmail: "test@example.com",
        accessibility: JSON.stringify({}),
        status: "published",
      })
      .$returningId();
    testEventId = event.id;

    // Associate event with deprecated type
    await db.insert(eventToEventTypes).values({
      eventId: testEventId,
      eventTypeId: deprecatedTypeId,
    });
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;
    
    // Clean up test data
    if (testEventId) {
      await db.delete(eventToEventTypes).where(eq(eventToEventTypes.eventId, testEventId));
      await db.delete(events).where(eq(events.id, testEventId));
    }
    if (deprecatedTypeId) {
      await db.delete(eventTypes).where(eq(eventTypes.id, deprecatedTypeId));
    }
    if (newTypeId1) {
      await db.delete(eventTypes).where(eq(eventTypes.id, newTypeId1));
    }
    if (newTypeId2) {
      await db.delete(eventTypes).where(eq(eventTypes.id, newTypeId2));
    }
  });

  it("should get events grouped by deprecated types", async () => {
    const grouped = await getEventsByDeprecatedTypes();

    // Find our test deprecated type in the results
    const testGroup = grouped.find(g => g.deprecatedType.id === deprecatedTypeId);
    expect(testGroup).toBeDefined();
    expect(testGroup?.deprecatedType.name).toBe("Test Deprecated Type");
    expect(testGroup?.events.length).toBeGreaterThan(0);

    const testEvent = testGroup?.events.find(e => e.id === testEventId);
    expect(testEvent).toBeDefined();
    expect(testEvent?.name).toBe("Test Event for Migration");
  });

  it("should get usage counts for deprecated types", async () => {
    const counts = await getDeprecatedTypeUsageCounts();

    const testCount = counts.find(c => c.typeId === deprecatedTypeId);
    expect(testCount).toBeDefined();
    expect(testCount?.typeName).toBe("Test Deprecated Type");
    expect(testCount?.eventCount).toBeGreaterThan(0);
  });

  it("should get all event types for a specific event", async () => {
    const types = await getEventTypes(testEventId);

    expect(types.length).toBeGreaterThan(0);
    const deprecatedType = types.find(t => t.id === deprecatedTypeId);
    expect(deprecatedType).toBeDefined();
    expect(deprecatedType?.name).toBe("Test Deprecated Type");
    expect(deprecatedType?.isDeprecated).toBe(1);
  });

  it("should migrate event from deprecated type to new types", async () => {
    // Perform migration
    const result = await migrateEventTypes(
      [testEventId],
      deprecatedTypeId,
      [newTypeId1, newTypeId2]
    );

    expect(result.eventsUpdated).toBe(1);
    expect(result.typesRemoved).toBe(1);
    expect(result.typesAdded).toBe(2);

    // Verify the event no longer has the deprecated type
    const typesAfter = await getEventTypes(testEventId);
    const hasDeprecated = typesAfter.some(t => t.id === deprecatedTypeId);
    expect(hasDeprecated).toBe(false);

    // Verify the event now has the new types
    const hasNewType1 = typesAfter.some(t => t.id === newTypeId1);
    const hasNewType2 = typesAfter.some(t => t.id === newTypeId2);
    expect(hasNewType1).toBe(true);
    expect(hasNewType2).toBe(true);
  });

  it("should handle migration of multiple events at once", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // Create a second test event
    const [event2] = await db
      .insert(events)
      .values({
        name: "Test Event 2 for Migration",
        description: "Test event 2 description for migration testing",
        startDate: new Date("2026-06-02T10:00:00Z"),
        endDate: new Date("2026-06-02T12:00:00Z"),
        province: "Nova Scotia",
        municipality: "Halifax",
        venue: "Test Venue 2",
        organizerName: "Test Organizer 2",
        organizerEmail: "test2@example.com",
        accessibility: JSON.stringify({}),
        status: "published",
      })
      .$returningId();
    const testEventId2 = event2.id;

    // Associate with deprecated type
    await db.insert(eventToEventTypes).values({
      eventId: testEventId2,
      eventTypeId: deprecatedTypeId,
    });

    // Migrate both events
    const result = await migrateEventTypes(
      [testEventId, testEventId2],
      deprecatedTypeId,
      [newTypeId1]
    );

    expect(result.eventsUpdated).toBe(2);
    expect(result.typesRemoved).toBe(1);
    expect(result.typesAdded).toBe(1);

    // Clean up second event
    await db.delete(eventToEventTypes).where(eq(eventToEventTypes.eventId, testEventId2));
    await db.delete(events).where(eq(events.id, testEventId2));
  });

  it("should throw error when no events provided", async () => {
    await expect(
      migrateEventTypes([], deprecatedTypeId, [newTypeId1])
    ).rejects.toThrow("Must provide at least one event and one new type");
  });

  it("should throw error when no new types provided", async () => {
    await expect(
      migrateEventTypes([testEventId], deprecatedTypeId, [])
    ).rejects.toThrow("Must provide at least one event and one new type");
  });
});
