# Local Happenings - Issues to Fix

## TypeScript Errors (32 total)

### High Priority - Functionality Impact

#### 1. SubmitEvent.tsx - Form Type Mismatch
**File:** `client/src/pages/SubmitEvent.tsx:706`
**Error:** Argument of type '(data: FormData) => void' is not assignable to parameter of type 'SubmitHandler<TFieldValues>'
**Impact:** Form submission type safety issue
**Fix:** Update form handler type definition to match react-hook-form expectations

#### 2. AdminEditEvent.tsx - Accessibility Object Properties
**File:** `client/src/pages/AdminEditEvent.tsx:138-142`
**Errors:** 
- Property 'caregiver' does not exist on type '{}'
- Property 'mobility' does not exist on type '{}'
- Property 'sensory' does not exist on type '{}'
- Property 'cognitive' does not exist on type '{}'
- Property 'social' does not exist on type '{}'
**Impact:** Admin edit form accessibility fields may not save correctly
**Fix:** Properly type the accessibility object initialization

#### 3. BrowseEvents.tsx - Missing Filter Property
**File:** `client/src/pages/BrowseEvents.tsx:300,303`
**Error:** Property 'strollerAccessible' does not exist on type 'EventFilters'
**Impact:** Stroller accessible filter may not work
**Fix:** Add strollerAccessible to EventFilters type definition

#### 4. OrganizerDashboard.tsx - Multiple Type Errors
**File:** `client/src/pages/OrganizerDashboard.tsx`
**Errors:**
- Line 110: Argument of type 'Date' is not assignable to parameter of type 'string'
- Line 114: Property 'startTime' does not exist
- Line 137, 145, 176: Property 'eventId' does not exist
- Line 170: Argument of type 'Date' is not assignable to parameter of type 'string'
- Line 235: Cannot find name 'refetch'
- Line 485: Comparison between incompatible types '"events" | "locations" | "saved" | "images"' and '"templates"'
**Impact:** Organizer dashboard may have runtime errors
**Fix:** Fix type mismatches and undefined references

### Medium Priority - Type Safety

#### 5. MySavedEvents.tsx - Property Name Mismatch
**File:** `client/src/pages/MySavedEvents.tsx:20`
**Error:** Property 'loading' does not exist. Did you mean 'isLoading'?
**Impact:** Loading state may not display correctly
**Fix:** Change 'loading' to 'isLoading'

#### 6. EditEvent.tsx - Implicit Any Type
**File:** `client/src/pages/EditEvent.tsx:299`
**Error:** Parameter 'prev' implicitly has an 'any' type
**Impact:** Type safety issue
**Fix:** Add explicit type annotation

#### 7. AdminEditEvent.tsx - Implicit Any Type
**File:** `client/src/pages/AdminEditEvent.tsx:560`
**Error:** Parameter 'prev' implicitly has an 'any' type
**Impact:** Type safety issue
**Fix:** Add explicit type annotation

### Low Priority - Legacy Code

#### 8. BrowseEvents_OLD2.tsx - Undefined Property Access
**File:** `client/src/pages/BrowseEvents_OLD2.tsx:161`
**Error:** 'locations.cities' is possibly 'undefined'
**Impact:** None (legacy file, not in use)
**Fix:** Delete file or fix for future reference

#### 9. BrowseEvents.tsx - Null Check
**File:** `client/src/pages/BrowseEvents.tsx:826`
**Error:** Object is possibly 'null'
**Impact:** Potential runtime error
**Fix:** Add null check

## Non-TypeScript Issues

### Code Quality

1. **Unused Legacy Files**
   - `client/src/pages/BrowseEvents_OLD2.tsx` should be deleted if not needed
   - Check for other `_OLD` or backup files

2. **Missing Error Handling**
   - Review all tRPC mutations for proper error handling
   - Ensure all async operations have try-catch blocks

3. **Console Warnings**
   - Check browser console for React warnings
   - Fix any key prop warnings in lists

### Documentation

1. **USER_MANUAL.md** - Needs update with latest features
2. **ORGANIZER_QUICKSTART.md** - Needs to be created
3. **ORGANIZER_COMPREHENSIVE_GUIDE.md** - Needs to be created
4. **ORGANIZER_EVENT_FIELDS_GUIDE.md** - Needs update

### Testing

1. **Missing Tests**
   - Filtering logic tests
   - Accessibility features tests
   - Mobile responsiveness tests

## Priority Order for Fixes

1. Fix AdminEditEvent.tsx accessibility object types (blocks admin editing)
2. Fix OrganizerDashboard.tsx errors (blocks organizer workflow)
3. Fix SubmitEvent.tsx form type (blocks event submission)
4. Fix BrowseEvents.tsx filter types (blocks filtering)
5. Fix MySavedEvents.tsx loading property (minor UX issue)
6. Add type annotations to prevent implicit any
7. Clean up legacy files
8. Update documentation
9. Add missing tests

## Estimated Time

- High Priority Fixes: 2-3 hours
- Medium Priority Fixes: 1 hour
- Low Priority Cleanup: 30 minutes
- Documentation Updates: 3-4 hours
- **Total: 6-8 hours**
