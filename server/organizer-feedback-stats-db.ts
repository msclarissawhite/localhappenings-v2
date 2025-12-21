/**
 * Database helpers for organizer feedback analytics
 */
import { getDb } from "./db";
import { events, eventFeedback, organizers } from "../drizzle/schema";
import { eq, sql, and, isNotNull } from "drizzle-orm";

export interface OrganizerFeedbackStats {
  organizerName: string;
  organizerEmail: string | null;
  organizerIsVerified: number;
  totalEvents: number;
  eventsWithFeedback: number;
  totalFeedback: number;
  totalAttended: number;
  avgAccuracy: number | null;
  lastFeedbackDate: Date | null;
}

export interface OrganizerEventFeedback {
  eventId: number;
  eventName: string;
  eventDate: Date;
  feedbackCount: number;
  attendedCount: number;
  avgAccuracy: number | null;
}

/**
 * Get aggregated feedback stats for all organizers
 * Returns organizers sorted by average accuracy (highest first)
 */
export async function getOrganizerFeedbackStats(): Promise<OrganizerFeedbackStats[]> {
  const db = await getDb();
  if (!db) return [];

  // Get all organizers with their events and feedback
  const stats = await db
    .select({
      organizerName: events.organizerName,
      organizerEmail: events.organizerEmail,
      organizerIsVerified: sql<number>`MAX(COALESCE(${organizers.isVerified}, 0))`,
      totalEvents: sql<number>`COUNT(DISTINCT ${events.id})`,
      eventsWithFeedback: sql<number>`COUNT(DISTINCT CASE WHEN ${eventFeedback.id} IS NOT NULL THEN ${events.id} END)`,
      totalFeedback: sql<number>`COUNT(${eventFeedback.id})`,
      totalAttended: sql<number>`SUM(CASE WHEN ${eventFeedback.attended} = 1 THEN 1 ELSE 0 END)`,
      avgAccuracy: sql<number>`AVG(CASE WHEN ${eventFeedback.attended} = 1 THEN ${eventFeedback.accuracyRating} ELSE NULL END)`,
      lastFeedbackDate: sql<Date>`MAX(${eventFeedback.submittedAt})`,
    })
    .from(events)
    .leftJoin(eventFeedback, eq(events.id, eventFeedback.eventId))
    .leftJoin(organizers, eq(events.organizerEmail, organizers.email))
    .where(
      and(
        isNotNull(events.organizerName),
        eq(events.status, "published")
      )
    )
    .groupBy(events.organizerName, events.organizerEmail)
    .orderBy(sql`avgAccuracy DESC NULLS LAST, totalFeedback DESC`);

  return stats.map((stat) => ({
    organizerName: stat.organizerName || "Unknown",
    organizerEmail: stat.organizerEmail,
    organizerIsVerified: Number(stat.organizerIsVerified || 0),
    totalEvents: Number(stat.totalEvents),
    eventsWithFeedback: Number(stat.eventsWithFeedback),
    totalFeedback: Number(stat.totalFeedback),
    totalAttended: Number(stat.totalAttended),
    avgAccuracy: stat.avgAccuracy ? Number(stat.avgAccuracy) : null,
    lastFeedbackDate: stat.lastFeedbackDate,
  }));
}

/**
 * Get feedback breakdown by event for a specific organizer
 */
export async function getOrganizerEventFeedback(
  organizerName: string
): Promise<OrganizerEventFeedback[]> {
  const db = await getDb();
  if (!db) return [];

  const eventStats = await db
    .select({
      eventId: events.id,
      eventName: events.name,
      eventDate: events.startDate,
      feedbackCount: sql<number>`COUNT(${eventFeedback.id})`,
      attendedCount: sql<number>`SUM(CASE WHEN ${eventFeedback.attended} = 1 THEN 1 ELSE 0 END)`,
      avgAccuracy: sql<number>`AVG(CASE WHEN ${eventFeedback.attended} = 1 THEN ${eventFeedback.accuracyRating} ELSE NULL END)`,
    })
    .from(events)
    .leftJoin(eventFeedback, eq(events.id, eventFeedback.eventId))
    .leftJoin(organizers, eq(events.organizerEmail, organizers.email))
    .where(
      and(
        eq(events.organizerName, organizerName),
        eq(events.status, "published")
      )
    )
    .groupBy(events.id, events.name, events.startDate)
    .orderBy(sql`eventDate DESC`);

  return eventStats.map((stat) => ({
    eventId: stat.eventId,
    eventName: stat.eventName,
    eventDate: stat.eventDate,
    feedbackCount: Number(stat.feedbackCount),
    attendedCount: Number(stat.attendedCount),
    avgAccuracy: stat.avgAccuracy ? Number(stat.avgAccuracy) : null,
  }));
}
