import { ENV } from "./env";

/**
 * ClickUp integration for syncing events and contact forms
 */

interface ClickUpTaskParams {
  name: string;
  description: string;
  priority?: 1 | 2 | 3 | 4; // 1=urgent, 2=high, 3=normal, 4=low
  dueDate?: number; // Unix timestamp in milliseconds
  status?: string;
}

interface EventSubmissionParams {
  eventId: number;
  eventName: string;
  organizerName: string | null;
  organizerEmail: string;
  organizerPhone: string | null;
  eventDate: Date;
  submissionDate: Date;
  status: "pending" | "published" | "rejected" | "needs-clarification";
  description: string;
  venue: string;
  address: string;
  municipality: string;
}

/**
 * Create a ClickUp task
 */
async function createClickUpTask(
  listId: string,
  params: ClickUpTaskParams
): Promise<{ success: boolean; taskId?: string; error?: string }> {
  if (!ENV.CLICKUP_API_KEY) {
    console.error("[ClickUp] API key not configured");
    return { success: false, error: "ClickUp API key not configured" };
  }

  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${listId}/task`,
      {
        method: "POST",
        headers: {
          Authorization: ENV.CLICKUP_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: params.name,
          description: params.description,
          markdown_description: params.description,
          priority: params.priority,
          due_date: params.dueDate,
          status: params.status,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ClickUp] Failed to create task:", errorText);
      return { success: false, error: errorText };
    }

    const data = await response.json();
    console.log(`[ClickUp] Task created: ${data.id}`);
    return { success: true, taskId: data.id };
  } catch (error) {
    console.error("[ClickUp] Error creating task:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Update a ClickUp task status
 */
async function updateClickUpTaskStatus(
  taskId: string,
  status: string
): Promise<boolean> {
  if (!ENV.CLICKUP_API_KEY) {
    console.error("[ClickUp] API key not configured");
    return false;
  }

  try {
    const response = await fetch(
      `https://api.clickup.com/api/v2/task/${taskId}`,
      {
        method: "PUT",
        headers: {
          Authorization: ENV.CLICKUP_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[ClickUp] Failed to update task status:", errorText);
      return false;
    }

    console.log(`[ClickUp] Task ${taskId} status updated to: ${status}`);
    return true;
  } catch (error) {
    console.error("[ClickUp] Error updating task status:", error);
    return false;
  }
}

/**
 * Sync event submission to ClickUp
 */
export async function syncEventToClickUp(
  params: EventSubmissionParams
): Promise<{ success: boolean; taskId?: string }> {
  if (!ENV.CLICKUP_EVENT_LIST_ID) {
    console.error("[ClickUp] Event list ID not configured");
    return { success: false };
  }

  const {
    eventId,
    eventName,
    organizerName,
    organizerEmail,
    organizerPhone,
    eventDate,
    submissionDate,
    status,
    description,
    venue,
    address,
    municipality,
  } = params;

  // Determine priority based on event date
  const now = new Date();
  const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const priority = eventDate <= oneWeekFromNow ? 1 : 3; // 1=urgent, 3=normal

  // Map status to ClickUp status names
  const statusMap: Record<string, string> = {
    pending: "Pending",
    published: "Approved",
    rejected: "Rejected",
    "needs-clarification": "Needs Clarification",
  };

  const taskDescription = `
**Event Details**
- **Event ID:** #${eventId}
- **Venue:** ${venue}
- **Address:** ${address}
- **Municipality:** ${municipality}
- **Event Date:** ${eventDate.toLocaleDateString()}

**Organizer Information**
- **Name:** ${organizerName || "Not provided"}
- **Email:** ${organizerEmail}
- **Phone:** ${organizerPhone || "Not provided"}

**Description**
${description}

**Submission Details**
- **Submitted:** ${submissionDate.toISOString()}
- **Status:** ${statusMap[status] || status}
  `.trim();

  const result = await createClickUpTask(ENV.CLICKUP_EVENT_LIST_ID, {
    name: eventName,
    description: taskDescription,
    priority,
    dueDate: eventDate.getTime(),
    status: statusMap[status],
  });

  return result;
}

/**
 * Update event status in ClickUp
 */
export async function updateEventStatusInClickUp(
  taskId: string,
  status: "pending" | "published" | "rejected" | "needs-clarification"
): Promise<boolean> {
  const statusMap: Record<string, string> = {
    pending: "Pending",
    published: "Approved",
    rejected: "Rejected",
    "needs-clarification": "Needs Clarification",
  };

  return await updateClickUpTaskStatus(taskId, statusMap[status]);
}
