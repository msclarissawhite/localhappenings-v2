import { describe, it, expect } from "vitest";
import { generateRecurringDates, generateEventInstances, previewRecurringDates } from "./recurring-events";

describe("Recurring Events", () => {
  it("should generate daily recurring dates", () => {
    const startDate = new Date("2025-01-01");
    const dates = generateRecurringDates({
      startDate,
      pattern: {
        frequency: "daily",
        interval: 1,
        occurrences: 5,
      },
    });

    expect(dates).toHaveLength(5);
    expect(dates[0].toISOString()).toContain("2025-01-01");
    expect(dates[1].toISOString()).toContain("2025-01-02");
    expect(dates[4].toISOString()).toContain("2025-01-05");
  });

  it("should generate weekly recurring dates", () => {
    const startDate = new Date("2025-01-06"); // Monday
    const dates = generateRecurringDates({
      startDate,
      pattern: {
        frequency: "weekly",
        interval: 1,
        occurrences: 4,
      },
    });

    expect(dates).toHaveLength(4);
    // Each date should be 7 days apart
    const daysBetween = (dates[1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24);
    expect(daysBetween).toBe(7);
  });

  it("should generate monthly recurring dates", () => {
    const startDate = new Date("2025-01-15");
    const dates = generateRecurringDates({
      startDate,
      pattern: {
        frequency: "monthly",
        interval: 1,
        occurrences: 3,
      },
    });

    expect(dates).toHaveLength(3);
    expect(dates[0].getMonth()).toBe(0); // January
    expect(dates[1].getMonth()).toBe(1); // February
    expect(dates[2].getMonth()).toBe(2); // March
  });

  it("should respect end date limit", () => {
    const startDate = new Date("2025-01-01");
    const endDate = new Date("2025-01-10");
    
    const dates = generateRecurringDates({
      startDate,
      pattern: {
        frequency: "daily",
        interval: 1,
        endDate,
      },
    });

    expect(dates.length).toBeLessThanOrEqual(10);
    dates.forEach(date => {
      expect(date.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });
  });

  it("should generate event instances with correct data", () => {
    const baseEvent = {
      name: "Weekly Meeting",
      description: "Team sync",
      province: "Nova Scotia",
      city: "Halifax",
      startDate: "2025-01-06T10:00:00Z",
      endDate: "2025-01-06T11:00:00Z",
      isFree: true,
      accessibility: {},
    };

    const instances = generateEventInstances(baseEvent, {
      startDate: new Date("2025-01-06T10:00:00Z"),
      endDate: new Date("2025-01-06T11:00:00Z"),
      pattern: {
        frequency: "weekly",
        interval: 1,
        occurrences: 3,
      },
    });

    expect(instances).toHaveLength(3);
    expect(instances[0].name).toBe("Weekly Meeting");
    expect(instances[0].isRecurring).toBe(1);
    expect(instances[0].recurringIndex).toBe(0);
    expect(instances[1].recurringIndex).toBe(1);
    expect(instances[0].recurringGroupId).toBe(instances[1].recurringGroupId);
  });

  it("should preview recurring dates in readable format", () => {
    const startDate = new Date("2025-01-06T12:00:00Z"); // Use noon UTC to avoid timezone issues
    const preview = previewRecurringDates(
      startDate,
      {
        frequency: "weekly",
        interval: 1,
        occurrences: 3,
      },
      3
    );

    expect(preview).toHaveLength(3);
    expect(preview[0]).toContain("Jan");
    expect(preview[0]).toMatch(/\d+/); // Contains a day number
  });
});
