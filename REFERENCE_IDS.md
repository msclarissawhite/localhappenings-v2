# Reference IDs for CSV Import

**Version 1.0** | **Last Updated:** January 1, 2026

This document provides quick reference tables for IDs used in CSV bulk imports. Use these IDs when populating the `eventTypeIds` and `seriesId` fields in your CSV files.

---

## Event Type IDs

Event types are organized into seven categories. You can assign multiple event types to a single event by using comma-separated IDs (e.g., `"30001,30002,30003"`).

### Family & Kids (8 types)

| ID | Name |
|-----|------|
| 30008 | Face Painting |
| 30006 | Kids Crafts |
| 30005 | Petting Zoos / Farms |
| 30007 | Puppet Shows |
| 30001 | Seeing Santa |
| 30003 | Skating |
| 30002 | Storytime / Library Events |
| 30004 | Swimming |

### Arts & Culture (9 types)

| ID | Name |
|-----|------|
| 30013 | Art Exhibition |
| 90003 | Arts & Crafts |
| 90002 | Cinema |
| 30012 | Concert |
| 30014 | Indigenous Events |
| 30009 | Live Music |
| 30015 | Multicultural Festivals |
| 30011 | Opera |
| 30010 | Theatre & Performances |

### Community & Social (7 types)

| ID | Name |
|-----|------|
| 30016 | Community Meetings |
| 30017 | Fundraisers & Charity Events |
| 30018 | Language Meetups |
| 30020 | Pride Events |
| 30019 | Religious / Faith-Based Events |
| 90004 | Socials & Clubs |
| 30021 | Workshops & Classes |

### Recreation & Sports (3 types)

| ID | Name |
|-----|------|
| 90001 | Games/Gaming |
| 30023 | Outdoor Adventure |
| 30022 | Sports & Recreation |

### Health & Wellness (4 types)

| ID | Name |
|-----|------|
| 90006 | Fitness |
| 90007 | Meditation |
| 90008 | Wellness Workshops |
| 90005 | Yoga |

### Markets & Festivals (3 types)

| ID | Name |
|-----|------|
| 30025 | Craft Shows & Markets |
| 30024 | Festivals & Fairs |
| 90024 | Food & Drink |

### Seasonal (15 types)

| ID | Name |
|-----|------|
| 90020 | Back to School |
| 90025 | Canada Day |
| 90019 | Christmas |
| 90015 | Easter |
| 30027 | Fall Events |
| 90018 | Festive Holidays |
| 90016 | Halloween |
| 90026 | Holiday Events |
| 90013 | New Year |
| 90023 | Spring Events |
| 90014 | St. Patrick's Day |
| 90012 | Summer Events |
| 90021 | Thanksgiving |
| 90022 | Valentine's Day |
| 30026 | Winter Events |

---

## Series IDs

Series IDs are used to group related recurring events together. When you have a recurring event (e.g., "Weekly Yoga Class" that happens every Monday), all instances of that event should share the same `seriesId`.

### How to Use Series IDs in CSV Import

**Option 1: Create New Series (Recommended)**

Leave the `seriesId` field **blank** in your CSV. The system will automatically:
1. Create a new series for each unique recurring event
2. Assign the same `seriesId` to all instances of that event
3. Link them together for batch management

**Example CSV:**
```csv
name,startDate,seriesId,isRecurring,...
"Weekly Yoga Class",2026-01-06,,1,...
"Weekly Yoga Class",2026-01-13,,1,...
"Weekly Yoga Class",2026-01-20,,1,...
```

The system will create a new series (e.g., `seriesId=5001`) and assign it to all three events automatically.

**Option 2: Link to Existing Series**

If you're adding new events to an **existing** series, you can specify the `seriesId` explicitly:

1. Find the series ID from the admin dashboard or database
2. Use that ID in your CSV for all events that belong to that series

**Example CSV:**
```csv
name,startDate,seriesId,isRecurring,...
"Weekly Yoga Class",2026-01-27,5001,1,...
"Weekly Yoga Class",2026-02-03,5001,1,...
```

These events will be added to the existing series with ID 5001.

### Finding Existing Series IDs

To find existing series IDs:

1. **Via Admin Dashboard:**
   - Navigate to **Event Series** page
   - View the series list with IDs displayed

2. **Via Database Query:**
   ```sql
   SELECT id, name, eventCount FROM eventSeries ORDER BY id DESC;
   ```

3. **Via Published Event:**
   - View any event in the series
   - Check the "Part of Series" badge which shows the series ID

### Series ID Format

- Series IDs are **integers** (e.g., `5001`, `5002`, `5003`)
- Leave blank for new series (system auto-generates)
- Use existing ID to add events to a series
- All events with the same `seriesId` are grouped together

### Important Notes

- **One-time events** should have `seriesId` left blank (they don't belong to a series)
- **Recurring events** can either:
  - Leave `seriesId` blank → system creates new series
  - Specify existing `seriesId` → adds to existing series
- **Batch operations** (edit, delete, publish) work on all events in a series
- **Series management** is available in the admin dashboard under "Event Series"

---

## Accessibility Field Reference

Accessibility information is stored as a JSON object in the `accessibility` field. The JSON structure contains five categories with specific field names.

### Accessibility Categories

#### 1. Caregiver Support

| Field Name | Options | Description |
|------------|---------|-------------|
| `changeTable` | yes, no, unknown, not-relevant | Diaper changing table available |
| `changeTableLocations` | mens, womens, family, wheelchair-accessible | Where change tables are located |
| `nursingRoom` | yes, no, unknown, not-relevant | Private nursing/feeding room |
| `strollerAccessible` | yes, no, unknown, not-relevant | Stroller-friendly venue |
| `strollerParking` | yes, no, unknown, not-relevant | Designated stroller parking |
| `familyWashroom` | yes, no, unknown, not-relevant | Family/gender-neutral washroom |

#### 2. Mobility & Physical Access

| Field Name | Options | Description |
|------------|---------|-------------|
| `wheelchairAccessible` | yes, no, unknown, not-relevant | Wheelchair accessible venue |
| `accessibleParking` | yes, no, unknown, not-relevant | Accessible parking available |
| `parkingDistance` | short, moderate, long, unknown, not-relevant | Distance from parking to venue |
| `elevatorLift` | yes, no, unknown, not-relevant | Elevator or lift available |
| `accessibleWashrooms` | yes, no, unknown, not-relevant | Accessible washrooms |
| `washroomAvailability` | Array: mens, womens, family, wheelchair-accessible | Types of washrooms available |
| `seatingAvailable` | yes, no, unknown, not-relevant | Seating provided |
| `terrainInfo` | flat, gravel, hills, paved, unpaved, mixed, unknown, not-relevant | Terrain type |
| `busStopDistance` | short, moderate, long, unknown, not-relevant | Distance to nearest bus stop |

#### 3. Sensory Considerations

| Field Name | Options | Description |
|------------|---------|-------------|
| `noiseLevel` | quiet, moderate, loud, unknown, not-relevant | Expected noise level |
| `lighting` | natural, bright, dim, adjustable, unknown, not-relevant | Lighting conditions |
| `quietSpace` | yes, no, unknown, not-relevant | Quiet space available |
| `scentFree` | yes, no, unknown, not-relevant | Scent-free environment |
| `sensoryFriendly` | yes, no, unknown, not-relevant | Sensory-friendly accommodations |
| `crowdLevel` | low, moderate, high, unknown, not-relevant | Expected crowd density |

#### 4. Cognitive & Communication

| Field Name | Options | Description |
|------------|---------|-------------|
| `visualSchedules` | yes, no, unknown, not-relevant | Visual schedules provided |
| `clearSignage` | yes, no, unknown, not-relevant | Clear directional signage |
| `flexibleParticipation` | yes, no, unknown, not-relevant | Flexible participation allowed |

#### 5. Social & Language

| Field Name | Options | Description |
|------------|---------|-------------|
| `aslInterpreter` | yes, no, unknown, not-relevant | ASL interpreter available |
| `multilingualSupport` | yes, no, unknown, not-relevant | Multilingual support |
| `serviceAnimalsWelcome` | yes, no, unknown, not-relevant | Service animals welcome |

### Example Accessibility JSON

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

---

## Quick Reference: CSV Field Names

### Core Fields
- `name` - Event name (required)
- `description` - Event description (required)
- `startDate` - Start date in YYYY-MM-DD format (required)
- `startTime` - Start time in HH:MM format (optional)
- `endDate` - End date for multi-day events (optional)
- `endTime` - End time in HH:MM format (optional)

### IDs & Linking
- `seriesId` - Series ID for recurring events (leave blank for new series)
- `eventTypeIds` - Comma-separated event type IDs (e.g., "30001,30002")

### Accessibility
- `accessibility` - JSON string with all accessibility information

---

## Related Documentation

- **CSV_IMPORT_GUIDE.md** - Complete CSV import guide with field specifications
- **USER_MANUAL.md** - User manual with feature documentation
- **event_upload_template.csv** - CSV template file with all column headers

---

**Need Help?**

If you have questions about CSV imports or need assistance with bulk uploads, contact the admin team through the [Contact Us](https://localhappenings.ca/contact) page.
