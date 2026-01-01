# CSV Bulk Import Guide for Local Happenings

**Version 2.1** | **Last Updated:** January 1, 2026

This guide explains how to use the CSV bulk import feature to add multiple events to Local Happenings at once. This feature is available only to administrators and is useful for importing seasonal events, recurring activities, or migrating data from other systems.

---

## Overview

The CSV bulk import feature allows administrators to upload a properly formatted CSV file containing multiple events. You can also upload a **ZIP file** containing both the CSV and event images for bulk import with photos.

**Key Features:**

- Import unlimited events in a single upload
- Upload ZIP files with CSV + event images for bulk photo import
- All events are published immediately with "published" status
- Events automatically sync to ClickUp for tracking
- Images automatically processed and optimized (1200×630px)
- Preview events before confirming import
- Comprehensive error reporting for invalid data

---

## Accessing the Bulk Import Feature

Navigate to the **Admin Dashboard** and click the **"Bulk Upload CSV"** button in the Events tab. This opens the bulk import dialog where you can select your CSV or ZIP file.

**Two Upload Options:**

1. **CSV Only** - Upload just the CSV file if events don't have images or you'll add images later
2. **ZIP with Images** - Upload a ZIP archive containing both the CSV file and event image files

---

## CSV File Format

### Required Template

Use the provided template file `event_upload_template.csv` located in the project root directory. This file contains all required column headers in the correct order.

**Column Headers (in order):**

```
name,description,province,municipality,neighborhoodCommunity,venue,address,startDate,startTime,endDate,endTime,duration,timeOfDay,isRecurring,recurrenceType,seriesId,isFree,costMin,costMax,costType,kidsFree,freeCompanion,allAges,familyFriendly,youngChildren,kids,teens,adults,adultsOnly,seniors,isIndoor,isOutdoor,isMixed,shortDuration,dropIn,canReenter,organizerName,organizerType,organizerEmail,organizerPhone,organizerWebsite,displayOrganizerInfo,publicContactName,publicContactEmail,publicContactPhone,notes,imageUrl,eventTypeIds,accessibility
```

**Key Changes in Version 2.0:**
- **Added** `startTime` and `endTime` fields for precise event timing (HH:MM format)
- **Added** `duration` field for human-readable duration text (e.g., "2 hours", "3 days")
- **Added** `adults` field for general adult audience (separate from adultsOnly)
- **Added** `isMixed` field for events that are both indoor and outdoor
- **Added** `publicContactName`, `publicContactEmail`, `publicContactPhone` for separate public contact info
- **Added** `eventTypeIds` for event type tags (comma-separated IDs)
- Individual accessibility columns consolidated into single `accessibility` JSON field

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
| `startTime` | HH:MM | "10:00" | 24-hour format. Optional but recommended for precise timing |
| `endDate` | YYYY-MM-DD | "2025-01-17" | **For multi-day events** (e.g., 3-day festival). Leave blank for single-day events. |
| `endTime` | HH:MM | "15:00" | 24-hour format. Optional |
| `duration` | Text | "5 hours", "3 days", "90 minutes" | Human-readable duration. Optional |
| `timeOfDay` | Text | "morning", "afternoon", "evening", "all-day" | Optional |

**Multi-Day Event Example:**
- A weekend festival running Friday-Sunday would have `startDate=2025-07-18` and `endDate=2025-07-20`
- The platform automatically calculates and displays "3-day event"
- For single-day events, leave `endDate` blank or set it equal to `startDate`

#### Recurring Events & Series

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `isRecurring` | 0 or 1 | 1 | 1 = recurring, 0 = one-time |
| `recurrenceType` | Text | "weekly", "monthly", "one-time" | Required if isRecurring=1 |
| `seriesId` | Integer | 5001 | **NEW:** Links events to an existing series. Leave blank to create a new series automatically. See "Series ID Usage" section below. |

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

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `allAges` | 0 or 1 | 1 | Suitable for all ages |
| `familyFriendly` | 0 or 1 | 1 | Family-friendly event |
| `youngChildren` | 0 or 1 | 1 | Ages 0-5 |
| `kids` | 0 or 1 | 1 | Ages 6-12 |
| `teens` | 0 or 1 | 0 | Ages 13-17 |
| `adults` | 0 or 1 | 1 | General adult audience (18+) |
| `adultsOnly` | 0 or 1 | 0 | Adults only (no children) |
| `seniors` | 0 or 1 | 0 | Senior-focused event |

#### Environment (0 = no, 1 = yes)

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `isIndoor` | 0 or 1 | 1 | Event is indoors |
| `isOutdoor` | 0 or 1 | 0 | Event is outdoors |
| `isMixed` | 0 or 1 | 0 | **NEW:** Event is both indoor AND outdoor (e.g., festival with indoor and outdoor areas) |
| `shortDuration` | 0 or 1 | 1 | Under 2 hours |
| `dropIn` | 0 or 1 | 1 | Drop-in allowed |
| `canReenter` | 0 or 1 | 0 | Can re-enter |

**Environment Logic:**
- For **indoor-only** events: `isIndoor=1, isOutdoor=0, isMixed=0`
- For **outdoor-only** events: `isIndoor=0, isOutdoor=1, isMixed=0`
- For **mixed** events (both indoor and outdoor spaces): `isIndoor=1, isOutdoor=1, isMixed=1`

#### Accessibility Field (JSON Format)

The `accessibility` field stores all accessibility information as a JSON object with five categories:

**Format:** JSON string containing nested objects for each category

**Categories:**
1. `caregiver` - Diaper changing, nursing rooms, stroller access, family washrooms
2. `mobility` - Wheelchair access, parking, terrain, elevators, washrooms
3. `sensory` - Noise levels, lighting, quiet spaces, sensory-friendly features
4. `cognitive` - Clear signage, visual schedules, flexible participation
5. `social` - Service animals, multilingual support, ASL interpreters

**Value Options:** Most fields use: `yes`, `no`, `unknown`, `not-relevant`

**Example JSON:**
```json
{
  "caregiver": {
    "changeTable": "yes",
    "changeTableLocations": "family",
    "nursingRoom": "yes",
    "strollerAccessible": "yes",
    "strollerParking": "yes",
    "familyWashroom": "yes"
  },
  "mobility": {
    "wheelchairAccessible": "yes",
    "accessibleParking": "yes",
    "parkingDistance": "short",
    "elevatorLift": "yes",
    "accessibleWashrooms": "yes",
    "washroomAvailability": ["mens", "womens", "family", "wheelchair-accessible"],
    "seatingAvailable": "yes",
    "terrainInfo": "flat",
    "busStopDistance": "short"
  },
  "sensory": {
    "noiseLevel": "moderate",
    "lighting": "natural",
    "quietSpace": "yes",
    "scentFree": "no",
    "sensoryFriendly": "yes",
    "crowdLevel": "moderate"
  },
  "cognitive": {
    "visualSchedules": "yes",
    "clearSignage": "yes",
    "flexibleParticipation": "yes"
  },
  "social": {
    "aslInterpreter": "no",
    "multilingualSupport": "no",
    "serviceAnimalsWelcome": "yes"
  }
}
```

**For CSV Import:** Provide the entire JSON object as a single escaped string in the `accessibility` column. If unsure, leave blank and add accessibility information through the admin dashboard after import.

#### Organizer Information

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `organizerName` | Text | "Halifax Recreation" | **Required** |
| `organizerType` | Text | "nonprofit", "business", "school-library", "municipality", "individual" | Optional |
| `organizerEmail` | Email | "events@halifax.ca" | **Required** (or phone) |
| `organizerPhone` | Text | "(902) 555-0123" | **Required** (or email) |
| `organizerWebsite` | URL | "https://www.halifax.ca" | Optional |
| `displayOrganizerInfo` | 0 or 1 | 1 | Show contact info publicly |

#### Public Contact Information (Optional)

**NEW in Version 2.0:** Provide separate public contact information if different from organizer account. This is useful when the organizer wants to display a different contact person or department for public inquiries.

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `publicContactName` | Text | "Jane Smith" or "Events Team" | **NEW:** Public-facing contact name (can be person or department) |
| `publicContactEmail` | Email | "events@example.com" | **NEW:** Public contact email (displayed on event page) |
| `publicContactPhone` | Text | "(902) 555-0199" | **NEW:** Public contact phone (displayed on event page) |

**Use Case Example:**
- **Organizer Info** (private): John Doe, john@company.com, (902) 555-1000
- **Public Contact Info** (displayed): Events Team, events@company.com, (902) 555-2000
- This allows the organizer to keep their personal contact private while providing a public-facing contact method.

#### Event Types (Tags)

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `eventTypeIds` | Comma-separated IDs | "30001,30002,30003" or "90005,90006" | **NEW:** Event type tag IDs. Use commas to separate multiple tags (no spaces). See reference table below for complete list. |

**Formatting Rules:**
- Use comma-separated IDs with **no spaces**: `"30001,30002,30003"` ✅
- Do NOT use spaces: `"30001, 30002, 30003"` ❌
- Can assign multiple tags to one event (e.g., a yoga class for kids could be `"90005,30006"` = Yoga + Kids Crafts)
- Leave blank if no specific event type applies

**Event Type ID Reference Table:**

**Total Active Event Types:** 143 organized into 6 categories

> **💡 Tip:** For the complete reference table with all 143 event types, see **REFERENCE_IDS.md**. Below is a quick reference of the most commonly used types.

<details>
<summary><strong>Family & Kids (19 types)</strong></summary>

| ID | Name |
|-----|------|
| 200001 | After-School Programs |
| 200002 | Baby & Me Classes |
| 200003 | Character Meet & Greets |
| 200004 | Drop-In Play Spaces |
| 30008 | Face Painting |
| 200006 | Family Movie Nights |
| 200005 | Family Swim |
| 30006 | Kids Crafts |
| 200007 | Kids Yoga & Movement |
| 200008 | Outdoor Play Meetups |
| 200009 | Parent & Tot Groups |
| 30005 | Petting Zoos / Farms |
| 30007 | Puppet Shows |
| 30001 | Seeing Santa |
| 30003 | Skating |
| 200010 | STEM for Kids |
| 30002 | Storytime / Library Events |
| 200011 | Summer Camps & Day Camps |
| 30004 | Swimming |
</details>

<details>
<summary><strong>Arts & Culture (22 types)</strong></summary>

| ID | Name |
|-----|------|
| 30013 | Art Exhibition |
| 200015 | Art Workshops |
| 90003 | Arts & Crafts |
| 90002 | Cinema |
| 200019 | Comedy Shows |
| 30012 | Concert |
| 200020 | Dance Performances |
| 200023 | Documentary Screenings |
| 200022 | Film Screenings |
| 30014 | Indigenous Events |
| 30009 | Live Music |
| 200018 | Maker Fairs |
| 30015 | Multicultural Festivals |
| 30011 | Opera |
| 200017 | Photography Exhibits & Walks |
| 200016 | Pottery & Ceramics |
| 200021 | Spoken Word & Poetry |
| 30010 | Theatre & Performances |
</details>

<details>
<summary><strong>Community & Social (25 types)</strong></summary>

| ID | Name |
|-----|------|
| 120003 | Board Game Nights |
| 120004 | Book Clubs |
| 120005 | Coffee Meetups |
| 30016 | Community Meetings |
| 120011 | Craft Circles |
| 30017 | Fundraisers & Charity Events |
| 200024 | Happy Hours |
| 120008 | Karaoke |
| 30018 | Language Meetups |
| 200027 | Lecture Series |
| 120006 | Networking Events |
| 200030 | Newcomer & Immigrant Meetups |
| 120009 | Open Mic Nights |
| 120010 | Potlucks |
| 30020 | Pride Events |
| 120002 | Pub Trivia |
| 30019 | Religious / Faith-Based Events |
| 200025 | Singles Mixers |
| 200028 | Skill Shares |
| 200026 | Social Walks |
| 90004 | Socials & Clubs |
| 120007 | Speed Dating |
| 200029 | Study Groups |
| 120001 | Trivia |
| 30021 | Workshops & Classes |
</details>

<details>
<summary><strong>Recreation & Sports (22 types)</strong></summary>

| ID | Name |
|-----|------|
| 200035 | Adult Recreational Leagues |
| 200045 | Camping & Backcountry Trips |
| 200047 | Climbing & Bouldering |
| 200038 | Cycling Rides & Tours |
| 200042 | Disc Golf |
| 90001 | Games/Gaming |
| 200044 | Hiking & Trail Meetups |
| 200032 | Individual Sports (Tennis/Golf/Track) |
| 200046 | Kayaking/Canoeing/Paddleboarding |
| 200049 | Mountain Biking |
| 200041 | Pickleball |
| 200037 | Running Clubs & Fun Runs |
| 200043 | Skateboarding & BMX |
| 200039 | Skating Meetups |
| 200048 | Snow Sports (Ski/Snowboard/Snowshoe) |
| 200040 | Swimming Clubs |
| 200031 | Team Sports (Soccer/Hockey/Baseball) |
| 200033 | Tournaments & Leagues |
| 200050 | Trail Running |
| 200036 | Walking Clubs |
| 200034 | Youth Sports |
</details>

<details>
<summary><strong>Health & Wellness (18 types)</strong></summary>

| ID | Name |
|-----|------|
| 200065 | Acupuncture & Traditional Medicine |
| 200057 | Breathwork |
| 200052 | Dance Fitness (Zumba/etc) |
| 200060 | Grief & Healing Circles |
| 200063 | Herbalism & Natural Health |
| 200064 | Holistic Wellness Fairs |
| 90007 | Meditation |
| 200056 | Mindfulness Sessions |
| 200066 | Nutrition Workshops |
| 200051 | Pilates & Barre |
| 200062 | Reiki & Energy Healing |
| 200055 | Seniors Fitness |
| 200061 | Sound Baths |
| 200058 | Stress & Burnout Support |
| 200054 | Stretching & Mobility |
| 200059 | Support Groups |
| 200053 | Walking for Wellness |
| 90005 | Yoga |
</details>

<details>
<summary><strong>Markets & Festivals (22 types)</strong></summary>

| ID | Name |
|-----|------|
| 200082 | Art Festivals |
| 200068 | Artisan Markets |
| 200075 | Beer/Wine/Cider Festivals |
| 200084 | Community Festivals |
| 200077 | Cultural Festivals |
| 200067 | Farmers' Markets |
| 30026 | Food & Drink |
| 200074 | Food Festivals |
| 200085 | Food Truck Rallies |
| 200083 | Heritage Festivals |
| 200070 | Holiday Markets |
| 200081 | Kids & Family Festivals |
| 200080 | Literary Festivals |
| 200073 | Makers Markets |
| 200076 | Music Festivals |
| 200069 | Night Markets |
| 200072 | Pop-Up Markets |
| 200079 | Seasonal Festivals |
| 200078 | Street Festivals & Block Parties |
| 200086 | Tasting Events |
| 200087 | Vendor Fairs |
| 200071 | Vintage & Thrift Markets |
</details>

<details>
<summary><strong>Seasonal (17 types)</strong></summary>

| ID | Name |
|-----|------|
| 90020 | Canada Day |
| 90025 | Christmas |
| 90019 | Easter |
| 90015 | Fall Events |
| 30027 | Festive Holidays |
| 90018 | Halloween |
| 90016 | Holiday Events |
| 200088 | Holiday Light Displays |
| 200089 | Holiday Shows & Performances |
| 90026 | New Year |
| 200090 | Remembrance Day Events |
| 90013 | Spring Events |
| 90023 | St. Patrick's Day |
| 90014 | Summer Events |
| 90021 | Thanksgiving |
| 90022 | Valentine's Day |
| 90012 | Winter Events |
</details>

**Example:** For a yoga and meditation workshop, use `eventTypeIds` value: `90005,90007`

---

### Series ID Usage

The `seriesId` field links recurring events together for batch management. This is useful when you have multiple instances of the same recurring event (e.g., "Weekly Yoga Class" every Monday).

**Two Options:**

1. **Create New Series (Recommended):** Leave `seriesId` **blank** in your CSV. The system will automatically create a new series and assign the same ID to all instances of that recurring event.

2. **Link to Existing Series:** If adding events to an existing series, specify the `seriesId` explicitly (e.g., `5001`). Find existing series IDs in the admin dashboard under "Event Series" or in the `REFERENCE_IDS.md` document.

**Example CSV - New Series (Leave Blank):**
```csv
name,startDate,seriesId,isRecurring,...
"Weekly Yoga Class",2026-01-06,,1,...
"Weekly Yoga Class",2026-01-13,,1,...
"Weekly Yoga Class",2026-01-20,,1,...
```

**Example CSV - Existing Series:**
```csv
name,startDate,seriesId,isRecurring,...
"Weekly Yoga Class",2026-01-27,5001,1,...
"Weekly Yoga Class",2026-02-03,5001,1,...
```

**Benefits of Series Grouping:**
- Batch edit all events in a series at once
- Batch delete/publish/unpublish series events
- View all instances of a recurring event together
- Easier management of long-running recurring events

**Note:** One-time events (`isRecurring=0`) should always have `seriesId` left blank.

For complete series ID reference and examples, see **REFERENCE_IDS.md**.

#### Additional Fields

| Field | Format | Example | Notes |
|-------|--------|---------|-------|
| `notes` | Text | "Bring your own skates..." | Additional information |
| `imageUrl` | URL | "https://example.com/image.jpg" | **Recommended size: 1200×630px (1.91:1 ratio)** for optimal display. Use this for events with images already hosted online. |
| `imageFileName` | Text | "winter-carnival.jpg" | **For ZIP uploads only.** Filename of image included in ZIP archive. Leave blank if using `imageUrl` or if event has no image. |

**Note:** The platform offers 49 event types across seven categories: Family & Kids, Arts & Culture, Community & Social, Recreation & Sports, Markets & Festivals, Health & Wellness, and Seasonal. Event types can be included in CSV imports using the `eventTypeIds` field with comma-separated type IDs, or added later through the admin dashboard.

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

## ZIP Upload with Images

For bulk imports with event photos, create a ZIP archive containing your CSV file and all image files.

### ZIP File Structure

```
events_import.zip
├── events.csv
├── winter-carnival.jpg
├── summer-festival.png
├── farmers-market.jpg
└── art-walk.webp
```

**Requirements:**

- ZIP must contain exactly **one CSV file** (any name)
- Image files can be JPG, JPEG, PNG, or WebP format
- Images can be in any size - they'll be automatically resized to 1200×630px
- Images can be at the root level or in subdirectories

### Linking Images in CSV

Use the `imageFileName` column to reference image files by their filename:

```csv
name,description,province,municipality,startDate,imageFileName
"Winter Carnival","Annual winter celebration","Nova Scotia","Halifax","2025-02-15","winter-carnival.jpg"
"Summer Festival","Music and food festival","Nova Scotia","Dartmouth","2025-07-20","summer-festival.png"
```

**Important:**

- Filenames are **case-insensitive** ("Image.JPG" matches "image.jpg")
- Use only the filename, not the full path ("photo.jpg" not "images/photo.jpg")
- If an image file isn't found in the ZIP, the event imports without an image
- Leave `imageFileName` blank if the event has no image

### Image Processing

All uploaded images are automatically:

- Resized to exactly 1200×630px (1.91:1 ratio)
- Cropped from the center to fit dimensions
- Converted to JPEG format
- Compressed to 85% quality for fast loading
- Uploaded to cloud storage with unique URLs

**File Size:** Original images can be up to 5MB each. After processing, they're typically 100-300KB.

### Example ZIP Upload

1. Create your CSV file with event data and `imageFileName` column
2. Collect all event photos in one folder
3. Select both the CSV and all images, then "Compress" or "Create Archive"
4. Upload the ZIP file via Admin Dashboard → Bulk Upload CSV
5. Preview shows events with image thumbnails
6. Click "Import" to publish all events with photos

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

**Last Updated:** December 31, 2025 | **Version:** 2.0

---

## For AI Assistants & Custom GPTs

This section provides structured guidance for AI assistants helping organizers format CSV data for Local Happenings bulk import.

### Quick Reference: Field Requirements

**ALWAYS REQUIRED:**
- `name` - Event name (text)
- `description` - Full description (text)
- `province` - Must match exact spelling from Canadian provinces list
- `municipality` - City/town name (text)
- `startDate` - YYYY-MM-DD format
- `organizerName` - Organizer name (text)
- `organizerEmail` OR `organizerPhone` - At least one required

**RECOMMENDED (improves discoverability):**
- `startTime` - HH:MM 24-hour format (e.g., "14:00" for 2 PM)
- `endTime` - HH:MM 24-hour format
- `duration` - Human-readable text (e.g., "2 hours", "3 days")
- `eventTypeIds` - Comma-separated IDs matching event categories
- `accessibility` - JSON string with accessibility details

**OPTIONAL:**
- All other fields can be left blank

### AI Formatting Rules

When helping users convert unstructured event data to CSV format:

1. **Date Conversion:**
   - Convert "January 15, 2025" → `2025-01-15`
   - Convert "Jan 15" → `2025-01-15` (infer current/next year)
   - Convert "15/01/2025" → `2025-01-15`

2. **Time Conversion:**
   - Convert "2 PM" → `14:00`
   - Convert "10:30 AM" → `10:30`
   - Convert "noon" → `12:00`
   - If only start time given, leave endTime blank

3. **Duration Parsing:**
   - Extract from phrases like "2-hour workshop" → `2 hours`
   - Multi-day events: calculate from dates (e.g., Jan 15-17 → `3 days`)
   - Use natural language: "90 minutes", "half day", "all weekend"

4. **Cost Conversion:**
   - Convert "$20" → `2000` (cents)
   - Convert "$15-$25" → `costMin=1500, costMax=2500, costType=range`
   - "Free" → `isFree=1, costMin=, costMax=`
   - "Donation" → `isFree=0, costType=donation`
   - "Pay what you can" → `isFree=0, costType=pay-what-you-can`

5. **Boolean Fields (0 or 1):**
   - "Yes", "true", "available" → `1`
   - "No", "false", "not available" → `0`
   - If unclear → leave blank

6. **Age Groups:**
   - "All ages" → `allAges=1`
   - "Family-friendly" → `familyFriendly=1`
   - "Toddlers" or "0-5" → `youngChildren=1`
   - "Kids" or "6-12" → `kids=1`
   - "Teens" or "13-17" → `teens=1`
   - "Adults" or "18+" → `adults=1`
   - "Adults only" or "19+" → `adultsOnly=1`
   - "Seniors" or "55+" → `seniors=1`

7. **Environment:**
   - "Indoor" → `isIndoor=1, isOutdoor=0, isMixed=0`
   - "Outdoor" → `isIndoor=0, isOutdoor=1, isMixed=0`
   - "Indoor and outdoor" → `isIndoor=1, isOutdoor=1, isMixed=1`

8. **Event Type IDs:**
   - Map keywords to IDs from reference table
   - "Yoga class" → `90005`
   - "Kids crafts workshop" → `30006,30021` (Kids Crafts + Workshops)
   - "Live music concert" → `30009,30012` (Live Music + Concert)

9. **Accessibility JSON:**
   - If user provides accessibility details, format as JSON string
   - Use double quotes for JSON keys and values
   - Escape quotes in CSV: `"{""wheelchairAccessible"":""yes""}"`
   - If no details provided, leave blank

### Example Conversions

**User Input:**
```
Winter Carnival on January 15th at Halifax Common. 
10am to 3pm. Free event with activities for all ages.
Contact: events@halifax.ca
```

**AI Output (CSV row):**
```csv
Winter Carnival,"Free winter carnival with activities for all ages",Nova Scotia,Halifax,,Halifax Common,"Halifax Common, Halifax, NS",2025-01-15,10:00,,15:00,5 hours,morning,0,one-time,1,,,,,0,0,1,1,1,1,0,1,0,0,0,1,0,1,1,Halifax Recreation,municipality,events@halifax.ca,,,1,,,,"",,,""
```

**User Input:**
```
Yoga class every Wednesday, 6-7:30pm at Community Center.
$15 per class. Adults only. Wheelchair accessible.
```

**AI Output (CSV row):**
```csv
Weekly Yoga Class,"Join us for a relaxing yoga session every Wednesday evening",Nova Scotia,Halifax,,Community Center,"Community Center, Halifax, NS",2025-01-08,18:00,2025-12-31,19:30,90 minutes,evening,1,weekly,0,1500,1500,fixed,0,0,0,0,0,0,0,1,1,0,1,0,0,0,1,Community Wellness,nonprofit,info@communitywellness.ca,(902) 555-0100,,1,,,,"",90005,"{""wheelchairAccessible"":""yes""}"
```

### Common Pitfalls to Avoid

❌ **DON'T:**
- Use spaces in comma-separated lists: `"30001, 30002"` 
- Put dollar signs in cost fields: `"$20"`
- Use 12-hour time without AM/PM conversion: `"2:00"` (ambiguous)
- Leave required fields blank (name, description, province, municipality, startDate, organizerName, contact)

✅ **DO:**
- Use no spaces in comma-separated lists: `"30001,30002"`
- Convert to cents: `2000`
- Use 24-hour format: `"14:00"`
- Fill all required fields, even if you need to infer information

### Validation Checklist

Before outputting CSV, verify:

- [ ] All required fields are filled
- [ ] Dates are YYYY-MM-DD format
- [ ] Times are HH:MM 24-hour format
- [ ] Costs are in cents (numbers only, no symbols)
- [ ] Boolean fields are 0 or 1 (not yes/no or true/false)
- [ ] Province matches exact spelling from Canadian provinces list
- [ ] Event type IDs are valid numbers from reference table
- [ ] No trailing commas or extra columns
- [ ] Accessibility JSON is properly escaped if used

### Output Format

When generating CSV for users:

1. **Include header row** with all 48 column names
2. **Quote all text fields** to handle commas and special characters
3. **Leave optional fields blank** (empty between commas) if no data
4. **Provide explanation** of what you filled in and any assumptions made
5. **Suggest improvements** if user can provide more details

---

## Version History

**Version 2.0** (December 31, 2025)
- Added `startTime`, `endTime`, `duration` fields
- Added `adults` field (separate from adultsOnly)
- Added `isMixed` field for mixed indoor/outdoor events
- Added `publicContactName`, `publicContactEmail`, `publicContactPhone` fields
- Added `eventTypeIds` field for event type tagging
- Added AI assistant guidance section

**Version 1.0** (December 20, 2024)
- Initial release with core CSV import functionality
- Consolidated accessibility fields into JSON format
