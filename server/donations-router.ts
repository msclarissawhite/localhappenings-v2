/**
 * tRPC router for donation functionality
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { stripe } from "./_core/stripe";
import { PRODUCTS } from "../shared/products";
import * as donationsDb from "./donations-db";

export const donationsRouter = router({
  /**
   * Create Stripe checkout session for donation
   * Supports one-time and recurring donations with custom amounts
   */
  createCheckoutSession: publicProcedure
    .input(
      z.object({
        amount: z.number().min(PRODUCTS.DONATION_ONE_TIME.minAmount), // In cents
        isRecurring: z.boolean(),
        donorName: z.string().optional(),
        donorEmail: z.string().email(),
        message: z.string().max(200).optional(),
        isAnonymous: z.boolean().default(false),
        showAmount: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const product = input.isRecurring
        ? PRODUCTS.DONATION_RECURRING
        : PRODUCTS.DONATION_ONE_TIME;

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        mode: input.isRecurring ? "subscription" : "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: product.currency,
              product_data: {
                name: product.name,
                description: product.description,
              },
              unit_amount: input.amount,
              ...(input.isRecurring && {
                recurring: {
                  interval: "month",
                },
              }),
            },
            quantity: 1,
          },
        ],
        success_url: `${ctx.req.headers.origin}/donate/thank-you?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.req.headers.origin}/donate`,
        customer_email: input.donorEmail,
        metadata: {
          donorName: input.donorName || "",
          donorEmail: input.donorEmail,
          message: input.message || "",
          isAnonymous: input.isAnonymous ? "1" : "0",
          showAmount: input.showAmount ? "1" : "0",
          isRecurring: input.isRecurring ? "1" : "0",
        },
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Get donor wall donations (public)
   */
  getDonorWall: publicProcedure.query(async () => {
    return await donationsDb.getDonorWallDonations();
  }),

  /**
   * Get donation statistics (admin only)
   */
  getStats: publicProcedure.query(async () => {
    return await donationsDb.getDonationStats();
  }),

  /**
   * Create Stripe customer portal session for managing recurring donations
   */
  createPortalSession: publicProcedure
    .input(
      z.object({
        customerId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const session = await stripe.billingPortal.sessions.create({
        customer: input.customerId,
        return_url: `${ctx.req.headers.origin}/donate/thank-you`,
      });

      return {
        url: session.url,
      };
    }),

  /**
   * Webhook endpoint for Buy Me a Coffee donations via Zapier
   * Receives donation data and adds to donor wall
   */
  buyMeCoffeeWebhook: publicProcedure
    .input(
      z.object({
        donorName: z.string().optional(),
        donorEmail: z.string().email().optional(),
        amount: z.number().positive(), // In dollars (not cents)
        message: z.string().max(200).optional(),
        isAnonymous: z.boolean().default(false),
        showAmount: z.boolean().default(true),
        transactionId: z.string().optional(), // Buy Me a Coffee transaction ID
      })
    )
    .mutation(async ({ input }) => {
      // Convert amount from dollars to cents for consistency with Stripe donations
      const amountInCents = Math.round(input.amount * 100);

      // Create donation record
      const donation = await donationsDb.createDonation({
        amount: amountInCents,
        donorName: input.isAnonymous ? null : (input.donorName || null),
        donorEmail: input.donorEmail || "anonymous@localhappenings.ca",
        message: input.message || null,
        isAnonymous: input.isAnonymous ? 1 : 0,
        showAmount: input.showAmount ? 1 : 0,
        isRecurring: 0, // Buy Me a Coffee doesn't support recurring through webhook
        stripePaymentIntentId: input.transactionId || null, // Store BMC transaction ID in this field
      });

      return {
        success: true,
        donationId: donation.id,
      };
    }),
});
