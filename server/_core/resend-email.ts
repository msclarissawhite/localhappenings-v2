import { Resend } from "resend";

/**
 * Resend email service for sending transactional emails to organizers
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL environment variables
 */

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmailAddress = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";
const fromEmail = `Local Happenings <${fromEmailAddress}>`;

let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn("[Resend] RESEND_API_KEY not configured - emails will not be sent");
}

interface MagicLinkEmailParams {
  to: string;
  name: string | null;
  magicLink: string;
}

interface EventStatusEmailParams {
  to: string;
  name: string | null;
  eventName: string;
  eventId: number;
  status: "published" | "rejected" | "needs-clarification" | "closed" | "pending";
  reviewNotes?: string;
}

interface DonationReceiptEmailParams {
  to: string;
  donorName: string;
  amount: number; // in cents
  isRecurring: boolean;
  transactionId: string;
  donationDate: Date;
  message?: string;
}

/**
 * Send magic link email to organizer
 */
export async function sendMagicLinkEmail(params: MagicLinkEmailParams): Promise<boolean> {
  if (!resend) {
    console.error("[Resend] Cannot send magic link - Resend not configured");
    return false;
  }

  const { to, name, magicLink } = params;

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: "Your Local Happenings Magic Link",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2d5016; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #2d5016; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
              .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
              .link { color: #2d5016; word-break: break-all; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">🗓️ Local Happenings</h1>
            </div>
            <div class="content">
              <h2>Hello${name ? ` ${name}` : ""}!</h2>
              <p>Click the button below to access your Local Happenings organizer dashboard:</p>
              <div style="text-align: center;">
                <a href="${magicLink}" class="button">Access My Dashboard</a>
              </div>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <span class="link">${magicLink}</span>
              </p>
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                This link will expire in 1 hour for security purposes.
              </p>
            </div>
            <div class="footer">
              <p>Local Happenings - Accessible, family-friendly events in your community</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Resend] Magic link sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Resend] Failed to send magic link:", error);
    return false;
  }
}

/**
 * Send event status change notification to organizer
 */
export async function sendEventStatusEmail(params: EventStatusEmailParams): Promise<boolean> {
  if (!resend) {
    console.error("[Resend] Cannot send status email - Resend not configured");
    return false;
  }

  const { to, name, eventName, eventId, status, reviewNotes } = params;

  const statusConfig = {
    published: {
      subject: "🎉 Your Event Has Been Approved!",
      heading: "Great News!",
      message: `Your event "<strong>${eventName}</strong>" has been approved and is now live on Local Happenings.`,
      color: "#2d5016",
    },
    rejected: {
      subject: "Event Submission Update",
      heading: "Event Not Approved",
      message: `Unfortunately, your event "<strong>${eventName}</strong>" could not be approved at this time.`,
      color: "#991b1b",
    },
    "needs-clarification": {
      subject: "More Information Needed for Your Event",
      heading: "Additional Information Required",
      message: `We need a bit more information about your event "<strong>${eventName}</strong>" before we can approve it.`,
      color: "#b45309",
    },
    closed: {
      subject: "Event Closed",
      heading: "Event Status Update",
      message: `Your event "<strong>${eventName}</strong>" has been closed.`,
      color: "#6b7280",
    },
    pending: {
      subject: "Event Status Update",
      heading: "Event Moved to Pending",
      message: `Your event "<strong>${eventName}</strong>" has been moved back to pending status.`,
      color: "#3b82f6",
    },
  };

  const config = statusConfig[status];

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: config.subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: ${config.color}; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #2d5016; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
              .review-notes { background: white; padding: 15px; border-left: 4px solid ${config.color}; margin: 20px 0; border-radius: 4px; }
              .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">${config.heading}</h1>
            </div>
            <div class="content">
              <p>Hello${name ? ` ${name}` : ""}!</p>
              <p>${config.message}</p>
              
              ${reviewNotes ? `
                <div class="review-notes">
                  <strong>Review Notes:</strong><br>
                  ${reviewNotes.replace(/\n/g, "<br>")}
                </div>
              ` : ""}
              
              ${status === "published" ? `
                <p>Your event is now visible to the community and people can start discovering it!</p>
              ` : ""}
              
              ${status === "needs-clarification" || status === "rejected" ? `
                <p>You can edit and resubmit your event from your organizer dashboard. All changes will require re-approval to maintain quality standards.</p>
              ` : ""}
              
              <div style="text-align: center;">
                <a href="${process.env.VITE_APP_URL || "http://localhost:3000"}/organizer/dashboard" class="button">View My Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p>Local Happenings - Accessible, family-friendly events in your community</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Resend] Status email (${status}) sent to ${to} for event #${eventId}`);
    return true;
  } catch (error) {
    console.error("[Resend] Failed to send status email:", error);
    return false;
  }
}

/**
 * Send generic email (for contact forms, notifications, etc.)
 */
export async function sendEmail(params: { to: string; subject: string; html: string }): Promise<boolean> {
  if (!resend) {
    console.error("[Resend] Cannot send email - Resend not configured");
    return false;
  }

  try {
    await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    console.log(`[Resend] Email sent to ${params.to}`);
    return true;
  } catch (error) {
    console.error("[Resend] Failed to send email:", error);
    return false;
  }
}

/**
 * Send donation receipt email to donor
 */
export async function sendDonationReceiptEmail(params: DonationReceiptEmailParams & { stripeCustomerId?: string }): Promise<boolean> {
  if (!resend) {
    console.error("[Resend] Cannot send donation receipt - Resend not configured");
    return false;
  }

  const { to, donorName, amount, isRecurring, transactionId, donationDate, message } = params;
  const amountDollars = (amount / 100).toFixed(2);
  const formattedDate = donationDate.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  try {
    await resend.emails.send({
      from: fromEmail,
      to,
      subject: isRecurring 
        ? "Thank You for Your Recurring Support! 💚" 
        : "Thank You for Your Donation! 💚",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2d5016; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px 20px; border-radius: 0 0 8px 8px; }
              .receipt-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 1px solid #e5e7eb; }
              .receipt-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
              .receipt-row:last-child { border-bottom: none; font-weight: 600; font-size: 18px; }
              .message-box { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; font-style: italic; }
              .footer { text-align: center; margin-top: 30px; font-size: 14px; color: #666; }
              .disclaimer { font-size: 12px; color: #999; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 style="margin: 0;">💚 Thank You!</h1>
            </div>
            <div class="content">
              <p>Dear ${donorName},</p>
              <p>Thank you for your generous ${isRecurring ? 'recurring ' : ''}donation to Local Happenings! Your support helps us keep event listings free and accessible for everyone.</p>
              
              ${message ? `
                <div class="message-box">
                  "${message}"
                </div>
              ` : ''}
              
              <div class="receipt-box">
                <h3 style="margin-top: 0;">Donation Receipt</h3>
                <div class="receipt-row">
                  <span>Date:</span>
                  <span>${formattedDate}</span>
                </div>
                <div class="receipt-row">
                  <span>Amount:</span>
                  <span>$${amountDollars} USD</span>
                </div>
                <div class="receipt-row">
                  <span>Type:</span>
                  <span>${isRecurring ? 'Monthly Recurring' : 'One-Time'}</span>
                </div>
                <div class="receipt-row">
                  <span>Transaction ID:</span>
                  <span style="font-size: 12px; color: #666;">${transactionId}</span>
                </div>
              </div>
              
              <p>Your contribution goes toward:</p>
              <ul>
                <li>Hosting and maintaining the platform</li>
                <li>Ongoing development and new features</li>
                <li>Accessibility improvements and audits</li>
                <li>Community outreach and support</li>
              </ul>
              
              ${isRecurring && params.stripeCustomerId ? `
                <p><strong>Recurring Donation:</strong> Your card will be charged $${amountDollars} monthly.</p>
                <div style="text-align: center; margin: 20px 0;">
                  <a href="${process.env.VITE_APP_URL || "http://localhost:3000"}/api/donations/portal?customerId=${params.stripeCustomerId}" style="display: inline-block; background: #2d5016; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">Manage Subscription</a>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center;">Update payment method or cancel anytime</p>
              ` : isRecurring ? `
                <p><strong>Recurring Donation:</strong> Your card will be charged $${amountDollars} monthly. You can cancel anytime by replying to this email.</p>
              ` : ''}
              
              <div class="disclaimer">
                <p><strong>Tax Information:</strong> Local Happenings is currently an independent project and not a registered 501(c)(3) nonprofit organization. This donation may not be tax-deductible. Please consult your tax advisor for guidance.</p>
                <p>Keep this email for your records. If you have any questions about your donation, please reply to this email.</p>
              </div>
            </div>
            <div class="footer">
              <p>Local Happenings - Accessible, family-friendly events in your community</p>
              <p style="font-size: 12px; color: #999;">Event listings are free and always will be.</p>
            </div>
          </body>
        </html>
      `,
    });

    console.log(`[Resend] Donation receipt sent to ${to} for $${amountDollars}`);
    return true;
  } catch (error) {
    console.error("[Resend] Failed to send donation receipt:", error);
    return false;
  }
}
