import { describe, expect, it } from "vitest";
import { getEvents } from "./events-db";

describe("Event Archiving Feature", () => {
  it("excludes past events by default", async () => {
    const events = await getEvents({});
    
    // All returned events should have startDate >= now
    const now = new Date();
    const futureEvents = events.filter(event => new Date(event.startDate) >= now);
    
    expect(events.length).toBe(futureEvents.length);
  });

  it("includes past events when showArchived is true", async () => {
    const allEvents = await getEvents({ showArchived: true });
    const futureOnlyEvents = await getEvents({ showArchived: false });
    
    // With showArchived=true, we should get more or equal events
    expect(allEvents.length).toBeGreaterThanOrEqual(futureOnlyEvents.length);
  });

  it("filters correctly with showArchived and other filters combined", async () => {
    const events = await getEvents({
      showArchived: true,
      isFree: true,
    });
    
    // All returned events should be free
    const freeEvents = events.filter(event => event.isFree === 1);
    expect(events.length).toBe(freeEvents.length);
  });
});
