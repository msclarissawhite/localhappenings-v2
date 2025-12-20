/**
 * Tests for donation functionality
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/types/context";

// Mock context for testing
const mockContext: Context = {
  user: null,
  req: {
    headers: {
      origin: "http://localhost:3000",
    },
  } as any,
  res: {} as any,
};

describe("Donations", () => {
  describe("createCheckoutSession", () => {
    it("should create one-time donation checkout session", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.donations.createCheckoutSession({
        amount: 1000, // $10
        isRecurring: false,
        donorEmail: "test@example.com",
        donorName: "Test Donor",
        message: "Great platform!",
        isAnonymous: false,
        showAmount: true,
      });

      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("url");
      expect(result.url).toContain("checkout.stripe.com");
    });

    it("should create recurring donation checkout session", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.donations.createCheckoutSession({
        amount: 2500, // $25
        isRecurring: true,
        donorEmail: "monthly@example.com",
        donorName: "Monthly Supporter",
        isAnonymous: false,
        showAmount: true,
      });

      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("url");
      expect(result.url).toContain("checkout.stripe.com");
    });

    it("should create anonymous donation checkout session", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.donations.createCheckoutSession({
        amount: 500, // $5
        isRecurring: false,
        donorEmail: "anon@example.com",
        isAnonymous: true,
        showAmount: false,
      });

      expect(result).toHaveProperty("sessionId");
      expect(result).toHaveProperty("url");
    });

    it("should reject donation below minimum amount", async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.donations.createCheckoutSession({
          amount: 50, // $0.50 - below $1 minimum
          isRecurring: false,
          donorEmail: "test@example.com",
          isAnonymous: false,
          showAmount: true,
        })
      ).rejects.toThrow();
    });

    it("should reject donation without email", async () => {
      const caller = appRouter.createCaller(mockContext);

      await expect(
        caller.donations.createCheckoutSession({
          amount: 1000,
          isRecurring: false,
          donorEmail: "", // Empty email
          isAnonymous: false,
          showAmount: true,
        })
      ).rejects.toThrow();
    });
  });

  describe("getDonorWall", () => {
    it("should return donor wall donations", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.donations.getDonorWall();

      expect(Array.isArray(result)).toBe(true);
      // Each donation should have required fields
      result.forEach((donation) => {
        expect(donation).toHaveProperty("id");
        expect(donation).toHaveProperty("donorName");
        expect(donation).toHaveProperty("createdAt");
        expect(donation).toHaveProperty("isRecurring");
      });
    });
  });

  describe("getStats", () => {
    it("should return donation statistics", async () => {
      const caller = appRouter.createCaller(mockContext);

      const result = await caller.donations.getStats();

      expect(result).toHaveProperty("totalDonations");
      expect(result).toHaveProperty("totalAmount");
      expect(result).toHaveProperty("oneTimeDonations");
      expect(result).toHaveProperty("recurringDonations");
      expect(result).toHaveProperty("averageDonation");

      expect(typeof result.totalDonations).toBe("number");
      expect(typeof result.totalAmount).toBe("number");
      expect(typeof result.oneTimeDonations).toBe("number");
      expect(typeof result.recurringDonations).toBe("number");
      expect(typeof result.averageDonation).toBe("number");
    });
  });
});
