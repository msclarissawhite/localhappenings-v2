/**
 * Database helpers for feedback statistics
 */
import { getDb } from "./db";
import { eventFeedback } from "../drizzle/schema";
import { eq, sql, inArray } from "drizzle-orm";

/**
 * Get feedback stats for multiple events (for Browse Events page)
 * Returns map of eventId -> stats
 */
export async function getFeedbackStatsForEvents(eventIds: number[]): Promise<
  Map<
    number,
    {
      totalFeedback: number;
      attendedCount: number;
      avgAccuracy: number | null;
    }
  >
> {
  if (eventIds.length === 0) return new Map();

  const db = await getDb();
  if (!db) return new Map();

  const stats = await db
    .select({
      eventId: eventFeedback.eventId,
      totalFeedback: sql<number>`COUNT(*)`,
      attendedCount: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
      avgAccuracy: sql<number>`AVG(CASE WHEN attended = 1 THEN accuracyRating ELSE NULL END)`,
    })
    .from(eventFeedback)
    .where(inArray(eventFeedback.eventId, eventIds))
    .groupBy(eventFeedback.eventId);

  const statsMap = new Map();
  stats.forEach((stat) => {
    statsMap.set(stat.eventId, {
      totalFeedback: Number(stat.totalFeedback),
      attendedCount: Number(stat.attendedCount),
      avgAccuracy: stat.avgAccuracy ? Number(stat.avgAccuracy) : null,
    });
  });

  return statsMap;
}

/**
 * Get feedback stats for a single event
 */
export async function getFeedbackStatsForEvent(eventId: number): Promise<{
  totalFeedback: number;
  attendedCount: number;
  avgAccuracy: number | null;
}> {
  const db = await getDb();
  if (!db)
    return {
      totalFeedback: 0,
      attendedCount: 0,
      avgAccuracy: null,
    };

  const [stats] = await db
    .select({
      totalFeedback: sql<number>`COUNT(*)`,
      attendedCount: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
      avgAccuracy: sql<number>`AVG(CASE WHEN attended = 1 THEN accuracyRating ELSE NULL END)`,
    })
    .from(eventFeedback)
    .where(eq(eventFeedback.eventId, eventId));

  return {
    totalFeedback: Number(stats?.totalFeedback || 0),
    attendedCount: Number(stats?.attendedCount || 0),
    avgAccuracy: stats?.avgAccuracy ? Number(stats.avgAccuracy) : null,
  };
}
