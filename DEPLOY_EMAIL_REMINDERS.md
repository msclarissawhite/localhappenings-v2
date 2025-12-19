# Email Reminder Deployment Guide

**Version 1.0** | **Last Updated:** December 19, 2024

This guide explains how to deploy the automated email reminder system for Local Happenings using GitHub Actions.

---

## Overview

The email reminder system automatically sends notifications to users who have bookmarked events and opted in for reminders. The system runs hourly and sends:

- **24-hour reminders** - sent the day before an event
- **48-hour reminders** - sent two days before an event

Users control their reminder preferences when bookmarking events (24h, 48h, both, or none).

---

## Prerequisites

Before deploying, ensure you have:

1. ✅ **GitHub repository** for your Local Happenings project
2. ✅ **Resend API key** (already configured in development)
3. ✅ **Production database URL** (MySQL/TiDB connection string)
4. ✅ **Deployed website URL** (e.g., https://localhappenings.manus.space)

---

## Deployment Steps

### Step 1: Push Code to GitHub

The GitHub Actions workflow is already configured at `.github/workflows/email-reminders.yml`. Ensure your latest code is pushed to your repository:

```bash
git add .
git commit -m "Add email reminder cron job"
git push origin main
```

### Step 2: Configure GitHub Secrets

Navigate to your GitHub repository settings and add the following secrets:

**Settings → Secrets and variables → Actions → New repository secret**

Add these four secrets:

| Secret Name | Description | Example Value |
|------------|-------------|---------------|
| `DATABASE_URL` | Production database connection string | `mysql://user:pass@host:3306/dbname` |
| `RESEND_API_KEY` | Your Resend API key | `re_xxxxxxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Sender email address | `org@localhappenings.clarissawhite.com` |
| `VITE_APP_URL` | Your deployed website URL | `https://localhappenings.manus.space` |

**Important Notes:**
- Use your **production** database URL, not the development one
- The `RESEND_FROM_EMAIL` must be a verified domain in your Resend account
- The `VITE_APP_URL` should match your deployed website (no trailing slash)

### Step 3: Enable GitHub Actions

1. Go to your repository's **Actions** tab
2. If prompted, click **"I understand my workflows, go ahead and enable them"**
3. The workflow will now run automatically every hour

### Step 4: Test the Workflow

You can manually trigger the workflow to test it:

1. Go to **Actions** tab in your GitHub repository
2. Click on **"Send Event Email Reminders"** workflow
3. Click **"Run workflow"** dropdown
4. Select the branch (usually `main`)
5. Click **"Run workflow"** button

The workflow will execute immediately, and you can view the logs to verify it's working correctly.

---

## Workflow Schedule

The email reminder job runs **every hour at minute 0** (e.g., 1:00 PM, 2:00 PM, 3:00 PM).

This is configured in the workflow file:

```yaml
on:
  schedule:
    - cron: '0 * * * *'  # Every hour at minute 0
```

**Why hourly?**
- Ensures reminders are sent promptly
- Handles timezone differences
- Catches events added throughout the day

---

## How It Works

### Reminder Logic

The system checks for events that need reminders based on:

1. **Event start date** - events happening in 24h or 48h
2. **User preferences** - only sends to users who opted in
3. **Reminder status** - tracks which reminders have been sent to avoid duplicates

### Email Content

Each reminder email includes:

- Event name and description
- Date, time, and location
- Direct link to event details page
- Option to manage reminder preferences

### Tracking

The system marks reminders as sent in the database to prevent duplicate emails:

- `reminder24hSent` - set to `true` after 24h reminder is sent
- `reminder48hSent` - set to `true` after 48h reminder is sent

---

## Monitoring

### View Workflow Runs

1. Go to **Actions** tab in your repository
2. Click on **"Send Event Email Reminders"** workflow
3. View recent runs and their status (✅ success or ❌ failure)

### Check Logs

Click on any workflow run to see detailed logs:

- Number of reminders found
- Emails sent successfully
- Any errors encountered

### Email Delivery

Monitor email delivery in your Resend dashboard:

1. Log in to [Resend](https://resend.com)
2. Navigate to **Emails** section
3. View delivery status, opens, and clicks

---

## Troubleshooting

### Workflow Not Running

**Problem:** The workflow doesn't appear to run automatically.

**Solutions:**
1. Verify GitHub Actions are enabled in repository settings
2. Check that the workflow file is in `.github/workflows/` directory
3. Ensure the repository has at least one commit after adding the workflow

### Emails Not Sending

**Problem:** Workflow runs successfully but no emails are received.

**Solutions:**
1. Verify `RESEND_API_KEY` secret is correct
2. Check that `RESEND_FROM_EMAIL` is a verified domain in Resend
3. Review Resend dashboard for delivery errors
4. Check spam/junk folders

### Database Connection Errors

**Problem:** Workflow fails with database connection errors.

**Solutions:**
1. Verify `DATABASE_URL` secret is correct
2. Ensure database allows connections from GitHub Actions IPs
3. Check database credentials and permissions

### Wrong Reminder Timing

**Problem:** Reminders are sent at incorrect times.

**Solutions:**
1. Verify event `startDate` is stored correctly in database (Unix timestamp)
2. Check server timezone settings
3. Review reminder calculation logic in `saved-events-db.ts`

---

## Customization

### Change Schedule

To modify when reminders are sent, edit the cron expression in `.github/workflows/email-reminders.yml`:

```yaml
# Every 2 hours
- cron: '0 */2 * * *'

# Every 30 minutes
- cron: '*/30 * * * *'

# Daily at 9 AM UTC
- cron: '0 9 * * *'
```

Use [crontab.guru](https://crontab.guru/) to help create cron expressions.

### Customize Email Templates

Email templates are in `server/send-event-reminders.ts`. You can modify:

- Subject lines
- HTML styling
- Content and messaging
- Links and call-to-action buttons

See `EMAIL_CUSTOMIZATION_GUIDE.md` for detailed instructions.

---

## Cost Considerations

### Resend Pricing

Resend offers:
- **Free tier:** 3,000 emails/month
- **Pro tier:** $20/month for 50,000 emails

**Estimate your usage:**
- If 100 users save events with reminders enabled
- And each user saves 5 events per month
- With both 24h and 48h reminders
- Total: 100 × 5 × 2 = **1,000 emails/month** (well within free tier)

### GitHub Actions

GitHub Actions is free for public repositories. For private repositories:
- **Free tier:** 2,000 minutes/month
- This workflow uses ~2 minutes per run
- Running hourly = 24 × 30 = 720 runs/month
- Total: ~1,440 minutes/month (within free tier for most users)

---

## Security Best Practices

1. **Never commit secrets** - always use GitHub Secrets for sensitive data
2. **Use environment-specific values** - separate development and production secrets
3. **Rotate API keys regularly** - update Resend API key every 6-12 months
4. **Monitor access logs** - review who has access to repository secrets
5. **Enable 2FA** - protect your GitHub account with two-factor authentication

---

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Actions documentation](https://docs.github.com/en/actions)
2. Review [Resend documentation](https://resend.com/docs)
3. Contact the Local Happenings team via the contact form

---

## Summary Checklist

Before going live, ensure:

- [ ] Code pushed to GitHub repository
- [ ] All four GitHub Secrets configured correctly
- [ ] GitHub Actions enabled in repository settings
- [ ] Manual workflow test completed successfully
- [ ] Test email received in inbox
- [ ] Resend dashboard shows successful delivery
- [ ] Workflow scheduled to run hourly
- [ ] Monitoring plan in place

Once all items are checked, your email reminder system is fully deployed! 🎉
