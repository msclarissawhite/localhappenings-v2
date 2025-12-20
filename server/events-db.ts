import { and, desc, eq, gte, lte, or, sql } from "drizzle-orm";
import { events, eventTypes, eventToEventTypes, collections, collectionToEvents, organizers } from "../drizzle/schema";
import { getDb } from "./db";
import type { EventFilters } from "../shared/types";

/**
 * Get all published events with optional filtering
 */
export async function getEvents(filters: EventFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  // Only show published events (exclude pending, rejected, needs-clarification, and closed)
  const conditions = [eq(events.status, "published")];

  // By default, exclude past events (unless showArchived is true)
  if (!filters.showArchived) {
    const now = new Date();
    conditions.push(gte(events.startDate, now));
  }

  // Location filters
  if (filters.province) {
    conditions.push(eq(events.province, filters.province));
  }
  if (filters.municipality) {
    conditions.push(eq(events.municipality, filters.municipality));
  }
  if (filters.neighborhoodCommunity) {
    conditions.push(eq(events.neighborhoodCommunity, filters.neighborhoodCommunity));
  }

  // Date filters
  if (filters.dateFrom) {
    conditions.push(gte(events.startDate, filters.dateFrom));
  }
  if (filters.dateTo) {
    conditions.push(lte(events.startDate, filters.dateTo));
  }

  // Quick date filters
  if (filters.today) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    conditions.push(and(gte(events.startDate, today), lte(events.startDate, tomorrow))!);
  }

  // Time of day
  if (filters.timeOfDay) {
    conditions.push(eq(events.timeOfDay, filters.timeOfDay));
  }

  // Cost filters
  if (filters.isFree) {
    conditions.push(eq(events.isFree, 1));
  }
  if (filters.costMax !== undefined) {
    conditions.push(or(eq(events.isFree, 1), lte(events.costMin, filters.costMax))!);
  }

  // Age filters
  if (filters.allAges) {
    conditions.push(eq(events.allAges, 1));
  }
  if (filters.familyFriendly) {
    conditions.push(eq(events.familyFriendly, 1));
  }
  if (filters.youngChildren) {
    conditions.push(eq(events.youngChildren, 1));
  }
  if (filters.kids) {
    conditions.push(eq(events.kids, 1));
  }
  if (filters.teens) {
    conditions.push(eq(events.teens, 1));
  }
  if (filters.adultsOnly) {
    conditions.push(eq(events.adultsOnly, 1));
  }
  if (filters.seniors) {
    conditions.push(eq(events.seniors, 1));
  }

  // Attribute filters
  if (filters.isIndoor) {
    conditions.push(eq(events.isIndoor, 1));
  }
  if (filters.isOutdoor) {
    conditions.push(eq(events.isOutdoor, 1));
  }

  let query = db
    .select({
      event: events,
      organizer: organizers,
    })
    .from(events)
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .where(and(...conditions)).$dynamic();

  // Text search - filter in-memory after fetching
  const hasSearchTerm = filters.search && filters.search.trim().length > 0;
  
  // Accessibility filters - filter in-memory since accessibility is JSON
  const accessibilityFilters = {
    changeTablesPresent: filters.changeTablesPresent,
    nursingFriendly: filters.nursingFriendly,
    strollerSpace: filters.strollerSpace,
    wheelchairEntrance: filters.wheelchairEntrance,
    stepFreeEntry: filters.stepFreeEntry,
    accessibleWashrooms: filters.accessibleWashrooms,
    sensoryFriendly: filters.sensoryFriendly,
    quietRoom: filters.quietRoom,
    quietEnvironment: filters.quietEnvironment,
    genderNeutralWashrooms: filters.genderNeutralWashrooms,
    lgbtqiaFriendly: filters.lgbtqiaFriendly,
    scentFree: filters.scentFree,
  };
  
  const hasAccessibilityFilters = Object.values(accessibilityFilters).some(v => v === true);

  // Sorting
  if (filters.sortBy === "soonest") {
    query = query.orderBy(events.startDate);
  } else if (filters.sortBy === "latest") {
    query = query.orderBy(desc(events.startDate));
  } else if (filters.sortBy === "name-az") {
    query = query.orderBy(events.name);
  } else if (filters.sortBy === "name-za") {
    query = query.orderBy(desc(events.name));
  } else {
    // Default: soonest first
    query = query.orderBy(events.startDate);
  }

  // Pagination
  if (filters.limit) {
    query = query.limit(filters.limit);
  }
  if (filters.offset) {
    query = query.offset(filters.offset);
  }

  let rawResults = await query;
  
  // Flatten results to include organizer verification status
  let results = rawResults.map(row => ({
    ...row.event,
    organizerIsVerified: row.organizer?.isVerified === 1,
  }));

  // Apply text search filter
  if (hasSearchTerm) {
    const searchLower = filters.search!.toLowerCase().trim();
    results = results.filter(event => {
      return (
        event.name?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.venue?.toLowerCase().includes(searchLower) ||
        event.organizerName?.toLowerCase().includes(searchLower)
      );
    });
  }
  
  // Apply accessibility filters in-memory
  if (hasAccessibilityFilters) {
    results = results.filter((event) => {
      try {
        const accessibility = typeof event.accessibility === 'string' 
          ? JSON.parse(event.accessibility) 
          : event.accessibility;
        
        // Check each active accessibility filter
        for (const [key, value] of Object.entries(accessibilityFilters)) {
          if (value === true) {
            // Map filter keys to accessibility JSON structure
            let found = false;
            
            // Caregiver fields
            if (['changeTablesPresent', 'nursingFriendly', 'strollerSpace'].includes(key)) {
              found = accessibility?.caregiver?.[key] === 'yes';
            }
            // Mobility fields
            else if (['wheelchairEntrance', 'stepFreeEntry', 'accessibleWashrooms'].includes(key)) {
              found = accessibility?.mobility?.[key] === 'yes';
            }
            // Sensory fields
            else if (['sensoryFriendly', 'quietRoom', 'quietEnvironment'].includes(key)) {
              found = accessibility?.sensory?.[key] === 'yes';
            }
            // Social fields
            else if (['genderNeutralWashrooms', 'lgbtqiaFriendly', 'scentFree'].includes(key)) {
              found = accessibility?.social?.[key] === 'yes';
            }
            
            if (!found) return false;
          }
        }
        
        return true;
      } catch {
        return false;
      }
    });
  }

  return results;
}

/**
 * Get event by ID
 */
export async function getEventById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      event: events,
      organizer: organizers,
    })
    .from(events)
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .where(eq(events.id, id))
    .limit(1);
  
  if (!result[0]) return null;
  
  // Flatten the result to include organizer verification status
  return {
    ...result[0].event,
    organizerIsVerified: result[0].organizer?.isVerified === 1,
  };
}

/**
 * Get event types for an event
 */
export async function getEventTypes(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ eventType: eventTypes })
    .from(eventToEventTypes)
    .innerJoin(eventTypes, eq(eventToEventTypes.eventTypeId, eventTypes.id))
    .where(eq(eventToEventTypes.eventId, eventId));

  return result.map((r) => r.eventType);
}

/**
 * Get all event types
 */
export async function getAllEventTypes() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(eventTypes).orderBy(eventTypes.name);
}

/**
 * Create a new event submission
 */
export async function createEvent(eventData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(events).values(eventData);
  return Number(result.insertId);
}

/**
 * Get pending events for admin review
 */
export async function getPendingEvents() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(events)
    .where(eq(events.status, "pending"))
    .orderBy(desc(events.createdAt));
}

/**
 * Update event status (admin moderation)
 */
export async function updateEventStatus(
  eventId: number,
  status: "published" | "rejected" | "needs-clarification",
  reviewedBy: number,
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {
    status,
    reviewedBy,
    reviewNotes,
    updatedAt: new Date(),
  };

  if (status === "published") {
    updateData.publishedAt = new Date();
  }

  await db.update(events).set(updateData).where(eq(events.id, eventId));
}

/**
 * Update an event
 */
export async function updateEvent(eventId: number, eventData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(events).set({ ...eventData, updatedAt: new Date() }).where(eq(events.id, eventId));
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(events).where(eq(events.id, eventId));
}

/**
 * Get all collections
 */
export async function getCollections() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(collections)
    .where(eq(collections.isActive, 1))
    .orderBy(collections.sortOrder);
}

/**
 * Get events for a collection
 */
export async function getCollectionEvents(collectionId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({ event: events })
    .from(collectionToEvents)
    .innerJoin(events, eq(collectionToEvents.eventId, events.id))
    .where(and(eq(collectionToEvents.collectionId, collectionId), eq(events.status, "published"))!);

  return result.map((r) => r.event);
}

/**
 * Get unique locations for filtering
 */
export async function getLocations() {
  const db = await getDb();
  if (!db) return { provinces: [], cities: [], neighborhoods: [] };

  const publishedEvents = await db
    .select({
      province: events.province,
      municipality: events.municipality,
      neighborhoodCommunity: events.neighborhoodCommunity,
    })
    .from(events)
    .where(eq(events.status, "published"));

  const provinces = Array.from(new Set(publishedEvents.map((e) => e.province))).filter(Boolean).sort();
  const municipalities = Array.from(new Set(publishedEvents.map((e) => e.municipality))).filter(Boolean).sort();
  const neighborhoodCommunities = Array.from(new Set(publishedEvents.map((e) => e.neighborhoodCommunity))).filter(Boolean).sort();

  return { provinces, municipalities, neighborhoodCommunities };
}
