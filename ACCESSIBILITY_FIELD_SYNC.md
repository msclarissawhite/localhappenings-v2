# Accessibility Field Synchronization Guide

**Last Updated:** December 20, 2024

This document outlines the process for adding, modifying, or removing accessibility fields in Local Happenings. Following this checklist ensures consistency across the entire platform.

---

## Why This Matters

Accessibility fields appear in **7 different places** across the codebase. Missing even one location can cause:
- Form submission errors
- Missing data in event details
- Broken filters
- Confused organizers
- Incomplete documentation

---

## The 7 Touch Points

When you add, modify, or remove an accessibility field, you MUST update all 7 locations:

### 1. **TypeScript Types** (`shared/types.ts`)
**Purpose:** Define the data structure and type safety

**Location:** `AccessibilityData` interface

**What to update:**
- Add/remove field under the correct category (caregiver, mobility, sensory, cognitive, social)
- Use `AccessibilityValue` type for yes/no/unknown/not-relevant fields
- Use specific union types for dropdown fields (e.g., `"flat" | "gravel" | "hills"`)
- Use `Array<...>` for multi-select fields

**Example:**
```typescript
social: {
  serviceAnimalsWelcome?: AccessibilityValue;
  flexibleParticipation?: AccessibilityValue;
  // ... other fields
}
```

---

### 2. **Event Filters** (`shared/types.ts`)
**Purpose:** Allow users to filter events by accessibility features

**Location:** `EventFilters` interface

**What to update:**
- Add boolean filter for yes/no fields: `fieldName?: boolean;`
- Add string filter for categorical fields: `fieldName?: string;`
- Add comment explaining the filter if not obvious

**Example:**
```typescript
// Accessibility filters
serviceAnimalsWelcome?: boolean;
flexibleParticipation?: boolean;
```

---

### 3. **Submission Form** (`client/src/pages/SubmitEvent.tsx`)
**Purpose:** Allow organizers to input accessibility information

**Location:** Inside the "Accessibility Information" Card, under appropriate section

**What to update:**
- For yes/no/unknown fields: Use `<AccessibilityField>` component
- For dropdowns: Use `<Select>` with custom handling
- For multi-select: Use checkbox group with array handling
- Add clear label and helpful tooltip
- Place in correct section (Caregiver, Mobility, Sensory, Cognitive, Social)

**Example - Yes/No Field:**
```tsx
<AccessibilityField
  category="social"
  field="serviceAnimalsWelcome"
  label="Service animals welcome"
  tooltip="Are service animals permitted at this event?"
/>
```

**Example - Dropdown:**
```tsx
<Select
  value={accessibility.caregiver?.changeTableLocations || "unknown"}
  onValueChange={(value) => updateAccessibility("caregiver", "changeTableLocations", value)}
>
  <SelectTrigger>
    <SelectValue placeholder="Select location..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="mens">Men's washroom</SelectItem>
    {/* ... more options */}
  </SelectContent>
</Select>
```

**Example - Multi-Select:**
```tsx
{["option1", "option2"].map((option) => {
  const currentValues = accessibility.mobility?.washroomAvailability || [];
  const isChecked = Array.isArray(currentValues) && currentValues.includes(option.value);
  
  return (
    <div key={option.value}>
      <input
        type="checkbox"
        checked={isChecked}
        onChange={(e) => {
          const newValues = e.target.checked
            ? [...currentValues, option.value]
            : currentValues.filter(v => v !== option.value);
          updateAccessibility("mobility", "washroomAvailability", newValues);
        }}
      />
      <Label>{option.label}</Label>
    </div>
  );
})}
```

---

### 4. **Event Detail Page** (`client/src/pages/EventDetail.tsx`)
**Purpose:** Display accessibility information to event viewers

**Location:** Inside accessibility sections (Caregiver & Infant, Mobility & Physical Access, etc.)

**What to update:**
- For simple fields: Use `<AccessibilityRow>` component
- For array fields: Create custom rendering with `.map()` and `.join()`
- Place in correct section matching the form

**Example - Simple Field:**
```tsx
<AccessibilityRow 
  label="Service animals welcome" 
  value={accessibility.social.serviceAnimalsWelcome} 
/>
```

**Example - Array Field:**
```tsx
{accessibility.mobility.washroomAvailability && Array.isArray(accessibility.mobility.washroomAvailability) && (
  <div className="flex justify-between items-center py-2 border-b">
    <span>Washroom availability</span>
    <span>
      {accessibility.mobility.washroomAvailability
        .map(type => labels[type] || type)
        .join(", ")}
    </span>
  </div>
)}
```

---

### 5. **Browse Events Filters** (`client/src/pages/BrowseEvents.tsx`)
**Purpose:** Allow users to filter events by accessibility needs

**Location:** Inside Advanced Filters Panel, under appropriate Accordion section

**What to update:**
- Add checkbox for boolean filters
- Use `toggleFilter()` function
- Add clear, concise label
- Place in correct accordion section

**Example:**
```tsx
<div className="flex items-center gap-2">
  <Checkbox
    id="serviceAnimalsWelcome"
    checked={filters.serviceAnimalsWelcome || false}
    onCheckedChange={() => toggleFilter("serviceAnimalsWelcome")}
  />
  <Label htmlFor="serviceAnimalsWelcome" className="cursor-pointer text-sm">
    Service animals welcome
  </Label>
</div>
```

**Note:** Only add filters for fields that make sense as search criteria. Categorical fields (like "change table locations") may not need filters if a simpler boolean filter (like "change tables present") already exists.

---

### 6. **Backend Query Logic** (`server/events-router.ts`)
**Purpose:** Filter events based on accessibility criteria

**Location:** Inside `events.list` procedure, in the SQL WHERE clause building logic

**What to update:**
- Add JSON path query for new field
- Use `JSON_EXTRACT()` or `JSON_CONTAINS()` depending on field type
- Handle array fields with `JSON_CONTAINS()` or `JSON_OVERLAPS()`

**Example:**
```typescript
if (input.serviceAnimalsWelcome) {
  conditions.push(
    sql`JSON_EXTRACT(${events.accessibility}, '$.social.serviceAnimalsWelcome') = 'yes'`
  );
}
```

**Note:** This may require reading the existing query logic to understand the pattern.

---

### 7. **Organizer Guide** (`ORGANIZER_EVENT_FIELDS_GUIDE.md`)
**Purpose:** Document all fields for organizers

**Location:** Under "Accessibility Information" section, in appropriate subsection

**What to update:**
- Add row to markdown table
- Include field name, all options, and clear description
- Use exact same labels as the form
- Place in correct subsection

**Example:**
```markdown
| **Service Animals Welcome** | Yes / No / Unknown / Not Relevant | Are service animals permitted? |
```

---

## Field Type Guidelines

### Yes/No/Unknown/Not-Relevant Fields
- **Type:** `AccessibilityValue`
- **Form:** Use `<AccessibilityField>` component
- **Display:** Use `<AccessibilityRow>` component
- **Filter:** Boolean checkbox
- **Backend:** `JSON_EXTRACT(...) = 'yes'`

### Dropdown Fields (Single Selection)
- **Type:** Union of string literals (e.g., `"flat" | "gravel" | "hills"`)
- **Form:** Use `<Select>` component
- **Display:** Use `<AccessibilityRow>` component
- **Filter:** Usually not needed (too specific)
- **Backend:** `JSON_EXTRACT(...) = 'value'`

### Multi-Select Fields (Array)
- **Type:** `Array<"option1" | "option2" | ...>`
- **Form:** Checkbox group with array handling
- **Display:** Custom rendering with `.map().join(", ")`
- **Filter:** Complex - usually skip or use simplified boolean
- **Backend:** `JSON_CONTAINS(...)` or `JSON_OVERLAPS(...)`

---

## Checklist for Adding a New Field

- [ ] 1. Add to `AccessibilityData` interface in `shared/types.ts`
- [ ] 2. Add to `EventFilters` interface in `shared/types.ts` (if filterable)
- [ ] 3. Add to submission form in `client/src/pages/SubmitEvent.tsx`
- [ ] 4. Add to event detail page in `client/src/pages/EventDetail.tsx`
- [ ] 5. Add filter UI in `client/src/pages/BrowseEvents.tsx` (if applicable)
- [ ] 6. Add backend query logic in `server/events-router.ts` (if filterable)
- [ ] 7. Document in `ORGANIZER_EVENT_FIELDS_GUIDE.md`
- [ ] 8. Test form submission with new field
- [ ] 9. Test event detail page displays new field correctly
- [ ] 10. Test filter works (if applicable)

---

## Testing Checklist

After making changes:

1. **Form Submission:**
   - [ ] Fill out form with new field
   - [ ] Submit event
   - [ ] Check database to confirm field saved correctly

2. **Event Display:**
   - [ ] View event detail page
   - [ ] Confirm new field displays correctly
   - [ ] Test with different values (yes/no/unknown/not-relevant)

3. **Filtering:**
   - [ ] Open advanced filters
   - [ ] Enable new filter
   - [ ] Confirm only matching events appear
   - [ ] Disable filter and confirm all events return

4. **Edge Cases:**
   - [ ] Test with field left empty/unknown
   - [ ] Test with "Not Relevant" selected
   - [ ] Test multi-select with multiple values
   - [ ] Test multi-select with no values

---

## Common Mistakes to Avoid

❌ **Don't:** Add field to form but forget event detail page
❌ **Don't:** Use inconsistent field names across files
❌ **Don't:** Forget to update TypeScript types first (causes errors)
❌ **Don't:** Add filter without backend query logic
❌ **Don't:** Use different labels in form vs. guide
❌ **Don't:** Forget to test with real data

✅ **Do:** Follow this checklist every time
✅ **Do:** Use exact same field names everywhere
✅ **Do:** Update types first, then implementation
✅ **Do:** Test all 7 touch points
✅ **Do:** Keep guide in sync with form
✅ **Do:** Document why you made changes

---

## Recent Changes Log

### December 20, 2024
**Changed:**
- Replaced `changeTablesAllWashrooms` (yes/no) with `changeTableLocations` (dropdown)
- Changed `washroomAvailability` from single-select to multi-select array
- Added `serviceAnimalsWelcome` to Social & Emotional
- Added `flexibleParticipation` to Social & Emotional
- Renamed "Social & Behavioral" to "Social & Emotional" throughout

**Reason:** Better match real-world venue scenarios and organizer needs

---

## Questions?

If you're unsure about any step in this process, refer to existing fields as examples:
- **Simple yes/no field:** `changeTablesPresent`
- **Dropdown field:** `terrainInfo`
- **Multi-select field:** `washroomAvailability`

When in doubt, follow the pattern of similar existing fields.
