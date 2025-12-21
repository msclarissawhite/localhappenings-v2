import { eq, and, or, gte, lte, like, inArray, sql, desc, asc, isNotNull } from "drizzle-orm";
import { events, eventTypes, eventToEventTypes, collections, collectionToEvents, organizers } from "../drizzle/schema";
import { getDb } from "./db";
import type { EventFilters } from "../shared/types";

/**
 * Get all published events with optional filtering
 */
export async function getEvents(filters: EventFilters = {}) {
  const db = await getDb();
  if (!db) return [];

  // Status filter (default to published for public queries)
  const conditions = [];
  if (filters.status) {
    conditions.push(eq(events.status, filters.status));
  } else {
    // Only show published events by default (exclude pending, rejected, needs-clarification, and closed)
    conditions.push(eq(events.status, "published"));
  }
  
  // Admin filter: events with pending edits
  if (filters.hasUnreviewedEdit !== undefined) {
    conditions.push(eq(events.hasUnreviewedEdit, filters.hasUnreviewedEdit ? 1 : 0));
  }

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
  
  // Event type filter - will be applied after fetching event types
  const hasEventTypeFilter = filters.eventTypeIds && filters.eventTypeIds.length > 0;

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

  // Fetch event types for all events
  const eventIds = results.map(e => e.id);
  let eventTypesMap: Record<number, any[]> = {};
  
  if (eventIds.length > 0) {
    const eventTypesResult = await db
      .select({
        eventId: eventToEventTypes.eventId,
        eventType: eventTypes,
      })
      .from(eventToEventTypes)
      .innerJoin(eventTypes, eq(eventToEventTypes.eventTypeId, eventTypes.id))
      .where(inArray(eventToEventTypes.eventId, eventIds));
    
    // Group event types by event ID
    eventTypesResult.forEach(row => {
      if (!eventTypesMap[row.eventId]) {
        eventTypesMap[row.eventId] = [];
      }
      eventTypesMap[row.eventId].push(row.eventType);
    });
  }
  
  // Add event types to each event
  let eventsWithTypes = results.map(event => ({
    ...event,
    eventTypes: eventTypesMap[event.id] || [],
  }));
  
  // Filter by event types if specified
  if (hasEventTypeFilter) {
    eventsWithTypes = eventsWithTypes.filter(event => {
      const eventTypeIds = event.eventTypes.map((t: any) => t.id);
      return filters.eventTypeIds!.some(id => eventTypeIds.includes(id));
    });
  }

  // Get total count (without limit/offset for pagination)
  const totalQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .leftJoin(organizers, eq(events.organizerId, organizers.id))
    .where(and(...conditions));
  
  const [{ count: total }] = await totalQuery;

  return {
    events: eventsWithTypes,
    total: Number(total) || 0,
  };
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
 * Associate event types with an event
 */
export async function associateEventTypes(eventId: number, eventTypeIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (eventTypeIds.length === 0) return;

  const associations = eventTypeIds.map(typeId => ({
    eventId,
    eventTypeId: typeId,
  }));

  await db.insert(eventToEventTypes).values(associations);
}

/**
 * Update event types for an event (delete old, insert new)
 */
export async function updateEventTypes(eventId: number, eventTypeIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete existing associations
  await db.delete(eventToEventTypes).where(eq(eventToEventTypes.eventId, eventId));

  // Insert new associations if any
  if (eventTypeIds.length > 0) {
    const associations = eventTypeIds.map(typeId => ({
      eventId,
      eventTypeId: typeId,
    }));
    await db.insert(eventToEventTypes).values(associations);
  }
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
 * Update event's ClickUp task ID
 */
export async function updateEventClickUpTaskId(eventId: number, clickupTaskId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(events).set({ clickupTaskId }).where(eq(events.id, eventId));
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

/**
 * Get all events (for admin export)
 */
export async function getAllEvents() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(events).orderBy(desc(events.createdAt));
}

/**
 * Log an admin edit to the event history
 */
export async function logEventEdit(eventId: number, adminId: number, adminName: string, changedFields: any) {
  const db = await getDb();
  if (!db) return;

  const { eventEditHistory } = await import("../drizzle/schema");
  
  await db.insert(eventEditHistory).values({
    eventId,
    adminId,
    adminName,
    changedFields: JSON.stringify(changedFields),
  });
}

/**
 * Get edit history for an event
 */
export async function getEventEditHistory(eventId: number) {
  const db = await getDb();
  if (!db) return [];

  const { eventEditHistory } = await import("../drizzle/schema");
  
  const history = await db
    .select()
    .from(eventEditHistory)
    .where(eq(eventEditHistory.eventId, eventId))
    .orderBy(desc(eventEditHistory.editedAt));

  return history;
}

/**
 * Record a tag click for analytics
 */
export async function recordTagClick(eventTypeId: number, sessionId?: string) {
  const db = await getDb();
  if (!db) return;

  const { eventTypeClicks } = await import("../drizzle/schema");
  
  await db.insert(eventTypeClicks).values({
    eventTypeId,
    sessionId: sessionId || null,
  });
}

/**
 * Get tag click analytics - returns event types with their click counts
 */
export async function getTagAnalytics() {
  const db = await getDb();
  if (!db) return [];

  const { eventTypeClicks, eventTypes } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");
  
  // Get click counts grouped by event type
  const results = await db
    .select({
      eventTypeId: eventTypeClicks.eventTypeId,
      eventTypeName: eventTypes.name,
      category: eventTypes.category,
      clickCount: sql<number>`COUNT(${eventTypeClicks.id})`.as('clickCount'),
    })
    .from(eventTypeClicks)
    .leftJoin(eventTypes, eq(eventTypeClicks.eventTypeId, eventTypes.id))
    .groupBy(eventTypeClicks.eventTypeId, eventTypes.name, eventTypes.category)
    .orderBy(desc(sql`COUNT(${eventTypeClicks.id})`));

  return results;
}

/**
 * Get popular tags (top N most-clicked event types)
 */
export async function getPopularTags(limit: number = 8) {
  const db = await getDb();
  if (!db) return [];

  const { eventTypeClicks, eventTypes } = await import("../drizzle/schema");
  const { sql } = await import("drizzle-orm");
  
  const results = await db
    .select({
      id: eventTypes.id,
      name: eventTypes.name,
      category: eventTypes.category,
      clickCount: sql<number>`COUNT(${eventTypeClicks.id})`.as('clickCount'),
    })
    .from(eventTypes)
    .leftJoin(eventTypeClicks, eq(eventTypes.id, eventTypeClicks.eventTypeId))
    .groupBy(eventTypes.id, eventTypes.name, eventTypes.category)
    .orderBy(desc(sql`COUNT(${eventTypeClicks.id})`))
    .limit(limit);

  return results;
}

/**
 * Get nearby events based on user's geolocation
 * Uses the Haversine formula to calculate distances
 */
export async function getNearbyEvents(
  userLat: number,
  userLon: number,
  radiusKm: number = 50,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) return [];

  const { sql } = await import("drizzle-orm");
  
  // Haversine formula to calculate distance in kilometers
  // Formula: 2 * R * asin(sqrt(sin²((lat2-lat1)/2) + cos(lat1) * cos(lat2) * sin²((lon2-lon1)/2)))
  // where R = Earth's radius in km (6371)
  const distanceFormula = sql<number>`
    (6371 * acos(
      cos(radians(${userLat})) *
      cos(radians(${events.latitude})) *
      cos(radians(${events.longitude}) - radians(${userLon})) +
      sin(radians(${userLat})) *
      sin(radians(${events.latitude}))
    ))
  `;

  const now = new Date();
  
  const results = await db
    .select({
      id: events.id,
      name: events.name,
      description: events.description,
      province: events.province,
      municipality: events.municipality,
      neighborhoodCommunity: events.neighborhoodCommunity,
      venue: events.venue,
      address: events.address,
      latitude: events.latitude,
      longitude: events.longitude,
      startDate: events.startDate,
      endDate: events.endDate,
      timeOfDay: events.timeOfDay,
      isFree: events.isFree,
      costMin: events.costMin,
      costMax: events.costMax,
      allAges: events.allAges,
      familyFriendly: events.familyFriendly,
      youngChildren: events.youngChildren,
      kids: events.kids,
      teens: events.teens,
      adultsOnly: events.adultsOnly,
      seniors: events.seniors,
      isIndoor: events.isIndoor,
      isOutdoor: events.isOutdoor,
      imageUrl: events.imageUrl,
      status: events.status,
      distance: distanceFormula.as('distance'),
    })
    .from(events)
    .where(
      and(
        eq(events.status, "published"),
        gte(events.startDate, now),
        isNotNull(events.latitude),
        isNotNull(events.longitude),
        sql`${distanceFormula} <= ${radiusKm}`
      )
    )
    .orderBy(asc(distanceFormula))
    .limit(limit);

  return results;
}
