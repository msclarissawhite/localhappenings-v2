import { getDb } from "./db";
import { events } from "../drizzle/schema";
import { and, eq, sql } from "drizzle-orm";

/**
 * Detect potential duplicate events based on name, date, and location similarity
 */

interface DuplicateCandidate {
  id: number;
  name: string;
  startDate: Date;
  venue: string | null;
  municipality: string;
  province: string;
  similarity: number;
  status: string;
}

/**
 * Find potential duplicates for a given event
 * Returns events with similar name, same date, and same location
 */
export async function findPotentialDuplicates(
  eventId: number,
  eventName: string,
  startDate: Date,
  province: string,
  municipality: string,
  venue?: string | null
): Promise<DuplicateCandidate[]> {
  const db = await getDb();
  if (!db) return [];

  // Convert date to YYYY-MM-DD format for comparison
  const dateStr = startDate.toISOString().split("T")[0];

  // Find events with:
  // 1. Same province and municipality
  // 2. Same start date (day)
  // 3. Similar name or same venue
  // 4. Not the same event
  const candidates = await db
    .select({
      id: events.id,
      name: events.name,
      startDate: events.startDate,
      venue: events.venue,
      municipality: events.municipality,
      province: events.province,
      status: events.status,
    })
    .from(events)
    .where(
      and(
        eq(events.province, province),
        eq(events.municipality, municipality),
        sql`DATE(${events.startDate}) = ${dateStr}`,
        sql`${events.id} != ${eventId}`
      )
    );

  // Calculate similarity scores
  const duplicates: DuplicateCandidate[] = candidates
    .map((candidate) => {
      let similarity = 0;

      // Name similarity (simple word overlap check)
      const nameWords1 = eventName.toLowerCase().split(/\s+/);
      const nameWords2 = candidate.name.toLowerCase().split(/\s+/);
      const commonWords = nameWords1.filter((word) =>
        nameWords2.includes(word)
      );
      const nameSimilarity = commonWords.length / Math.max(nameWords1.length, nameWords2.length);
      similarity += nameSimilarity * 60; // Name is 60% of score

      // Venue match (if both have venues)
      if (venue && candidate.venue) {
        const venueSimilarity = venue.toLowerCase() === candidate.venue.toLowerCase() ? 1 : 0;
        similarity += venueSimilarity * 40; // Venue is 40% of score
      }

      return {
        ...candidate,
        startDate: new Date(candidate.startDate),
        similarity: Math.round(similarity),
      };
    })
    .filter((dup) => dup.similarity >= 40) // Only return if similarity >= 40%
    .sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending

  return duplicates;
}

/**
 * Check if an event has potential duplicates
 * Returns true if duplicates found, false otherwise
 */
export async function hasPotentialDuplicates(
  eventId: number,
  eventName: string,
  startDate: Date,
  province: string,
  municipality: string,
  venue?: string | null
): Promise<boolean> {
  const duplicates = await findPotentialDuplicates(
    eventId,
    eventName,
    startDate,
    province,
    municipality,
    venue
  );
  return duplicates.length > 0;
}
