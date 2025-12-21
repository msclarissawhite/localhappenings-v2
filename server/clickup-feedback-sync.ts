import { ENV } from "./_core/env";
import { getDb } from "./db";
import { events, eventFeedback } from "../drizzle/schema";
import { eq, and, sql } from "drizzle-orm";

interface FeedbackData {
  id: number;
  eventId: number;
  attended: number;
  accuracyRating: number | null;
  helpfulDetails: string | null;
  inaccurateDetails: string | null;
  comments: string | null;
  submittedAt: Date;
}

/**
 * Sync feedback to ClickUp task
 * Updates custom fields and adds comment
 */
export async function syncFeedbackToClickUp(feedback: FeedbackData): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      console.error("[ClickUp Sync] Database not available");
      return false;
    }

    // Get event to find ClickUp task ID
    const [event] = await db
      .select({ clickupTaskId: events.clickupTaskId })
      .from(events)
      .where(eq(events.id, feedback.eventId));

    if (!event?.clickupTaskId) {
      console.warn(`[ClickUp Sync] No ClickUp task ID for event ${feedback.eventId}`);
      return false; // Not an error - event might not be in ClickUp
    }

    const clickupTaskId = event.clickupTaskId;

    // Calculate aggregate stats for this event
    const stats = await db
      .select({
        totalFeedback: sql<number>`COUNT(*)`,
        attendedCount: sql<number>`SUM(CASE WHEN attended = 1 THEN 1 ELSE 0 END)`,
        avgAccuracy: sql<number>`AVG(CASE WHEN attended = 1 THEN accuracyRating ELSE NULL END)`,
      })
      .from(eventFeedback)
      .where(eq(eventFeedback.eventId, feedback.eventId));

    const { totalFeedback, attendedCount, avgAccuracy } = stats[0] || {
      totalFeedback: 0,
      attendedCount: 0,
      avgAccuracy: null,
    };

    // Update ClickUp custom fields
    await updateClickUpCustomFields(clickupTaskId, {
      feedbackCount: totalFeedback,
      attendedCount: attendedCount,
      averageAccuracy: avgAccuracy ? parseFloat(avgAccuracy.toFixed(2)) : null,
      lastFeedbackDate: feedback.submittedAt,
    });

    // Add comment with individual feedback details
    await addClickUpComment(clickupTaskId, feedback);

    return true;
  } catch (error) {
    console.error("[ClickUp Sync] Error syncing feedback:", error);
    return false;
  }
}

/**
 * Update ClickUp custom fields with aggregated feedback stats
 */
async function updateClickUpCustomFields(
  taskId: string,
  stats: {
    feedbackCount: number;
    attendedCount: number;
    averageAccuracy: number | null;
    lastFeedbackDate: Date;
  }
): Promise<void> {
  const apiKey = ENV.CLICKUP_API_KEY;
  if (!apiKey) {
    throw new Error("CLICKUP_API_KEY not configured");
  }

  // Note: You'll need to create these custom fields in ClickUp first
  // and get their field IDs. For now, this is a placeholder structure.
  
  const customFields = [
    {
      id: "feedback_count", // Replace with actual field ID from ClickUp
      value: stats.feedbackCount,
    },
    {
      id: "attended_count", // Replace with actual field ID
      value: stats.attendedCount,
    },
    {
      id: "average_accuracy", // Replace with actual field ID
      value: stats.averageAccuracy,
    },
    {
      id: "last_feedback_date", // Replace with actual field ID
      value: stats.lastFeedbackDate.getTime(),
    },
  ];

  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}`, {
    method: "PUT",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      custom_fields: customFields.filter((f) => f.value !== null),
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickUp API error: ${response.status} ${error}`);
  }
}

/**
 * Add feedback as a comment on the ClickUp task
 */
async function addClickUpComment(taskId: string, feedback: FeedbackData): Promise<void> {
  const apiKey = ENV.CLICKUP_API_KEY;
  if (!apiKey) {
    throw new Error("CLICKUP_API_KEY not configured");
  }

  // Parse JSON fields
  const helpfulDetails = feedback.helpfulDetails
    ? JSON.parse(feedback.helpfulDetails)
    : [];
  const inaccurateDetails = feedback.inaccurateDetails
    ? JSON.parse(feedback.inaccurateDetails)
    : [];

  // Format rating as stars
  const stars = feedback.accuracyRating
    ? "⭐".repeat(feedback.accuracyRating)
    : "N/A";

  // Build comment text
  const commentLines = [
    "📊 **Event Feedback Received**",
    "",
    `**Rating:** ${stars} (${feedback.accuracyRating || "N/A"}/5)`,
    `**Attended:** ${feedback.attended === 1 ? "Yes" : "No"}`,
  ];

  if (helpfulDetails.length > 0) {
    commentLines.push("");
    commentLines.push("**Helpful Details:**");
    helpfulDetails.forEach((detail: string) => {
      commentLines.push(`- ${detail}`);
    });
  }

  if (inaccurateDetails.length > 0) {
    commentLines.push("");
    commentLines.push("**Inaccurate/Missing:**");
    inaccurateDetails.forEach((detail: string) => {
      commentLines.push(`- ${detail}`);
    });
  }

  if (feedback.comments) {
    commentLines.push("");
    commentLines.push("**Comments:**");
    commentLines.push(feedback.comments);
  }

  commentLines.push("");
  commentLines.push(
    `*Submitted: ${feedback.submittedAt.toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    })}*`
  );

  const commentText = commentLines.join("\n");

  const response = await fetch(`https://api.clickup.com/api/v2/task/${taskId}/comment`, {
    method: "POST",
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      comment_text: commentText,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ClickUp API error: ${response.status} ${error}`);
  }
}

/**
 * Background job to sync pending feedback to ClickUp
 * Call this periodically (e.g., every 5 minutes via cron)
 */
export async function syncPendingFeedbackToClickUp(): Promise<{
  synced: number;
  failed: number;
}> {
  const db = await getDb();
  if (!db) {
    console.error("[ClickUp Sync] Database not available");
    return { synced: 0, failed: 0 };
  }

  // Get pending feedback
  const pending = await db
    .select()
    .from(eventFeedback)
    .where(eq(eventFeedback.syncedToClickUp, 0))
    .limit(50); // Process in batches

  let synced = 0;
  let failed = 0;

  for (const feedback of pending) {
    const success = await syncFeedbackToClickUp(feedback as FeedbackData);

    if (success) {
      // Mark as synced
      await db
        .update(eventFeedback)
        .set({
          syncedToClickUp: 1,
          clickUpSyncedAt: new Date(),
        })
        .where(eq(eventFeedback.id, feedback.id));
      synced++;
    } else {
      failed++;
    }
  }

  console.log(`[ClickUp Sync] Processed ${pending.length} feedback items: ${synced} synced, ${failed} failed`);
  return { synced, failed };
}
