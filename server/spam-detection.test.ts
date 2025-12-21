import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { detectSpam } from "./spam-detection";
import { getDb } from "./db";
import { eventFeedback } from "../drizzle/schema";

describe("Spam Detection", () => {
  let testEventId: number;

  beforeEach(async () => {
    // Use a unique event ID for each test
    testEventId = Math.floor(Math.random() * 1000000) + 100000;
  });

  afterEach(async () => {
    // Clean up test feedback
    const db = await getDb();
    if (db) {
      await db.delete(eventFeedback).where(/* cleanup */);
    }
  });

  describe("Duplicate submission detection", () => {
    it("should flag duplicate comments within 24 hours", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");

      const testComment = "This is a test comment for duplicate detection";

      // Insert first feedback
      await db.insert(eventFeedback).values({
        eventId: testEventId,
        attended: 1,
        accuracyRating: 5,
        comments: testComment,
        syncedToClickUp: 0,
      });

      // Try to submit duplicate
      const result = await detectSpam(testEventId, testComment);

      expect(result.isSpam).toBe(true);
      expect(result.reason).toBe("duplicate_submission");
    });

    it("should allow same comment after 24 hours", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");

      const testComment = "Old comment from yesterday";

      // Insert feedback from 25 hours ago (simulate by using old timestamp)
      const oldDate = new Date(Date.now() - 25 * 60 * 60 * 1000);
      await db.insert(eventFeedback).values({
        eventId: testEventId,
        attended: 1,
        accuracyRating: 5,
        comments: testComment,
        submittedAt: oldDate,
        syncedToClickUp: 0,
      });

      // Try to submit same comment now
      const result = await detectSpam(testEventId, testComment);

      expect(result.isSpam).toBe(false);
    });
  });

  describe("Rapid submission detection", () => {
    it("should flag rapid submissions (5+ in 5 minutes)", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");

      // Insert 5 feedback entries for same event in last 5 minutes
      for (let i = 0; i < 5; i++) {
        await db.insert(eventFeedback).values({
          eventId: testEventId,
          attended: 1,
          accuracyRating: 5,
          comments: `Test comment ${i}`,
          syncedToClickUp: 0,
        });
      }

      // 6th submission should be flagged
      const result = await detectSpam(testEventId, "Another comment");

      expect(result.isSpam).toBe(true);
      expect(result.reason).toBe("rapid_submission");
    });

    it("should allow normal submission rate", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");

      // Insert only 2 feedback entries
      for (let i = 0; i < 2; i++) {
        await db.insert(eventFeedback).values({
          eventId: testEventId,
          attended: 1,
          accuracyRating: 5,
          comments: `Normal comment ${i}`,
          syncedToClickUp: 0,
        });
      }

      // 3rd submission should be allowed
      const result = await detectSpam(testEventId, "Normal rate comment");

      expect(result.isSpam).toBe(false);
    });
  });

  describe("Identical text across events detection", () => {
    it("should flag identical comments on 3+ events within 1 hour", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");

      const spamComment = "Generic spam comment posted everywhere";

      // Post same comment on 3 different events
      for (let i = 0; i < 3; i++) {
        await db.insert(eventFeedback).values({
          eventId: testEventId + i,
          attended: 1,
          accuracyRating: 5,
          comments: spamComment,
          syncedToClickUp: 0,
        });
      }

      // 4th event with same comment should be flagged
      const result = await detectSpam(testEventId + 10, spamComment);

      expect(result.isSpam).toBe(true);
      expect(result.reason).toBe("identical_text_multiple_events");
    });

    it("should allow same comment on 2 events", async () => {
      const db = await getDb();
      if (!db) throw new Error("DB not available");

      const normalComment = "This event was great!";

      // Post same comment on 2 different events
      for (let i = 0; i < 2; i++) {
        await db.insert(eventFeedback).values({
          eventId: testEventId + i,
          attended: 1,
          accuracyRating: 5,
          comments: normalComment,
          syncedToClickUp: 0,
        });
      }

      // 3rd event with same comment should be allowed
      const result = await detectSpam(testEventId + 10, normalComment);

      expect(result.isSpam).toBe(false);
    });
  });

  describe("Suspiciously short comment detection", () => {
    it("should flag very short comments (< 5 chars)", async () => {
      const result = await detectSpam(testEventId, "bad");

      expect(result.isSpam).toBe(true);
      expect(result.reason).toBe("suspiciously_short_comment");
    });

    it("should allow reasonable length comments", async () => {
      const result = await detectSpam(testEventId, "Great event!");

      expect(result.isSpam).toBe(false);
    });

    it("should allow empty comments", async () => {
      const result = await detectSpam(testEventId, "");

      expect(result.isSpam).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle null comments gracefully", async () => {
      const result = await detectSpam(testEventId, null);

      expect(result.isSpam).toBe(false);
    });

    it("should handle undefined comments gracefully", async () => {
      const result = await detectSpam(testEventId, undefined);

      expect(result.isSpam).toBe(false);
    });

    it("should not flag legitimate feedback", async () => {
      const result = await detectSpam(
        testEventId,
        "This was a wonderful event! The organizers were very helpful and the venue was accessible."
      );

      expect(result.isSpam).toBe(false);
    });
  });
});
