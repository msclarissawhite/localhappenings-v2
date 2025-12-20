# CSV Bulk Import Guide for Local Happenings

**Version 1.0** | **Last Updated:** December 20, 2024

This guide explains how to use the CSV bulk import feature to add multiple events to Local Happenings at once. This feature is available only to administrators and is useful for importing seasonal events, recurring activities, or migrating data from other systems.

---

## Overview

The CSV bulk import feature allows administrators to upload a properly formatted CSV file containing multiple events. All events in the CSV are automatically published to the site without requiring individual review.

**Key Features:**

- Import unlimited events in a single upload
- All events are published immediately with "published" status
- Events automatically sync to ClickUp for tracking
- Preview events before confirming import
- Comprehensive error reporting for invalid data

---

## Accessing the Bulk Import Feature

Navigate to the **Admin Dashboard** and click the **"Bulk Upload CSV"** button in the Events tab. This opens the bulk import dialog where you can select your CSV file.

---

## CSV File Format

### Required Template

Use the provided template file `event_upload_template.csv` located in the project root directory. This file contains all required column headers in the correct order.

**Column Headers (in order):**

```
name,description,province,municipality,neighborhoodCommunity,venue,address,startDate,startTime,endDate,endTime,timeOfDay,isRecurring,recurrenceType,isFree,costMin,costMax,costType,kidsFree,freeCompanion,allAges,familyFriendly,youngChildren,kids,teens,adultsOnly,seniors,isIndoor,isOutdoor,shortDuration,dropIn,canReenter,changeTable,changeTableLocations,nursingRoom,strollerAccessible,strollerParking,familyWashroom,wheelchairAccessible,accessibleParking,parkingDistance,elevatorLift,accessibleWashrooms,washroomAvailability,seatingAvailable,terrain,noiseLevel,lighting,quietSpace,scentFree,visualSchedules,clearSignage,aslInterpreter,multilingualSupport,sensoryFriendly,serviceAnimalsWelcome,crowdingLevel,flexibleParticipation,organizerName,organizerType,organizerEmail,organizerPhone,organizerWebsite,displayOrganizerInfo,notes,imageUrl
```

### Field Specifications

#### Basic Information (Required)

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `name` | Text | "Winter Carnival" | Event name (required) |
| `description` | Text | "Join us for ice skating..." | Full description (required) |
| `province` | Text | "Nova Scotia" | Must match province list exactly |
| `municipality` | Text | "Halifax" | City/town/municipality (required) |
| `neighborhoodCommunity` | Text | "North End" | Optional |

#### Location Details (Optional)

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `venue` | Text | "Halifax Common" | Venue name |
| `address` | Text | "5775 Spring Garden Rd, Halifax, NS" | Full street address |

#### Date & Time

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `startDate` | YYYY-MM-DD | "2025-01-15" | **Required** |
| `startTime` | HH:MM | "10:00" | Optional (24-hour format) |
| `endDate` | YYYY-MM-DD | "2025-01-17" | **For multi-day events** (e.g., 3-day festival). Leave blank for single-day events. |
| `endTime` | HH:MM | "15:00" | Optional (24-hour format) |
| `timeOfDay` | Text | "morning", "afternoon", "evening", "all-day" | Optional |

**Multi-Day Event Example:**
- A weekend festival running Friday-Sunday would have `startDate=2025-07-18` and `endDate=2025-07-20`
- The platform automatically calculates and displays "3-day event"
- For single-day events, leave `endDate` blank or set it equal to `startDate`

#### Recurring Events

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `isRecurring` | 0 or 1 | 1 | 1 = recurring, 0 = one-time |
| `recurrenceType` | Text | "weekly", "monthly", "one-time" | Required if isRecurring=1 |

#### Cost Information

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `isFree` | 0 or 1 | 1 | 1 = free event, 0 = paid |
| `costMin` | Number (cents) | 2000 | $20.00 = 2000 cents |
| `costMax` | Number (cents) | 5000 | $50.00 = 5000 cents |
| `costType` | Text | "fixed", "range", "donation" | Optional |
| `kidsFree` | 0 or 1 | 1 | Kids attend free |
| `freeCompanion` | 0 or 1 | 0 | Free companion ticket |

**Important:** All cost values are in **cents** (not dollars). $15.00 = 1500 cents.

#### Age Groups (0 = no, 1 = yes)

| Field | Format | Example |
|-------|--------|---------|
| `allAges` | 0 or 1 | 1 |
| `familyFriendly` | 0 or 1 | 1 |
| `youngChildren` | 0 or 1 | 1 |
| `kids` | 0 or 1 | 1 |
| `teens` | 0 or 1 | 0 |
| `adultsOnly` | 0 or 1 | 0 |
| `seniors` | 0 or 1 | 0 |

#### Environment (0 = no, 1 = yes)

| Field | Format | Example |
|-------|--------|---------|
| `isIndoor` | 0 or 1 | 1 |
| `isOutdoor` | 0 or 1 | 0 |
| `shortDuration` | 0 or 1 | 1 |
| `dropIn` | 0 or 1 | 1 |
| `canReenter` | 0 or 1 | 0 |

#### Accessibility Fields

Most accessibility fields use the following format:

| Value | Meaning |
|-------|---------|
| `yes` | Feature is available |
| `no` | Feature is not available |
| `unknown` | Not confirmed yet |
| `not-relevant` | Doesn't apply to this event |

**Special Accessibility Fields:**

- `changeTableLocations`: "mens", "womens", "gender-neutral", "family", "multiple", "unknown", "not-relevant"
- `washroomAvailability`: Comma-separated list (e.g., "mens,womens,family,wheelchair-accessible")
- `parkingDistance`: "short", "moderate", "long", "unknown", "not-relevant"
- `terrain`: "flat", "gravel", "hills", "paved", "unpaved", "mixed", "unknown", "not-relevant"
- `noiseLevel`: "quiet", "moderate", "loud", "unknown", "not-relevant"
- `lighting`: "natural", "bright", "dim", "adjustable", "unknown", "not-relevant"
- `crowdingLevel`: "low", "moderate", "high", "unknown", "not-relevant"

#### Organizer Information

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `organizerName` | Text | "Halifax Recreation" | **Required** |
| `organizerType` | Text | "nonprofit", "business", "school-library", "municipality", "individual" | Optional |
| `organizerEmail` | Email | "events@halifax.ca" | **Required** (or phone) |
| `organizerPhone` | Text | "(902) 555-0123" | **Required** (or email) |
| `organizerWebsite` | URL | "https://www.halifax.ca" | Optional |
| `displayOrganizerInfo` | 0 or 1 | 1 | Show contact info publicly |

#### Additional Fields

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `notes` | Text | "Bring your own skates..." | Additional information |
| `imageUrl` | URL | "https://example.com/image.jpg" | **Recommended size: 1200×630px (1.91:1 ratio)** for optimal display |

---

## Example CSV File

See `event_upload_example.csv` for a complete working example with six diverse events including:

1. **Winter Carnival** - Single-day community event
2. **Toddler Story Time** - Recurring weekly event
3. **Accessible Art Workshop** - Accessibility-focused event
4. **Farmers Market** - Long-running seasonal event
5. **Summer Music Festival** - **Multi-day event (3 days)** with date range

---

## Import Process

### Step 1: Prepare Your CSV File

1. **Start with the template** - Copy `event_upload_template.csv` and add your event data
2. **Follow the format exactly** - Column order and spelling must match the template
3. **Use the correct data types** - Numbers for costs (in cents), 0/1 for checkboxes, specific text values for dropdowns
4. **Validate dates** - Use YYYY-MM-DD format for all dates
5. **For multi-day events** - Set both `startDate` and `endDate` (e.g., festival from Jan 15-17 would have startDate=2025-01-15, endDate=2025-01-17)
6. **Check accessibility values** - Use only valid options (yes/no/unknown/not-relevant)

### Step 2: Upload the File

1. Navigate to **Admin Dashboard**
2. Click **"Bulk Upload CSV"**
3. Click **"Choose File"** and select your CSV
4. The file will be parsed and validated

### Step 3: Preview Events

The import dialog displays a preview table showing:

- Event name
- Date (with duration for multi-day events, e.g., "Jan 15-17, 2025 • 3-day event")
- Location (municipality, province)
- Cost (Free or price range)
- Organizer name

Review this preview carefully to ensure all data is correct.

### Step 4: Confirm Import

Click **"Import Events"** to add all events to the database. The system will:

1. Create all events with "published" status
2. Sync each event to ClickUp for tracking
3. Display a success message with the count of imported events

---

## Common Errors and Solutions

### Error: "Missing required field: name"

**Cause:** The `name` column is empty for one or more events.

**Solution:** Ensure every event has a name in the CSV.

### Error: "Invalid date format"

**Cause:** Dates are not in YYYY-MM-DD format.

**Solution:** Change dates to match the required format (e.g., "2025-01-15").

### Error: "Invalid cost value"

**Cause:** Cost values are in dollars instead of cents, or contain non-numeric characters.

**Solution:** Convert dollars to cents (e.g., $20.00 → 2000) and remove currency symbols.

### Error: "Invalid accessibility value"

**Cause:** An accessibility field contains a value other than yes/no/unknown/not-relevant.

**Solution:** Check all accessibility fields and use only valid options.

### Error: "Missing organizer contact"

**Cause:** Both `organizerEmail` and `organizerPhone` are empty.

**Solution:** Provide at least one contact method (email or phone).

### Error: "Invalid province"

**Cause:** Province name doesn't match the exact spelling in the system.

**Solution:** Use exact province names: "Nova Scotia", "Ontario", "British Columbia", etc.

---

## Tips for Successful Imports

### Data Preparation

Prepare your data in a spreadsheet application (Excel, Google Sheets) and export as CSV. This makes it easier to manage columns and validate data before import.

### Test with Small Batches

Start with a small CSV file (5-10 events) to test your format before importing hundreds of events. This helps catch formatting errors early.

### Use the Example File

Copy rows from `event_upload_example.csv` and modify them for your events. This ensures you're using the correct format and valid values.

### Accessibility Completeness

The more accessibility fields you complete, the more useful your events are to families. Use "unknown" rather than leaving fields blank if you're unsure.

### Multi-Day Events

For festivals, camps, or exhibitions spanning multiple days, always set both `startDate` and `endDate`. The platform will automatically show the duration (e.g., "3-day event") on event cards and detail pages.

### Image URLs

If you're including event images, ensure the URLs are publicly accessible and point directly to image files (JPG or PNG). Images should be 1200×630px (1.91:1 aspect ratio) for optimal display on both desktop and mobile devices.

---

## After Import

Once events are imported:

- **Check the Browse Events page** to see your events live
- **Review event detail pages** to ensure all information displays correctly
- **Verify ClickUp sync** by checking your ClickUp list for new tasks
- **Test filters** to ensure events appear in the correct location/date/accessibility filters

---

## Exporting Events

To create a backup or download all events for editing:

1. Navigate to **Admin Dashboard**
2. Click **"Download All Events"**
3. A CSV file will download containing all events in the database

This export file uses the same format as the import template, so you can edit it and re-import if needed.

---

## Support

If you encounter issues with CSV imports:

1. **Validate your CSV format** - Ensure column headers match exactly
2. **Check the example file** - Compare your CSV to `event_upload_example.csv`
3. **Review error messages** - The import dialog provides specific error details
4. **Test with a single event** - Create a CSV with just one event to isolate formatting issues

---

**Last Updated:** December 20, 2024 | **Author:** Manus AI
