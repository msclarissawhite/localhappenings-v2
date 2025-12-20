/**
 * ClickUp API Integration for Feature Requests
 * 
 * This module handles two-way sync between Local Happenings feature requests
 * and ClickUp tasks.
 */

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const CLICKUP_LIST_ID = process.env.CLICKUP_LIST_ID;
const CLICKUP_API_BASE = "https://api.clickup.com/api/v2";

interface ClickUpTask {
  id: string;
  name: string;
  description: string;
  status: {
    status: string;
  };
  url: string;
  custom_fields?: Array<{
    id: string;
    name: string;
    value: any;
  }>;
}

/**
 * Create a task in ClickUp for a new feature request
 */
export async function createClickUpTask(data: {
  title: string;
  description: string;
  submitterInfo?: string;
}): Promise<{ taskId: string; taskUrl: string }> {
  if (!CLICKUP_API_KEY || !CLICKUP_LIST_ID) {
    throw new Error("ClickUp credentials not configured");
  }

  const response = await fetch(`${CLICKUP_API_BASE}/list/${CLICKUP_LIST_ID}/task`, {
    method: "POST",
    headers: {
      "Authorization": CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: data.title,
      description: data.description + (data.submitterInfo ? `\n\n**Submitted by:** ${data.submitterInfo}` : ""),
      status: "proposed",
      tags: ["feature-request"],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickUp API error: ${response.status} - ${error}`);
  }

  const task: ClickUpTask = await response.json();
  
  return {
    taskId: task.id,
    taskUrl: task.url,
  };
}

/**
 * Update upvote count in ClickUp task
 * Note: Requires a custom field named "Upvotes" to be created in ClickUp
 */
export async function updateClickUpUpvotes(taskId: string, upvoteCount: number): Promise<void> {
  if (!CLICKUP_API_KEY) {
    throw new Error("ClickUp API key not configured");
  }

  // Note: This requires the custom field ID, which varies per workspace
  // For now, we'll add the upvote count to the task description
  // To use custom fields, you'd need to:
  // 1. Create a "Number" custom field named "Upvotes" in ClickUp
  // 2. Get its field ID via GET /list/{list_id}/field
  // 3. Update it via POST /task/{task_id}/field/{field_id}
  
  const response = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "GET",
    headers: {
      "Authorization": CLICKUP_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ClickUp task: ${response.status}`);
  }

  const task: ClickUpTask = await response.json();
  
  // Update description to include upvote count
  const descriptionWithoutUpvotes = task.description.replace(/\n\n\*\*Upvotes:\*\* \d+/, "");
  const newDescription = `${descriptionWithoutUpvotes}\n\n**Upvotes:** ${upvoteCount}`;

  await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "PUT",
    headers: {
      "Authorization": CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description: newDescription,
    }),
  });
}

/**
 * Update task status in ClickUp
 */
export async function updateClickUpStatus(taskId: string, status: string): Promise<void> {
  if (!CLICKUP_API_KEY) {
    throw new Error("ClickUp API key not configured");
  }

  // Map our status to ClickUp status
  const statusMap: Record<string, string> = {
    "pending": "proposed",
    "under_review": "under consideration",
    "planned": "approved for development",
    "in_progress": "in review",
    "completed": "approved for development",
    "declined": "rejected",
  };

  const clickupStatus = statusMap[status] || "proposed";

  await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "PUT",
    headers: {
      "Authorization": CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: clickupStatus,
    }),
  });
}

/**
 * Get task details from ClickUp
 */
export async function getClickUpTask(taskId: string): Promise<ClickUpTask> {
  if (!CLICKUP_API_KEY) {
    throw new Error("ClickUp API key not configured");
  }

  const response = await fetch(`${CLICKUP_API_BASE}/task/${taskId}`, {
    method: "GET",
    headers: {
      "Authorization": CLICKUP_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ClickUp task: ${response.status}`);
  }

  return await response.json();
}

/**
 * Test ClickUp API connection
 */
export async function testClickUpConnection(): Promise<boolean> {
  if (!CLICKUP_API_KEY || !CLICKUP_LIST_ID) {
    return false;
  }

  try {
    const response = await fetch(`${CLICKUP_API_BASE}/list/${CLICKUP_LIST_ID}`, {
      method: "GET",
      headers: {
        "Authorization": CLICKUP_API_KEY,
      },
    });

    return response.ok;
  } catch (error) {
    return false;
  }
}
