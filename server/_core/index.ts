import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import cookieParser from "cookie-parser";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleStripeWebhook } from "../stripe-webhook";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Stripe webhook MUST be registered BEFORE express.json() middleware
  // to preserve raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );
  
  // Stripe customer portal redirect (for managing recurring donations)
  app.get("/api/donations/portal", async (req, res) => {
    const customerId = req.query.customerId as string;
    if (!customerId) {
      return res.status(400).send("Missing customerId parameter");
    }
    
    try {
      const { stripe } = await import("./stripe");
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${req.headers.origin || process.env.VITE_APP_URL}/donate/thank-you`,
      });
      res.redirect(session.url);
    } catch (error) {
      console.error("[Stripe] Failed to create portal session:", error);
      res.status(500).send("Failed to create portal session");
    }
  });
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Configure cookie parser for session handling
  app.use(cookieParser());
  
  // Buy Me a Coffee webhook endpoint (simple REST endpoint for Zapier)
  app.post("/api/webhooks/buymeacoffee", async (req, res) => {
    try {
      const { donorName, donorEmail, amount, message, isAnonymous, showAmount, transactionId } = req.body;
      
      // Validate required fields
      if (!amount || typeof amount !== 'number') {
        return res.status(400).json({ error: "Missing or invalid 'amount' field" });
      }
      
      // Import donations database functions
      const donationsDb = await import("../donations-db");
      
      // Convert amount from dollars to cents
      const amountInCents = Math.round(amount * 100);
      
      // Create donation record
      const donation = await donationsDb.createDonation({
        amount: amountInCents,
        donorName: isAnonymous ? null : (donorName || null),
        donorEmail: donorEmail || "anonymous@localhappenings.ca",
        message: message || null,
        isAnonymous: isAnonymous ? 1 : 0,
        showAmount: showAmount !== false ? 1 : 0, // Default to showing amount
        isRecurring: 0,
        stripePaymentIntentId: transactionId || null,
      });
      
      res.json({ success: true, donationId: donation.id });
    } catch (error) {
      console.error("[Buy Me a Coffee Webhook] Error:", error);
      res.status(500).json({ error: "Failed to process donation" });
    }
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
