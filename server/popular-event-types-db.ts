/**
 * Popular Event Types Database Helpers
 * 
 * Track and retrieve the most-used event types for better UX
 */

import { getDb } from "./db";
import { eventTypes, eventToEventTypes } from "../drizzle/schema";
import { sql, desc } from "drizzle-orm";

/**
 * Get popular event types (most-used) across all events
 */
export async function getPopularEventTypes(limit: number = 10) {
  const db = await getDb();
  
  const result = await db
    .select({
      typeId: eventToEventTypes.eventTypeId,
      typeName: eventTypes.name,
      category: eventTypes.category,
      usageCount: sql<number>`COUNT(${eventToEventTypes.eventId})`.as('usage_count'),
    })
    .from(eventToEventTypes)
    .innerJoin(eventTypes, sql`${eventToEventTypes.eventTypeId} = ${eventTypes.id}`)
    .where(sql`${eventTypes.isDeprecated} = 0`)
    .groupBy(eventToEventTypes.eventTypeId, eventTypes.name, eventTypes.category)
    .orderBy(desc(sql`usage_count`))
    .limit(limit);

  return result;
}

/**
 * Get popular event types within a specific category
 */
export async function getPopularEventTypesByCategory(category: string, limit: number = 5) {
  const db = await getDb();
  
  const result = await db
    .select({
      typeId: eventToEventTypes.eventTypeId,
      typeName: eventTypes.name,
      category: eventTypes.category,
      usageCount: sql<number>`COUNT(${eventToEventTypes.eventId})`.as('usage_count'),
    })
    .from(eventToEventTypes)
    .innerJoin(eventTypes, sql`${eventToEventTypes.eventTypeId} = ${eventTypes.id}`)
    .where(sql`${eventTypes.category} = ${category} AND ${eventTypes.isDeprecated} = 0`)
    .groupBy(eventToEventTypes.eventTypeId, eventTypes.name, eventTypes.category)
    .orderBy(desc(sql`usage_count`))
    .limit(limit);

  return result;
}

/**
 * Get usage count for all event types (for analytics)
 */
export async function getAllEventTypeUsageCounts() {
  const db = await getDb();
  
  const result = await db
    .select({
      typeId: eventToEventTypes.eventTypeId,
      typeName: eventTypes.name,
      category: eventTypes.category,
      isDeprecated: eventTypes.isDeprecated,
      usageCount: sql<number>`COUNT(${eventToEventTypes.eventId})`.as('usage_count'),
    })
    .from(eventToEventTypes)
    .innerJoin(eventTypes, sql`${eventToEventTypes.eventTypeId} = ${eventTypes.id}`)
    .groupBy(eventToEventTypes.eventTypeId, eventTypes.name, eventTypes.category, eventTypes.isDeprecated)
    .orderBy(desc(sql`usage_count`));

  return result;
}
