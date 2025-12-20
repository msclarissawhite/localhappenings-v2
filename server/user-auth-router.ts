import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
// Updated to use production domain
const APP_URL = process.env.VITE_APP_URL || "http://localhost:3000";

export const userAuthRouter = router({
  /**
   * Request a magic link for user login
   */
  requestMagicLink: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
      const { email } = input;

      // Find or create user
      let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

      if (!user) {
        // Create new user with magic link login method
        const [result] = await db.insert(users).values({
          email,
          loginMethod: "magic_link",
          role: "user",
          openId: `magic_${Date.now()}_${Math.random().toString(36).substring(7)}`, // Generate unique openId for magic link users
        });
        
        [user] = await db.select().from(users).where(eq(users.id, Number(result.insertId))).limit(1);
      }

      // Generate magic link token (expires in 1 hour)
      const token = jwt.sign({ userId: user!.id, email }, JWT_SECRET, {
        expiresIn: "1h",
      });

      const magicLink = `${APP_URL}/user/verify?token=${token}`;

      // Send magic link email
      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: email,
          subject: "Sign in to Local Happenings",
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Sign in to Local Happenings</h2>
            <p>Click the link below to sign in to your account:</p>
            <p style="margin: 24px 0;">
              <a href="${magicLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Sign In
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this email, you can safely ignore it.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 32px;">
              Or copy and paste this link into your browser:<br/>
              <span style="word-break: break-all;">${magicLink}</span>
            </p>
          </div>
        `,
        });
        
        console.log("✅ User magic link email sent successfully:", { email, emailId: result.data?.id });
      } catch (emailError) {
        console.error("❌ Failed to send user magic link email:", emailError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to send magic link email. Please try again later.'
        });
      }

      return {
        success: true,
        message: "Magic link sent! Check your email to sign in.",
        // In development, return the link for testing
        ...(process.env.NODE_ENV === "development" && { magicLink }),
      };
    }),

  /**
   * Verify magic link token and log in user
   */
  verifyMagicLink: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { token } = input;

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };

        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        // Update last signed in
        await db
          .update(users)
          .set({ lastSignedIn: new Date() })
          .where(eq(users.id, user.id));

        // Check if this email belongs to an organizer
        const isOrganizer = user.loginMethod === "email"; // Organizers use email login method (Manus OAuth)
        
        // Create session token
        const sessionToken = jwt.sign(
          { userId: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: "30d" }
        );

        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token: sessionToken,
          isOrganizer, // Flag to redirect to organizer dashboard if true
        };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired magic link",
        });
      }
    }),

  /**
   * Get current user from session token
   */
  me: publicProcedure.query(async ({ ctx }) => {
    // Check for session token in cookie or header
    const token = ctx.req.cookies?.user_session || ctx.req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return null;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };

      const db = await getDb();
      if (!db) return null;
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.userId))
        .limit(1);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pendingEmail: user.pendingEmail,
      };
    } catch (error) {
      return null;
    }
  }),

  /**
   * Logout user
   */
  logout: publicProcedure.mutation(async ({ ctx }) => {
    // Clear session cookie
    ctx.res.clearCookie("user_session");
    return { success: true };
  }),

  /**
   * Update user profile (name only - email requires verification)
   */
  updateProfile: publicProcedure
    .input(
      z.object({
        name: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check for session token
      const token = ctx.req.cookies?.user_session || ctx.req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to update your profile",
        });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };

        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        // Update user name
        if (input.name !== undefined) {
          await db
            .update(users)
            .set({ name: input.name })
            .where(eq(users.id, decoded.userId));
        }

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid session",
        });
      }
    }),

  /**
   * Request email change - sends verification link to new email
   */
  requestEmailChange: publicProcedure
    .input(
      z.object({
        newEmail: z.string().email(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check for session token
      const token = ctx.req.cookies?.user_session || ctx.req.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be signed in to change your email",
        });
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };

        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        // Check if new email is already in use
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, input.newEmail))
          .limit(1);

        if (existingUser && existingUser.id !== decoded.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "This email is already in use by another account",
          });
        }

        // Store pending email
        await db
          .update(users)
          .set({ pendingEmail: input.newEmail })
          .where(eq(users.id, decoded.userId));

        // Generate verification token
        const verificationToken = jwt.sign(
          { userId: decoded.userId, newEmail: input.newEmail, type: "email_change" },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        const verificationLink = `${APP_URL}/user/verify-email?token=${verificationToken}`;

        // Send verification email to NEW email address
        try {
          const result = await resend.emails.send({
            from: fromEmail,
            to: input.newEmail,
            subject: "Verify your new email address",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">Verify Your New Email Address</h2>
              <p>You requested to change your email address on Local Happenings.</p>
              <p>Click the link below to confirm this change:</p>
              <p style="margin: 24px 0;">
                <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Verify New Email
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this change, you can safely ignore this email.
              </p>
              <p style="color: #666; font-size: 14px; margin-top: 32px;">
                Or copy and paste this link into your browser:<br/>
                <span style="word-break: break-all;">${verificationLink}</span>
              </p>
            </div>
          `,
          });

          console.log("✅ Email verification link sent:", { newEmail: input.newEmail, emailId: result.data?.id });
        } catch (emailError) {
          console.error("❌ Failed to send email verification:", emailError);
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to send verification email. Please try again later.'
          });
        }

        return {
          success: true,
          message: "Verification email sent! Check your new email address to confirm the change.",
          // In development, return the link for testing
          ...(process.env.NODE_ENV === "development" && { verificationLink }),
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to process email change request",
        });
      }
    }),

  /**
   * Verify email change token and apply the change
   */
  verifyEmailChange: publicProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Verify JWT token
        const decoded = jwt.verify(input.token, JWT_SECRET) as {
          userId: number;
          newEmail: string;
          type: string;
        };

        if (decoded.type !== "email_change") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid verification token",
          });
        }

        const db = await getDb();
        if (!db) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Database unavailable' });

        // Get user and verify pending email matches
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, decoded.userId))
          .limit(1);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        if (user.pendingEmail !== decoded.newEmail) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Email verification mismatch",
          });
        }

        // Apply email change
        await db
          .update(users)
          .set({
            email: decoded.newEmail,
            pendingEmail: null,
          })
          .where(eq(users.id, decoded.userId));

        return {
          success: true,
          message: "Email address updated successfully!",
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or expired verification link",
        });
      }
    }),
});
