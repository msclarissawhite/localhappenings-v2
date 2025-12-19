import { describe, expect, it } from "vitest";
import { getAnalytics } from "./analytics-db";

describe("Analytics Query Fix", () => {
  it("should fetch analytics data without DATE_FORMAT errors", async () => {
    const analytics = await getAnalytics();

    // Verify all required fields are present
    expect(analytics).toHaveProperty("totalEvents");
    expect(analytics).toHaveProperty("publishedEvents");
    expect(analytics).toHaveProperty("pendingEvents");
    expect(analytics).toHaveProperty("rejectedEvents");
    expect(analytics).toHaveProperty("approvalRate");
    expect(analytics).toHaveProperty("topCities");
    expect(analytics).toHaveProperty("topProvinces");
    expect(analytics).toHaveProperty("eventsByMonth");
    expect(analytics).toHaveProperty("recentSubmissions");

    // Verify data types
    expect(typeof analytics.totalEvents).toBe("number");
    expect(typeof analytics.publishedEvents).toBe("number");
    expect(typeof analytics.pendingEvents).toBe("number");
    expect(typeof analytics.rejectedEvents).toBe("number");
    expect(typeof analytics.approvalRate).toBe("number");
    expect(Array.isArray(analytics.topCities)).toBe(true);
    expect(Array.isArray(analytics.topProvinces)).toBe(true);
    expect(Array.isArray(analytics.eventsByMonth)).toBe(true);
    expect(typeof analytics.recentSubmissions).toBe("number");
  });

  it("should group events by month correctly", async () => {
    const analytics = await getAnalytics();

    // Verify eventsByMonth has correct structure
    analytics.eventsByMonth.forEach((item) => {
      expect(item).toHaveProperty("month");
      expect(item).toHaveProperty("count");
      expect(typeof item.month).toBe("string");
      expect(typeof item.count).toBe("number");
      // Month should be in YYYY-MM format
      expect(item.month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  it("should calculate approval rate correctly", async () => {
    const analytics = await getAnalytics();

    // Approval rate should be between 0 and 100
    expect(analytics.approvalRate).toBeGreaterThanOrEqual(0);
    expect(analytics.approvalRate).toBeLessThanOrEqual(100);

    // If there are published or rejected events, approval rate should be calculated
    if (analytics.publishedEvents + analytics.rejectedEvents > 0) {
      const expectedRate =
        (analytics.publishedEvents / (analytics.publishedEvents + analytics.rejectedEvents)) * 100;
      expect(analytics.approvalRate).toBeCloseTo(expectedRate, 1);
    }
  });

  it("should return top cities with counts", async () => {
    const analytics = await getAnalytics();

    analytics.topCities.forEach((city) => {
      expect(city).toHaveProperty("city");
      expect(city).toHaveProperty("count");
      expect(typeof city.city).toBe("string");
      expect(typeof city.count).toBe("number");
      expect(city.count).toBeGreaterThan(0);
    });
  });

  it("should return top provinces with counts", async () => {
    const analytics = await getAnalytics();

    analytics.topProvinces.forEach((province) => {
      expect(province).toHaveProperty("province");
      expect(province).toHaveProperty("count");
      expect(typeof province.province).toBe("string");
      expect(typeof province.count).toBe("number");
      expect(province.count).toBeGreaterThan(0);
    });
  });
});
