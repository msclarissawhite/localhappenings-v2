import { getDb } from "./db";
import { eventFeedback } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

/**
 * Check if a feedback submission is likely spam
 * @param eventId - The event ID the feedback is for
 * @param comments - The feedback comments text
 * @returns SpamCheckResult with isSpam flag and reason
 */
export async function detectSpam(
  eventId: number,
  comments?: string | null
): Promise<SpamCheckResult> {
  const db = await getDb();
  if (!db) {
    // If DB unavailable, don't block submission
    return { isSpam: false };
  }

  // Check 1: Duplicate submission (same event + identical comments within 24 hours)
  if (comments && comments.trim().length > 0) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const duplicates = await db
      .select()
      .from(eventFeedback)
      .where(
        and(
          eq(eventFeedback.eventId, eventId),
          eq(eventFeedback.comments, comments),
          gte(eventFeedback.submittedAt, oneDayAgo)
        )
      )
      .limit(1);

    if (duplicates.length > 0) {
      return {
        isSpam: true,
        reason: "duplicate_submission",
      };
    }
  }

  // Check 2: Rapid submissions from same event (more than 5 in last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  
  const recentCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventFeedback)
    .where(
      and(
        eq(eventFeedback.eventId, eventId),
        gte(eventFeedback.submittedAt, fiveMinutesAgo)
      )
    );

  if (recentCount[0]?.count && recentCount[0].count >= 5) {
    return {
      isSpam: true,
      reason: "rapid_submission",
    };
  }

  // Check 3: Identical text pattern (same comments on multiple events within 1 hour)
  if (comments && comments.trim().length > 10) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const identicalComments = await db
      .select({ eventId: eventFeedback.eventId })
      .from(eventFeedback)
      .where(
        and(
          eq(eventFeedback.comments, comments),
          gte(eventFeedback.submittedAt, oneHourAgo)
        )
      );

    // If same comment appears on 3+ different events in last hour, likely spam
    const uniqueEvents = new Set(identicalComments.map((r) => r.eventId));
    if (uniqueEvents.size >= 3) {
      return {
        isSpam: true,
        reason: "identical_text_multiple_events",
      };
    }
  }

  // Check 4: Suspiciously short/generic comments with low rating
  if (comments && comments.trim().length > 0 && comments.trim().length < 5) {
    return {
      isSpam: true,
      reason: "suspiciously_short_comment",
    };
  }

  return { isSpam: false };
}
