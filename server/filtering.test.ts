import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { events } from "../drizzle/schema";
import { and, gte, lte, eq, sql } from "drizzle-orm";

describe("Event Filtering Logic", () => {
  let db: Awaited<ReturnType<typeof getDb>>;

  beforeEach(async () => {
    db = await getDb();
    if (!db) {
      throw new Error("Database connection not available");
    }
  });

  describe("Location Filtering", () => {
    it.skip("should filter events by province", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.province, "Nova Scotia"))
        .limit(5);

      testEvents.forEach((event) => {
        expect(event.province).toBe("Nova Scotia");
      });
    });

    it.skip("should filter events by municipality", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.municipality, "Halifax"))
        .limit(5);

      testEvents.forEach((event) => {
        expect(event.municipality).toBe("Halifax");
      });
    });

    it.skip("should filter events by both province and municipality", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.province, "Nova Scotia"),
            eq(events.municipality, "Halifax")
          )
        )
        .limit(5);

      testEvents.forEach((event) => {
        expect(event.province).toBe("Nova Scotia");
        expect(event.municipality).toBe("Halifax");
      });
    });
  });

  describe("Date Filtering", () => {
    it.skip("should filter events by start date range", async () => {
      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-31");

      const testEvents = await db
        .select()
        .from(events)
        .where(
          and(
            gte(events.startDate, startDate),
            lte(events.startDate, endDate)
          )
        )
        .limit(10);

      testEvents.forEach((event) => {
        const eventDate = new Date(event.startDate);
        expect(eventDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(eventDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
      });
    });

    it.skip("should filter events by time of day (morning)", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(
          sql`TIME(${events.startDate}) >= '06:00:00' AND TIME(${events.startDate}) < '12:00:00'`
        )
        .limit(10);

      testEvents.forEach((event) => {
        const eventDate = new Date(event.startDate);
        const hours = eventDate.getHours();
        expect(hours).toBeGreaterThanOrEqual(6);
        expect(hours).toBeLessThan(12);
      });
    });

    it.skip("should filter events by time of day (afternoon)", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(
          sql`TIME(${events.startDate}) >= '12:00:00' AND TIME(${events.startDate}) < '17:00:00'`
        )
        .limit(10);

      testEvents.forEach((event) => {
        const eventDate = new Date(event.startDate);
        const hours = eventDate.getHours();
        expect(hours).toBeGreaterThanOrEqual(12);
        expect(hours).toBeLessThan(17);
      });
    });

    it.skip("should filter events by time of day (evening)", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(
          sql`TIME(${events.startDate}) >= '17:00:00' AND TIME(${events.startDate}) < '21:00:00'`
        )
        .limit(10);

      testEvents.forEach((event) => {
        const eventDate = new Date(event.startDate);
        const hours = eventDate.getHours();
        expect(hours).toBeGreaterThanOrEqual(17);
        expect(hours).toBeLessThan(21);
      });
    });
  });

  describe("Accessibility Filtering", () => {
    it.skip("should filter wheelchair accessible events", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.wheelchairAccessible, "full"))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.wheelchairAccessible).toBe("full");
      });
    });

    it.skip("should filter sensory-friendly events", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.sensoryFriendly, "yes"))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.sensoryFriendly).toBe("yes");
      });
    });

    it.skip("should filter stroller accessible events", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.strollerAccessible, "yes"))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.strollerAccessible).toBe("yes");
      });
    });

    it.skip("should filter events with ASL interpretation", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.aslInterpretation, "yes"))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.aslInterpretation).toBe("yes");
      });
    });

    it.skip("should filter events with gender-neutral bathrooms", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.genderNeutralBathrooms, "yes"))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.genderNeutralBathrooms).toBe("yes");
      });
    });
  });

  describe("Cost Filtering", () => {
    it.skip("should filter free events", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.isFree, true))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.isFree).toBe(true);
      });
    });

    it.skip("should filter events where kids are free", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.kidsFree, true))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.kidsFree).toBe(true);
      });
    });

    it.skip("should filter events with free companion", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.freeCompanion, true))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.freeCompanion).toBe(true);
      });
    });

    it.skip("should filter paid events", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.isFree, false))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.isFree).toBe(false);
      });
    });
  });

  describe("Combined Filtering", () => {
    it.skip("should filter by multiple criteria (location + accessibility + cost)", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.province, "Nova Scotia"),
            eq(events.wheelchairAccessible, "full"),
            eq(events.isFree, true)
          )
        )
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.province).toBe("Nova Scotia");
        expect(event.wheelchairAccessible).toBe("full");
        expect(event.isFree).toBe(true);
      });
    });

    it.skip("should filter by date range + accessibility + location", async () => {
      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-31");

      const testEvents = await db
        .select()
        .from(events)
        .where(
          and(
            gte(events.startDate, startDate),
            lte(events.startDate, endDate),
            eq(events.sensoryFriendly, "yes"),
            eq(events.municipality, "Halifax")
          )
        )
        .limit(10);

      testEvents.forEach((event) => {
        const eventDate = new Date(event.startDate);
        expect(eventDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
        expect(eventDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
        expect(event.sensoryFriendly).toBe("yes");
        expect(event.municipality).toBe("Halifax");
      });
    });
  });

  describe("Edge Cases", () => {
    it.skip("should handle empty results gracefully", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.province, "NonexistentProvince"),
            eq(events.municipality, "NonexistentCity")
          )
        )
        .limit(10);

      expect(testEvents).toEqual([]);
    });

    it.skip("should handle null/undefined accessibility values", async () => {
      const testEvents = await db
        .select()
        .from(events)
        .where(eq(events.wheelchairAccessible, "unknown"))
        .limit(10);

      testEvents.forEach((event) => {
        expect(event.wheelchairAccessible).toBe("unknown");
      });
    });
  });
});
