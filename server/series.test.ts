import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import * as seriesDb from "./series-db";
import { eventSeries, organizers, events } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Event Series Functionality", () => {
  let testOrganizerId: number;
  let testSeriesId: number;
  let testEventId: number;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Create a test organizer
    const [orgResult] = await db.insert(organizers).values({
      email: `test-series-${Date.now()}@example.com`,
      name: "Test Series Organizer",
      isVerified: 1,
    });
    testOrganizerId = orgResult.insertId;

    // Create a test event
    const [eventResult] = await db.insert(events).values({
      name: "Test Event for Series",
      startDate: new Date("2026-06-01"),
      province: "Nova Scotia",
      municipality: "Halifax",
      organizerId: testOrganizerId,
      organizerName: "Test Organizer",
      organizerEmail: `test-series-${Date.now()}@example.com`,
      status: "approved",
      isFree: 1,
      allAges: 1,
      isIndoor: 1,
      isOutdoor: 0,
      isMixed: 0,
      displayOrganizerInfo: 1,
    });
    testEventId = eventResult.insertId;
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    if (testSeriesId) {
      await db.delete(eventSeries).where(eq(eventSeries.id, testSeriesId));
    }
    if (testEventId) {
      await db.delete(events).where(eq(events.id, testEventId));
    }
    if (testOrganizerId) {
      await db.delete(organizers).where(eq(organizers.id, testOrganizerId));
    }
  });

  it("should create a new event series", async () => {
    const seriesData = {
      name: "Weekly Test Trivia",
      description: "A test trivia series",
      organizerId: testOrganizerId,
      slug: "weekly-test-trivia",
      isActive: 1,
    };

    const created = await seriesDb.createSeries(seriesData);
    testSeriesId = created.id;

    expect(created).toBeDefined();
    expect(created.name).toBe(seriesData.name);
    expect(created.slug).toBe(seriesData.slug);
    expect(created.organizerId).toBe(testOrganizerId);
  });

  it("should get series by organizer", async () => {
    const seriesList = await seriesDb.getSeriesByOrganizerId(testOrganizerId);

    expect(seriesList).toBeDefined();
    expect(Array.isArray(seriesList)).toBe(true);
    expect(seriesList.length).toBeGreaterThan(0);
    expect(seriesList[0].organizerId).toBe(testOrganizerId);
  });

  it("should get series by slug", async () => {
    const series = await seriesDb.getSeriesBySlug("weekly-test-trivia");

    expect(series).toBeDefined();
    expect(series?.slug).toBe("weekly-test-trivia");
    expect(series?.name).toBe("Weekly Test Trivia");
  });

  it("should update series", async () => {
    const updated = await seriesDb.updateSeries(testSeriesId, testOrganizerId, {
      name: "Updated Trivia Series",
      description: "Updated description",
    });

    expect(updated).toBeDefined();
    expect(updated.name).toBe("Updated Trivia Series");
    expect(updated.description).toBe("Updated description");
  });

  it("should link event to series", async () => {
    await seriesDb.linkEventToSeries(testEventId, testSeriesId);

    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(event.seriesId).toBe(testSeriesId);
  });

  it("should get series with events", async () => {
    const series = await seriesDb.getSeriesBySlug("weekly-test-trivia");

    expect(series).toBeDefined();
    expect(series?.events).toBeDefined();
    expect(Array.isArray(series?.events)).toBe(true);
  });

  it("should prevent unauthorized series update", async () => {
    const unauthorizedOrganizerId = testOrganizerId + 999;

    await expect(
      seriesDb.updateSeries(testSeriesId, unauthorizedOrganizerId, {
        name: "Unauthorized Update",
      })
    ).rejects.toThrow();
  });

  it("should prevent unauthorized series deletion", async () => {
    const unauthorizedOrganizerId = testOrganizerId + 999;

    await expect(
      seriesDb.deleteSeries(testSeriesId, unauthorizedOrganizerId)
    ).rejects.toThrow();
  });

  it("should unlink event when series is deleted", async () => {
    // First verify event is linked
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    let [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(event.seriesId).toBe(testSeriesId);

    // Delete series
    await seriesDb.deleteSeries(testSeriesId, testOrganizerId);

    // Verify event is unlinked
    [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, testEventId))
      .limit(1);

    expect(event.seriesId).toBeNull();
  });
});
