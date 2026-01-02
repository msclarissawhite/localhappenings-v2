import mysql from 'mysql2/promise';
import type { EventFilters } from "../shared/types";

let pool: mysql.Pool | null = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = mysql.createPool(process.env.DATABASE_URL);
  }
  return pool;
}

export async function getEventsRaw(filters: EventFilters = {}) {
  const db = getPool();
  if (!db) {
    console.error('[events-db-raw] No database connection available');
    return { events: [], total: 0 };
  }

  try {
    // Build WHERE conditions
    const conditions: string[] = [];
    const params: any[] = [];

    // Status filter (default to published)
    if (filters.status) {
      conditions.push('events.status = ?');
      params.push(filters.status);
    } else {
      conditions.push('events.status = ?');
      params.push('published');
    }

    // By default, exclude past events (unless showArchived is true)
    if (!filters.showArchived) {
      conditions.push('events.startDate >= ?');
      params.push(new Date());
    }

    // Location filters
    if (filters.province) {
      conditions.push('events.province = ?');
      params.push(filters.province);
    }
    if (filters.municipality) {
      conditions.push('events.municipality = ?');
      params.push(filters.municipality);
    }
    if (filters.neighborhoodCommunity) {
      conditions.push('events.neighborhoodCommunity = ?');
      params.push(filters.neighborhoodCommunity);
    }

    // Date filters
    if (filters.dateFrom) {
      conditions.push('events.startDate >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('events.startDate <= ?');
      params.push(filters.dateTo);
    }

    // Time of day
    if (filters.timeOfDay) {
      conditions.push('events.timeOfDay = ?');
      params.push(filters.timeOfDay);
    }

    // Cost filters
    if (filters.isFree) {
      conditions.push('events.isFree = 1');
    }
    if (filters.costMax !== undefined) {
      conditions.push('(events.isFree = 1 OR events.costMin <= ?)');
      params.push(filters.costMax);
    }

    // Age filters
    if (filters.allAges) {
      conditions.push('events.allAges = 1');
    }
    if (filters.familyFriendly) {
      conditions.push('events.familyFriendly = 1');
    }
    if (filters.youngChildren) {
      conditions.push('events.youngChildren = 1');
    }
    if (filters.kids) {
      conditions.push('events.kids = 1');
    }
    if (filters.teens) {
      conditions.push('events.teens = 1');
    }
    if (filters.adultsOnly) {
      conditions.push('events.adultsOnly = 1');
    }
    if (filters.seniors) {
      conditions.push('events.seniors = 1');
    }

    // Attribute filters
    if (filters.isIndoor) {
      conditions.push('events.isIndoor = 1');
    }
    if (filters.isOutdoor) {
      conditions.push('events.isOutdoor = 1');
    }

    // Geolocation filter (Near Me)
    if (filters.nearMe && filters.userLatitude && filters.userLongitude) {
      conditions.push('events.latitude IS NOT NULL');
      conditions.push('events.longitude IS NOT NULL');
      
      if (filters.radiusKm) {
        const distanceFormula = `
          (6371 * acos(
            cos(radians(?)) *
            cos(radians(events.latitude)) *
            cos(radians(events.longitude) - radians(?)) +
            sin(radians(?)) *
            sin(radians(events.latitude))
          ))
        `;
        conditions.push(`${distanceFormula} <= ?`);
        params.push(filters.userLatitude, filters.userLongitude, filters.userLatitude, filters.radiusKm);
      }
    }

    // Build the WHERE clause
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Build ORDER BY clause
    let orderBy = 'ORDER BY events.startDate ASC';
    if (filters.sortBy === 'latest') {
      orderBy = 'ORDER BY events.startDate DESC';
    } else if (filters.sortBy === 'name-az') {
      orderBy = 'ORDER BY events.name ASC';
    } else if (filters.sortBy === 'name-za') {
      orderBy = 'ORDER BY events.name DESC';
    } else if (filters.sortBy === 'distance' && filters.nearMe && filters.userLatitude && filters.userLongitude) {
      const distanceFormula = `
        (6371 * acos(
          cos(radians(${filters.userLatitude})) *
          cos(radians(events.latitude)) *
          cos(radians(events.longitude) - radians(${filters.userLongitude})) +
          sin(radians(${filters.userLatitude})) *
          sin(radians(events.latitude))
        ))
      `;
      orderBy = `ORDER BY ${distanceFormula} ASC`;
    }

    // Build LIMIT/OFFSET clause
    let limitClause = '';
    if (filters.limit) {
      limitClause = `LIMIT ${filters.limit}`;
      if (filters.offset) {
        limitClause += ` OFFSET ${filters.offset}`;
      }
    }

    // Main query
    const query = `
      SELECT 
        events.*,
        organizers.isVerified as organizerIsVerified
      FROM events
      LEFT JOIN organizers ON events.organizerId = organizers.id
      ${whereClause}
      ${orderBy}
      ${limitClause}
    `;

    console.log('[events-db-raw] Executing query with', params.length, 'parameters');
    
    const [rows] = await db.execute(query, params);
    const events = rows as any[];

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM events
      LEFT JOIN organizers ON events.organizerId = organizers.id
      ${whereClause}
    `;
    
    const [countRows] = await db.execute(countQuery, params.filter((_, i) => {
      // Remove limit/offset params from count query
      return i < params.length - (filters.limit ? (filters.offset ? 2 : 1) : 0);
    }));
    const total = (countRows as any[])[0]?.total || 0;

    // Fetch event types for all events
    if (events.length > 0) {
      const eventIds = events.map(e => e.id);
      const placeholders = eventIds.map(() => '?').join(',');
      
      const typesQuery = `
        SELECT 
          ett.eventId,
          et.id,
          et.name,
          et.description,
          et.icon
        FROM event_to_event_types ett
        INNER JOIN event_types et ON ett.eventTypeId = et.id
        WHERE ett.eventId IN (${placeholders})
      `;
      
      const [typeRows] = await db.execute(typesQuery, eventIds);
      const eventTypesMap: Record<number, any[]> = {};
      
      (typeRows as any[]).forEach(row => {
        if (!eventTypesMap[row.eventId]) {
          eventTypesMap[row.eventId] = [];
        }
        eventTypesMap[row.eventId].push({
          id: row.id,
          name: row.name,
          description: row.description,
          icon: row.icon
        });
      });
      
      // Add event types to each event
      events.forEach(event => {
        event.eventTypes = eventTypesMap[event.id] || [];
      });
    }

    // Apply text search filter in-memory (after fetching)
    let filteredEvents = events;
    if (filters.search && filters.search.trim().length > 0) {
      const searchLower = filters.search.toLowerCase().trim();
      filteredEvents = events.filter(event => {
        return (
          event.name?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.venue?.toLowerCase().includes(searchLower) ||
          event.organizerName?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply event type filter if specified
    if (filters.eventTypeIds && filters.eventTypeIds.length > 0) {
      filteredEvents = filteredEvents.filter(event => {
        const eventTypeIds = event.eventTypes.map((t: any) => t.id);
        return filters.eventTypeIds!.some(id => eventTypeIds.includes(id));
      });
    }

    console.log('[events-db-raw] Returning', filteredEvents.length, 'events out of', total, 'total');

    return {
      events: filteredEvents,
      total: Number(total) || 0,
    };
  } catch (error) {
    console.error('[events-db-raw] Query failed:', error);
    throw error;
  }
}
