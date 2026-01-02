import { query } from './db-simple';
import type { EventFilters } from '../shared/types';

export async function listEvents(filters: EventFilters = {}) {
  console.log('[listEvents] Fetching events with filters:', JSON.stringify(filters));
  
  const conditions: string[] = [];
  const params: any[] = [];

  // Default: only published events
  conditions.push('events.status = ?');
  params.push(filters.status || 'published');

  // Default: exclude past events unless showArchived is true
  if (!filters.showArchived) {
    conditions.push('events.startDate >= CURDATE()');
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

  // Age/audience filters
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

  // Location type filters
  if (filters.isIndoor) {
    conditions.push('events.isIndoor = 1');
  }
  if (filters.isOutdoor) {
    conditions.push('events.isOutdoor = 1');
  }

  // Search filter
  if (filters.search) {
    conditions.push('(events.name LIKE ? OR events.description LIKE ? OR events.venue LIKE ? OR events.organizerName LIKE ?)');
    const searchPattern = `%${filters.search}%`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  // Build WHERE clause
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Build ORDER BY
  let orderBy = 'ORDER BY events.startDate ASC';
  if (filters.sortBy === 'latest') {
    orderBy = 'ORDER BY events.startDate DESC';
  } else if (filters.sortBy === 'name-az') {
    orderBy = 'ORDER BY events.name ASC';
  } else if (filters.sortBy === 'name-za') {
    orderBy = 'ORDER BY events.name DESC';
  }

  // Build LIMIT/OFFSET
  const limit = parseInt(String(filters.limit || 1000), 10);
  const offset = parseInt(String(filters.offset || 0), 10);

  // Main query - embed LIMIT/OFFSET directly as TiDB doesn't support them as placeholders
  const sql = `
    SELECT 
      events.*,
      organizers.isVerified as organizerIsVerified
    FROM events
    LEFT JOIN organizers ON events.organizerId = organizers.id
    ${whereClause}
    ${orderBy}
    LIMIT ${limit} OFFSET ${offset}
  `;

  console.log('[listEvents] Executing SQL with', params.length, 'params');
  
  try {
    const events = await query(sql, params);
    
    // Get event types for all events
    if (events.length > 0) {
      const eventIds = events.map((e: any) => e.id);
      const placeholders = eventIds.map(() => '?').join(',');
      
      const typesSql = `
        SELECT 
          ett.eventId,
          et.id,
          et.name,
          et.category
        FROM eventToEventTypes ett
        INNER JOIN eventTypes et ON ett.eventTypeId = et.id
        WHERE ett.eventId IN (${placeholders})
      `;
      
      const eventTypes = await query(typesSql, eventIds);
      
      // Map event types to events
      const eventTypesMap: Record<number, any[]> = {};
      eventTypes.forEach((row: any) => {
        if (!eventTypesMap[row.eventId]) {
          eventTypesMap[row.eventId] = [];
        }
        eventTypesMap[row.eventId].push({
          id: row.id,
          name: row.name,
          category: row.category
        });
      });
      
      // Add event types to each event
      events.forEach((event: any) => {
        event.eventTypes = eventTypesMap[event.id] || [];
      });
    }

    // Get total count
    const countSql = `
      SELECT COUNT(*) as total
      FROM events
      LEFT JOIN organizers ON events.organizerId = organizers.id
      ${whereClause}
    `;
    
    // Use all params for count query (limit/offset not in params anymore)
    const countParams = params;
    const countResult = await query<{ total: number }>(countSql, countParams);
    const total = countResult[0]?.total || 0;

    console.log('[listEvents] Returning', events.length, 'events out of', total, 'total');

    return {
      events,
      total: Number(total)
    };
  } catch (error) {
    console.error('[listEvents] Query failed:', error);
    throw error;
  }
}

export async function getEventById(id: number) {
  const sql = `
    SELECT 
      events.*,
      organizers.isVerified as organizerIsVerified
    FROM events
    LEFT JOIN organizers ON events.organizerId = organizers.id
    WHERE events.id = ?
  `;
  
  const events = await query(sql, [id]);
  if (events.length === 0) {
    return null;
  }
  
  const event = events[0];
  
  // Get event types
  const typesSql = `
    SELECT 
      et.id,
      et.name,
      et.category
    FROM eventToEventTypes ett
    INNER JOIN eventTypes et ON ett.eventTypeId = et.id
    WHERE ett.eventId = ?
  `;
  
  const eventTypes = await query(typesSql, [id]);
  (event as any).eventTypes = eventTypes;
  
  return event;
}
