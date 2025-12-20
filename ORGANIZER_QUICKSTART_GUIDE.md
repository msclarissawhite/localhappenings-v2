# Local Happenings: Organizer Quickstart Guide

**Version 1.1** | **Last Updated:** December 20, 2024

Welcome to Local Happenings! This guide will help you get started as an event organizer and make the most of the platform's features to reach families in your community.

---

## What is Local Happenings?

Local Happenings is a community-driven platform that connects families with accessible, family-friendly events and activities across Nova Scotia. As an organizer, you can submit events, manage your listings, and help families discover what's happening in their neighborhoods.

**Key Benefits for Organizers:**

- **Free event listings** with comprehensive accessibility information
- **Magic link authentication** – no passwords to remember
- **Saved locations** – reuse venue details across multiple events
- **Auto-approval for verified organizers** – skip the review process once you're established
- **Email notifications** when your events are published or need updates

---

## Getting Started: Your First Event

### Step 1: Create Your Organizer Account

Navigate to the **Organizer Login** page at `/organizer/login` or click "My Events" in the header navigation.

1. **Enter your email address** – use an email you check regularly
2. **Click "Send Magic Link"** – you'll receive an email within seconds
3. **Check your inbox** and click the link in the email
4. **You're in!** – you'll be redirected to your Organizer Dashboard

> **Note:** In development mode, the magic link appears on the screen for testing. In production, it's only sent via email for security.

### Step 2: Submit Your First Event

From your Organizer Dashboard, click **"Submit New Event"** or navigate to `/submit`.

The event submission form has several sections:

#### **Basic Information**
- **Event Name** – keep it clear and descriptive (e.g., "Toddler Storytime at Halifax Library")
- **Description** – explain what the event is, what families can expect, and any special highlights

#### **Location Details**
- **Province & Municipality** – select from dropdown menus
- **Neighborhood** – help families find events near them
- **Venue Name & Address** – provide the full address for Google Maps integration
- **Indoor/Outdoor** – check the appropriate boxes

> **💡 Pro Tip:** Use the **"Quick Fill from Saved Location"** dropdown if you're hosting at a venue you've used before. All location fields will auto-fill instantly!

#### **Date & Time**
- **Start Date** – when the event begins (required)
- **End Date** (optional) – for multi-day events like weekend festivals, week-long camps, or month-long exhibitions. When you provide an end date, the platform automatically calculates and displays the duration (e.g., "3-day event") to help families plan accordingly.
- **Time of Day** – morning, afternoon, evening, or all-day. For multi-day events, this indicates the time of day activities occur each day.
- **Recurring Events** – check this box for weekly/monthly events and set the interval

> **💡 Multi-Day Event Example:** A summer music festival running Friday through Sunday would have a start date of Friday and an end date of Sunday. The event card will automatically show "3-day event" and the date range "July 12-14, 2024".

#### **Cost Information**
- **Free Event** – check this box if there's no cost
- **Cost Range** – enter minimum and maximum prices in dollars
- **Kids Free** – indicate if children attend at no charge
- **Free Companion** – for support workers or caregivers

#### **Age Groups**
Select all age groups that apply:
- Young Children (0-5)
- Kids (6-12)
- Teens
- Adults Only
- Seniors
- All Ages

#### **Accessibility & Logistics**

This is the most important section for families planning outings. Local Happenings provides **comprehensive accessibility fields** across eight categories:

1. **Caregiver & Infant** – change tables, nursing areas, stroller access, quiet spaces
2. **Mobility** – wheelchair access, ramps, elevators, accessible parking, seating
3. **Sensory** – noise level, lighting, sensory-friendly accommodations
4. **Safety & Supervision** – fencing, supervision requirements, first aid
5. **Food & Allergies** – food policies, allergy accommodations, nut-free zones
6. **Washrooms** – accessibility, change tables, family washrooms
7. **Logistics** – parking, transit access, weather contingency, registration requirements
8. **Crowd & Terrain** – expected crowd size, terrain type, physical demands

> **Why This Matters:** Detailed accessibility information helps families plan with confidence. A parent with a toddler in a stroller needs to know about ramps and elevators. A family with a child who has sensory sensitivities needs to know about noise levels and quiet spaces. **Your attention to these details makes events truly accessible.**

For each field, you can select:
- **Yes** – this feature is available
- **No** – this feature is not available
- **Unknown** – you haven't confirmed this detail yet
- **Not Relevant** – this feature doesn't apply to your event

**Educational Tooltips:** Hover over the info icon (ℹ️) next to each field to see why it matters and how it helps families.

#### **Contact Information** (Optional)
- Email, phone, and website for families who have questions

#### **Event Image** (Optional but Recommended)

Upload a photo to make your event stand out in browse listings and attract more families. Event images appear prominently on event cards and detail pages.

**Image Guidelines for Best Results:**

- **Recommended Size:** 1200 pixels wide × 630 pixels tall (1200x630px)
- **Aspect Ratio:** 1.91:1 (landscape orientation)
- **File Format:** JPG or PNG
- **File Size:** Under 2MB for fast loading

**Why These Dimensions?** This size displays perfectly on both desktop and mobile devices without cropping or distortion. The 1.91:1 ratio matches social media preview standards, so your event looks great when shared on Facebook or Twitter.

**Image Best Practices:**

- **Show the activity in action** – photos of previous events, the venue, or similar activities help families visualize the experience
- **Include people when possible** – families connect with images showing children engaged and having fun
- **Ensure good lighting** – bright, clear photos are more inviting than dark or blurry images
- **Avoid text-heavy graphics** – let the event name and description provide details; use the image to convey atmosphere
- **Consider accessibility** – high contrast images are easier to see for users with visual impairments

**Don't Have a Photo?** That's okay! Events without images still appear in listings. However, events with images typically receive more clicks and engagement.

---

### Step 3: Review & Submit

Before submitting:
- **Double-check all details** – especially date, time, and location
- **Review accessibility information** – the more complete, the better
- **Add contact info** if families might have questions

Click **"Submit Event"** when you're ready.

**What Happens Next?**

- **New Organizers:** Your event goes to the admin review queue. You'll receive an email when it's published (usually within 24-48 hours).
- **Verified Organizers:** Your event is **published immediately** and appears on the site right away.

---

## Organizer Dashboard: Your Command Center

Your dashboard at `/organizer/dashboard` has two main tabs:

### **My Events Tab**

View all your submitted events with their current status:

- **Published** – live on the site
- **Pending** – awaiting admin review
- **Rejected** – needs changes (you'll receive an email explaining why)

**Actions You Can Take:**
- **Edit** – update event details (verified organizers' edits auto-publish)
- **Copy from Previous Event** – duplicate an event with one click, then just update the date
- **View** – see how your event appears to families

### **Saved Locations Tab**

Manage your frequently used venues to save time on future submissions.

**Adding a Saved Location:**

1. Click **"Add Location"**
2. Enter:
   - Location Name (e.g., "Halifax Central Library")
   - Province & Municipality
   - Neighborhood
   - Venue Name & Address
   - Indoor/Outdoor type
   - **Accessibility Details** (optional but recommended)
3. Click **"Save Location"**

**Setting a Default Location:**

If you host most events at the same venue, click **"Set as Default"** on that location. It will automatically pre-fill the submission form every time you create a new event.

**Using Saved Locations:**

When submitting an event, use the **"Quick Fill from Saved Location"** dropdown at the top of the Location section. Select your venue and watch all fields populate instantly – including accessibility information if you saved it with the location.

---

## Time-Saving Features

### 1. **Copy from Previous Event**

Hosting the same event again? Click the **"Copy"** button next to any event in your dashboard. All details (except the date) will pre-fill the submission form. Just update the date and submit!

### 2. **Default Location Auto-Fill**

Set your primary venue as the default location, and it will automatically fill in every time you create a new event. No more typing the same address repeatedly.

### 3. **Saved Locations with Accessibility**

Save accessibility details with your locations. If your venue always has wheelchair access, a change table, and accessible parking, save that information once and reuse it forever.

---

## Becoming a Verified Organizer

**What is Verification?**

Verified organizers have a green **"Verified"** badge next to their name on event listings. More importantly, their events **auto-publish without admin review**.

**How to Get Verified:**

1. **Submit high-quality events** with complete, accurate information
2. **Build a track record** – after a few successful events, the admin may verify your account
3. **Request verification** – contact the admin via the Contact page if you're an established organizer

**Benefits of Verification:**
- ✅ **Instant publishing** – no waiting for approval
- ✅ **Instant edits** – changes go live immediately
- ✅ **Trust badge** – families see you're an established organizer

---

## Best Practices for Great Event Listings

### **Be Specific with Accessibility**

Instead of leaving fields as "Unknown," take a few minutes to confirm details. Call the venue if needed. Families rely on this information to decide if an event works for them.

**Example:**
- ❌ "Unknown" for wheelchair access
- ✅ "Yes – ramp at main entrance, elevator to second floor, accessible washroom on main level"

### **Use Clear, Descriptive Titles**

Help families find your event by including key details in the title.

**Examples:**
- ❌ "Storytime"
- ✅ "Toddler Storytime at Halifax Central Library (Ages 0-3)"

### **Write Engaging Descriptions**

Tell families what makes your event special. What will kids do? What should they bring? What makes it unique?

**Example:**
> "Join us for an interactive storytime featuring classic picture books, songs, and movement activities. Perfect for toddlers ages 0-3 and their caregivers. We'll read three stories, sing songs with props, and end with a simple craft. Bring a blanket to sit on – we gather in a circle on the floor. No registration required, drop-ins welcome!"

### **Keep Information Up to Date**

If details change (time, location, cost), edit your event immediately. Families plan around your listing – outdated information leads to frustration.

---

## Managing Email Notifications

You'll receive emails when:
- Your event is **published**
- Your event is **rejected** (with feedback on what to fix)
- Your event needs **clarification** (admin has questions)

**Customizing Email Content:**

Refer to the **Email Customization Guide** (`EMAIL_CUSTOMIZATION_GUIDE.md`) for instructions on:
- Changing email templates
- Adjusting sender name and "from" address
- Modifying reminder timing
- Customizing notification content

---

## Troubleshooting Common Issues

### **"I didn't receive the magic link email"**

1. **Check your spam folder** – sometimes automated emails end up there
2. **Wait a few minutes** – email delivery can be delayed
3. **Try again** – request a new magic link
4. **Contact support** if the problem persists

### **"My event was rejected – what do I do?"**

Check the email you received – it explains what needs to be fixed. Common reasons:
- Incomplete accessibility information
- Missing location details
- Unclear event description
- Incorrect date or time format

Edit your event, make the requested changes, and resubmit.

### **"I need to cancel an event"**

Edit the event and add **"CANCELLED"** to the title, or contact the admin to have it removed from the site.

### **"I made a mistake after submitting"**

- **New organizers:** Contact the admin before the event is published
- **Verified organizers:** Edit the event directly – changes go live immediately

---

## Getting Help

**Have questions?** Contact the Local Happenings team:

- **Contact Form:** `/contact`
- **Feature Requests:** `/feature-requests` – suggest improvements and vote on others' ideas
- **Email:** Check the footer of the website for the admin contact email

---

## Next Steps

Now that you know the basics:

1. **Submit your first event** – start with something simple to get familiar with the process
2. **Add your saved locations** – save time on future submissions
3. **Explore the site** – browse other events to see what makes a great listing
4. **Share your events** – use the share buttons on event detail pages to spread the word on social media

Thank you for being part of Local Happenings and helping families discover accessible, inclusive events in Nova Scotia!

---

**Questions or feedback?** We'd love to hear from you. Visit `/feature-requests` to share your ideas for improving the platform.
