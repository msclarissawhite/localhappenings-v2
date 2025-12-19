# Welcome Email Guide for New Organizers

This guide explains how to use the automated welcome email system that sends a personalized onboarding email to new organizers after their first login.

---

## Overview

The welcome email template (`server/templates/organizer-welcome-email.ts`) provides new organizers with:

- **Welcome message** and account confirmation
- **Quick links** to dashboard, submit event, and quickstart guide
- **Tips for great event listings** with emphasis on accessibility
- **Verification program** explanation
- **Support resources** and contact information

---

## How to Send Welcome Emails

### **Option 1: Automatic (Recommended)**

Automatically send welcome emails when organizers log in for the first time.

**Implementation:**

1. **Update the organizer verification router** (`server/organizer-router.ts`):

```typescript
import { sendOrganizerWelcomeEmail } from "./send-organizer-welcome";

// In the verifyToken procedure, after successful login:
verifyToken: publicProcedure
  .input(z.object({ token: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // ... existing verification logic ...
    
    // Check if this is the organizer's first login
    const isFirstLogin = !organizer.lastLoginAt; // Add this field to schema if needed
    
    if (isFirstLogin) {
      // Send welcome email
      await sendOrganizerWelcomeEmail(organizer.email);
      
      // Update last login timestamp
      await updateOrganizerLastLogin(organizer.id);
    }
    
    // ... rest of the procedure ...
  }),
```

2. **Add `lastLoginAt` field to organizers table** (optional but recommended):

```typescript
// In drizzle/schema.ts
export const organizers = sqliteTable("organizers", {
  // ... existing fields ...
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
});
```

3. **Push the migration**:
```bash
pnpm db:push
```

**Pros:**
- ✅ Fully automated
- ✅ Ensures every new organizer gets the email
- ✅ No manual work required

**Cons:**
- ❌ Requires schema change
- ❌ Slightly more complex logic

---

### **Option 2: Manual Trigger**

Send welcome emails manually from the admin dashboard.

**Implementation:**

1. **Add a "Send Welcome Email" button** in the Admin Dashboard organizers tab:

```typescript
// In AdminDashboard.tsx, add a mutation:
const sendWelcome = trpc.admin.sendWelcomeEmail.useMutation({
  onSuccess: () => {
    toast.success("Welcome email sent!");
  },
});

// Add button next to each organizer:
<Button
  size="sm"
  variant="outline"
  onClick={() => sendWelcome.mutate({ organizerId: organizer.id })}
>
  Send Welcome Email
</Button>
```

2. **Add the procedure** to `server/routers.ts`:

```typescript
import { sendOrganizerWelcomeEmail } from "./send-organizer-welcome";

admin: {
  sendWelcomeEmail: protectedProcedure
    .input(z.object({ organizerId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      const organizer = await getOrganizerById(input.organizerId);
      if (!organizer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Organizer not found" });
      }
      
      await sendOrganizerWelcomeEmail(organizer.email);
      return { success: true };
    }),
}
```

**Pros:**
- ✅ Simple to implement
- ✅ No schema changes needed
- ✅ Full control over when emails are sent

**Cons:**
- ❌ Requires manual action
- ❌ Easy to forget to send

---

### **Option 3: Bulk Send (One-Time)**

Send welcome emails to all existing organizers at once (useful for beta launch).

**Implementation:**

Create a one-time script:

```typescript
// server/send-bulk-welcome-emails.ts
import { getAllOrganizers } from "./organizer-db";
import { sendOrganizerWelcomeEmail } from "./send-organizer-welcome";

async function sendBulkWelcomeEmails() {
  const organizers = await getAllOrganizers();
  
  console.log(`Sending welcome emails to ${organizers.length} organizers...`);
  
  for (const organizer of organizers) {
    try {
      await sendOrganizerWelcomeEmail(organizer.email);
      console.log(`✅ Sent to ${organizer.email}`);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to send to ${organizer.email}:`, error);
    }
  }
  
  console.log("Bulk send complete!");
}

sendBulkWelcomeEmails();
```

Run it once:
```bash
node server/send-bulk-welcome-emails.ts
```

**Pros:**
- ✅ Great for beta launch
- ✅ Reaches all existing organizers at once

**Cons:**
- ❌ One-time only
- ❌ Doesn't handle future organizers

---

## Customizing the Welcome Email

### **Changing Email Content**

Edit `server/templates/organizer-welcome-email.ts`:

```typescript
export function getOrganizerWelcomeEmail(data: OrganizerWelcomeEmailData) {
  // Customize subject line
  const subject = "Welcome to Local Happenings! 🎉";
  
  // Customize HTML content
  const html = `
    <!-- Your custom HTML here -->
  `;
  
  // Customize plain text version
  const text = `
    Your custom plain text here
  `;
  
  return { subject, html, text };
}
```

### **Common Customizations**

**1. Change the greeting:**
```typescript
<p style="font-size: 16px; margin-top: 0;">Hi ${data.organizerName || 'there'},</p>
```

**2. Add your logo:**
```typescript
<div style="text-align: center; margin-bottom: 20px;">
  <img src="https://your-site.com/logo.png" alt="Local Happenings" style="max-width: 200px;">
</div>
```

**3. Highlight a specific feature:**
```typescript
<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 25px 0;">
  <p style="margin: 0; font-size: 15px; color: #065f46;">
    <strong>✨ New Feature:</strong> Try our Saved Locations feature to save time!
  </p>
</div>
```

**4. Add a call-to-action:**
```typescript
<div style="text-align: center; margin: 30px 0;">
  <a href="${data.submitEventUrl}" style="display: inline-block; background: #667eea; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 18px;">
    Submit Your First Event Now
  </a>
</div>
```

---

## Testing the Welcome Email

### **Send a Test Email**

Create a test script:

```typescript
// server/test-welcome-email.ts
import { sendOrganizerWelcomeEmail } from "./send-organizer-welcome";

async function testWelcomeEmail() {
  const testEmail = "your-email@example.com"; // Use your own email
  
  console.log(`Sending test welcome email to ${testEmail}...`);
  const success = await sendOrganizerWelcomeEmail(testEmail);
  
  if (success) {
    console.log("✅ Test email sent! Check your inbox.");
  } else {
    console.log("❌ Failed to send test email.");
  }
}

testWelcomeEmail();
```

Run it:
```bash
node server/test-welcome-email.ts
```

### **Check Email Rendering**

1. **Send test email** to yourself
2. **Open in multiple email clients**:
   - Gmail (web and mobile)
   - Outlook
   - Apple Mail
   - Mobile devices (iOS, Android)
3. **Verify all links work**
4. **Check spam folder** (if it lands there, adjust content or sender reputation)

---

## Monitoring Welcome Emails

### **Check Resend Dashboard**

1. Log in to [Resend](https://resend.com)
2. Go to **Emails** tab
3. Filter by subject: "Welcome to Local Happenings"
4. Check delivery status and open rates

### **Track in Database (Optional)**

Add a `welcomeEmailSent` field to track which organizers received the email:

```typescript
// In drizzle/schema.ts
export const organizers = sqliteTable("organizers", {
  // ... existing fields ...
  welcomeEmailSent: integer("welcome_email_sent", { mode: "boolean" }).default(false),
  welcomeEmailSentAt: integer("welcome_email_sent_at", { mode: "timestamp" }),
});
```

Update the send function:

```typescript
export async function sendOrganizerWelcomeEmail(organizerId: number, email: string): Promise<boolean> {
  // ... send email logic ...
  
  if (success) {
    // Mark as sent in database
    await markWelcomeEmailSent(organizerId);
  }
  
  return success;
}
```

---

## Troubleshooting

### **Problem: Emails not sending**

- **Check environment variables**: Ensure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` are set
- **Check Resend quota**: Free tier has limits (100 emails/day)
- **Check Resend logs**: Look for errors in the Resend dashboard
- **Verify sender domain**: Make sure your from email is verified in Resend

### **Problem: Emails going to spam**

- **Verify your domain** in Resend (SPF, DKIM, DMARC records)
- **Use a professional from address** (e.g., `hello@localhappenings.com` not `noreply@...`)
- **Avoid spam trigger words** in subject line and content
- **Include an unsubscribe link** (optional but recommended)

### **Problem: Links not working**

- **Check `VITE_APP_URL`** environment variable
- **Ensure URLs are absolute** (include `https://`)
- **Test links manually** by clicking them in the email

---

## Best Practices

1. **Send immediately after first login** - Strike while the iron is hot
2. **Keep it concise** - Organizers are busy, get to the point
3. **Include clear CTAs** - Make it obvious what they should do next
4. **Link to the quickstart guide** - Provide comprehensive onboarding resources
5. **Test regularly** - Send yourself test emails when you make changes
6. **Monitor delivery rates** - Check Resend dashboard weekly
7. **Collect feedback** - Ask organizers if the email was helpful

---

## Next Steps

1. **Choose your implementation** (automatic, manual, or bulk)
2. **Customize the email content** to match your brand
3. **Send test emails** to verify everything works
4. **Deploy to production** and monitor delivery
5. **Iterate based on feedback** from organizers

---

**Questions?** Refer to the Email Customization Guide for general email configuration and timing details.
