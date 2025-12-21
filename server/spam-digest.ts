import { getDb } from "./db";
import { eventFeedback, events } from "../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmailAddress = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";
const fromEmail = `Local Happenings <${fromEmailAddress}>`;

let resend: Resend | null = null;
if (resendApiKey) {
  resend = new Resend(resendApiKey);
}

/**
 * Send daily spam digest email to admin
 * This function should be called by a scheduled job (cron)
 */
export async function sendSpamDigest() {
  const db = await getDb();
  if (!db) {
    console.error("[spam-digest] Database not available");
    return false;
  }

  // Get spam flagged in last 24 hours
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const spamFeedback = await db
    .select({
      id: eventFeedback.id,
      eventId: eventFeedback.eventId,
      eventName: events.name,
      comments: eventFeedback.comments,
      spamReason: eventFeedback.spamReason,
      submittedAt: eventFeedback.submittedAt,
    })
    .from(eventFeedback)
    .leftJoin(events, eq(eventFeedback.eventId, events.id))
    .where(
      and(
        eq(eventFeedback.isSpam, 1),
        gte(eventFeedback.submittedAt, yesterday)
      )
    )
    .orderBy(eventFeedback.submittedAt);

  // If no spam, don't send email
  if (spamFeedback.length === 0) {
    console.log("[spam-digest] No spam flagged in last 24 hours");
    return true;
  }

  // Build email HTML
  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background-color: #f9fafb; padding: 20px; }
    .spam-item { background-color: white; border-left: 4px solid #dc2626; padding: 15px; margin-bottom: 15px; border-radius: 4px; }
    .spam-reason { display: inline-block; background-color: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-bottom: 8px; }
    .event-name { font-weight: bold; color: #1f2937; margin-bottom: 4px; }
    .comment { color: #6b7280; font-style: italic; margin-top: 8px; }
    .timestamp { color: #9ca3af; font-size: 12px; }
    .footer { background-color: #1f2937; color: #9ca3af; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; }
    .button { display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">⚠️ Daily Spam Digest</h1>
      <p style="margin: 5px 0 0 0;">Local Happenings Feedback Moderation</p>
    </div>
    
    <div class="content">
      <p><strong>${spamFeedback.length} suspicious feedback submission${spamFeedback.length === 1 ? '' : 's'}</strong> flagged in the last 24 hours:</p>
      
      ${spamFeedback.map(item => `
        <div class="spam-item">
          <span class="spam-reason">${item.spamReason?.replace(/_/g, ' ').toUpperCase() || 'UNKNOWN'}</span>
          <div class="event-name">Event: ${item.eventName || `#${item.eventId}`}</div>
          <div class="timestamp">Submitted: ${new Date(item.submittedAt).toLocaleString()}</div>
          ${item.comments ? `<div class="comment">"${item.comments}"</div>` : ''}
        </div>
      `).join('')}
      
      <p style="margin-top: 20px;">Review and moderate these submissions in your admin dashboard:</p>
      <a href="${process.env.VITE_APP_URL}/admin?tab=feedback&filter=spam" class="button">Review Spam Submissions</a>
    </div>
    
    <div class="footer">
      <p style="margin: 0;">This is an automated notification from Local Happenings.</p>
      <p style="margin: 5px 0 0 0;">To adjust notification settings, contact your system administrator.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Send email to admin
  const adminEmail = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";
  
  if (!resend) {
    console.error("[spam-digest] Resend not configured");
    return false;
  }
  
  try {
    await resend.emails.send({
      from: fromEmail,
      to: adminEmail,
      subject: `⚠️ ${spamFeedback.length} Spam Submission${spamFeedback.length === 1 ? '' : 's'} Flagged - Local Happenings`,
      html: emailHtml,
    });

    console.log(`[spam-digest] Sent spam digest email with ${spamFeedback.length} items`);
    return true;
  } catch (error) {
    console.error("[spam-digest] Failed to send email:", error);
    return false;
  }
}

/**
 * Manual trigger endpoint for testing
 * Can be called via tRPC procedure
 */
export async function triggerSpamDigest() {
  console.log("[spam-digest] Manually triggered spam digest");
  return await sendSpamDigest();
}
