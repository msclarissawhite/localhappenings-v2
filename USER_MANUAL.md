# Local Happenings - User Manual & Testing Guide

**Version:** 1.0  
**Last Updated:** December 18, 2025  
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

**Local Happenings** is a community-first events platform designed to help families and individuals discover accessible, inclusive activities in Nova Scotia. The platform prioritizes transparency and accessibility information, allowing event organizers to submit "Unknown" for fields they cannot confirm while still providing valuable information to the community.

### Core Features

The platform includes advanced filtering by location, date, age groups, and accessibility criteria. Public users can submit events through a comprehensive form that includes mandatory accessibility information. Administrators review submissions through a moderation dashboard before events are published. The system automatically sends email notifications to admins when new events are submitted.

### Technology Stack

The application is built with **React 19**, **TypeScript**, **tRPC**, **Drizzle ORM**, and **MySQL/TiDB**. It uses **Tailwind CSS** for styling and **shadcn/ui** for UI components. Authentication is handled through Manus OAuth with role-based access control.

---

## Getting Started

### Accessing the Platform

Navigate to your deployed URL or local development server. The homepage displays the main hero section with two primary call-to-action buttons: **Browse Events** and **Submit an Event**. The navigation header provides access to Browse Events, Submit Event, and Admin (visible only to admin users).

### First-Time Setup

When you first access the platform, you will need to log in using the Manus OAuth system. Your account will automatically be created with a **user** role. To access admin features, your role must be manually upgraded to **admin** in the database. This can be done through the Database panel in the Manus Management UI or by running a SQL query directly.

To promote a user to admin, navigate to the Database panel in the Management UI, find the users table, locate your user record by email or openId, and change the role field from "user" to "admin". Alternatively, you can execute the following SQL query:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## User Roles & Permissions

### Public Visitors (Unauthenticated)

Public visitors can browse published events with full access to the filtering system. They can view detailed event pages including accessibility information and submit events through the public submission form. However, they cannot access the admin dashboard or modify existing events.

### Authenticated Users

Authenticated users have the same permissions as public visitors. The primary benefit of authentication is that their submissions are tracked by user ID, which may be useful for future features such as managing their own submissions.

### Administrators

Administrators have full access to all features. They can view the pending events queue in the admin dashboard, approve, reject, or request clarification on submitted events, and access all published and pending events. The admin role is required to moderate event submissions before they appear publicly.

---

## Feature Guide

### Browsing Events

The Browse Events page provides comprehensive filtering options to help users find relevant activities. Users can apply quick toggles for common filters including Today, Free, Family-Friendly, Young Children (0-5), Indoor, and Outdoor. These toggles provide instant filtering without opening the advanced filters panel.

For more specific searches, the Advanced Filters panel organizes options into three categories. **Location filters** allow selection by province, city, and neighborhood. **Age group filters** include options for Kids (6-12), Teens, and Seniors. The **Sort By** option allows users to order results by Soonest or Name (A-Z).

Each event card displays key information including the event name, date, location, cost (with "FREE" highlighted), and relevant badges such as Family-Friendly, age suitability, and Indoor/Outdoor indicators. Clicking any event card navigates to the detailed event page.

### Submitting Events

The event submission form is organized into seven sections to make the process clear and manageable.

**Basic Information** requires the event name, description, start date and time, and optional time of day (Morning, Afternoon, Evening, All Day).

**Location** fields include province, city, neighborhood (optional), venue name (optional), and address (optional). While only province and city are required, providing complete location information helps users find events more easily.

**Cost** information starts with a checkbox for free events. If the event is not free, organizers can specify minimum and maximum cost in dollars. Additional options include indicating if kids attend free or if free companion/support worker tickets are available.

**Age Suitability** checkboxes allow organizers to indicate if the event is suitable for Family-Friendly, Young Children (0-5), Kids (6-12), Teens, or Seniors. Multiple options can be selected.

**Environment** checkboxes indicate whether the event is Indoor, Outdoor, or both.

**Accessibility Information** is the most detailed section and is mandatory. However, "Unknown" is always an acceptable answer for any field. The section is divided into three categories:

**Caregiver & Infant Accessibility** includes questions about change tables, nursing/breastfeeding friendliness, and space for strollers. Each field has three options: Yes, No, or Unknown.

**Mobility & Physical Access** covers wheelchair accessible entrance, step-free entry, and accessible washrooms.

**Sensory & Neurodivergent Accessibility** addresses loud noises expected, flashing lights, and quiet room/break space availability.

Each accessibility field includes a tooltip icon that explains what the question means and why it matters. This helps submitters understand what information to provide.

**Organizer Information** is optional but recommended. Fields include organization/contact name and contact email. This information helps users reach out with questions.

**Additional Notes** provides a free-form text area for any other important information such as weather dependency, registration requirements, or special instructions.

After completing the form, clicking **Submit Event** sends the submission to the admin moderation queue. The submitter receives a confirmation message indicating that the event will be reviewed before publication.

### Viewing Event Details

Event detail pages are organized into scannable sections for easy information retrieval.

**What It Is** displays the full event description in readable paragraphs.

**When & Where** shows the date and time formatted as "Day, Month Date, Year at Time", the venue name and address if provided, and the location hierarchy (neighborhood, city, province). It also indicates whether the event is Indoor, Outdoor, or both.

**Cost** clearly displays "FREE" for free events or shows the price range for paid events. Additional cost information such as "Kids attend free" or "Free companion/support worker ticket" is displayed when applicable.

**Accessibility & Logistics** presents all accessibility information in an organized format. Each category (Caregiver & Infant, Mobility & Physical Access, Sensory & Neurodivergent) is displayed with individual fields showing Yes, No, or Unknown badges. The section includes explanatory text: "Accessibility information helps families plan with confidence. 'Unknown' means the organizer hasn't confirmed this detail yet."

**Organizer Information** displays the organization name, type (if provided), email (as a clickable mailto link), phone (as a clickable tel link), and website (as an external link).

**Additional Notes** shows any extra information provided by the organizer.

A **Back to Events** button at the top of the page allows easy navigation back to the browse page.

### Admin Dashboard

The admin dashboard is accessible only to users with the admin role. It displays all events with a status of "pending" in reverse chronological order (newest first).

Each pending event card shows the event name, date, location, cost indicator, venue and organizer information, age groups and environment, a note about accessibility information being provided or not, additional notes if any, and the submission timestamp.

Three action buttons are available for each event:

**Approve** (green button with checkmark) publishes the event immediately, making it visible to all users. Admins can optionally add internal notes.

**Need Info** (yellow button with alert icon) marks the event as "needs-clarification" and allows the admin to specify what information is missing or unclear. This status keeps the event in the pending queue.

**Reject** (red button with X icon) marks the event as "rejected" and removes it from the pending queue. Admins should provide a reason for rejection.

When an admin clicks any action button, a confirmation dialog appears requesting optional notes or required explanations depending on the action. After confirming, the event status is updated and the admin receives a success notification.

When there are no pending events, the dashboard displays a friendly message: "All caught up! There are no pending events to review."

---

## Testing Checklist

### Pre-Launch Testing

Before publishing your site, complete the following tests to ensure all features work correctly.

#### Public User Flow

1. **Homepage**: Visit the homepage and verify that the hero section displays correctly, both call-to-action buttons (Browse Events, Submit an Event) are functional, and the "Why Local Happenings?" section with feature cards is visible.

2. **Browse Events - Empty State**: Navigate to Browse Events and confirm that the empty state message displays when no events exist, and the "Clear Filters" button appears if filters are applied.

3. **Event Submission**: Click "Submit an Event" and test the form by filling in all required fields (name, description, province, city, start date), setting the event as free, selecting age groups and environment, completing the accessibility section (test all three response options: Yes, No, Unknown), and submitting the form. Verify that a success message appears and you are redirected to Browse Events.

4. **Accessibility Tooltips**: Hover over the info icons in the accessibility section and confirm that tooltips display helpful explanations for each field.

5. **Form Validation**: Attempt to submit the form with missing required fields and verify that appropriate error messages appear.

#### Admin Flow

1. **Admin Access**: Log in with an admin account and verify that the "Admin" link appears in the navigation header.

2. **Pending Events Queue**: Navigate to the admin dashboard and confirm that your test submission from the public flow appears in the pending queue with all submitted information displayed correctly.

3. **Event Approval**: Click "Approve" on a pending event, optionally add notes, confirm the action, and verify that a success notification appears. Navigate to Browse Events and confirm the approved event now appears in the list.

4. **Event Rejection**: Submit another test event, navigate to the admin dashboard, click "Reject", provide a reason, confirm, and verify the event disappears from the pending queue and does not appear in Browse Events.

5. **Request Clarification**: Submit a third test event, click "Need Info", specify what needs clarification, confirm, and verify the event remains in the pending queue with the updated status.

#### Filtering & Search

1. **Quick Toggles**: On the Browse Events page, test each quick toggle button (Today, Free, Family-Friendly, Young Children, Indoor, Outdoor) and verify that the event list updates accordingly.

2. **Advanced Filters**: Open the Advanced Filters panel and test location filtering by province and city, age group checkboxes, and sort options (Soonest, Name A-Z). Verify that multiple filters can be applied simultaneously.

3. **Clear Filters**: Apply several filters, then click "Clear All" and verify that all filters are reset and the full event list is displayed.

4. **Filter Counter**: Apply multiple filters and verify that the filter count badge displays the correct number of active filters.

#### Event Detail Page

1. **Navigation**: Click on an event card from Browse Events and verify that the detail page loads correctly with all information displayed.

2. **Accessibility Display**: Verify that accessibility information is organized by category with Yes/No/Unknown badges displayed correctly.

3. **Back Button**: Click the "Back to Events" button and verify that you return to the Browse Events page.

4. **External Links**: If the event has organizer contact information, test that email links open the mail client, phone links initiate calls on mobile devices, and website links open in a new tab.

#### Responsive Design

1. **Mobile Navigation**: Resize your browser to mobile width (or use a mobile device) and verify that the hamburger menu icon appears, clicking it opens the mobile navigation drawer, all navigation links are accessible, and clicking a link closes the drawer.

2. **Mobile Forms**: Test the event submission form on mobile and verify that all fields are accessible and usable, date/time pickers work correctly, and the form can be submitted successfully.

3. **Mobile Event Cards**: Verify that event cards stack vertically on mobile and all information remains readable.

#### Authentication & Permissions

1. **Logged Out State**: Log out and verify that you can still browse events and view event details, submit events (tracked as anonymous), but cannot access the admin dashboard (attempting to navigate to /admin shows an access denied message).

2. **Non-Admin User**: Log in with a regular user account (role: user) and verify that the "Admin" link does not appear in navigation and attempting to access /admin directly shows an access denied message.

3. **Admin User**: Log in with an admin account and verify that the "Admin" link appears and the admin dashboard is accessible.

#### Email Notifications

1. **Submission Notification**: Submit a test event and check that the admin receives an email notification with the event name and location. Note that email notifications are sent to the project owner's email address configured in the Manus platform.

### Post-Launch Monitoring

After launching your site, monitor the following areas regularly.

**Database Growth**: Check the number of events in the database weekly. Monitor for spam submissions or duplicate events.

**Admin Queue**: Review the pending events queue daily to ensure timely moderation. Aim to approve or reject events within 24-48 hours of submission.

**User Feedback**: Collect feedback from event organizers and attendees about the submission process, accessibility information usefulness, and filtering effectiveness.

**Error Logs**: Monitor server logs for errors or warnings. Pay special attention to database connection issues and failed email notifications.

**Performance**: Monitor page load times, especially on the Browse Events page as the number of events grows. Consider implementing pagination if the event list becomes very long.

---

## Admin Workflow

### Daily Moderation Routine

Administrators should establish a consistent moderation routine to ensure timely event publication. A recommended daily workflow includes the following steps.

**Morning Review**: Log into the admin dashboard and check for new pending events. Review each submission for completeness and accuracy. Prioritize events with upcoming dates.

**Quality Check**: Verify that event information is clear and accurate. Ensure accessibility information is provided (even if marked as "Unknown"). Check for spam or inappropriate content. Confirm that location information is valid.

**Decision Making**: For complete and appropriate submissions, click "Approve" to publish immediately. For submissions missing critical information, click "Need Info" and specify what needs clarification. For spam, duplicates, or inappropriate content, click "Reject" with a brief reason.

**Follow-Up**: If you requested clarification, check back in 24-48 hours to see if the organizer has resubmitted with updated information. Consider reaching out directly via email if contact information is provided.

### Approval Guidelines

When reviewing events, consider the following approval criteria.

**Required Information**: The event must have a clear name and description, valid location (at minimum, province and city), a start date, and cost information (free or price range).

**Accessibility Section**: The accessibility section must be completed. "Unknown" is acceptable for all fields, but the section cannot be left blank.

**Appropriate Content**: The event must be suitable for a community platform. No hate speech, discrimination, or illegal activities. No purely commercial advertisements (events can be hosted by businesses but must offer community value).

**Accuracy**: Location and date information should be verifiable. If something seems incorrect, use "Need Info" to request clarification.

### Rejection Guidelines

Events should be rejected in the following circumstances: spam or automated submissions, duplicate events (check if the same event has already been published), purely commercial advertisements with no community value, events promoting illegal activities or discrimination, events with completely fabricated or nonsensical information.

When rejecting an event, always provide a clear reason in the notes field. This helps organizers understand why their submission was not approved and how they can improve future submissions.

### Communication Best Practices

When using the "Need Info" status, be specific about what information is missing or unclear. Use friendly, helpful language rather than critical or demanding tone. Provide examples of what you're looking for when possible. Set reasonable expectations for response time.

Example of good clarification request: "Thanks for submitting this event! Could you please clarify the venue address? You mentioned 'downtown Halifax' but we need a specific street address or venue name to help families find the event. Also, do you know if the venue has wheelchair access? Even if you're not sure, marking it as 'Unknown' is helpful."

---

## Database Management

### Accessing the Database

The database can be accessed through two methods. The **Manus Management UI** provides a Database panel with a visual interface for viewing and editing records. You can browse tables, filter records, and make updates without writing SQL. The **Direct SQL** method is available through the Management UI's SQL query interface or by using the `webdev_execute_sql` tool during development.

### Common Database Operations

#### Promoting a User to Admin

To grant admin access to a user, locate their record in the users table and update the role field:

```sql
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';
```

You can also use openId if you know it:

```sql
UPDATE users SET role = 'admin' WHERE openId = 'abc123xyz';
```

#### Viewing All Pending Events

To see all events awaiting moderation:

```sql
SELECT id, name, city, province, status, createdAt 
FROM events 
WHERE status = 'pending' 
ORDER BY createdAt DESC;
```

#### Bulk Approving Events

If you need to approve multiple events at once (use cautiously):

```sql
UPDATE events SET status = 'published' WHERE status = 'pending' AND createdAt > '2025-12-01';
```

#### Finding Events by Location

To see all events in a specific city:

```sql
SELECT name, startDate, venue, status 
FROM events 
WHERE city = 'Halifax' 
ORDER BY startDate ASC;
```

#### Deleting Spam Events

To permanently remove spam submissions:

```sql
DELETE FROM events WHERE status = 'rejected' AND name LIKE '%spam%';
```

**Warning**: Deletions are permanent. Consider keeping rejected events for a period to track spam patterns.

### Database Schema Reference

The **users** table contains user authentication and profile information. Key fields include id (primary key), openId (Manus OAuth identifier), name, email, role (enum: 'user' or 'admin'), createdAt, updatedAt, and lastSignedIn.

The **events** table stores all event information. Important fields include id (primary key), name, description, province, city, neighborhood, venue, address, startDate, endDate, timeOfDay (enum: 'morning', 'afternoon', 'evening', 'all-day'), isFree (boolean), costMin and costMax (integers in cents), familyFriendly, youngChildren, kids, teens, seniors (all boolean), isIndoor and isOutdoor (boolean), accessibility (JSON string containing detailed accessibility data), status (enum: 'pending', 'published', 'rejected', 'needs-clarification'), organizerName, organizerEmail, organizerPhone, organizerWebsite, organizerType, notes, submittedBy (foreign key to users.id), reviewNotes, imageUrl, kidsFree, freeCompanion, createdAt, and updatedAt.

The **accessibility JSON structure** follows this format:

```json
{
  "caregiver": {
    "changeTablesPresent": "yes|no|unknown",
    "nursingFriendly": "yes|no|unknown",
    "strollerSpace": "yes|no|unknown"
  },
  "mobility": {
    "wheelchairEntrance": "yes|no|unknown",
    "stepFreeEntry": "yes|no|unknown",
    "accessibleWashrooms": "yes|no|unknown"
  },
  "sensory": {
    "loudNoises": "yes|no|unknown",
    "flashingLights": "yes|no|unknown",
    "quietRoom": "yes|no|unknown"
  },
  "cognitive": {},
  "social": {}
}
```

### Backup Recommendations

Regular database backups are essential for data protection. The Manus platform automatically backs up your database, but you should also export important data periodically. You can export the events table monthly to CSV through the Management UI, save user data separately if you have custom user profiles, and keep a local copy of approved events for reference.

---

## Troubleshooting

### Common Issues

**Issue: Admin link not appearing in navigation**

**Solution**: Verify that your user account has role = 'admin' in the database. Log out and log back in after changing the role. Clear your browser cache if the link still doesn't appear.

**Issue: Events not appearing after approval**

**Solution**: Verify that the event status is 'published' in the database. Check that the startDate is not in the past (past events may be filtered out). Refresh the Browse Events page or clear filters.

**Issue: Email notifications not being received**

**Solution**: Check the spam folder for notification emails. Verify that the project owner email is correctly configured in Manus. Note that email notifications are sent to the project owner, not to individual admins.

**Issue: Filters not working correctly**

**Solution**: Clear all filters and try again. Check the browser console for JavaScript errors. Verify that events in the database have the correct field values (e.g., isFree = true for free events).

**Issue: Form submission fails**

**Solution**: Check that all required fields are filled in (name, description, province, city, startDate). Verify that the date is in the future. Ensure the accessibility section is completed (even if all fields are "Unknown"). Check the browser console for validation errors.

**Issue: Mobile menu not opening**

**Solution**: Clear browser cache and reload the page. Try a different browser to rule out browser-specific issues. Check that JavaScript is enabled in the browser.

### Getting Help

If you encounter issues not covered in this manual, you can access support through the following channels. Check the browser console for error messages (F12 or right-click → Inspect → Console tab). Review server logs in the Manus Management UI under the Dashboard panel. Submit a support request at https://help.manus.im with a detailed description of the issue, steps to reproduce, and any error messages.

### Performance Optimization

As your event database grows, you may need to implement performance optimizations. Consider adding pagination to the Browse Events page when you have more than 100 events. Implement caching for frequently accessed data such as location lists. Add database indexes on commonly filtered fields (city, province, startDate, status). Archive old events (past events that are no longer relevant) to a separate table.

---

## Appendix: Quick Reference

### User Roles Summary

| Role | Can Browse | Can Submit | Can Moderate | Can Access Admin |
|------|-----------|-----------|--------------|------------------|
| Public | ✓ | ✓ | ✗ | ✗ |
| User | ✓ | ✓ | ✗ | ✗ |
| Admin | ✓ | ✓ | ✓ | ✓ |

### Event Status Workflow

```
Submitted → pending → [Admin Review] → published (visible to public)
                                    → rejected (hidden)
                                    → needs-clarification (stays in queue)
```

### Key URLs

- **Homepage**: `/`
- **Browse Events**: `/browse`
- **Submit Event**: `/submit`
- **Event Detail**: `/event/:id`
- **Admin Dashboard**: `/admin`

### Contact & Support

For questions about using Local Happenings or to report issues, visit the Manus support portal at https://help.manus.im.

---

**End of Manual**

This manual will be updated as new features are added to the platform. Keep this document accessible for reference and share it with team members who need to understand how to use and test the system.
