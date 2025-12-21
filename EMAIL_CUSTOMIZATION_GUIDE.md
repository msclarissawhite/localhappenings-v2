# Email Reminder Customization Guide

**Version:** 1.0  
**Last Updated:** December 19, 2024  
**Author:** Manus AI

---

## Overview

The Local Happenings platform includes an automated email reminder system that notifies users about their saved events. This guide explains how to customize email content, timing, sender information, and scheduling to match your brand and user needs.

---

## Email System Architecture

The reminder system consists of three main components that work together to deliver timely notifications to users who have bookmarked events.

**Database Layer**: The `saved_events` table stores user bookmarks with reminder preferences (`none`, `24h`, `48h`, or `both`). Each saved event tracks whether 24-hour and 48-hour reminders have been sent via `reminder24hSent` and `reminder48hSent` boolean flags.

**Email Service**: The Resend API handles email delivery through the configuration in `server/_core/resend-email.ts`. Your Resend API key and sender email are stored as environment variables (`RESEND_API_KEY` and `RESEND_FROM_EMAIL`).

**Scheduled Job**: The script `server/send-event-reminders.ts` runs periodically (recommended: hourly) to query upcoming events, send reminders to users who opted in, and mark reminders as sent to prevent duplicates.

---

## Customizing Email Content

### Editing Email Templates

All reminder email templates are located in `server/send-event-reminders.ts`. The file contains two main email templates: one for 24-hour reminders and one for 48-hour reminders.

**24-Hour Reminder Template** (starts at line 27): This email uses the subject line "Reminder: {event name} is tomorrow!" and includes event details with a call-to-action button linking to the event page.

**48-Hour Reminder Template** (starts at line 93): This email uses the subject line "Upcoming: {event name} in 2 days" with similar formatting but adjusted messaging for the longer timeframe.

### Customizable Elements

You can modify several elements in each template to match your brand voice and user expectations.

**Subject Lines**: Edit the `subject` field in the `sendEmail()` call. Keep subject lines under 50 characters for optimal mobile display. Consider adding emojis for visual appeal (e.g., "🎉 Reminder: {event name} is tomorrow!").

**Email Body HTML**: The `html` field contains the full email template with inline CSS styling. The template uses a maximum width of 600 pixels for email client compatibility and includes responsive design elements.

**Sender Name**: The "from" field uses `RESEND_FROM_EMAIL` environment variable. To customize the sender name, update this variable to include a name prefix (e.g., "Local Happenings <noreply@yourdomain.com>").

**Brand Colors**: The primary brand color is defined as `#2563eb` (blue) in multiple places throughout the template. Search and replace this hex code to match your brand palette.

**Button Styling**: The call-to-action button uses inline styles for maximum email client compatibility. Modify the `background-color`, `padding`, and `border-radius` properties to match your design system.

**Footer Text**: The footer includes a brief description and unsubscribe information. Update the text at the bottom of each template to reflect your platform name and policies.

### Example: Changing the 24-Hour Reminder Subject

To change the 24-hour reminder subject line, locate this code block around line 42:

```typescript
await sendEmail({
  to: user.email,
  subject: `Reminder: ${event.name} is tomorrow!`,
  html: `...`
});
```

Replace the subject line with your preferred text:

```typescript
subject: `🎉 Don't forget: ${event.name} starts tomorrow!`,
```

---

## Adjusting Reminder Timing

### Changing Reminder Windows

The system currently sends reminders when events are 24-25 hours away or 48-49 hours away. These windows are defined in `server/saved-events-db.ts`.

**24-Hour Window** (line 97-99): The function `getEvents24hReminders()` calculates timestamps for 24 and 25 hours from now, then queries events with start dates in that range.

**48-Hour Window** (line 134-136): The function `getEvents48hReminders()` uses the same logic but with 48 and 49-hour offsets.

### Example: Adding a 1-Week Reminder

To add a new reminder type that sends 7 days before an event, follow these steps:

**Step 1 - Update Database Schema**: Add a new column to the `saved_events` table in `drizzle/schema.ts`:

```typescript
reminder7dSent: integer("reminder_7d_sent").default(0).notNull(),
```

Then run `pnpm db:push` to apply the migration.

**Step 2 - Update Reminder Preferences**: Modify the `reminderPreference` enum in `drizzle/schema.ts` to include new options like `"7d"` or `"all"`.

**Step 3 - Create Query Function**: Add a new function in `server/saved-events-db.ts`:

```typescript
export async function getEvents7dReminders() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const in7d = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in7d1h = new Date(now.getTime() + (7 * 24 + 1) * 60 * 60 * 1000);

  const results = await db
    .select({
      savedEventId: savedEvents.id,
      userId: savedEvents.userId,
      event: events,
    })
    .from(savedEvents)
    .innerJoin(events, eq(savedEvents.eventId, events.id))
    .where(
      and(
        or(
          eq(savedEvents.reminderPreference, "7d"),
          eq(savedEvents.reminderPreference, "all")
        ),
        eq(savedEvents.reminder7dSent, 0),
        gte(events.startDate, in7d),
        lt(events.startDate, in7d1h)
      )
    );

  return results.map(r => ({
    savedEventId: r.savedEventId,
    userId: r.userId,
    ...r.event,
  }));
}

export async function mark7dReminderSent(savedEventId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(savedEvents)
    .set({ reminder7dSent: 1 })
    .where(eq(savedEvents.id, savedEventId));
}
```

**Step 4 - Add to Reminder Job**: In `server/send-event-reminders.ts`, add a new section after the 48-hour reminders:

```typescript
// Send 7-day reminders
const events7d = await getEvents7dReminders();
console.log(`[Event Reminders] Found ${events7d.length} events needing 7-day reminders`);

for (const { savedEventId, userId, event } of events7d) {
  // ... similar email sending logic ...
  await mark7dReminderSent(savedEventId);
}
```

**Step 5 - Update Frontend**: Modify the reminder preference selector in `client/src/pages/EventDetail.tsx` to include the new 7-day option in the radio group.

---

## Configuring Sender Information

### Updating the From Address

The sender email address is controlled by the `RESEND_FROM_EMAIL` environment variable. To change it, you need to update this value in your deployment environment.

**For Development**: Create or edit `.env` file in the project root:

```
RESEND_FROM_EMAIL=Local Happenings <hello@localhappenings.com>
```

**For Production**: Use the Manus dashboard Settings → Secrets panel to update the `RESEND_FROM_EMAIL` value. The format supports both plain email addresses and name-prefixed formats.

### Domain Verification

Resend requires domain verification before you can send emails from your custom domain. Follow these steps to verify your domain:

1. Log in to your Resend dashboard at https://resend.com/domains
2. Click "Add Domain" and enter your domain name
3. Add the provided DNS records (SPF, DKIM, and DMARC) to your domain's DNS settings
4. Wait for verification (usually 5-30 minutes)
5. Update `RESEND_FROM_EMAIL` to use your verified domain

Until verification is complete, you can use Resend's default sending domain for testing purposes.

---

## Scheduling the Reminder Job

### Recommended Schedule

The reminder job should run **every hour** to ensure timely delivery. Running more frequently (e.g., every 15 minutes) provides better precision but increases server load. Running less frequently (e.g., every 6 hours) may cause reminders to arrive outside the intended window.

### Deployment Options

**Option 1 - Cron Job (Linux Server)**: If you're hosting on a Linux server with cron access, add this line to your crontab:

```
0 * * * * cd /path/to/local_happenings && node --loader ts-node/esm server/send-event-reminders.ts >> /var/log/event-reminders.log 2>&1
```

This runs the job at the top of every hour and logs output to a file for debugging.

**Option 2 - GitHub Actions**: Create `.github/workflows/send-reminders.yml` in your repository:

```yaml
name: Send Event Reminders
on:
  schedule:
    - cron: '0 * * * *'  # Every hour
  workflow_dispatch:  # Allow manual trigger

jobs:
  send-reminders:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: npm install
      - run: node --loader ts-node/esm server/send-event-reminders.ts
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}
          RESEND_FROM_EMAIL: ${{ secrets.RESEND_FROM_EMAIL }}
          VITE_APP_URL: ${{ secrets.VITE_APP_URL }}
```

Add the required secrets to your GitHub repository settings under Settings → Secrets and variables → Actions.

**Option 3 - Vercel Cron Jobs**: If deploying to Vercel, create `vercel.json` in your project root:

```json
{
  "crons": [{
    "path": "/api/cron/send-reminders",
    "schedule": "0 * * * *"
  }]
}
```

Then create an API endpoint at `server/api/cron/send-reminders.ts` that calls the reminder logic.

**Option 4 - Manus Scheduler**: Use the built-in Manus scheduler by calling the `schedule` tool with these parameters:

```typescript
{
  type: "cron",
  cron: "0 * * * * *",  // Every hour (6-field format)
  repeat: true,
  name: "Send Event Reminders",
  prompt: "Run the event reminder job by executing: node --loader ts-node/esm server/send-event-reminders.ts"
}
```

### Manual Testing

To test the reminder system without waiting for the scheduled time, run the script manually from your project directory:

```bash
cd /home/ubuntu/local_happenings
node --loader ts-node/esm server/send-event-reminders.ts
```

Check the console output to see how many reminders were found and sent. For testing purposes, you can temporarily modify the time windows in `server/saved-events-db.ts` to include events further in the future.

---

## Monitoring and Troubleshooting

### Checking Reminder Logs

The reminder script outputs detailed logs to the console. Each log line is prefixed with `[Event Reminders]` for easy filtering. Key log messages include:

- `Starting reminder job...` - Job execution began
- `Found X events needing 24h reminders` - Number of 24-hour reminders to send
- `Sent 24h reminder for event X to user Y` - Successful delivery
- `Failed to send 24h reminder for event X: [error]` - Delivery failure
- `Reminder job completed` - Job finished successfully

### Common Issues

**No Reminders Being Sent**: Verify that users have actually saved events with reminder preferences other than "none". Check that the event start dates fall within the 24-25 hour or 48-49 hour windows. Confirm that reminders haven't already been sent by checking the `reminder24hSent` and `reminder48hSent` flags in the database.

**Emails Not Delivered**: Confirm your Resend API key is valid and has sending quota remaining. Verify that `RESEND_FROM_EMAIL` is set correctly and the domain is verified in Resend. Check the Resend dashboard logs at https://resend.com/logs for delivery status and bounce information.

**Duplicate Reminders**: Ensure the reminder job isn't running multiple times simultaneously. The `reminder24hSent` and `reminder48hSent` flags should prevent duplicates, but concurrent job runs can cause race conditions. Use proper job locking mechanisms if running on multiple servers.

**Wrong Timing**: The system uses the server's timezone for all date calculations. Verify that your server timezone is set correctly. Consider storing event start times with timezone information if your events span multiple time zones.

### Database Queries for Debugging

To check which events are eligible for reminders right now, run these SQL queries:

```sql
-- Events needing 24h reminders
SELECT e.id, e.name, e.startDate, se.userId, se.reminder24hSent
FROM saved_events se
JOIN events e ON se.eventId = e.id
WHERE (se.reminderPreference = '24h' OR se.reminderPreference = 'both')
  AND se.reminder24hSent = 0
  AND e.startDate >= NOW() + INTERVAL 24 HOUR
  AND e.startDate < NOW() + INTERVAL 25 HOUR;

-- Events needing 48h reminders
SELECT e.id, e.name, e.startDate, se.userId, se.reminder48hSent
FROM saved_events se
JOIN events e ON se.eventId = e.id
WHERE (se.reminderPreference = '48h' OR se.reminderPreference = 'both')
  AND se.reminder48hSent = 0
  AND e.startDate >= NOW() + INTERVAL 48 HOUR
  AND e.startDate < NOW() + INTERVAL 49 HOUR;
```

---

## Best Practices

### Email Deliverability

To maximize the chances that your reminder emails reach users' inboxes rather than spam folders, follow these recommendations.

**Use a Verified Domain**: Always send from a domain you own and have verified with Resend. Free email domains (gmail.com, yahoo.com) are not suitable for transactional emails and will likely be rejected.

**Implement SPF, DKIM, and DMARC**: These email authentication protocols prove that your emails are legitimate. Resend provides the necessary DNS records during domain verification.

**Keep Content Relevant**: Reminder emails should only be sent to users who explicitly opted in by saving an event and selecting a reminder preference. Never send unsolicited emails.

**Include Unsubscribe Information**: While the current template mentions that users can manage preferences in their account, consider adding a direct unsubscribe link for better user experience and compliance with email regulations.

**Monitor Bounce Rates**: Check your Resend dashboard regularly for bounced emails. High bounce rates can harm your sender reputation. Remove invalid email addresses from your database.

### User Experience

**Respect Preferences**: Always honor the user's reminder preference setting. If they selected "none", don't send any reminders. If they selected "24h", only send the 24-hour reminder.

**Provide Value**: Each reminder email should include all essential event information (date, time, location, description preview) so users can make attendance decisions without clicking through.

**Mobile Optimization**: Most users read emails on mobile devices. Keep subject lines short, use large touch-friendly buttons, and ensure the email template is responsive.

**Clear Call-to-Action**: The primary action should be "View Event Details" with a prominent button. Secondary actions (like "Remove from Saved Events") should be less prominent to avoid accidental clicks.

### Performance Optimization

**Batch Email Sending**: The current implementation sends emails one at a time. For better performance with large user bases, consider using Resend's batch API to send multiple emails in a single request (up to 100 emails per batch).

**Database Indexing**: Ensure the `saved_events` table has indexes on `eventId`, `userId`, `reminderPreference`, `reminder24hSent`, and `reminder48hSent` for fast query performance.

**Rate Limiting**: Resend has rate limits based on your plan. If you have many users, implement rate limiting in your reminder job to avoid hitting API limits. Consider spreading the job across multiple runs if necessary.

---

## Summary

The email reminder system provides a flexible foundation for notifying users about upcoming events. By customizing email templates, adjusting timing windows, configuring sender information, and setting up reliable scheduling, you can create a professional notification experience that keeps users engaged with your platform.

For questions or issues not covered in this guide, consult the Resend documentation at https://resend.com/docs or review the source code in `server/send-event-reminders.ts` and `server/saved-events-db.ts`.
