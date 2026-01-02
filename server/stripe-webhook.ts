/**
 * Stripe webhook handler for payment events
 * 
 * This file handles webhook events from Stripe for:
 * - Donation payments (one-time and recurring)
 * - Featured event payments (to be implemented in Checkpoint 3)
 */

import type { Request, Response } from "express";
import { stripe, constructWebhookEvent } from "./_core/stripe";
import { env } from "./_core/env";
import * as donationsDb from "./donations-db";
import { sendDonationReceiptEmail } from "./_core/resend-email";

/**
 * Handle Stripe webhook events
 * Must be registered with express.raw() middleware
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe is not configured");
    return res.status(503).send("Stripe not configured");
  }
  
  const signature = req.headers["stripe-signature"];

  if (!signature || typeof signature !== "string") {
    console.error("[Stripe Webhook] Missing or invalid stripe-signature header");
    return res.status(400).send("Missing signature");
  }

  if (!env.STRIPE_WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).send("Webhook secret not configured");
  }

  let event;
  try {
    // Verify webhook signature
    event = constructWebhookEvent(
      req.body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("[Stripe Webhook] Signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle test events
  if (event.id.startsWith("evt_test_")) {
    console.log("[Stripe Webhook] Test event detected, returning verification response");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;

      case "invoice.paid":
        // Handle recurring donation renewals
        await handleInvoicePaid(event.data.object);
        break;

      case "customer.subscription.deleted":
        // Handle subscription cancellations (optional: log or notify)
        console.log(`[Stripe Webhook] Subscription deleted: ${event.data.object.id}`);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err: any) {
    console.error(`[Stripe Webhook] Error processing event ${event.type}:`, err);
    res.status(500).send(`Webhook processing error: ${err.message}`);
  }
}

/**
 * Handle checkout.session.completed event
 * Creates donation record in database
 */
async function handleCheckoutSessionCompleted(session: any) {
  const metadata = session.metadata;

  // Determine if this is a donation or featured event payment
  // (For now, only donations; featured events will be added in Checkpoint 3)
  if (metadata.donorEmail) {
    // This is a donation
    const isRecurring = metadata.isRecurring === "1";

    await donationsDb.createDonation({
      donorName: metadata.isAnonymous === "1" ? null : (metadata.donorName || null),
      donorEmail: metadata.donorEmail,
      message: metadata.message || null,
      amount: session.amount_total, // In cents
      isRecurring: isRecurring ? 1 : 0,
      stripePaymentIntentId: isRecurring ? null : session.payment_intent,
      stripeSubscriptionId: isRecurring ? session.subscription : null,
      isAnonymous: metadata.isAnonymous === "1" ? 1 : 0,
      showAmount: metadata.showAmount === "1" ? 1 : 0,
    });

    console.log(`[Stripe Webhook] Donation recorded: ${session.amount_total} cents from ${metadata.donorEmail}`);

    // Send donation receipt email
    try {
      await sendDonationReceiptEmail({
        to: metadata.donorEmail,
        donorName: metadata.donorName || "Anonymous Supporter",
        amount: session.amount_total,
        isRecurring: isRecurring,
        transactionId: isRecurring ? session.subscription : session.payment_intent,
        donationDate: new Date(),
        message: metadata.message || undefined,
        stripeCustomerId: session.customer || undefined, // Pass customer ID for portal link
      });
      console.log(`[Stripe Webhook] Donation receipt email sent to ${metadata.donorEmail}`);
    } catch (emailError: any) {
      console.error(`[Stripe Webhook] Failed to send donation receipt email:`, emailError.message);
      // Don't fail the webhook if email fails - donation is already recorded
    }
  }
}

/**
 * Handle invoice.paid event
 * Records recurring donation renewals
 */
async function handleInvoicePaid(invoice: any) {
  // For recurring donations, we create a new donation record for each renewal
  // This allows us to track donation history over time
  
  if (!invoice.subscription) {
    return; // Not a subscription payment
  }

  // Check if this is a donation subscription
  const existingDonation = await donationsDb.getDonationBySubscription(invoice.subscription);
  
  if (existingDonation) {
    // Create a new donation record for this renewal
    await donationsDb.createDonation({
      donorName: existingDonation.donorName,
      donorEmail: existingDonation.donorEmail,
      message: null, // No message for renewals
      amount: invoice.amount_paid,
      isRecurring: 1,
      stripePaymentIntentId: null,
      stripeSubscriptionId: invoice.subscription,
      isAnonymous: existingDonation.isAnonymous,
      showAmount: existingDonation.showAmount,
    });

    console.log(`[Stripe Webhook] Recurring donation renewal recorded: ${invoice.amount_paid} cents`);

    // Send renewal receipt email
    try {
      await sendDonationReceiptEmail({
        to: existingDonation.donorEmail,
        donorName: existingDonation.donorName || "Anonymous Supporter",
        amount: invoice.amount_paid,
        isRecurring: true,
        transactionId: invoice.subscription,
        donationDate: new Date(),
      });
      console.log(`[Stripe Webhook] Recurring donation receipt email sent to ${existingDonation.donorEmail}`);
    } catch (emailError: any) {
      console.error(`[Stripe Webhook] Failed to send renewal receipt email:`, emailError.message);
      // Don't fail the webhook if email fails - donation is already recorded
    }
  }
}
