/**
 * Helper function to send welcome email to new organizers
 * Call this after first successful magic link login
 */

import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
import { getOrganizerWelcomeEmail } from "./templates/organizer-welcome-email";

export async function sendOrganizerWelcomeEmail(organizerEmail: string): Promise<boolean> {
  if (!resend) {
    console.error("❌ Resend not configured - cannot send welcome email");
    return false;
  }

  try {
    const baseUrl = process.env.VITE_APP_URL || "http://localhost:3000";
    
    const emailData = {
      organizerEmail,
      dashboardUrl: `${baseUrl}/organizer/dashboard`,
      quickstartGuideUrl: `${baseUrl}/organizer-guide`, // You can create a page that displays the guide
      submitEventUrl: `${baseUrl}/submit`,
      contactUrl: `${baseUrl}/contact`,
    };

    const { subject, html, text } = getOrganizerWelcomeEmail(emailData);

    const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@localhappenings.com";

    await resend.emails.send({
      from: fromEmail,
      to: organizerEmail,
      subject,
      html,
      text,
    });

    console.log(`✅ Welcome email sent to ${organizerEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send welcome email to ${organizerEmail}:`, error);
    return false;
  }
}
