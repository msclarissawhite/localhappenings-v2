# Event Claim Flow - Complete Workflow Guide

## Overview

The claim flow allows you to assign pre-seeded events to organizers who can then claim ownership through a magic link. This is useful for initial outreach when you want to seed the platform with real events before organizers have registered.

---

## The Complete Flow

### **Admin Side (Your Manual Steps)**

1. **Seed or create events** without an organizer
   - Events must have `organizerId = NULL` and `status = 'published'`
   - You can create these through Submit Event form or via database

2. **Generate a claim token** (currently manual via SQL)
   ```sql
   -- Generate a random token
   -- Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   -- Insert claim token
   INSERT INTO event_claim_tokens (token, organizerEmail, eventIds, claimed, expiresAt) 
   VALUES ('YOUR_TOKEN_HERE', 'organizer@email.com', '[EVENT_ID_1,EVENT_ID_2]', 0, DATE_ADD(NOW(), INTERVAL 30 DAY));
   ```

3. **Build the claim URL**
   ```
   https://your-domain.com/claim/YOUR_TOKEN_HERE
   ```

4. **Send outreach email** with the claim link

---

### **Organizer Side (Automatic)**

1. Organizer clicks the claim link you sent
2. Claim page shows:
   - List of events being assigned
   - Pre-filled email field (the one you specified)
   - "Claim X Events" button
3. Organizer confirms their email matches
4. Organizer clicks "Claim Events"
5. System automatically:
   - Creates organizer account with that email
   - Assigns all events to that organizer
   - Marks organizer as `isVerified: false` (pending your review)
   - Redirects to Manus OAuth login
6. Organizer logs in with Manus and lands in organizer dashboard

---

### **Post-Claim (Your Review)**

1. Go to Admin Dashboard → Organizers tab
2. Find the new organizer (will show `isVerified: false`)
3. Review their events and profile
4. Click "Verify" to grant them verified status
5. Verified organizers get:
   - Instant event publishing (no approval queue)
   - Verified badge on their events
   - Higher trust signals for users

---

## Current Limitations

- **Admin claim assignment UI has bugs** - The `/admin/claim-assignment` page doesn't properly display unclaimed events due to nested data structure issues
- **Manual SQL required** - For now, you need to generate claim tokens via SQL queries
- **No bulk operations** - Each claim token must be created individually

---

## Workaround for Outreach

Until the admin UI is fixed, use this process:

### Step 1: Find unclaimed events
```sql
SELECT id, name, municipality, startDate 
FROM events 
WHERE organizerId IS NULL 
  AND status = 'published' 
ORDER BY startDate;
```

### Step 2: Generate claim token
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 3: Create claim record
```sql
INSERT INTO event_claim_tokens (token, organizerEmail, eventIds, claimed, expiresAt) 
VALUES (
  'TOKEN_FROM_STEP_2', 
  'organizer@email.com', 
  '[EVENT_ID_1,EVENT_ID_2,EVENT_ID_3]',  -- Array of event IDs as JSON
  0, 
  DATE_ADD(NOW(), INTERVAL 30 DAY)
);
```

### Step 4: Build claim URL
```
https://your-published-domain.com/claim/TOKEN_FROM_STEP_2
```

### Step 5: Send email
Use one of the outreach templates and include the claim link.

---

## Outreach Email Templates

### Template 1: Cold Outreach (Libraries, Community Centers)

**Subject:** Help Nova Scotia families find your events

Hi [Name],

I'm reaching out because [Organization] runs great family events, and I'd love to feature them on Local Happenings—a new platform helping Nova Scotia families discover accessible, family-friendly activities.

**What makes us different:** We capture the accessibility details families actually need—wheelchair access, nursing areas, sensory accommodations, parking info—so parents can plan with confidence.

**I've already added your [event name] to get started.** You can claim your listing here:

[CLAIM_LINK]

Once you claim it, you'll be able to:
- Update details and add future events
- Get verified status for instant publishing
- Reach families searching by accessibility needs

No cost, no catch—just a better way to connect with families who need the details you already provide.

Happy to answer questions!

[Your name]
Local Happenings
[Contact info]

---

### Template 2: Warm Contacts (People You Know)

**Subject:** Quick favor - claim your event on Local Happenings

Hey [Name],

I'm building Local Happenings to help families find accessible events in Nova Scotia. I've added [event name] as one of the first listings—would you mind claiming it and letting me know what you think?

Claim link: [CLAIM_LINK]

Takes 2 minutes, and you'll be able to add future events with way more detail than Facebook allows (accessibility, parking, sensory info, etc.).

Let me know if you have feedback!

[Your name]

---

### Template 3: High-Volume Organizers (Libraries with 20+ events/month)

**Subject:** Streamline your event listings with Local Happenings

Hi [Name],

I noticed [Organization] runs [X] events per month, and I'd love to save you time by featuring them on Local Happenings—a platform built specifically for family-friendly, accessible events in Nova Scotia.

**Why this matters for you:**
- Reach families who specifically search by accessibility needs
- Save time: create reusable location templates, duplicate past events with one click
- Build trust: verified organizers get a badge + instant publishing

**I've pre-loaded [X events] to show you how it works.** Claim them here: [CLAIM_LINK]

Happy to walk you through it or answer questions—[your phone/email].

[Your name]

---

## Security Notes

- Claim tokens expire after 30 days
- Each token can only be used once
- Email validation ensures only the intended recipient can claim
- Organizers must still log in with Manus OAuth after claiming
- You manually verify organizers before they get instant-publish privileges

---

## Future Improvements Needed

1. Fix admin claim assignment UI to properly display unclaimed events
2. Add bulk claim token generation
3. Add email sending integration (currently manual copy/paste)
4. Add claim token management (view, revoke, resend)
5. Add organizer invitation tracking (sent, opened, claimed, verified)

---

## Test Claim Link

**For testing with clarissa.nell@gmail.com:**
```
https://3000-ilb3edpui1jbig95vkoed-3f947863.manusvm.computer/claim/71048063e51c8bf86d7ff2633a501021ab621c48966f707b67c83d190f6318d1
```

This link assigns 2 test events:
- Family Movie Night (Dartmouth)
- Toddler Playgroup (Halifax)

Use this to test the complete flow from claim → login → organizer dashboard → admin verification.
