/**
 * Stripe product and price definitions for Local Happenings monetization
 * 
 * This file centralizes product configuration for:
 * - Featured Event Placement ($10/week, 1-8 weeks)
 * - Voluntary Donations (one-time and recurring)
 */

export const PRODUCTS = {
  /**
   * Featured Event Placement
   * $10 per week, organizers can select 1-8 weeks
   */
  FEATURED_EVENT: {
    name: "Featured Event Placement",
    description: "Promote your event at the top of Browse Events and Archive pages",
    pricePerWeek: 1000, // $10.00 in cents
    minWeeks: 1,
    maxWeeks: 8,
    currency: "cad",
  },

  /**
   * Voluntary Donations - One-time
   * Preset amounts: $5, $10, $25 + custom
   */
  DONATION_ONE_TIME: {
    name: "Support Local Happenings",
    description: "Help us maintain and improve the platform for families across Canada",
    presetAmounts: [500, 1000, 2500], // $5, $10, $25 in cents
    currency: "cad",
    minAmount: 100, // $1.00 minimum (Stripe requirement: $0.50 USD, ~$0.70 CAD, we use $1 for simplicity)
  },

  /**
   * Voluntary Donations - Monthly Recurring
   * Same preset amounts as one-time
   */
  DONATION_RECURRING: {
    name: "Monthly Support for Local Happenings",
    description: "Become a monthly supporter and help us grow accessibility-focused event discovery",
    presetAmounts: [500, 1000, 2500], // $5, $10, $25 in cents
    currency: "cad",
    minAmount: 100, // $1.00 minimum
  },
} as const;

/**
 * Helper function to calculate featured event total cost
 */
export function calculateFeaturedEventCost(weeks: number): number {
  if (weeks < PRODUCTS.FEATURED_EVENT.minWeeks || weeks > PRODUCTS.FEATURED_EVENT.maxWeeks) {
    throw new Error(`Weeks must be between ${PRODUCTS.FEATURED_EVENT.minWeeks} and ${PRODUCTS.FEATURED_EVENT.maxWeeks}`);
  }
  return PRODUCTS.FEATURED_EVENT.pricePerWeek * weeks;
}

/**
 * Helper function to format price in CAD
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Helper function to calculate end date for featured event
 */
export function calculateEndDate(startDate: Date, weeks: number): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (weeks * 7));
  return endDate;
}
