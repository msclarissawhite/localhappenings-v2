/**
 * Database operations for donations
 */

import { getDb } from "./db";
import { donations, type Donation, type InsertDonation } from "../drizzle/schema";
import { desc, sql } from "drizzle-orm";

/**
 * Create a new donation record
 */
export async function createDonation(data: InsertDonation): Promise<Donation> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [donation] = await db.insert(donations).values(data).$returningId();
  const [created] = await db.select().from(donations).where(sql`${donations.id} = ${donation.id}`);
  return created;
}

/**
 * Get donation by Stripe payment intent ID
 */
export async function getDonationByPaymentIntent(paymentIntentId: string): Promise<Donation | null> {
  const db = await getDb();
  if (!db) return null;
  const [donation] = await db
    .select()
    .from(donations)
    .where(sql`${donations.stripePaymentIntentId} = ${paymentIntentId}`)
    .limit(1);
  return donation || null;
}

/**
 * Get donation by Stripe subscription ID
 */
export async function getDonationBySubscription(subscriptionId: string): Promise<Donation | null> {
  const db = await getDb();
  if (!db) return null;
  const [donation] = await db
    .select()
    .from(donations)
    .where(sql`${donations.stripeSubscriptionId} = ${subscriptionId}`)
    .limit(1);
  return donation || null;
}

/**
 * Get all donations for donor wall (public display)
 * Excludes email addresses, respects privacy preferences
 */
export async function getDonorWallDonations(): Promise<Array<{
  id: number;
  donorName: string | null; // Will be "Anonymous Supporter" if isAnonymous=1
  message: string | null;
  amount: number | null; // Will be null if showAmount=0
  isRecurring: number;
  createdAt: Date;
}>> {
  const db = await getDb();
  if (!db) return [];
  const results = await db
    .select({
      id: donations.id,
      donorName: donations.donorName,
      message: donations.message,
      amount: donations.amount,
      isAnonymous: donations.isAnonymous,
      showAmount: donations.showAmount,
      isRecurring: donations.isRecurring,
      createdAt: donations.createdAt,
    })
    .from(donations)
    .orderBy(desc(donations.createdAt));

  // Transform results to respect privacy preferences
  return results.map((d: any) => ({
    id: d.id,
    donorName: d.isAnonymous ? "Anonymous Supporter" : d.donorName,
    message: d.message,
    amount: d.showAmount ? d.amount : null,
    isRecurring: d.isRecurring,
    createdAt: d.createdAt,
  }));
}

/**
 * Get donation statistics for admin dashboard
 */
export async function getDonationStats(): Promise<{
  totalDonations: number;
  totalAmount: number;
  oneTimeDonations: number;
  recurringDonations: number;
  averageDonation: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalDonations: 0,
      totalAmount: 0,
      oneTimeDonations: 0,
      recurringDonations: 0,
      averageDonation: 0,
    };
  }
  const [stats] = await db
    .select({
      totalDonations: sql<number>`COUNT(*)`,
      totalAmount: sql<number>`SUM(${donations.amount})`,
      oneTimeDonations: sql<number>`SUM(CASE WHEN ${donations.isRecurring} = 0 THEN 1 ELSE 0 END)`,
      recurringDonations: sql<number>`SUM(CASE WHEN ${donations.isRecurring} = 1 THEN 1 ELSE 0 END)`,
      averageDonation: sql<number>`AVG(${donations.amount})`,
    })
    .from(donations);

  return {
    totalDonations: stats.totalDonations || 0,
    totalAmount: stats.totalAmount || 0,
    oneTimeDonations: stats.oneTimeDonations || 0,
    recurringDonations: stats.recurringDonations || 0,
    averageDonation: stats.averageDonation || 0,
  };
}
