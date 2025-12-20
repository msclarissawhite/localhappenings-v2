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
});
