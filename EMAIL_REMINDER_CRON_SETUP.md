# Email Reminder Cron Job Setup Guide

This guide explains how to set up the automated email reminder system that sends notifications to users 24-48 hours before their saved events.

---

## What the Cron Job Does

The email reminder script (`server/send-event-reminders.ts`) runs on a schedule and:

1. **Queries the database** for saved events happening in the next 24-48 hours
2. **Checks user reminder preferences** (24h, 48h, both, or none)
3. **Sends personalized reminder emails** via Resend
4. **Prevents duplicate sends** by tracking which reminders have been sent

---

## Deployment Options

You have three options for running the cron job:

### **Option 1: GitHub Actions (Recommended)**

GitHub Actions is free, reliable, and requires no server setup.

**Setup Steps:**

1. **Create the workflow file** in your repository:
   ```
   .github/workflows/email-reminders.yml
   ```

2. **Copy the workflow configuration** (see `email-reminders.yml` file in this directory)

3. **Add repository secrets** in GitHub:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add all required environment variables (DATABASE_URL, RESEND_API_KEY, etc.)

4. **Commit and push** the workflow file to your repository

5. **Verify it's running**:
   - Go to Actions tab in your repository
   - You should see the workflow running hourly

**Pros:**
- ✅ Free for public repositories
- ✅ No server maintenance required
- ✅ Built-in logging and error tracking
- ✅ Easy to enable/disable

**Cons:**
- ❌ Requires GitHub repository
- ❌ Slight delay (up to 10 minutes) in scheduled runs

---

### **Option 2: Manus Platform Scheduler**

If Manus provides a built-in scheduler, you can use it directly.

**Setup Steps:**

1. **Check if Manus has a scheduler** in the Management UI → Settings
2. **Create a new scheduled task**:
   - Command: `node server/send-event-reminders.ts`
   - Schedule: Every hour (`0 * * * *`)
   - Working directory: `/home/ubuntu/local_happenings`

3. **Verify environment variables** are available to the scheduled task

**Pros:**
- ✅ Integrated with your hosting
- ✅ No external dependencies
- ✅ Direct access to environment variables

**Cons:**
- ❌ Depends on Manus platform features
- ❌ May have usage limits

---

### **Option 3: External Cron Service**

Use a service like **Cron-job.org**, **EasyCron**, or **cron-job.de**.

**Setup Steps:**

1. **Create an HTTP endpoint** that triggers the reminder script:
   - Add a new tRPC procedure: `system.sendReminders` (admin-only)
   - The procedure calls the reminder logic

2. **Sign up for a cron service** (most have free tiers)

3. **Configure the cron job**:
   - URL: `https://your-site.com/api/trpc/system.sendReminders`
   - Schedule: Every hour
   - Method: POST
   - Headers: Add authentication if needed

**Pros:**
- ✅ Works with any hosting provider
- ✅ Reliable and battle-tested
- ✅ Good for testing before full deployment

**Cons:**
- ❌ Requires creating an HTTP endpoint
- ❌ External dependency
- ❌ May have rate limits on free tiers

---

## Testing the Cron Job

Before deploying, test the script manually:

### **Local Testing**

1. **Run the script directly**:
   ```bash
   cd /home/ubuntu/local_happenings
   node server/send-event-reminders.ts
   ```

2. **Check the output**:
   - You should see console logs indicating how many reminders were sent
   - Check your email inbox for test reminders

3. **Verify database updates**:
   - Check the `saved_events` table to see `reminder24hSent` and `reminder48hSent` flags

### **Creating Test Data**

To test the cron job, create a saved event with a start date 24 hours from now:

1. **Save an event** from the website
2. **Set reminder preference** to "24h" or "both"
3. **Wait for the next cron run** (or run the script manually)
4. **Check your email** for the reminder

---

## Monitoring & Troubleshooting

### **Checking if Reminders are Sending**

1. **Check the logs**:
   - GitHub Actions: Go to Actions tab → Click on the workflow run
   - Manus Scheduler: Check the scheduler logs in Management UI
   - External service: Check the service's execution history

2. **Query the database**:
   ```sql
   SELECT * FROM saved_events 
   WHERE reminder24hSent = 1 OR reminder48hSent = 1 
   ORDER BY updatedAt DESC 
   LIMIT 10;
   ```

3. **Check Resend dashboard**:
   - Log in to Resend
   - View sent emails and delivery status

### **Common Issues**

**Problem: No emails are being sent**

- **Check environment variables**: Ensure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and `VITE_APP_URL` are set
- **Check database connection**: Verify `DATABASE_URL` is correct
- **Check Resend quota**: Free tier has limits (100 emails/day)
- **Check spam folder**: Reminder emails might be filtered

**Problem: Duplicate reminders**

- **Check cron frequency**: Should run hourly, not more frequently
- **Check database flags**: `reminder24hSent` and `reminder48hSent` should prevent duplicates
- **Check timezone**: Ensure server timezone matches your expectations

**Problem: Reminders sent at wrong time**

- **Check server timezone**: The script uses server time, not user time
- **Check event start dates**: Ensure they're stored in the correct timezone
- **Adjust timing logic**: Modify the time window in `send-event-reminders.ts` if needed

---

## Customizing the Schedule

The default schedule is **every hour**. You can adjust this based on your needs:

### **Cron Schedule Examples**

- **Every hour**: `0 * * * *`
- **Every 2 hours**: `0 */2 * * *`
- **Every 6 hours**: `0 */6 * * *`
- **Twice daily (9am, 9pm)**: `0 9,21 * * *`
- **Once daily (9am)**: `0 9 * * *`

**Recommendation**: Hourly is ideal for timely reminders. Less frequent schedules may cause delays.

---

## Pausing or Disabling Reminders

### **GitHub Actions**
- Go to Actions tab → Click on the workflow → Disable workflow

### **Manus Scheduler**
- Go to Management UI → Scheduler → Disable the task

### **External Service**
- Log in to the service → Pause or delete the cron job

---

## Next Steps

1. **Choose your deployment option** (GitHub Actions recommended)
2. **Set up the cron job** following the steps above
3. **Test with a sample event** to verify emails are sending
4. **Monitor for the first few days** to ensure everything works smoothly
5. **Adjust timing or frequency** if needed based on user feedback

---

**Questions?** Refer to the Email Customization Guide for details on modifying email content and timing logic.
