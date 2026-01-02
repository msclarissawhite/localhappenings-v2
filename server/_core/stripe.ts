/**
 * Stripe client initialization
 * 
 * Configured with STRIPE_SECRET_KEY from environment
 */

import Stripe from "stripe";
import { env } from "./env";

// Make Stripe optional - only initialize if key is provided
export const stripe = env.STRIPE_SECRET_KEY 
  ? new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    })
  : null;

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
