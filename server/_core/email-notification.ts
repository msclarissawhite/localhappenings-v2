import { notifyOwner } from "./notification";

/**
 * Send email notification to event submitter about status change
 * Since we don't have direct email sending capability, we'll notify the owner
 * who can then manually reach out to the submitter using the contact info
 */
export async function notifySubmitterStatusChange(
  eventName: string,
  submitterEmail: string | null,
  submitterPhone: string | null,
  status: "published" | "rejected" | "needs-clarification" | "closed" | "pending",
  reviewNotes?: string
) {
  const statusMessages = {
    published: "✅ Event Approved",
    rejected: "❌ Event Rejected",
    "needs-clarification": "⚠️ Event Needs Clarification",
    closed: "🔒 Event Closed",
    pending: "⏳ Event Moved to Pending",
  };

  const statusTitle = statusMessages[status];
  
  let content = `Event: "${eventName}"\nStatus: ${statusTitle}\n\n`;
  
  if (submitterEmail) {
    content += `Submitter Email: ${submitterEmail}\n`;
  }
  if (submitterPhone) {
    content += `Submitter Phone: ${submitterPhone}\n`;
  }
  
  if (reviewNotes) {
    content += `\nReview Notes: ${reviewNotes}\n`;
  }
  
  content += `\nPlease reach out to the submitter to inform them of this status change.`;

  try {
    await notifyOwner({
      title: `${statusTitle}: ${eventName}`,
      content,
    });
    return true;
  } catch (error) {
    console.error("Failed to send status notification:", error);
    return false;
  }
}
