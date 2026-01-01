/**
 * Tests for Popular Event Types Feature
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { events, eventTypes, eventToEventTypes } from "../drizzle/schema";
import { sql } from "drizzle-orm";
import { getPopularEventTypes, getPopularEventTypesByCategory, getAllEventTypeUsageCounts } from "./popular-event-types-db";

describe("Popular Event Types", () => {
  let testEventIds: number[] = [];
  let testTypeIds: number[] = [];

  beforeAll(async () => {
    const db = await getDb();

    // Create test event types with unique names
    const timestamp = Date.now();
    const typeResults = await db.insert(eventTypes).values([
      { name: `Test Popular Type 1 ${timestamp}`, category: "arts-culture", isDeprecated: false },
      { name: `Test Popular Type 2 ${timestamp}`, category: "arts-culture", isDeprecated: false },
      { name: `Test Unpopular Type ${timestamp}`, category: "recreation-sports", isDeprecated: false },
      { name: `Test Deprecated Type ${timestamp}`, category: "arts-culture", isDeprecated: true },
    ]);
    
    testTypeIds = [
      Number(typeResults[0].insertId),
      Number(typeResults[0].insertId) + 1,
      Number(typeResults[0].insertId) + 2,
      Number(typeResults[0].insertId) + 3,
    ];

    // Create test events
    const eventResults = await db.insert(events).values([
      {
        name: "Test Event 1",
        description: "Test description",
        province: "ON",
        municipality: "Toronto",
        startDate: new Date(),
        status: "approved",
        category: "arts-culture",
        organizerName: "Test",
        organizerEmail: "test@test.com",
        accessibility: {},
      },
      {
        name: "Test Event 2",
        description: "Test description",
        province: "ON",
        municipality: "Toronto",
        startDate: new Date(),
        status: "approved",
        category: "arts-culture",
        organizerName: "Test",
        organizerEmail: "test@test.com",
        accessibility: {},
      },
      {
        name: "Test Event 3",
        description: "Test description",
        province: "ON",
        municipality: "Toronto",
        startDate: new Date(),
        status: "approved",
        category: "Sports & Recreation",
        organizerName: "Test",
        organizerEmail: "test@test.com",
        accessibility: {},
      },
    ]);

    testEventIds = [
      Number(eventResults[0].insertId),
      Number(eventResults[0].insertId) + 1,
      Number(eventResults[0].insertId) + 2,
    ];

    // Link events to types (Popular Type 1 used 3 times, Popular Type 2 used 2 times, Unpopular Type used 1 time)
    await db.insert(eventToEventTypes).values([
      { eventId: testEventIds[0], eventTypeId: testTypeIds[0] }, // Popular Type 1
      { eventId: testEventIds[1], eventTypeId: testTypeIds[0] }, // Popular Type 1
      { eventId: testEventIds[2], eventTypeId: testTypeIds[0] }, // Popular Type 1
      { eventId: testEventIds[0], eventTypeId: testTypeIds[1] }, // Popular Type 2
      { eventId: testEventIds[1], eventTypeId: testTypeIds[1] }, // Popular Type 2
      { eventId: testEventIds[2], eventTypeId: testTypeIds[2] }, // Unpopular Type
    ]);
  });

  afterAll(async () => {
    const db = await getDb();
    
    // Clean up test data
    if (testEventIds.length > 0) {
      for (const id of testEventIds) {
        await db.delete(eventToEventTypes).where(sql`eventId = ${id}`);
        await db.delete(events).where(sql`id = ${id}`);
      }
    }
    if (testTypeIds.length > 0) {
      for (const id of testTypeIds) {
        await db.delete(eventTypes).where(sql`id = ${id}`);
      }
    }
  });

  it("should get popular event types ordered by usage count", async () => {
    const popular = await getPopularEventTypes(10);
    
    // Should return types ordered by usage count (Popular Type 1 first, then Popular Type 2)
    expect(popular.length).toBeGreaterThanOrEqual(2);
    
    const popularType1 = popular.find(p => p.typeId === testTypeIds[0]);
    const popularType2 = popular.find(p => p.typeId === testTypeIds[1]);
    
    expect(popularType1).toBeDefined();
    expect(popularType2).toBeDefined();
    expect(popularType1!.usageCount).toBe(3);
    expect(popularType2!.usageCount).toBe(2);
    
    // Popular Type 1 should come before Popular Type 2
    const index1 = popular.findIndex(p => p.typeId === testTypeIds[0]);
    const index2 = popular.findIndex(p => p.typeId === testTypeIds[1]);
    expect(index1).toBeLessThan(index2);
  });

  it("should not include deprecated types in popular results", async () => {
    const popular = await getPopularEventTypes(10);
    
    // Deprecated type should not appear
    const deprecatedType = popular.find(p => p.typeId === testTypeIds[3]);
    expect(deprecatedType).toBeUndefined();
  });

  it("should get popular event types by category", async () => {
    const artsPopular = await getPopularEventTypesByCategory("arts-culture", 5);
    
    // Should only return arts-culture types
    artsPopular.forEach(p => {
      expect(p.category).toBe("arts-culture");
    });
    
    // Should include our popular types
    const popularType1 = artsPopular.find(p => p.typeId === testTypeIds[0]);
    const popularType2 = artsPopular.find(p => p.typeId === testTypeIds[1]);
    
    expect(popularType1).toBeDefined();
    expect(popularType2).toBeDefined();
  });

  it("should get all event type usage counts including deprecated", async () => {
    const allCounts = await getAllEventTypeUsageCounts();
    
    // Should include both deprecated and non-deprecated
    const testTypeCounts = allCounts.filter(c => testTypeIds.includes(c.typeId));
    
    expect(testTypeCounts.length).toBeGreaterThanOrEqual(3);
    
    // Check that usage counts are correct
    const popularType1Count = testTypeCounts.find(c => c.typeId === testTypeIds[0]);
    expect(popularType1Count?.usageCount).toBe(3);
  });
});
