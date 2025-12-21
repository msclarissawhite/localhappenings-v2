# Local Happenings - User Manual & Testing Guide

**Version:** 3.2  
**Last Updated:** December 20, 2025  
**Author:** Manus AI

---

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Feature Guide](#feature-guide)
5. [Testing Checklist](#testing-checklist)
6. [Admin Workflow](#admin-workflow)
7. [Database Management](#database-management)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Local Happenings** is a community-first events platform designed to help families and individuals discover accessible, inclusive activities in Nova Scotia. The platform prioritizes transparency and accessibility information, allowing event organizers to submit "Unknown" or "Not Relevant" for fields they cannot confirm while still providing valuable information to the community.

### Core Features

The platform includes advanced filtering by location, date, age groups, and comprehensive accessibility criteria across five categories. Public users can submit events through a detailed form that includes mandatory accessibility information with image upload capability. Administrators review submissions through a moderation dashboard with full editing capabilities before events are published. The system automatically sends email notifications when event statuses change and provides analytics dashboards for tracking platform usage. Events are automatically archived after their date passes to keep listings fresh.

### Technology Stack

The application is built with **React 19**, **TypeScript**, **tRPC**, **Drizzle ORM**, and **MySQL/TiDB**. It uses **Tailwind CSS** for styling and **shadcn/ui** for UI components. Authentication is handled through Manus OAuth with role-based access control. File storage uses **AWS S3** for event images.

---

## Getting Started

### Accessing the Platform

Navigate to your deployed URL or local development server. The homepage displays the main hero section with two primary call-to-action buttons: **Browse Events** and **Submit an Event**. The navigation header provides access to Browse Events, Submit Event, Archive, and Admin/Analytics (visible only to admin users).

### First-Time Setup

When you first access the platform, you will need to log in using the Manus OAuth system. Your account will automatically be created with a **user** role. To access admin features, your role must be manually upgraded to **admin** in the database. This can be done through the Database panel in the Manus Management UI or by running a SQL query directly.

To promote a user to admin, navigate to the Database panel in the Management UI, find the users table, locate your user record by email or openId, and change the role field from "user" to "admin". Alternatively, you can execute the following SQL query:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## User Roles & Permissions

### Public Visitors (Unauthenticated)

Public visitors can browse published events with full access to the filtering system including text search. They can view detailed event pages including comprehensive accessibility information across five categories, share events via social media or copy link, and submit events through the public submission form with image upload. However, they cannot access the admin dashboard, analytics, or modify existing events.

### Authenticated Users

Authenticated users have the same permissions as public visitors. The primary benefit of authentication is that their submissions are tracked by user ID, which may be useful for future features such as managing their own submissions.

### Administrators

Administrators have full access to all features. They can view the pending events queue in the admin dashboard, approve, reject, or request clarification on submitted events, edit any event details directly without rejecting, access analytics dashboard showing submission volume and approval rates, and view archived events. The admin role is required to moderate event submissions before they appear publicly.

---

## Feature Guide

### Browsing Events

The Browse Events page provides comprehensive filtering options to help users find relevant activities. At the top of the page, a **text search bar** allows users to search across event names, descriptions, venues, and organizer names for quick discovery.

Users can apply **quick toggles** for common filters including Today, Free, Family-Friendly, Young Children (0-5), Indoor, Outdoor, and Show Archived. These toggles provide instant filtering without opening the advanced filters panel.

For more specific searches, the **Advanced Filters** panel organizes options into multiple categories:

**Location filters** provide dropdowns for province/territory and city selection based on Canadian locations, plus a text input for neighborhood.

**Date & Time filters** include options for Today, Tomorrow, This Weekend, This Week, This Month, or a custom date range with start and end date pickers. Time of day filters (Morning, Afternoon, Evening, All Day) and a recurring events checkbox are also available.

**Age group filters** include checkboxes for Family-Friendly, Young Children (0-5), Kids (6-12), Teens, Adults Only, Seniors, and All Ages.

**Cost filters** provide options for Free events, specific price ranges, Donation-based, Pay-what-you-can, Sliding scale, Kids free, and Free companion/support worker tickets.

**Event type filters** include checkboxes for various categories such as Festival, Market, Live Music, Workshop, Sports & Recreation, Seasonal Event, and Family Activity.

**Accessibility filters** are organized into four collapsible sections:

- **Caregiver & Infant**: Change table, nursing/breastfeeding friendly, stroller space, baby-wearing friendly, quiet feeding area, family washroom, bottle warming, diaper disposal
- **Mobility & Physical**: Wheelchair accessible entrance, step-free entry, accessible washroom, elevator access, accessible parking, wide doorways, ramps available, seating available, accessible route, distance from parking (Short <2min, Moderate 2-5min, Long 5+min)
- **Sensory & Neurodivergent**: Loud noises expected, flashing lights, quiet room/break space, low sensory environment, noise-cancelling headphones allowed, visual schedules, sensory-friendly, scent-free
- **Social & Emotional**: Flexible participation, supervision required, social interaction level, structured vs free-play, emotional support available, inclusive environment, terrain type (Flat, Gravel, Hills, Paved, Unpaved, Mixed)

The **Sort By** dropdown allows users to order results by Soonest, Latest, Name (A-Z), or Name (Z-A).

Each event card displays the event image (if uploaded), event name, date, location, cost (with "FREE" highlighted in accent color), and relevant badges such as Family-Friendly, age suitability, and Indoor/Outdoor indicators. Clicking any event card navigates to the detailed event page.

### Submitting Events

The event submission form is organized into seven sections to make the process clear and manageable.

**Basic Information** requires the event name, description, start date, and optional end date. The **description field** includes a rich text editor with formatting toolbar that allows organizers to format text with bold and italic, create bullet or numbered lists, add headings to organize content, insert hyperlinks to registration pages or venue websites, and use undo/redo buttons. Formatted descriptions are displayed with proper styling on event detail pages. All HTML content is automatically sanitized to prevent security issues while preserving safe formatting. An **image upload** field allows organizers to upload a photo (max 5MB) that will be displayed on event cards and detail pages. Images are automatically optimized to 1200×630px for consistent display across desktop and mobile devices. Time of day options include Morning, Afternoon, Evening, or All Day.

**Location** fields include province/territory dropdown (Canadian provinces and territories), city dropdown (populated based on selected province), neighborhood text input (optional), venue name (optional), and address (optional). Province and city are required, and providing complete location information helps users find events more easily.

**Cost** information starts with a checkbox for free events. If the event is not free, organizers can specify minimum and maximum cost in dollars and select cost type (Fixed price, Donation-based, Pay-what-you-can, Sliding scale). Additional checkboxes indicate if kids attend free or if free companion/support worker tickets are available.

**Age Suitability** checkboxes allow organizers to indicate if the event is suitable for Family-Friendly, Young Children (0-5), Kids (6-12), Teens, Adults Only, Seniors, or All Ages. Multiple options can be selected.

**Environment** checkboxes indicate whether the event is Indoor, Outdoor, or both.

**Accessibility Information** is the most detailed section and is mandatory. However, "Unknown" or "Not Relevant" are always acceptable answers for any field. The section is divided into five categories with radio button options (Yes, No, Unknown, Not Relevant):

**Caregiver & Infant Accessibility**: Change table available, nursing/breastfeeding friendly, space for strollers, baby-wearing friendly, quiet feeding area, family washroom, bottle warming available, diaper disposal

**Mobility & Physical Access**: Wheelchair accessible entrance, step-free entry, accessible washroom, elevator access, accessible parking nearby, wide doorways, ramps available, seating available, accessible route throughout, distance from parking (dropdown with Short <2min, Moderate 2-5min, Long 5+min, Unknown, Not Relevant)

**Sensory & Neurodivergent**: Loud noises expected, flashing lights, quiet room/break space, low sensory environment, noise-cancelling headphones allowed, visual schedules available, sensory-friendly, scent-free

**Cognitive & Communication**: Clear signage, simple language used, visual aids available, interpreters available, written materials provided, staff trained in accessibility

**Social & Emotional**: Flexible participation allowed, supervision required, social interaction level, structured vs free-play, emotional support available, inclusive environment, terrain type (dropdown with Flat, Gravel, Hills, Paved, Unpaved, Mixed, Unknown, Not Relevant)

Each accessibility field includes a tooltip icon that explains what the question means and why it matters. This helps submitters understand what information to provide.

**Organizer Information** requires organization/contact name and either email OR phone (at least one contact method is mandatory). A checkbox allows organizers to control whether this information is displayed publicly on the event page. Even if hidden from public view, admins can always see contact information for moderation purposes.

**Additional Notes** provides a free-form text area for any other important information such as weather dependency, registration requirements, or special instructions.

After completing the form, clicking **Submit Event** sends the submission to the admin moderation queue. The submitter receives a confirmation message indicating that the event will be reviewed before publication.

### Organizer Dashboard & Convenience Features

Organizers who submit events frequently can use the **Organizer Dashboard** to streamline their workflow. The dashboard is accessed via magic link authentication sent to the organizer's email address.

#### Accessing the Organizer Dashboard

To access the organizer dashboard, navigate to the **Organizer Login** page from the footer or by visiting `/organizer/login`. Enter your email address and click **Send Magic Link**. You will receive an email with a secure login link that logs you in automatically when clicked. In development mode, the magic link is also displayed on the page for testing purposes.

Once logged in, you will see the **Organizer Dashboard** with two tabs: **My Events** and **Saved Locations**.

#### My Events Tab

The **My Events** tab displays all events you have submitted, organized by status (Published, Pending, Needs Clarification, Rejected). Each event card shows the event name, date, location, status badge, and action buttons.

**Copy from Previous Event**: Each event card includes a **Copy** button that duplicates the event with all details pre-filled except the date. This is perfect for recurring events or similar activities. When you click Copy, you are redirected to the Submit Event form with all fields auto-filled including location, cost, age groups, environment, accessibility information, and organizer details. Simply update the date and any other details that have changed, then submit.

#### Saved Locations Tab

The **Saved Locations** tab allows you to save frequently used venues with complete location and accessibility details. This eliminates the need to re-enter the same information for every event at the same venue.

**Adding a Saved Location**: Click the **Add Location** button to open the saved location form. Fill in the location name (e.g., "Halifax Central Library"), province, municipality, neighborhood (optional), venue name (optional), address (optional), environment (Indoor/Outdoor checkboxes), and accessibility settings. The accessibility section includes all the same fields as the event submission form, allowing you to save venue-specific accessibility information. Click **Save Location** to add it to your saved locations.

**Setting a Default Location**: Each saved location card displays a **Set as Default** button. Click this button to mark a location as your default venue. When you create a new event, the default location will be automatically selected in the "Quick Fill from Saved Location" dropdown, and all location and accessibility fields will be pre-filled. Only one location can be set as default at a time. The default location is indicated with a green **Default Location** badge.

**Editing and Deleting Locations**: Each saved location card includes **Edit** and **Delete** buttons. Click Edit to modify any location details including accessibility settings. Click Delete to remove a location from your saved list. Deleting a saved location does not affect events that have already been submitted using that location.

#### Using Saved Locations When Submitting Events

When you navigate to the **Submit Event** page while logged in as an organizer, you will see a **Quick Fill from Saved Location** dropdown at the top of the Location section. This dropdown lists all your saved locations.

**Auto-Fill with Default Location**: If you have set a default location, it will be automatically selected when the form loads, and all location and accessibility fields will be pre-filled with the saved details. You can still edit any field before submitting.

**Select a Different Saved Location**: Click the dropdown to select any of your saved locations. When you select a location, the following fields are automatically filled: province, municipality, neighborhood, venue name, address, Indoor/Outdoor checkboxes, and all accessibility settings from the saved location. You can edit any of these fields after auto-fill if needed for a specific event.

**Manual Entry**: If you select "None (enter manually)" from the dropdown, all location fields will be cleared and you can enter location details from scratch.

These convenience features significantly reduce the time required to submit events, especially for organizers who host regular activities at the same venue or run similar events frequently.

#### My Images Tab

The **My Images** tab provides a centralized image library where organizers can upload and manage reusable event photos. This feature eliminates the need to repeatedly upload the same venue or activity photos for recurring events.

**Uploading Images to Library**: Click the **Upload Image** button to open the upload dialog. Select an image file (max 5MB, JPG/PNG/WebP formats supported) and the system automatically optimizes it to 1200×630px for consistent display across desktop and mobile devices. All uploaded images are compressed to 85% quality JPEG for fast loading times while maintaining visual quality.

**Using Library Images in Events**: When submitting or editing an event, you will see a **Choose from Library** button next to the image upload field. Click this button to open your image library in a modal dialog. Your saved images are displayed in a grid with thumbnails. Click any image to select it for your event. The selected image URL is automatically filled in the event form.

**Managing Your Images**: Each image in your library displays a **Delete** button. Click Delete to remove an image from your library. Deleting an image from your library does not affect events that are already using that image URL.

**Automatic Image Optimization**: All images uploaded through the platform (whether directly in the event form or via the image library) are automatically processed with Sharp image optimization. This ensures consistent sizing (1200×630px, 1.91:1 aspect ratio), format conversion (all images converted to JPEG), and compression (85% quality) for optimal performance on both desktop and mobile devices. Organizers can upload images in any size or format, and the system handles all optimization automatically.

#### Templates Tab

The **Templates** tab allows organizers to save event configurations as reusable templates. This is ideal for recurring event types like weekly storytimes, monthly workshops, or seasonal festivals where most details remain consistent.

**Creating a Template**: When filling out the event submission form, click the **Save as Template** button (visible only to logged-in organizers). Enter a template name (e.g., "Weekly Storytime") and optional description. Click **Save Template**. The template saves all form fields including location, cost, age groups, environment, accessibility settings, organizer information, and even the event image URL. The template does NOT save the event date or name, as these typically change for each occurrence.

**Viewing Your Templates**: Navigate to the **Templates** tab in your Organizer Dashboard. You will see all your saved templates displayed as cards showing the template name, description, and creation date.

**Using a Template**: Click the **Use Template** button on any template card. You will be redirected to the event submission form with all saved fields pre-filled. Simply add the event name and date, make any necessary adjustments, and submit. This workflow is significantly faster than filling out the entire form from scratch.

**Editing Templates**: Click the **Edit** button on a template card to modify the saved configuration. Update any fields and click **Save Changes**. The updated template will be used for all future events created from that template.

**Deleting Templates**: Click the **Delete** button on a template card to remove it from your library. Deleting a template does not affect events that were previously created using that template.

### Organizer Verification System

Organizers can be marked as **verified** by administrators. Verified organizers enjoy streamlined event submission with automatic approval.

**Verification Badge**: Events submitted by verified organizers display a green **Verified** badge with a shield icon next to the organizer name on event detail pages. This helps community members identify trusted, established organizers.

**Auto-Approval**: When a verified organizer submits an event, it is automatically published without requiring admin review. This allows trusted organizers to post time-sensitive events immediately. Verified organizers can also edit their published events directly, and changes are applied immediately without re-entering the moderation queue.

#### Editing Published Events

Organizers can edit their published events to correct mistakes or update information that has changed. The editing workflow depends on whether the organizer is verified.

**Accessing the Edit Form**: In the **My Events** tab of your Organizer Dashboard, find the event you want to edit. Published events and events marked "Needs Clarification" display an **Edit** button next to the View button. Click **Edit** to open the event editing form.

**Edit Form**: The edit form is pre-populated with all current event information. You can modify any field including the event name, description, dates, location, cost, accessibility information, and organizer details. The form layout is identical to the original submission form for consistency.

**Verified Organizer Edits**: If you are a verified organizer, your changes are applied immediately when you click **Submit**. You will see a success message: "Event Updated - Your changes are now live!" The updated information appears on the public event page right away.

**Unverified Organizer Edits**: If you are not verified, your changes enter a pending review queue. When you click **Submit**, you will see: "Edit Submitted - Your changes are pending admin approval. The original event remains published." Your event continues to display the original information publicly while the admin reviews your proposed changes. In your Organizer Dashboard, the event will show an **Edit Pending Review** badge in yellow next to the status badge.

**Admin Review Process**: When an unverified organizer submits an edit, the admin receives a notification and can review the changes in the **Pending Edits** tab of the Admin Dashboard. The admin sees a side-by-side comparison of the current published version and your proposed changes, with modified fields highlighted in orange. The admin can either approve your edit (which publishes your changes immediately) or reject it with an optional reason.

**Email Notifications**: You will receive an email notification when the admin makes a decision on your edit. If approved, the email will say "Your edits have been approved and are now live." If rejected, the email will include the admin's reason for rejection so you can understand what needs to be changed.

**Admin Verification Controls**: Administrators can view all organizers in the **Admin Dashboard** under the **Manage Organizers** tab. Each organizer card displays their email, total events submitted, and a toggle switch to mark them as verified or unverified. Admins should verify organizers who have demonstrated consistent, high-quality submissions and accurate accessibility information.

### Viewing Event Details

Event detail pages are organized into scannable sections for easy information retrieval.

**Event Header** displays the event image (if uploaded) in a banner format, the event name as a large heading, and **share buttons** for Facebook, Twitter, and a "Copy Link" button for easy sharing.

**What It Is** displays the full event description in readable paragraphs.

**When & Where** shows the date and time formatted as "Day, Month Date, Year" for single-day events or "Month Day - Month Day, Year" for multi-day events. For multi-day events, a duration indicator displays (e.g., "3-day event") to help families plan accordingly. The time of day is shown if specified, with "(each day)" appended for multi-day events. The section also displays the venue name and address if provided, the location hierarchy (neighborhood, city, province), whether the event is Indoor, Outdoor, or both, and an **"Open in Google Maps"** button that opens the event location directly in Google Maps for navigation.

**Cost** clearly displays "FREE" for free events or shows the price range for paid events. Cost type (Donation-based, Pay-what-you-can, Sliding scale) is displayed when applicable. Additional cost information such as "Kids attend free" or "Free companion/support worker ticket" is displayed with checkmark icons.

**Who It's For** shows age suitability badges for all selected age groups (Family-Friendly, Young Children 0-5, Kids 6-12, Teens, Adults Only, Seniors, All Ages).

**Accessibility & Logistics** presents all accessibility information in an organized format with five collapsible sections. Each category displays individual fields with color-coded badges: green checkmark for Yes, red X for No, gray question mark for Unknown, and gray dash for Not Relevant. The section includes explanatory text: "Accessibility information helps families plan with confidence. 'Unknown' means the organizer hasn't confirmed this detail yet, and 'Not Relevant' means it doesn't apply to this event."

**Organizer Information** displays the organization name, email (as a clickable mailto link), phone (as a clickable tel link), and website (as an external link) only if the organizer chose to display this information publicly.

**Additional Notes** shows any extra information provided by the organizer.

A **Back to Events** button at the top of the page allows easy navigation back to the browse page.

### Admin Dashboard

The admin dashboard is accessible only to users with the admin role. It displays all events with a status of "pending" in reverse chronological order (newest first).

**Bulk Actions Toolbar**: At the top of the Events tab, a toolbar provides quick access to bulk operations. The **Bulk Upload CSV** button allows admins to import multiple events at once (see CSV Import section below). The **Download All Events** button exports all pending events to a CSV file for offline review or backup purposes. When events are selected via checkboxes, a **Batch Edit (N)** button appears, allowing admins to update common fields across multiple events simultaneously.

**Batch Edit Tool**: Admins can select multiple events using the checkboxes next to each event card. Once events are selected, click the **Batch Edit** button to open the batch edit modal. The modal displays checkboxes for each editable field category: venue information (venue name, address), organizer information (organizer name, email, phone, website, display toggle), and accessibility features (any of the five accessibility categories). Check the boxes for fields you want to update, enter the new values, and click **Apply Changes**. Only the checked fields will be updated across all selected events. Unchecked fields remain unchanged. This feature is particularly useful for updating venue details when a location changes its accessibility features, or for correcting organizer contact information across a series of events.

Each pending event card shows the event name, date, location, cost indicator, venue and organizer information (always visible to admins regardless of public display setting), age groups and environment, a note about accessibility information being provided or not, additional notes if any, and the submission timestamp.

Four action buttons are available for each event:

**Edit** (blue button with pencil icon) opens a comprehensive edit dialog where admins can modify any field including basic information, location, cost, age groups, environment, accessibility details, and organizer information. This allows admins to fix small errors without rejecting the submission. Changes are saved immediately and the event remains in pending status until approved.

**Approve** (green button with checkmark) publishes the event immediately, making it visible to all users, and sends an email notification to the admin with the submitter's contact information. Admins can optionally add internal notes.

**Need Info** (yellow button with alert icon) marks the event as "needs-clarification", sends an email notification to the admin with details about what information is needed, and keeps the event in the pending queue. Admins should specify what information is missing or unclear.

**Reject** (red button with X icon) marks the event as "rejected", sends an email notification to the admin with the rejection reason, and removes it from the pending queue. Admins should provide a reason for rejection.

When an admin clicks any action button, a confirmation dialog appears requesting optional notes or required explanations depending on the action. After confirming, the event status is updated, an email notification is sent, and the admin receives a success notification.

When there are no pending events, the dashboard displays a friendly message: "All caught up! There are no pending events to review."

**Bulk Upload CSV** allows admins to import multiple events at once using a CSV file. Click the "Bulk Upload CSV" button in the admin dashboard, select a properly formatted CSV file (use the template provided in the repository), preview the events that will be imported, and click "Import Events" to add them all to the database with published status. This feature is useful for importing seasonal events, recurring activities, or migrating data from other systems.

**Download All Events** exports all events in the database to a CSV file for backup or analysis purposes. Click the "Download All Events" button in the admin dashboard to download a CSV file containing all event data including accessibility information, organizer details, and status. This file uses the same format as the bulk upload template.

**Bulk Delete** allows admins to delete multiple events simultaneously. Select events using the checkboxes next to each event card, click the "Delete Selected" button, and confirm the deletion in the dialog that appears. This feature is useful for removing outdated events, clearing test data, or managing seasonal cleanup.

### Analytics Dashboard

The analytics dashboard is accessible only to admin users and provides key metrics about platform usage and event submissions.

**Overview Metrics** display four key statistics in card format:

- Total Events (all-time count)
- Pending Events (current count awaiting moderation)
- Approval Rate (percentage of approved vs total submissions)
- Published Events (currently visible to public)

**Events by Status** shows a bar chart visualization breaking down events by status: Published, Pending, Needs Clarification, and Rejected. This helps admins understand the distribution of event statuses at a glance.

**Top Cities** displays a horizontal bar chart showing the cities with the most events. This helps identify which communities are most active on the platform and where to focus outreach efforts.

**Recent Activity** provides a table of the 10 most recently submitted events with columns for Event Name, City, Status, and Submitted date. This gives admins a quick overview of recent submissions without navigating to the full pending queue.

The analytics page automatically refreshes data when navigated to, ensuring admins always see current statistics.

### Archive Page

The Archive page displays all past events (events where the start date has passed) in reverse chronological order. This keeps the main Browse Events page focused on current and upcoming activities while preserving historical event data.

Each archived event card shows the same information as Browse Events cards: event image, name, date, location, cost, and badges. Clicking any archived event navigates to its detail page where all information remains accessible.

The Archive page includes a note at the top: "Browse past events that have already occurred. To see upcoming events, visit Browse Events." This helps users understand they are viewing historical data.

Users can also access archived events by clicking the **"Show Archived"** toggle in the Browse Events quick filters, which displays both current and past events together in the main browse view.

---

## Testing Checklist

### Pre-Launch Testing

Before publishing your site, complete the following tests to ensure all features work correctly.

#### Public User Flow

1. **Homepage**: Visit the homepage and verify that the hero section displays correctly, both call-to-action buttons (Browse Events, Submit an Event) are functional, and the "Why Local Happenings?" section with feature cards is visible.

2. **Browse Events - Text Search**: Navigate to Browse Events and test the search bar by entering event names, venue names, or keywords. Verify that results filter correctly.

3. **Browse Events - Quick Toggles**: Test each quick toggle (Today, Free, Family-Friendly, Young Children, Indoor, Outdoor, Show Archived) and verify that events filter correctly. Confirm that the "Show Archived" toggle displays past events.

4. **Browse Events - Advanced Filters**: Open the advanced filters panel and test location dropdowns (province, city), date filters (today, tomorrow, custom range), age group checkboxes, cost filters, event type filters, and all four accessibility filter sections. Verify that filters combine correctly.

5. **Browse Events - Sorting**: Test all four sort options (Soonest, Latest, Name A-Z, Name Z-A) and verify that events reorder correctly.

6. **Event Submission - Basic Flow**: Click "Submit an Event" and test the form by filling in all required fields (name, description, province, city, start date), uploading an image (test with a valid image file in 1200x630px resolution with 1.91:1 aspect ratio for optimal display), setting the event as free, selecting age groups and environment, completing the accessibility section (test all four response options: Yes, No, Unknown, Not Relevant), providing organizer name and email, and submitting the form. Verify that a success message appears.

**Event Submission - Multi-Day Events**: Test submitting a multi-day event by filling in both the start date and end date fields (e.g., a weekend festival or week-long camp). Verify that the form accepts the date range and that the preview shows the duration correctly.

7. **Event Submission - Organizer Validation**: Test that the form requires either email OR phone (try submitting with neither, with only email, with only phone, and with both). Verify that the "Display organizer info publicly" checkbox works.

8. **Event Submission - Terrain and Parking**: Verify that the terrain field shows a dropdown with options (Flat, Gravel, Hills, Paved, Unpaved, Mixed, Unknown, Not Relevant) instead of radio buttons. Verify that distance from parking shows a dropdown with Short <2min, Moderate 2-5min, Long 5+min, Unknown, Not Relevant.

9. **Event Detail Page**: Click on an event card and verify that the detail page displays the event image, all event information is formatted correctly, share buttons work (Facebook, Twitter, Copy Link), the "Open in Google Maps" button opens the correct location, accessibility information is organized into collapsible sections with proper badges, and organizer information displays only if the organizer chose to show it publicly.

10. **Archive Page**: Navigate to the Archive page from the header navigation and verify that only past events are displayed, event cards show the same information as Browse Events, and clicking an archived event opens its detail page.

11. **Form Validation**: Attempt to submit the event form with missing required fields and verify that appropriate error messages appear for event name, description, province, city, start date, organizer name, and organizer contact (must have email OR phone).

12. **Accessibility Tooltips**: Hover over the info icons in the accessibility section and confirm that tooltips display helpful explanations for each field.

#### Admin Flow

1. **Admin Access**: Log in with an admin account and verify that the "Admin" and "Analytics" links appear in the navigation header.

2. **Pending Events Queue**: Navigate to the admin dashboard and confirm that your test submission from the public flow appears in the pending queue with all submitted information displayed correctly including the event image.

3. **Admin Edit Event**: Click the "Edit" button on a pending event and verify that the edit dialog opens with all current values pre-filled, you can modify any field, province/city dropdowns work correctly, accessibility fields show current values, and clicking "Save Changes" updates the event and closes the dialog.

4. **Event Approval**: Click "Approve" on a pending event, optionally add notes, and confirm. Verify that the event disappears from the pending queue and you receive an email notification with the submitter's contact information. Navigate to Browse Events and confirm the event now appears in the published list.

5. **Event Rejection**: Submit another test event, then reject it from the admin dashboard with a reason. Verify that the event is removed from the pending queue and you receive an email notification with the rejection reason.

6. **Need Clarification**: Submit a third test event, then mark it as "needs clarification" with specific questions. Verify that the event remains in the pending queue with an updated status and you receive an email notification with the clarification request.

7. **Analytics Dashboard**: Navigate to the Analytics page and verify that overview metrics display correctly (Total Events, Pending Events, Approval Rate, Published Events), the Events by Status chart shows accurate data, the Top Cities chart displays cities with event counts, and the Recent Activity table shows the 10 most recent submissions.

8. **Email Notifications**: Check that you received email notifications for event approval, rejection, and clarification requests. Verify that each email contains the submitter's contact information and relevant event details.

#### Filtering & Search

1. **Location Filtering**: Select a province and verify that the city dropdown populates with cities from that province. Select a city and verify that only events from that city appear.

2. **Date Filtering**: Test "Today" filter and verify only today's events appear. Test "This Weekend" and verify only Saturday/Sunday events appear. Test custom date range and verify events within that range appear.

3. **Age Group Filtering**: Select "Young Children (0-5)" and verify that only events marked as suitable for young children appear.

4. **Cost Filtering**: Select "Free" and verify that only free events appear. Select a price range and verify that events within that range appear.

5. **Accessibility Filtering**: Select "Wheelchair accessible entrance" in the Mobility section and verify that only events with wheelchair accessible entrances (marked as "Yes") appear. Test multiple accessibility filters together.

6. **Text Search**: Search for a specific event name and verify it appears. Search for a venue name and verify events at that venue appear. Search for an organizer name and verify their events appear.

7. **Combined Filters**: Apply multiple filters simultaneously (e.g., Free + Family-Friendly + Halifax + Wheelchair accessible) and verify that only events matching all criteria appear.

8. **Clear Filters**: Apply several filters, then click "Clear Filters" and verify that all filters reset and all events appear again.

#### Archiving

1. **Automatic Archiving**: Verify that events with past start dates do not appear in the default Browse Events view (without "Show Archived" toggle).

2. **Show Archived Toggle**: Click the "Show Archived" toggle in Browse Events and verify that past events now appear mixed with upcoming events.

3. **Archive Page**: Navigate to the Archive page and verify that only past events appear, events are sorted by date (most recent first), and all event information is accessible.

4. **Archive to Detail**: Click an archived event and verify that the detail page displays all information correctly including the "past event" indicator.

#### Responsive Design

1. **Mobile Navigation**: Resize your browser to mobile width (< 768px) and verify that the navigation collapses into a hamburger menu, the menu opens when clicked, all navigation links are accessible, and the menu closes after clicking a link.

2. **Mobile Event Cards**: Verify that event cards stack vertically on mobile, images scale appropriately, text remains readable, and badges wrap correctly.

3. **Mobile Filters**: Verify that the advanced filters panel is accessible on mobile, filter sections scroll correctly, and dropdowns and checkboxes are tap-friendly.

4. **Mobile Forms**: Test the event submission form on mobile and verify that all fields are accessible, dropdowns work correctly, the image upload button is tap-friendly, and the form submits successfully.

5. **Tablet View**: Test the site at tablet width (768px - 1024px) and verify that the layout adapts appropriately with a balanced use of space.

#### Authentication

1. **Login Flow**: Click any link that requires authentication and verify that you are redirected to the Manus OAuth login page, can complete the login process, and are redirected back to the intended page after login.

2. **Admin Access Control**: Log out and verify that the Admin and Analytics links disappear from the navigation. Attempt to directly access /admin or /analytics URLs while logged out and verify that you are redirected to login.

3. **Role-Based Access**: Log in with a non-admin account and verify that the Admin and Analytics links do not appear, and attempting to access /admin or /analytics shows an access denied message or redirects.

---

## Admin Workflow

### Daily Moderation Routine

Administrators should establish a regular moderation schedule to ensure timely event publication. A recommended daily routine includes logging into the admin dashboard once or twice per day, reviewing all pending events in the queue, and processing each event using the Edit, Approve, Need Info, or Reject actions.

When reviewing events, admins should verify that basic information is complete and accurate (name, description, date, location), cost information is clear and reasonable, age suitability is appropriate for the event type, accessibility information is provided (even if marked as "Unknown"), and organizer contact information is valid.

### Approval Guidelines

Events should be approved if they meet the following criteria: the event is a legitimate community activity open to the public or a defined group, all required fields are completed, the description is clear and informative, location information is accurate, cost information is transparent, and accessibility information is provided (even if some fields are marked as "Unknown" or "Not Relevant").

Events that are clearly spam, commercial advertisements without community value, contain offensive or inappropriate content, have misleading information, or are duplicates of existing events should be rejected.

### Using the Edit Feature

The Edit feature allows admins to fix minor issues without rejecting submissions. Common use cases include correcting typos in event names or descriptions, adjusting date or time formatting, updating location details for clarity, adding missing accessibility information if the admin has knowledge of the venue, and standardizing cost information format.

When editing an event, admins should make minimal changes necessary to meet approval criteria, add a note in the approval explaining what was edited, and avoid changing the fundamental nature or details of the event without contacting the organizer.

### Rejection Best Practices

When rejecting an event, always provide a clear, specific reason for rejection. Use polite, professional language and explain what information is missing or why the event does not meet guidelines. If possible, suggest how the submitter could resubmit the event successfully.

Common rejection reasons include incomplete required fields, duplicate submission of an existing event, event is not open to the public without explanation, cost information is unclear or misleading, description contains spam or promotional content, or event date has already passed.

### Requesting Clarification

Use the "Need Info" action when an event has potential but needs additional information. Be specific about what information is needed and why it matters. Common clarification requests include unclear event description (ask for more details about activities), ambiguous cost information (ask for specific pricing), missing or vague location details (ask for complete address), and accessibility information that seems inconsistent (ask for confirmation).

After marking an event as "needs clarification," monitor for resubmissions or follow-up communication from the organizer.

### Email Notifications

Admins receive email notifications for all status changes (approval, rejection, clarification requests). These emails include the submitter's contact information (name, email, phone if provided) and event details. Admins should use this information to follow up with submitters when necessary, especially for clarification requests or to explain rejections.

### Analytics Review

Regularly review the Analytics dashboard to understand platform usage patterns. Key metrics to monitor include approval rate (target: 80%+ approval rate indicates clear submission guidelines), pending queue size (aim to keep pending events under 10 to ensure timely moderation), top cities (identifies where to focus community outreach), and submission trends (helps plan for busy periods like holiday seasons).

### Organizer Feedback Analytics

The **Organizers** tab in the admin dashboard provides comprehensive feedback analytics to help identify high-performing organizers and make informed verification decisions.

#### Viewing Organizer Stats

Access the Organizers tab from the admin dashboard navigation. The page displays all organizers sorted by average accuracy rating (highest first). Each organizer card shows:

- **Organizer Name** and email address
- **Verified status** (indicated by a green badge)
- **Total Events**: Number of events submitted by this organizer
- **Events with Feedback**: How many of their events have received attendee feedback
- **Total Responses**: Total number of feedback submissions across all events
- **Attended Count**: Number of people who marked "Yes, I attended" in feedback
- **Avg Accuracy**: Average accuracy rating from attendees (1-5 scale)

#### Viewing Event Breakdown

Click the **"View Events"** button on any organizer card to expand and see individual event performance. The breakdown shows:

- Event name and date
- Number of feedback responses per event
- Number of attendees per event
- Average accuracy rating per event

This helps identify which specific events performed well or poorly, useful for understanding organizer consistency.

#### Exporting Analytics Data

Click the **"Export CSV"** button at the top of the Organizers tab to download a complete spreadsheet of organizer analytics. The CSV includes all metrics shown in the dashboard and is formatted for easy analysis in Excel or Google Sheets. The filename includes the current date (e.g., `organizer-analytics-2025-12-20.csv`).

Use exported data for:

- Quarterly performance reports
- Sharing with stakeholders or community partners
- Identifying verification candidates (e.g., organizers with 4.5+ avg accuracy and 10+ responses)
- Tracking organizer performance trends over time

#### Using Analytics for Verification Decisions

When deciding whether to verify an organizer, consider:

- **Consistency**: Do they have multiple events with feedback?
- **Accuracy**: Is their average rating 4.0 or higher?
- **Volume**: Have they received at least 5-10 feedback responses total?
- **Attendance**: Do people actually attend their events (high attended count)?

Recommended verification threshold: 4.5+ average accuracy with 10+ total feedback responses from at least 3 different events. Adjust these thresholds based on your community's needs and feedback volume.

---

## Database Management

### Accessing the Database

The database can be accessed through the Manus Management UI by clicking the "Database" tab in the right panel. This provides a visual interface for viewing and editing data. Alternatively, you can connect directly using a MySQL client with the connection string provided in the environment variables.

### Database Schema Overview

The platform uses the following main tables:

**users**: Stores user accounts with fields for id (primary key), openId (Manus OAuth identifier), name, email, loginMethod, role (user or admin), createdAt, updatedAt, and lastSignedIn.

**events**: Stores all event data with fields for id (primary key), name, description, startDate (required), endDate (optional, for multi-day events), timeOfDay, province, city, neighborhood, venue, address, isIndoor, isOutdoor, isFree, minCost, maxCost, costType, kidsFree, freeCompanion, familyFriendly, youngChildren, kids, teens, adultsOnly, seniors, allAges, accessibility (JSON field containing all 40+ accessibility fields), organizerName, organizerEmail, organizerPhone, organizerWebsite, displayOrganizerInfo (boolean), additionalNotes, imageUrl (recommended size: 1200x630px, aspect ratio 1.91:1), status (pending, published, rejected, needs-clarification), submittedBy (user id), createdAt, and updatedAt. For multi-day events, endDate should be set to the last day of the event, and the platform will automatically calculate and display the duration.

The accessibility field is stored as JSON and contains five nested objects: caregiverInfant, mobilityPhysical, sensoryNeurodivergent, cognitiveComm, and socialEmotional. Each object contains multiple fields with values of "yes", "no", "unknown", or "not-relevant".

### Common SQL Queries

**Promote a user to admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

**View all pending events:**
```sql
SELECT id, name, city, province, createdAt 
FROM events 
WHERE status = 'pending' 
ORDER BY createdAt DESC;
```

**View events by city:**
```sql
SELECT name, startDate, isFree, status 
FROM events 
WHERE city = 'Halifax' AND status = 'published' 
ORDER BY startDate ASC;
```

**Count events by status:**
```sql
SELECT status, COUNT(*) as count 
FROM events 
GROUP BY status;
```

**Find events with specific accessibility features:**
```sql
SELECT name, city, startDate 
FROM events 
WHERE JSON_EXTRACT(accessibility, '$.mobilityPhysical.wheelchairAccessible') = 'yes' 
AND status = 'published';
```

**Delete a rejected event:**
```sql
DELETE FROM events WHERE id = 123 AND status = 'rejected';
```

**Update event status manually:**
```sql
UPDATE events SET status = 'published' WHERE id = 456;
```

### Backup Recommendations

Regular database backups are essential for data protection. The Manus platform automatically backs up your database, but you can also export data manually through the Database panel. For critical data, consider exporting events data weekly as CSV or JSON for local backup.

To export events data:
```sql
SELECT * FROM events WHERE status = 'published' ORDER BY startDate DESC;
```

Copy the results to a CSV file or use a MySQL export tool.

---

## Troubleshooting

### Common Issues

**Admin links not appearing in navigation:**
- Verify that you are logged in with an account that has admin role
- Check the users table in the database and confirm your role field is set to "admin"
- Clear your browser cache and cookies, then log in again
- If the issue persists, manually update your role using SQL: `UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';`

**Events not showing after approval:**
- Verify that the event status is set to "published" in the database
- Check that the event's start date has not passed (past events are automatically hidden unless "Show Archived" is toggled)
- Clear any active filters in Browse Events that might exclude the event
- Refresh the Browse Events page

**Image upload failing:**
- Verify that the image file is under 5MB
- Ensure the file is in a supported format (JPEG, PNG, GIF, WebP)
- Check your internet connection for upload stability
- Try a different image file to rule out file corruption

**Filters not working correctly:**
- Clear all filters and reapply them one at a time to identify the problematic filter
- Verify that events in the database have the expected field values
- Check the browser console for JavaScript errors
- Refresh the page and try again

**Form submission errors:**
- Verify that all required fields are filled (event name, description, province, city, start date, organizer name, and either email OR phone)
- Check that date fields are in the correct format
- Ensure that the accessibility section is completed (all fields can be "Unknown" or "Not Relevant")
- Review the error message for specific field issues

**Email notifications not received:**
- Check your spam/junk folder
- Verify that email notifications are enabled in your Manus account settings
- Confirm that the event status was actually changed (check the events table)
- Contact Manus support if notifications consistently fail

**Analytics dashboard showing incorrect data:**
- Refresh the Analytics page to reload current data
- Verify that events in the database have accurate status values
- Check that the date ranges are calculated correctly (events may have been submitted/approved on different dates)
- If data still appears incorrect, review the analytics-db.ts queries

**Archive page showing upcoming events:**
- Verify that the event's startDate field is correctly set in the database
- Check your system time and timezone settings
- Refresh the Archive page
- If the issue persists, check the events-db.ts filtering logic

**Province/City dropdowns not populating:**
- Verify that JavaScript is enabled in your browser
- Check the browser console for errors
- Ensure that the canadian-locations.ts file is properly loaded
- Try selecting a different province to trigger the city dropdown update

**"Show Archived" toggle not working:**
- Clear the toggle and reapply it
- Check that archived events exist in the database (events with past start dates)
- Verify that the showArchived filter is being passed to the backend correctly
- Check the browser console for errors

### Getting Help

If you encounter issues not covered in this troubleshooting section, you can access the database directly through the Manus Management UI to inspect data, check the browser console for JavaScript errors, review the server logs in the Manus interface, or contact Manus support at https://help.manus.im.

When reporting issues, include the specific error message, steps to reproduce the issue, your user role (admin or regular user), and relevant screenshots.

---

## Appendix: Feature Changelog

### Version 2.0 (December 19, 2025)

**New Features:**
- Event image upload with S3 storage integration
- Province/territory and city dropdowns with Canadian location data
- Text search across event names, descriptions, venues, and organizers
- Social media share buttons (Facebook, Twitter) and copy link functionality
- "Open in Google Maps" button on event detail pages
- Admin event editing capability (edit any field without rejecting)
- Email notifications for event status changes
- Analytics dashboard with metrics, charts, and recent activity
- Event archiving system (automatically hides past events)
- Archive page for browsing historical events
- "Show Archived" toggle in Browse Events filters

**Enhancements:**
- Expanded accessibility fields from 3 to 5 categories (40+ fields total)
- Added "Not Relevant" option for accessibility fields
- Changed terrain field from radio buttons to dropdown with specific options
- Changed parking distance field from radio buttons to dropdown with time-based options
- Made organizer name mandatory
- Made either email OR phone mandatory for organizer contact
- Added checkbox to control public display of organizer information
- Updated event detail page layout with improved accessibility display
- Enhanced admin dashboard with edit button and better event card layout
- Improved mobile responsiveness across all pages

**Bug Fixes:**
- Fixed nested anchor tag errors in Header and Footer components
- Fixed Select component empty value errors in BrowseEvents
- Fixed boolean rendering issues (zeros appearing around tags)
- Fixed form validation for organizer contact information

### Version 1.0 (December 18, 2025)

**Initial Release:**
- Event browsing with filtering by location, date, age groups, cost, and event types
- Basic accessibility filtering (3 categories)
- Public event submission form
- Admin moderation dashboard (approve, reject, request clarification)
- Event detail pages with comprehensive information display
- Email notification to admin on new event submission
- User authentication with Manus OAuth
- Role-based access control (admin vs regular users)
- Responsive design for mobile and desktop

---

**End of User Manual**

For additional support or feature requests, visit https://help.manus.im or contact the platform administrator.
