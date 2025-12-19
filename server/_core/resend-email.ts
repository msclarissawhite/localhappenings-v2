import { Resend } from "resend";

/**
 * Resend email service for sending transactional emails to organizers
 * Requires RESEND_API_KEY and RESEND_FROM_EMAIL environment variables
 */

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";

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
  status: "published" | "rejected" | "needs-clarification";
  reviewNotes?: string;
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
