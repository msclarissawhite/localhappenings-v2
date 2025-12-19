import { notifyOwner } from "./notification";

/**
 * Send email notification to organizer about their event status change
 * Currently uses the owner notification system as a proxy
 * In production, this would send directly to the organizer's email
 */

interface EmailNotificationParams {
  organizerEmail: string;
  organizerName: string | null;
  eventName: string;
  eventId: number;
  status: "published" | "rejected" | "needs-clarification";
  reviewNotes?: string;
}

export async function notifyOrganizerStatusChange(params: EmailNotificationParams) {
  const { organizerEmail, organizerName, eventName, eventId, status, reviewNotes } = params;
  
  const statusMessages = {
    published: {
      subject: "🎉 Your Event Has Been Approved!",
      message: `Great news! Your event "${eventName}" has been approved and is now live on Local Happenings.`,
    },
    rejected: {
      subject: "Event Submission Update",
      message: `Unfortunately, your event "${eventName}" could not be approved at this time.`,
    },
    "needs-clarification": {
      subject: "More Information Needed for Your Event",
      message: `We need a bit more information about your event "${eventName}" before we can approve it.`,
    },
  };

  const { subject, message } = statusMessages[status];
  
  let emailContent = `
Hello ${organizerName || "there"},

${message}

Event: ${eventName}
Status: ${status}

${reviewNotes ? `\nReview Notes:\n${reviewNotes}\n` : ""}

${status === "published" ? `\nYou can view your event at: [Event URL]\n` : ""}
${status === "needs-clarification" || status === "rejected" ? `\nYou can edit and resubmit your event from your organizer dashboard.\n` : ""}

Thank you for using Local Happenings!

---
This email would be sent to: ${organizerEmail}
`;

  // For now, notify the owner so they can manually send the email
  // In production, this would use a real email service
  try {
    await notifyOwner({
      title: `[Organizer Notification] ${subject}`,
      content: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send organizer notification:", error);
    return false;
  }
}

/**
 * Send welcome email when organizer first signs up
 */
export async function sendOrganizerWelcomeEmail(email: string, name: string | null) {
  const emailContent = `
Hello ${name || "there"},

Welcome to Local Happenings! You've successfully created an organizer account.

With your organizer account, you can:
- Submit events for approval
- Track the status of your submissions
- Edit and update your published events
- View all your events in one dashboard

Ready to get started? Submit your first event now!

Thank you for helping build a more accessible community.

---
This email would be sent to: ${email}
`;

  try {
    await notifyOwner({
      title: "[Organizer Welcome] New Organizer Account",
      content: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    return false;
  }
}
