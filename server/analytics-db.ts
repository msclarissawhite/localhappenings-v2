import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { events } from "../drizzle/schema";

export interface AnalyticsData {
  totalEvents: number;
  publishedEvents: number;
  pendingEvents: number;
  rejectedEvents: number;
  approvalRate: number;
  topCities: Array<{ city: string; count: number }>;
  topProvinces: Array<{ province: string; count: number }>;
  eventsByMonth: Array<{ month: string; count: number }>;
  recentSubmissions: number; // Last 7 days
}

export async function getAnalytics(): Promise<AnalyticsData> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get total counts by status
  const statusCounts = await db
    .select({
      status: events.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(events)
    .groupBy(events.status);

  const totalEvents = statusCounts.reduce((sum, row) => sum + Number(row.count), 0);
  const publishedEvents = statusCounts.find((row) => row.status === "published")?.count || 0;
  const pendingEvents = statusCounts.find((row) => row.status === "pending")?.count || 0;
  const rejectedEvents = statusCounts.find((row) => row.status === "rejected")?.count || 0;

  const approvalRate =
    publishedEvents + rejectedEvents > 0
      ? (Number(publishedEvents) / (Number(publishedEvents) + Number(rejectedEvents))) * 100
      : 0;

  // Get top cities
  const topCities = await db
    .select({
      city: events.city,
      count: sql<number>`COUNT(*)`,
    })
    .from(events)
    .where(sql`${events.status} = 'published'`)
    .groupBy(events.city)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  // Get top provinces
  const topProvinces = await db
    .select({
      province: events.province,
      count: sql<number>`COUNT(*)`,
    })
    .from(events)
    .where(sql`${events.status} = 'published'`)
    .groupBy(events.province)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  // Get events by month - simplified to avoid DATE_FORMAT compatibility issues
  // Fetch all published events and group by month in JavaScript
  const allPublishedEvents = await db
    .select({
      startDate: events.startDate,
    })
    .from(events)
    .where(sql`${events.status} = 'published'`);

  // Group by month in JavaScript
  const monthCounts = new Map<string, number>();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  allPublishedEvents.forEach((event) => {
    if (event.startDate && event.startDate >= sixMonthsAgo) {
      const month = `${event.startDate.getFullYear()}-${String(event.startDate.getMonth() + 1).padStart(2, '0')}`;
      monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
    }
  });

  const eventsByMonth = Array.from(monthCounts.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Get recent submissions (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const recentResult = await db
    .select({
      count: sql<number>`COUNT(*)`,
    })
    .from(events)
    .where(sql`${events.createdAt} >= ${sevenDaysAgo.toISOString()}`);

  const recentSubmissions = recentResult[0]?.count || 0;

  return {
    totalEvents,
    publishedEvents: Number(publishedEvents),
    pendingEvents: Number(pendingEvents),
    rejectedEvents: Number(rejectedEvents),
    approvalRate: Math.round(approvalRate * 10) / 10,
    topCities: topCities.map((row) => ({ city: row.city, count: Number(row.count) })),
    topProvinces: topProvinces.map((row) => ({ province: row.province, count: Number(row.count) })),
    eventsByMonth: eventsByMonth.map((row) => ({ month: row.month, count: Number(row.count) })),
    recentSubmissions: Number(recentSubmissions),
  };
}
