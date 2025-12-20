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
 * Update upvote count in ClickUp task "👍 Upvotes" custom field
 */
export async function updateClickUpUpvotes(taskId: string, upvoteCount: number): Promise<void> {
  if (!CLICKUP_API_KEY) {
    throw new Error("ClickUp API key not configured");
  }

  // "👍 Upvotes" number field ID
  const UPVOTES_FIELD_ID = "55890be5-69ec-4208-ad9b-20d9fd9b730b";
  
  const response = await fetch(`${CLICKUP_API_BASE}/task/${taskId}/field/${UPVOTES_FIELD_ID}`, {
    method: "POST",
    headers: {
      "Authorization": CLICKUP_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      value: upvoteCount,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to update ClickUp upvotes: ${response.status} - ${error}`);
  }
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
