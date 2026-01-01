/**
 * Event Type Migration Database Operations
 * 
 * Handles queries and mutations for migrating events from deprecated types
 * to specific replacement types.
 */

import { getDb } from "./db";
import { events, eventTypes, eventToEventTypes } from "../drizzle/schema";
import { eq, inArray, and, sql } from "drizzle-orm";
import { getDeprecatedTypeIds } from "../shared/event-type-migration-suggestions";

/**
 * Get events grouped by deprecated event type
 * Returns events that are currently using deprecated types
 */
export async function getEventsByDeprecatedTypes() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const deprecatedIds = getDeprecatedTypeIds();
  
  // Get all events that have at least one deprecated type
  const eventsWithDeprecatedTypes = await db
    .select({
      eventId: events.id,
      eventName: events.name,
      eventDate: events.startDate,
      eventStatus: events.status,
      typeId: eventTypes.id,
      typeName: eventTypes.name,
      typeCategory: eventTypes.category,
    })
    .from(events)
    .innerJoin(eventToEventTypes, eq(events.id, eventToEventTypes.eventId))
    .innerJoin(eventTypes, eq(eventToEventTypes.eventTypeId, eventTypes.id))
    .where(
      and(
        inArray(eventTypes.id, deprecatedIds),
        eq(eventTypes.isDeprecated, 1)
      )
    )
    .orderBy(eventTypes.id, events.startDate);

  // Group events by deprecated type
  const grouped: Record<number, {
    deprecatedType: { id: number; name: string; category: string };
    events: Array<{
      id: number;
      name: string;
      startDate: Date;
      status: string;
    }>;
  }> = {};

  for (const row of eventsWithDeprecatedTypes) {
    if (!grouped[row.typeId]) {
      grouped[row.typeId] = {
        deprecatedType: {
          id: row.typeId,
          name: row.typeName,
          category: row.typeCategory,
        },
        events: [],
      };
    }

    // Check if event already added (might have multiple deprecated types)
    const existingEvent = grouped[row.typeId].events.find(e => e.id === row.eventId);
    if (!existingEvent) {
      grouped[row.typeId].events.push({
        id: row.eventId,
        name: row.eventName,
        startDate: row.eventDate,
        status: row.eventStatus,
      });
    }
  }

  return Object.values(grouped);
}

/**
 * Get count of events using each deprecated type
 */
export async function getDeprecatedTypeUsageCounts() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const deprecatedIds = getDeprecatedTypeIds();

  const counts = await db
    .select({
      typeId: eventTypes.id,
      typeName: eventTypes.name,
      eventCount: sql<number>`count(distinct ${events.id})`,
    })
    .from(eventTypes)
    .leftJoin(eventToEventTypes, eq(eventTypes.id, eventToEventTypes.eventTypeId))
    .leftJoin(events, eq(eventToEventTypes.eventId, events.id))
    .where(
      and(
        inArray(eventTypes.id, deprecatedIds),
        eq(eventTypes.isDeprecated, 1)
      )
    )
    .groupBy(eventTypes.id, eventTypes.name);

  return counts;
}

/**
 * Replace deprecated type with new types for specific events
 * 
 * @param eventIds - Array of event IDs to update
 * @param deprecatedTypeId - The deprecated type to remove
 * @param newTypeIds - Array of new type IDs to add
 */
export async function migrateEventTypes(
  eventIds: number[],
  deprecatedTypeId: number,
  newTypeIds: number[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (eventIds.length === 0 || newTypeIds.length === 0) {
    throw new Error("Must provide at least one event and one new type");
  }

  // Start transaction
  return await db.transaction(async (tx) => {
    // 1. Remove the deprecated type from all selected events
    await tx
      .delete(eventToEventTypes)
      .where(
        and(
          inArray(eventToEventTypes.eventId, eventIds),
          eq(eventToEventTypes.eventTypeId, deprecatedTypeId)
        )
      );

    // 2. Add new types to all selected events
    const insertValues = eventIds.flatMap(eventId =>
      newTypeIds.map(typeId => ({
        eventId,
        eventTypeId: typeId,
      }))
    );

    // Insert new associations (ignore duplicates if event already has some of these types)
    for (const value of insertValues) {
      await tx
        .insert(eventToEventTypes)
        .values(value)
        .onDuplicateKeyUpdate({
          set: { eventTypeId: value.eventTypeId }, // No-op, just ignore duplicates
        });
    }

    return {
      eventsUpdated: eventIds.length,
      typesRemoved: 1,
      typesAdded: newTypeIds.length,
    };
  });
}

/**
 * Get all current event types for a specific event
 * Useful for showing what types an event currently has before migration
 */
export async function getEventTypes(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const types = await db
    .select({
      id: eventTypes.id,
      name: eventTypes.name,
      category: eventTypes.category,
      isDeprecated: eventTypes.isDeprecated,
    })
    .from(eventToEventTypes)
    .innerJoin(eventTypes, eq(eventToEventTypes.eventTypeId, eventTypes.id))
    .where(eq(eventToEventTypes.eventId, eventId));

  return types;
}
