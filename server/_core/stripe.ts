/**
 * Stripe client initialization
 * 
 * Configured with STRIPE_SECRET_KEY from environment
 */

import Stripe from "stripe";
import { env } from "./env";

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});

/**
 * Helper to construct webhook event from raw request body
 * Used in webhook endpoint to verify Stripe signature
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
