import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { getDb } from "./db";
import { events, eventFeedback } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Feedback System", () => {
  let testEventId: number;
  let testContext: Context;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create a test event
    const [event] = await db.insert(events).values({
      name: "Test Event for Feedback",
      description: "Testing feedback submission",
      province: "Nova Scotia",
      municipality: "Halifax",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-01"),
      isFree: 1,
      isRecurring: 0,
      status: "published",
      accessibility: JSON.stringify({}), // Empty accessibility object
    });

    testEventId = event.insertId;

    // Create mock context (public, no user)
    testContext = {
      req: {} as any,
      res: {} as any,
      user: null,
    };
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // Clean up test data
    await db.delete(eventFeedback).where(eq(eventFeedback.eventId, testEventId));
    await db.delete(events).where(eq(events.id, testEventId));
  });

  it("should submit feedback successfully", async () => {
    const caller = appRouter.createCaller(testContext);

    const result = await caller.feedback.submit({
      eventId: testEventId,
      attended: true,
      accuracyRating: 5,
      helpfulDetails: ["Accessibility information", "Parking/transit details"],
      inaccurateDetails: [],
      comments: "Great event, listing was very accurate!",
    });

    expect(result.success).toBe(true);
    expect(result.feedbackId).toBeGreaterThan(0);
  });

  it("should get feedback statistics", async () => {
    const caller = appRouter.createCaller(testContext);

    // Submit another feedback
    await caller.feedback.submit({
      eventId: testEventId,
      attended: true,
      accuracyRating: 4,
      helpfulDetails: ["Cost information"],
      inaccurateDetails: ["Time/schedule"],
      comments: "Event started 10 minutes late",
    });

    const stats = await caller.feedback.getStats({ eventId: testEventId });

    // MySQL returns these as strings, convert to numbers for comparison
    expect(Number(stats.totalFeedback)).toBeGreaterThanOrEqual(2);
    expect(Number(stats.attendedCount)).toBeGreaterThanOrEqual(2);
    expect(Number(stats.avgAccuracy)).toBeGreaterThan(0);
    expect(Number(stats.avgAccuracy)).toBeLessThanOrEqual(5);
  });

  it("should handle feedback from non-attendees", async () => {
    const caller = appRouter.createCaller(testContext);

    const result = await caller.feedback.submit({
      eventId: testEventId,
      attended: false,
    });

    expect(result.success).toBe(true);

    // Stats should not include non-attendee in accuracy average
    const stats = await caller.feedback.getStats({ eventId: testEventId });
    expect(stats.totalFeedback).toBeGreaterThan(0);
  });

  it("should require admin role to view individual feedback", async () => {
    const publicCaller = appRouter.createCaller(testContext);

    // Public user should not be able to view individual feedback
    await expect(
      publicCaller.feedback.getForEvent({ eventId: testEventId })
    ).rejects.toThrow();
  });

  it("should validate feedback input", async () => {
    const caller = appRouter.createCaller(testContext);

    // Invalid rating (out of range)
    await expect(
      caller.feedback.submit({
        eventId: testEventId,
        attended: true,
        accuracyRating: 6, // Invalid: must be 1-5
      })
    ).rejects.toThrow();

    // Comments too long
    await expect(
      caller.feedback.submit({
        eventId: testEventId,
        attended: true,
        accuracyRating: 5,
        comments: "a".repeat(501), // Invalid: max 500 chars
      })
    ).rejects.toThrow();
  });
});
