# Accessibility Fields Reference

This document tracks all locations where accessibility fields are used in the Local Happenings platform. When adding or modifying accessibility fields, update ALL of these locations.

## Database Schema
**File:** `drizzle/schema.ts`
- `events` table: `accessibility` field (JSON text)
- `savedLocations` table: `accessibility` field (JSON text)

## TypeScript Types
**File:** `shared/types.ts`
- `AccessibilityData` interface
- Defines the structure: `{ caregiver, mobility, sensory, cognitive, social }`

## Forms (Input/Create)

### 1. Submit Event Form
**File:** `client/src/pages/SubmitEvent.tsx`
- Lines ~1302-2000: Complete accessibility section with all 40+ fields
- Includes tooltips, validation, and conditional logic
- **Categories:**
  - Caregiver & Infant (8 fields)
  - Mobility & Physical Access (12 fields)
  - Sensory Environment (9 fields)
  - Cognitive & Communication (6 fields)
  - Social & Behavioral (5 fields)

### 2. Edit Event Form
**File:** `client/src/pages/EditEvent.tsx`
- Should mirror SubmitEvent accessibility section
- Allows organizers to update accessibility details on published events

### 3. Saved Location Form
**File:** `client/src/components/SavedLocationForm.tsx`
- Uses "Import from existing event" approach
- Stores accessibility data but doesn't render individual fields

## Display/Read

### 1. Event Detail Page
**File:** `client/src/pages/EventDetail.tsx`
- Displays accessibility information to public users
- Grouped by category with icons and labels

### 2. Browse Events Filters
**File:** `client/src/pages/BrowseEvents.tsx`
- Advanced Filters modal
- Allows filtering by key accessibility criteria
- **Filterable fields:**
  - Wheelchair accessible
  - Stroller accessible
  - Accessible parking
  - Accessible washrooms
  - Step-free entry
  - Sensory-friendly
  - Quiet space available
  - Service animals welcome

### 3. Admin Dashboard
**File:** `client/src/pages/AdminDashboard.tsx`
- Reviews pending event submissions
- Views accessibility data for moderation

## Backend/API

### 1. Events Router
**File:** `server/events-router.ts`
- Handles accessibility data in create/update procedures
- Validates and stores JSON

### 2. Events Database Helper
**File:** `server/events-db.ts`
- Queries and returns accessibility data
- Parses JSON for API responses

## Field List (Current Implementation)

### Caregiver & Infant
1. `changeTablesPresent` (yes/no/unknown)
2. `changeTableLocations` (dropdown: mens/womens/gender-neutral/family/multiple)
3. `nursingFriendly` (yes/no/unknown)
4. `privateFeedingArea` (yes/no/unknown/not-relevant)
5. `bottleWarming` (yes/no/unknown/not-relevant)
6. `highChairs` (yes/no/unknown/not-relevant)
7. `strollerSpace` (yes/no/unknown)
8. `storage` (yes/no/unknown/not-relevant)

### Mobility & Physical Access
1. `strollerAccessible` (yes/no/unknown)
2. `wheelchairEntrance` (yes/no/unknown)
3. `stepFreeEntry` (yes/no/unknown)
4. `elevatorAccess` (yes/no/unknown/not-relevant)
5. `wideDoorways` (yes/no/unknown)
6. `accessibleSeating` (yes/no/unknown/not-relevant)
7. `accessibleWashrooms` (yes/no/unknown)
8. `washroomAvailability` (multi-select: mens/womens/gender-neutral/family/wheelchair-accessible)
9. `accessibleParking` (yes/no/unknown)
10. `terrainInfo` (dropdown: flat/gentle-slopes/steep-hills/stairs/mixed/unknown)
11. `publicTransit` (yes/no/unknown)
12. `dropOffZone` (yes/no/unknown/not-relevant)

### Sensory Environment
1. `sensoryFriendly` (yes/no/unknown)
2. `quietSpaceAvailable` (yes/no/unknown/not-relevant)
3. `crowdLevel` (dropdown: small/medium/large/very-large/unknown)
4. `lightingLevel` (dropdown: bright/moderate/dim/natural/mixed/unknown)
5. `noiseLevel` (dropdown: quiet/moderate/loud/very-loud/variable/unknown)
6. `scentFree` (yes/no/unknown)
7. `flashingLights` (yes/no/unknown)
8. `strongScents` (yes/no/unknown)
9. `visualSupports` (yes/no/unknown/not-relevant)

### Cognitive & Communication
1. `visualSchedule` (yes/no/unknown/not-relevant)
2. `pictureCards` (yes/no/unknown/not-relevant)
3. `aslInterpreter` (yes/no/unknown/not-relevant)
4. `captioning` (yes/no/unknown/not-relevant)
5. `simplifiedInstructions` (yes/no/unknown/not-relevant)
6. `writtenMaterials` (yes/no/unknown/not-relevant)

### Social & Behavioral
1. `serviceAnimalsWelcome` (yes/no/unknown)
2. `breakArea` (yes/no/unknown/not-relevant)
3. `flexibleParticipation` (yes/no/unknown)
4. `supportForBehaviors` (yes/no/unknown)
5. `trainedStaff` (yes/no/unknown)

## Update Checklist

When adding or modifying accessibility fields:

- [ ] Update `shared/types.ts` - Add/modify TypeScript type
- [ ] Update `drizzle/schema.ts` - Document in comments if needed
- [ ] Update `client/src/pages/SubmitEvent.tsx` - Add form field
- [ ] Update `client/src/pages/EditEvent.tsx` - Add form field
- [ ] Update `client/src/pages/EventDetail.tsx` - Add display logic
- [ ] Update `client/src/pages/BrowseEvents.tsx` - Add filter if applicable
- [ ] Update this reference document - Add to field list
- [ ] Test: Submit new event with new field
- [ ] Test: Edit existing event with new field
- [ ] Test: Filter by new field (if applicable)
- [ ] Test: View event detail with new field

## Notes

- All accessibility fields support "Unknown" as a value to encourage honesty over guessing
- Some fields support "Not Relevant" for features that don't apply
- Multi-select fields (like `washroomAvailability`) are stored as arrays
- Dropdown fields (like `terrainInfo`, `crowdLevel`) are stored as strings
- Yes/No fields are stored as strings: "yes", "no", "unknown"
