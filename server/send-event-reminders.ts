/**
 * Scheduled job to send event reminders
 * Run this script hourly via cron or scheduler
 * 
 * Usage: node --loader ts-node/esm send-event-reminders.ts
 */

import { getEvents24hReminders, getEvents48hReminders, mark24hReminderSent, mark48hReminderSent } from "./saved-events-db";
import { getUserById } from "./db";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";

let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
} else {
  console.warn("[Resend] RESEND_API_KEY not configured - emails will not be sent");
}

async function sendEmail(params: { to: string; subject: string; html: string }) {
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
    return true;
  } catch (error) {
    console.error("[Resend] Failed to send email:", error);
    return false;
  }
}

async function sendReminders() {
  console.log("[Event Reminders] Starting reminder job...");

  // Send 24h reminders
  const events24h = await getEvents24hReminders();
  console.log(`[Event Reminders] Found ${events24h.length} events needing 24h reminders`);

  for (const { savedEventId, userId, event } of events24h) {
    try {
      const user = await getUserById(userId);
      if (!user || !user.email) {
        console.warn(`[Event Reminders] User ${userId} not found or has no email`);
        continue;
      }

      const eventDate = new Date(event.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const eventTime = event.timeOfDay
        ? event.timeOfDay.charAt(0).toUpperCase() + event.timeOfDay.slice(1)
        : "All day";

      await sendEmail({
        to: user.email,
        subject: `Reminder: ${event.name} is tomorrow!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Event Reminder</h2>
            <p>Hi ${user.name || "there"},</p>
            <p>This is a friendly reminder that <strong>${event.name}</strong> is happening tomorrow!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">${event.name}</h3>
              <p style="margin: 8px 0;"><strong>When:</strong> ${eventDate}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${eventTime}</p>
              <p style="margin: 8px 0;"><strong>Where:</strong> ${event.venue || event.municipality}, ${event.province}</p>
              ${event.address ? `<p style="margin: 8px 0;"><strong>Address:</strong> ${event.address}</p>` : ""}
            </div>

            <p>${event.description.substring(0, 200)}${event.description.length > 200 ? "..." : ""}</p>

            <p style="margin-top: 30px;">
              <a href="${process.env.VITE_APP_URL}/events/${event.id}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Event Details
              </a>
            </p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              You're receiving this because you saved this event and opted in for reminders.
              You can manage your saved events and reminder preferences in your account.
            </p>
          </div>
        `,
      });

      await mark24hReminderSent(savedEventId);
      console.log(`[Event Reminders] Sent 24h reminder for event ${event.id} to user ${userId}`);
    } catch (error) {
      console.error(`[Event Reminders] Failed to send 24h reminder for event ${event.id}:`, error);
    }
  }

  // Send 48h reminders
  const events48h = await getEvents48hReminders();
  console.log(`[Event Reminders] Found ${events48h.length} events needing 48h reminders`);

  for (const { savedEventId, userId, event } of events48h) {
    try {
      const user = await getUserById(userId);
      if (!user || !user.email) {
        console.warn(`[Event Reminders] User ${userId} not found or has no email`);
        continue;
      }

      const eventDate = new Date(event.startDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const eventTime = event.timeOfDay
        ? event.timeOfDay.charAt(0).toUpperCase() + event.timeOfDay.slice(1)
        : "All day";

      await sendEmail({
        to: user.email,
        subject: `Upcoming: ${event.name} in 2 days`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Event Reminder</h2>
            <p>Hi ${user.name || "there"},</p>
            <p><strong>${event.name}</strong> is coming up in 2 days!</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1f2937;">${event.name}</h3>
              <p style="margin: 8px 0;"><strong>When:</strong> ${eventDate}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${eventTime}</p>
              <p style="margin: 8px 0;"><strong>Where:</strong> ${event.venue || event.municipality}, ${event.province}</p>
              ${event.address ? `<p style="margin: 8px 0;"><strong>Address:</strong> ${event.address}</p>` : ""}
            </div>

            <p>${event.description.substring(0, 200)}${event.description.length > 200 ? "..." : ""}</p>

            <p style="margin-top: 30px;">
              <a href="${process.env.VITE_APP_URL}/events/${event.id}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Event Details
              </a>
            </p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              You're receiving this because you saved this event and opted in for reminders.
              You can manage your saved events and reminder preferences in your account.
            </p>
          </div>
        `,
      });

      await mark48hReminderSent(savedEventId);
      console.log(`[Event Reminders] Sent 48h reminder for event ${event.id} to user ${userId}`);
    } catch (error) {
      console.error(`[Event Reminders] Failed to send 48h reminder for event ${event.id}:`, error);
    }
  }

  console.log("[Event Reminders] Reminder job completed");
}

// Run the job
sendReminders().catch(console.error);
