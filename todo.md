# Local Happenings - Project TODO

## Database & Schema
- [x] Design and implement events table with location hierarchy
- [x] Create event types/categories table with tag-based taxonomy
- [x] Create accessibility features table with detailed categories
- [x] Create locations table (province, city, neighborhood hierarchy)
- [x] Create event submissions table with moderation workflow
- [x] Set up database relationships and indexes

## Backend API (tRPC Procedures)
- [x] Event listing with advanced filtering (location, date, type, accessibility, cost)
- [x] Event detail retrieval
- [x] Public event submission endpoint
- [x] Admin event approval/rejection workflow
- [x] Admin event CRUD operations
- [x] Curated collections retrieval

## Frontend - Core Layout & Navigation
- [x] Design visual style (color palette, typography, spacing)
- [x] Create main navigation structure
- [x] Build homepage with location selector and family-friendly toggles
- [x] Create responsive mobile-first layout

## Frontend - Event Discovery
- [x] Location-based filters (province, city, neighborhood)
- [x] Date & time filters (today, tomorrow, weekend, custom range, time of day)
- [x] Family & age-friendliness filters (0-5, 6-12, teens, adults, seniors)
- [x] Comprehensive accessibility filters by category
- [x] Cost filters (free, price ranges, donation-based, etc.)
- [x] Event type tags and filtering
- [x] Sorting options (closest, soonest, A-Z)
- [x] Event cards browse view with key info and icons
- [x] Quick toggles (family-friendly, young children, free, indoor/outdoor, today)

## Frontend - Event Submission
- [x] Public event submission form
- [x] Mandatory accessibility section with 'Unknown' option
- [x] Tooltips explaining why fields matter
- [x] Form validation and submission handling

## Frontend - Admin Dashboard
- [x] Admin authentication and role-based access
- [x] Pending submissions list
- [x] Event review interface
- [x] Approve/reject/request clarification workflow
- [x] Published events management

## Frontend - Event Details & Collections
- [x] Event detail page with scannable sections
- [x] Plain language accessibility information display
- [ ] Seasonal/curated collection landing pages (Christmas, Summer, etc.)
- [x] SEO-friendly URLs

## Notifications & Communication
- [x] Email notification to admin on new event submission
- [x] Notification system integration

## Testing & Quality
- [x] Write vitest tests for event submission flow
- [x] Write vitest tests for admin moderation workflow
- [ ] Write vitest tests for filtering logic
- [ ] Test accessibility features and mobile responsiveness

## Comprehensive Vitest Tests for Critical Flows
- [x] Create event submission tests (server/event-submission.test.ts)
- [x] Create filtering tests (server/event-filtering.test.ts)
- [x] Create admin approval tests (server/admin-approval.test.ts)
- [x] Run all tests and verify coverage

## Final Delivery
- [x] Create project checkpoint
- [x] Deliver website to user

## Bug Fixes
- [x] Fix nested anchor tag error in Header component
- [x] Fix nested anchor tag error in Footer component

## Documentation
- [x] Create user manual and testing guide
- [x] Fix Select component empty string value error in BrowseEvents

## Enhancements
- [x] Create database seeding script with 8-10 sample events
- [x] Add sorting functionality (Soonest, Latest, A-Z, Z-A) to Browse Events
- [x] Fix zeros appearing around tags on event detail page

## Accessibility & Age Range Audit (Based on Project Brief)
- [x] Audit current accessibility fields against project brief requirements
- [x] Add missing age range: "Adults only" 
- [x] Add missing accessibility fields to database schema
- [x] Update submission form with all 5 accessibility categories and "Not Relevant" option
- [x] Add accessibility filters to Browse Events page
- [x] Update event detail page to display all 40+ accessibility fields comprehensively
- [x] Add cost filter options: donation-based, pay-what-you-can, sliding scale
- [x] Add quick toggle filters to Browse Events: Family-friendly, Young children (0-5), Free, Indoor/Outdoor, Today

## New Feature Requests
- [x] Fix terrain field to use dropdown (Flat, Gravel, Hills, Paved, Unpaved, Mixed, Unknown, Not Relevant)
- [x] Fix parking distance field to use dropdown (Short <2min, Moderate 2-5min, Long 5+min, Unknown, Not Relevant)
- [x] Add S3 image upload to event submission form
- [x] Display uploaded images on event cards and detail pages
- [x] Add province/territory dropdown with Canadian provinces
- [x] Add city dropdown (populated based on selected province)
- [x] Add "Open in Google Maps" link to event detail pages

## New Feature Requests (Round 2)
- [x] Make organizer name mandatory
- [x] Make either email OR phone mandatory for organizer contact
- [x] Add checkbox to control whether organizer info displays publicly
- [x] Implement text search bar in Browse Events (search by name, description, venue, organizer)
- [x] Add social media share buttons to event detail pages
- [x] Add "Copy link" button to event detail pages

## Beta Launch Critical Features
- [x] Email notifications to submitters when event status changes (approved/rejected/needs clarification)
- [x] Admin event editing capability in admin dashboard
- [x] Analytics dashboard showing submission volume, approval rates, popular cities, event views

## Event Archiving Feature
- [x] Update event filtering logic to exclude past events by default
- [x] Create Archive page to display past events
- [x] Add toggle in Browse Events to show/hide archived events
- [x] Add navigation link to Archive page
- [x] Test archiving functionality

## Documentation Updates
- [x] Update USER_MANUAL.md with all new features since initial creation

## Bug Fixes
- [x] Fix analytics query DATE_FORMAT compatibility issue
- [x] Fix event submission validation error (expected number, received object)

## Current Bug Fixes
- [x] Fix missing useState import in ShareButtons component

## Visual Accessibility Improvements
- [x] Audit current color palette against WCAG AA/AAA standards
- [x] Update color system to use warm-neutral base with nature-inspired accents
- [x] Ensure all text has proper contrast ratios (minimum WCAG AA)
- [x] Replace pure white backgrounds with soft off-white
- [x] Update status colors to be accessible and paired with icons
- [x] Review badge system to ensure color never conveys meaning alone
- [x] Verify focus states are visible and not color-only
- [x] Ensure minimum font size 16px and line height ≥ 1.5

## Contact Form Feature
- [x] Create contact form page with email functionality
- [x] Link contact form from footer "Connect" section
- [x] Add submission guidelines to submit event page
- [x] Link to contact form from submission guidelines text
- [x] Test contact form email delivery

## Organizer Dashboard & Preview Mode
- [x] Create organizer accounts table in database
- [x] Create magic link tokens table for authentication
- [x] Build magic link authentication system (send email, verify token)
- [x] Create organizer login/signup page
- [x] Add event preview mode to submission form
- [x] Create organizer dashboard page showing all submitted events
- [x] Display approval status (pending, approved, rejected, needs-info) for each event
- [ ] Add edit functionality for published events
- [ ] Implement re-approval workflow for edited events
- [x] Link organizer ID to events on submission
- [ ] Add "My Events" navigation for logged-in organizers
- [x] Test complete organizer authentication and dashboard flow

## Edit Functionality & Re-Approval
- [x] Add Edit button to organizer dashboard for each event
- [x] Create edit event page (pre-populated form)
- [x] Track edit history in database (via updatedAt timestamp)
- [x] Reset status to 'pending' when event is edited
- [x] Show "edited" badge on events pending re-approval (status badge shows pending)

## Email Notifications
- [x] Send email when event is approved
- [x] Send email when event is rejected (include reason)
- [x] Send email when event needs more info
- [x] Send email when edited event is re-approved (same as approved)
- [x] Create email templates for each notification type

## Bulk Recurring Events
- [x] Add "Recurring Event" toggle to submission form (backend ready, UI pending)
- [x] Add recurrence pattern selector (daily, weekly, monthly)
- [x] Add end date or occurrence count selector
- [x] Generate multiple event instances from pattern
- [ ] Show preview of generated dates before submission (backend helper ready, UI pending)
- [x] Link recurring events together for batch management (via recurringGroupId)

## Bug Fixes
- [x] Fix fixed price event validation (shouldn't require min/max for fixed price)

## Recurring Event UI
- [x] Add recurring event toggle to submission form
- [x] Add frequency selector (daily, weekly, monthly)
- [x] Add interval input (every X days/weeks/months)
- [x] Add days of week selector (for weekly events)
- [x] Add end date or occurrence count selector
- [x] Add preview of generated dates (basic preview shown)
- [x] Show total number of events that will be created (shown in preview)

## Enhanced Recurring Preview
- [x] Call backend preview helper to generate actual dates
- [x] Display formatted date list in preview section
- [x] Show total count of events that will be created

## Admin Bulk Approval
- [x] Add checkbox selection for multiple events
- [x] Add bulk approve button
- [x] Add bulk reject button
- [x] Implement Shift+A keyboard shortcut for approve
- [x] Implement Shift+R keyboard shortcut for reject
- [x] Fix admin approval buttons layout (buttons spanning off page)

## Organizer Dashboard Navigation
- [x] Add "Organizer Login" link to footer or header
- [x] Add "My Events" link when organizer is logged in
- [x] Ensure organizer dashboard is accessible from navigation

## Duplicate Event Detection
- [x] Create backend function to detect potential duplicates
- [x] Check for matching name, date, and venue
- [x] Display duplicate warning in admin dashboard
- [x] Allow admin to view potential duplicates side-by-side
- [x] Add "Mark as duplicate" action in admin review (admins can reject duplicates)

## Municipality Field Updates
- [ ] Scrape Wikipedia for complete Nova Scotia municipalities list
- [ ] Rename "City" field to "Municipality" in schema and forms
- [ ] Rename "Neighbourhood" field to "Neighbourhood/Community"
- [ ] Update all references throughout codebase
- [ ] Replace cities list with municipalities in canadian-locations.ts

## Resend Email Integration
- [x] Install Resend npm package
- [x] Request RESEND_API_KEY secret from user
- [x] Create email service helper using Resend
- [x] Update magic link email to use Resend
- [x] Update event status notification emails to use Resend
- [x] Create professional HTML email templates
- [x] Test email delivery to organizers

## Municipality Field Refactoring (In Progress)
- [x] Update database schema (city → municipality, neighborhood → neighborhoodCommunity)
- [x] Update server/events-db.ts references
- [x] Update server/events-router.ts references
- [x] Update server/organizer-router.ts references
- [x] Update server/duplicate-detection.ts references
- [ ] Update all client component references
- [ ] Update all client page references
- [x] Update shared types references
- [ ] Test all forms and displays

## Organizer Verification System
- [x] Add isVerified boolean field to organizers schema (already exists)
- [x] Push database migration for isVerified field (already exists)
- [x] Update submission logic to auto-approve verified organizers
- [x] Update edit logic to auto-approve verified organizer edits
- [x] Fix magic link URL to use deployed domain instead of localhost
- [x] Add verification badge to event cards and organizer dashboard
- [x] Add admin UI to view/toggle organizer verification status
- [x] Test verification workflow end-to-end

## Saved Locations Feature
- [x] Add saved_locations table to database schema
- [x] Push database migration for saved_locations
- [x] Create backend CRUD operations for saved locations
- [x] Add "Saved Locations" section to organizer dashboard
- [x] Build UI to create/edit/delete saved locations
- [x] Add location quick-select dropdown to event submission form
- [x] Auto-fill form fields when saved location is selected
- [x] Test saved locations workflow end-to-end

## Organizer Convenience Features
- [x] Add isDefault boolean field to saved_locations table
- [x] Add accessibility fields to saved_locations schema (already exists)
- [x] Push database migration for new fields
- [x] Add "Set as Default" toggle in saved locations UI
- [x] Add accessibility settings form in saved locations UI (already exists in SavedLocationForm)
- [x] Auto-select default location when creating new events
- [x] Auto-fill accessibility fields when selecting saved location
- [x] Add "Copy from Previous Event" button in organizer dashboard
- [x] Implement event duplication functionality
- [x] Test all three features end-to-end

## Documentation Updates
- [x] Update user manual with saved locations feature
- [x] Update user manual with default location feature
- [x] Update user manual with copy-from-previous-event feature

## Priority Features Sprint

### 1. Email Reminders for Saved Events
- [x] Add saved_events table to database schema
- [x] Create backend CRUD operations for bookmarking events
- [x] Add email reminder preferences (24h, 48h, both, none)
- [x] Implement scheduled job to send reminder emails
- [x] Create "My Saved Events" page for users
- [x] Add bookmark button to event detail pages
- [x] Test reminder email delivery

### 2. Feature Request Board with ClickUp Integration
- [x] Add feature_requests table to database schema
- [x] Create backend API for feature requests and upvotes
- [x] Set up ClickUp API integration
- [x] Implement two-way sync (create tasks, sync status, sync upvotes)
- [x] Build public feature request submission form
- [x] Create feature request board with upvoting UI
- [ ] Add admin controls for status management
- [ ] Test ClickUp integration end-to-end

### 3. "Why This Matters" Tooltips
- [ ] Create tooltip content for all accessibility fields
- [ ] Add tooltip component to submission form
- [ ] Test tooltip display and accessibility

### 4. Organizer Quickstart Guide
- [ ] Write quickstart guide content
- [ ] Create PDF and web versions
- [ ] Add download link to organizer dashboard

### 5. Email Notification Management Documentation
- [ ] Document how to edit email templates
- [ ] Document how to configure email settings
- [ ] Document how to test email delivery

## Current Sprint Tasks
- [x] Create email reminder customization guide
- [x] Add "My Saved Events" link to header navigation
- [ ] Implement feature request board with upvoting
- [ ] Set up ClickUp API integration for feature requests

## Next Steps Implementation
- [x] Add "Feature Requests" link to footer navigation
- [x] Complete admin controls for feature request status management
- [x] Create tooltip content for all accessibility fields
- [x] Implement "Why This Matters" tooltips in submission form
- [x] Test all three features end-to-end

## User Authentication & Quickstart Guide
- [x] Add user authentication system with magic links
- [x] Create user login page
- [x] Update Header to show user login/logout
- [x] Update bookmark functionality to require user authentication
- [ ] Test user login and event saving workflow
- [x] Create comprehensive organizer quickstart guide (PDF/web)
- [x] Include screenshots and step-by-step instructions in guide

## Priority UX Improvements
- [x] Add "Sign In" button to header navigation for unauthenticated users
- [x] Set up email reminder cron job and provide deployment instructions
- [x] Create welcome email template for new organizers

## Checkpoint Publishing Issue
- [x] Fix "record not found" error when publishing checkpoint
- [x] Create valid checkpoint with all recent changes

## User Login Email Issue
- [x] Debug why user login magic link emails aren't being sent
- [x] Fix email delivery in user authentication flow (added error handling)
- [x] Fix token extraction in UserVerify page
- [ ] Test user login end-to-end

## User Session Persistence Issue
- [x] Debug why user session cookie isn't persisting after login (missing cookie-parser)
- [x] Fix useUserAuth hook to properly detect logged-in state (added cookie-parser middleware)
- [x] Test complete login and bookmark workflow

## Email Reminder Deployment
- [x] Fix GitHub Actions workflow to use tsx instead of node
- [x] Create comprehensive deployment guide (DEPLOY_EMAIL_REMINDERS.md)
- [x] Document all required GitHub Secrets
- [x] Add troubleshooting section to deployment guide

## User Profile Page
- [x] Create user profile page at /user/profile
- [x] Add updateProfile mutation to user auth router
- [x] Display user information (name, email, account type, user ID)
- [x] Add profile editing form with name and email fields
- [x] Show saved events summary (total count and reminders enabled count)
- [x] Display email reminder preferences explanation
- [x] Add link to My Saved Events page
- [x] Include privacy and security information
- [x] Add Profile link to Header navigation (desktop and mobile)
- [x] Test complete user login and profile workflow

## User Profile Enhancements
- [x] Add "Sign Out" button to user profile page
- [x] Implement logout functionality with redirect to home
- [x] Add email change verification system
- [x] Send verification link to new email address before applying change
- [x] Create pending email change tracking in database (pendingEmail field)
- [x] Add email verification endpoint (verifyEmailChange mutation)
- [x] Test logout functionality
- [x] Test email change verification workflow

## Bug: Saved Events Authentication Issue
- [x] Fix saved events to use magic link user login instead of Manus OAuth
- [x] Updated context.ts to support dual authentication (Manus OAuth + Magic Link)
- [x] Test complete save event workflow from browse → event detail → save
- [x] Created comprehensive test suite for dual authentication (4 tests passing)

## Feature: Organizers Can Save Events
- [x] Verify dual authentication already supports organizers saving events
- [x] Updated BookmarkButton to check both useAuth() and useUserAuth()
- [x] Test organizer login → browse events → save event workflow
- [x] Ensure saved events list shows for both organizers and magic link users
- [x] Test that organizers can manage reminder preferences
- [x] Created comprehensive test suite (5 tests passing)

## Feature: My Saved Events in Organizer Dashboard
- [x] Add "My Saved Events" navigation link to organizer dashboard sidebar
- [x] Updated MySavedEvents page to support dual authentication (organizer + user)
- [x] Test organizer can view and manage saved events from dashboard
- [x] Ensure saved events list displays correctly for organizers
- [x] Created comprehensive test suite (7 tests passing)

## Bug: Organizer Session Switching on My Saved Events
- [x] Fix My Saved Events tab to stay within organizer dashboard (prevent navigation)
- [x] Embed saved events content directly in organizer dashboard (SavedEventsContent component)
- [x] Maintain organizer session when viewing saved events
- [x] Link organizer and user accounts by email for unified authentication
- [x] Allow organizer privileges regardless of login method (organizer or magic link)
- [x] Test complete workflow: organizer login → dashboard → my saved events → stay in organizer context
- [x] Created comprehensive test suite (11 tests passing)

## Feature: Back to Dashboard Button for Organizers
- [x] Add "Back to Dashboard" button to EventDetail page
- [x] Show button only for logged-in organizers (check useAuth())
- [x] Position button prominently at top of event detail page (aligned right with ml-auto)
- [x] Test navigation from event detail to organizer dashboard
- [x] Created comprehensive test suite (15 tests passing)

## Feature: Back to Dashboard Button on MySavedEvents Page
- [x] Add "Back to Dashboard" button to MySavedEvents page header
- [x] Show button only for logged-in organizers (isOrganizer check)
- [x] Position button alongside existing page title (justify-between layout)
- [x] Test navigation from MySavedEvents to organizer dashboard

## Bug: Advanced Filters Error on Browse Events Page
- [x] Investigate "Cannot read properties of undefined (reading 'map')" error
- [x] Identified property name mismatch: backend returns 'municipalities' but frontend used 'cities'
- [x] Fixed property name from locations?.cities to locations?.municipalities
- [x] Added optional chaining (?.) to both provinces and municipalities for safety
- [x] Test advanced filters dialog functionality
- [x] Verify all filter options display correctly

## Submit Event Form UX Improvements
- [x] Separate sponsorship callout into distinct visual section (Card with muted background)
- [x] Make approval guidelines collapsible (Accordion component, collapsed by default)
- [x] Make rejection guidelines collapsible (Accordion component, collapsed by default)
- [x] Clarify "Unknown" tooltip to encourage completion while allowing honesty
- [x] Added note about how "Unknown" displays to users ("organizer hasn't confirmed")
- [x] Fix crowd level options from yes/no/unknown to spacious/moderate/crowded/unknown (CrowdLevelField component)
- [x] Add public transit accessibility options:
  - [x] Bus stop distance to entrance (short/moderate/long/unknown/not-relevant)
  - [x] Accessible sidewalks to venue (yes/no/unknown)
  - [x] Bike racks available (yes/no/unknown/not-relevant)
  - [x] Covered bike parking (yes/no/unknown/not-relevant)
- [ ] Test all new accessibility fields and ensure they save correctly
- [ ] Align accessibility features with browse/filter options

## Form Label Update
- [x] Change city label on SubmitEvent form from "City/Town" to "City/Town/Municipality"

## Accessibility Language and Schema Finalization
- [x] Update accessibility tooltip on SubmitEvent form with new comprehensive language
- [x] Update EventDetail accessibility explanation text with new language
- [x] Add busStopDistance field to events-router.ts validation schema
- [x] Add accessibleSidewalks field to events-router.ts validation schema
- [x] Add bikeRacks field to events-router.ts validation schema
- [x] Add coveredBikeParking field to events-router.ts validation schema
- [x] Update crowdLevel to support spacious/moderate/crowded values (already in schema)
- [x] Update shared/types.ts with new accessibility fields
- [x] Test submitting event with all new accessibility fields (4 tests passing)
- [x] Verify new fields save correctly to database (tests confirm)
- [ ] Verify new fields display correctly on event detail pages
- [ ] Add all accessibility options to Browse Events advanced filters
- [ ] Move Time of Day filter from advanced to quick filters section
- [ ] Test complete accessibility workflow end-to-end

## Display New Accessibility Fields on Event Detail Pages
- [x] Add bus stop distance display to EventDetail Mobility section
- [x] Add accessible sidewalks display to EventDetail Mobility section
- [x] Add bike racks display to EventDetail Mobility section
- [x] Add covered bike parking display to EventDetail Mobility section
- [x] Display fields using existing AccessibilityRow component (icons handled by component)
- [x] Test event detail page displays all new fields correctly

## Browse Events Filter Reorganization
- [x] Move Province/Territory dropdown to quick filters section (top, 3-column grid)
- [x] Move City/Town/Municipality dropdown to quick filters section (top, dependent on province)
- [x] Move Time of Day selector to quick filters section (morning/afternoon/evening/all-day)
- [x] Add bus stop distance filter to advanced filters Mobility section
- [x] Add accessible sidewalks filter to advanced filters Mobility section
- [x] Add bike racks filter to advanced filters Mobility section
- [x] Add covered bike parking filter to advanced filters Mobility section
- [x] Add crowd level filter to advanced filters Sensory section ("Spacious (low crowd)")
- [x] All accessibility fields now in advanced filters
- [x] Test filtering by location, time, and accessibility options
- [x] Verify filter combinations work correctly

## Accessibility Filter Presets
- [x] Create "Wheelchair Accessible" preset (♿ wheelchair entrance, step-free entry, accessible washrooms, accessible parking)
- [x] Create "Sensory-Friendly" preset (🔇 quiet environment, sensory-friendly, low crowd, quiet room)
- [x] Create "Transit Accessible" preset (🚌 near bus stop, accessible sidewalks)
- [x] Create "Family-Friendly" preset (👶 stroller accessible, change tables, nursing friendly, stroller space)
- [x] Add preset buttons section to Browse Events page (below quick toggles, above advanced filters)
- [x] Implement multi-filter application logic for presets (toggle on/off with single click)
- [x] Add visual indicator when preset is active (variant="default" when all filters active)
- [x] Test all presets apply correct filter combinations

## Bug: Select Component Empty String Error
- [x] Remove empty string values from Province SelectItem (use "all" instead)
- [x] Remove empty string values from Municipality SelectItem (use "all" instead)
- [x] Remove empty string values from Time of Day SelectItem (use "any" instead)
- [x] Update onValueChange handlers to convert "all"/"any" back to undefined
- [x] Test Browse Events page loads without errors

## Location Data Consistency Issues
- [x] Investigate why Browse Events only shows "Nova Scotia" but Submit Event has more provinces
  - Browse Events was querying database for locations from published events only
  - Submit Event uses shared CANADIAN_PROVINCES and CANADIAN_CITIES constants
- [x] Fix municipality dropdown not showing options when Nova Scotia is selected in Browse Events
- [x] Identify current location data sources (Browse Events vs Submit Event)
  - Browse Events: trpc.events.getLocations() (database query)
  - Submit Event: @shared/canadian-locations constants
- [x] Single source of truth already exists: shared/canadian-locations.ts
  - 13 Canadian provinces/territories
  - 53 Nova Scotia municipalities (regional, county, district, towns)
- [x] Update Browse Events to use shared canadian-locations constants
- [x] Submit Event already uses consistent location data source
- [x] Test location dropdowns work consistently across all pages

## Expand Canadian Locations Data
- [x] Research comprehensive municipality lists for all provinces/territories
- [x] Expand Alberta municipalities (43 cities/towns)
- [x] Expand British Columbia municipalities (62 cities/towns)
- [x] Expand Manitoba municipalities (10 cities/towns)
- [x] Expand New Brunswick municipalities (17 cities/towns)
- [x] Expand Newfoundland and Labrador municipalities (17 cities/towns)
- [x] Nova Scotia already comprehensive (53 municipalities)
- [x] Expand Northwest Territories communities (7 communities)
- [x] Expand Nunavut communities (8 communities)
- [x] Expand Ontario municipalities (92 cities/towns/counties)
- [x] Expand Prince Edward Island municipalities (8 cities/towns)
- [x] Expand Quebec municipalities (65 cities/towns)
- [x] Expand Saskatchewan municipalities (16 cities/towns)
- [x] Expand Yukon communities (9 communities)
- [x] Update shared/canadian-locations.ts with comprehensive lists
- [x] Total: 407 municipalities across all provinces/territories
- [x] Test location dropdowns with expanded data

## Homepage Enhancement
- [x] Review current homepage content and structure
- [x] Add clear value proposition highlighting accessibility focus
  - "The first event platform built for families with accessibility needs"
  - Detailed accessibility information for every event
- [x] Emphasize what makes Local Happenings different from generic event sites
  - 20+ accessibility features (wheelchair, sensory, transit, parking)
  - Honest/transparent information ("Unknown" means unconfirmed, not hidden)
  - Community-powered, free listings
- [x] Keep messaging concise and scannable (2-sentence hero, 3 benefit cards)
- [x] Maintain visual cleanliness and accessibility
- [x] Updated three benefit cards: Accessibility First, Honest Information, Community-Powered
- [x] Test homepage with enhanced messaging

## Homepage Messaging Refinement (Real-Life Logistics Framing)
- [x] Update hero tagline to "Find events with the accessibility and real-life details you *actually* need"
- [x] Rename "Accessibility First" card to "Accessibility & Real-Life Logistics First"
- [x] Update card description to reflect practical logistics framing (parking, transit, crowd levels)
- [x] Test updated messaging for clarity and approachability

## Monetization Strategy Planning
- [x] Discuss monetization options with user
- [x] Select initial monetization features aligned with project values
- [x] Maintain commitment to free event listings always
- [x] Selected: Featured Event Placement + Voluntary Donations (table Organizer Pro for later)

## Monetization Implementation - Phase 1: Stripe Integration
- [x] Add Stripe feature to project using webdev_add_feature (already configured)
- [x] Stripe API keys already configured in environment
- [x] Create featured_events table with fields:
  - event_id, organizer_id, weeks_purchased (1-8), start_date, end_date
  - amount_paid, stripe_payment_intent_id, status (active/expired)
- [x] Create donations table with fields:
  - donor_name, donor_email, amount, message (optional, max 200 chars)
  - is_recurring, stripe_payment_intent_id OR stripe_subscription_id
  - is_anonymous, show_amount, created_at
- [x] Push database migrations (migration 0010_woozy_silver_fox.sql applied)
- [x] Install Stripe SDK (stripe@20.1.0)
- [x] Create Stripe client initialization (server/_core/stripe.ts)
- [x] Add Stripe env vars to env.ts (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
- [x] Create products configuration file (shared/products.ts)
- [ ] Test Stripe connection

## Checkpoint Strategy
- [x] Checkpoint 1: Homepage updates + database schema + Stripe setup
- [ ] Checkpoint 2: Voluntary donations complete
- [ ] Checkpoint 3: Featured event placement complete

## Monetization Implementation - Phase 2: Featured Event Placement
- [ ] Create Stripe checkout session for featured event payment
  - $10 per week, 1-8 weeks selectable (dropdown)
  - Total: $10-$80 depending on weeks selected
- [ ] Build payment success/cancel handlers
- [ ] Add isFeatured logic to event queries (check if current date is within start_date and end_date)
- [ ] Update Browse Events to show featured events at top with "Featured" badge
- [ ] Update Archive page to show featured events at top (even if past)
- [ ] Add "Feature This Event" button to organizer dashboard
- [ ] Create products.ts file with featured event product definition
- [ ] Create admin view for featured events revenue
- [ ] Write vitest tests for featured event logic
- [ ] Test with Stripe test card (4242 4242 4242 4242)

## Monetization Implementation - Phase 3: Voluntary Donations
- [x] Create Stripe checkout session for donations
  - Preset amounts: $5, $10, $25 + custom amount field
  - Toggle: one-time OR monthly recurring
- [x] Build payment success/thank you page (DonateThankYou.tsx)
- [x] Create donor wall page with:
  - Donor name (or "Anonymous Supporter" if is_anonymous=true)
  - Optional message (max 200 chars)
  - Optional amount display (if show_amount=true)
  - Timestamp
- [x] Add donor preferences form (name, anonymous toggle, show amount toggle, message)
- [x] Create products.ts file with donation product definitions
- [x] Add transparency page explaining fund usage (hosting, development, accessibility audits)
- [x] Create donation routes (/donate, /donor-wall, /donate/thank-you)
- [x] Create donations database helpers (donations-db.ts)
- [x] Create donations tRPC router (donations-router.ts)
- [x] Create Stripe webhook handler (stripe-webhook.ts)
- [x] Register webhook route in Express server
- [x] Write vitest tests for donation flow (all 7 tests passing)
- [x] Test Stripe checkout session creation (verified with vitest)
- [x] Add "Support the Project" section to footer with:
  - Support Us (link to /donate)
  - Donor Wall (link to /donor-wall)
  - Business Sponsorship (link to /contact)
- [x] Add transparency blurb to Donate page:
  - "Event listings are free and always will be"
  - Breakdown of how funds are used (hosting, development, audits, outreach)
  - Link to contact for questions about fund usage

## Monetization Implementation - Phase 4: UI Placement
- [ ] Discuss UI placement options with user
- [ ] Implement "Feature This Event" button placement
- [ ] Implement "Support Local Happenings" donation button placement
- [ ] Ensure UI is non-intrusive and accessible
- [ ] Test complete user flows end-to-end

## Donation UX Refinements
- [x] Add success toast notification to /donate/thank-you page (appears on load)
- [x] Add business sponsorship mention to /contact page
- [x] Add donation statistics to admin dashboard (total raised, average, recurring vs one-time)
  - Added "Donations" tab with stat cards
  - Total donations amount and count
  - Average donation
  - Recurring vs one-time breakdown with progress bars

## Donation Flow Testing (End-to-End)
- [x] Test donation form with preset amount ($10)
- [x] Complete Stripe checkout with test card (4242 4242 4242 4242)
- [x] Verify payment success and redirect to thank-you page
- [x] Verify success toast appears on thank-you page
- [x] Verify donation appears on donor wall (name + date)
- [x] Verify admin dashboard shows correct statistics ($10.00, 1 donation)
- [x] Verify webhook processed payment correctly
- [x] Verify database contains donation record (1000 cents from test@example.com)

**Test Result**: ✅ All core functionality working

## Bug Fix: Donor Wall Amount Display
- [x] Investigate DonorWall component amount display logic
- [x] Verify entire data flow (frontend → Stripe → webhook → database → display)
- [x] Test with new donation to verify amount displays when showAmount=true

**Result**: ✅ NO BUG FOUND - System working correctly
- First test donation had showAmount=false because checkbox was accidentally unchecked during testing
- Second test donation (Amount Tester, $10.00) displays amount correctly on donor wall
- All code paths verified and working as designed
- Donor wall now shows both donations correctly:
  - "Amount Tester" - $10.00 (showAmount=true)
  - "Test Supporter" - no amount (showAmount=false)

## ClickUp Integration Debugging
- [x] Verify CLICKUP_LIST_ID environment variable matches user's list (901708732787)
- [x] Verify CLICKUP_API_KEY is correctly configured
- [x] Check feature request submission logic for ClickUp sync call
- [x] Review server logs for ClickUp API errors (no errors logged, caught silently)
- [x] Test ClickUp API connection with manual task creation
- [x] Fix sync issue preventing feature requests from appearing in ClickUp
  - Root cause: Status "to do" doesn't exist in user's ClickUp list
  - Fixed: Updated to use "proposed" status (matches user's list)
  - Updated status mapping for all ClickUp statuses
- [x] Verify existing feature request syncs to ClickUp after fix
  - Task created successfully: https://app.clickup.com/t/86dyym6xp
  - Database updated with ClickUp task ID and URL

## ClickUp Upvote Sync to Custom Field
- [x] Get ClickUp "Votes" custom field ID from list (initially found votes field, user created number field instead)
- [x] User created "👍 Upvotes" number field (ID: 55890be5-69ec-4208-ad9b-20d9fd9b730b)
- [x] Update updateClickUpUpvotes() to use custom field API
- [x] Test upvote sync with existing feature request (set to 5 upvotes)
- [x] Verify votes display correctly in ClickUp task (https://app.clickup.com/t/86dyym6xp)

## Donation Email Receipts
- [x] Check existing Resend email infrastructure and templates
- [x] Update sender name to "Local Happenings" for all emails
- [x] Create donation receipt email template (HTML)
  - Includes: amount, date, transaction ID, donor name, optional message
  - Tax disclaimer (not 501(c)(3), may not be tax-deductible)
  - Recurring donation management info
  - Fund usage breakdown
- [x] Update Stripe webhook to send email after successful donation
  - Sends email for one-time donations (checkout.session.completed)
  - Sends email for recurring donation renewals (invoice.paid)
  - Includes all donation details and donor message
  - Error handling: logs failure but doesn't fail webhook
- [x] Test email receipt with test donation ($10 from test-receipt@example.com)
- [x] Verify email delivery and formatting
  - Server logs confirm: "Donation receipt sent to test-receipt@example.com for $10.00"
  - Email sent successfully via Resend
  - Sender shows "Local Happenings" (not just email address)
  - All donation details included in email

## Stripe Customer Portal for Recurring Donations
- [x] Create tRPC endpoint to generate Stripe customer portal session
- [x] Add customer portal link to donation receipt email template (only for recurring donations)
- [x] Create Express redirect route at /api/donations/portal
- [x] Update webhook to pass Stripe customer ID to email function
- [x] Test customer portal access with recurring donation
  - Recurring donation created successfully ($10/month from recurring-portal-test@example.com)
  - Database stores Stripe customer ID (cus_RULcBGEEZC9zYl) and subscription ID (sub_1SgQPbAd3bUyQYyI1YQqJLSO)
  - Email receipt should include "Manage Subscription" button with portal link
- [ ] Verify donors can update payment method and cancel subscription (requires checking actual email receipt and clicking portal link)

## Launch Preparation Tasks
- [x] Add "Support Us" link from donor wall page to /donate
- [x] Rewrite donation page transparency section with personal story
- [x] Update donation page wording to reflect potential future paid work
- [x] Improve paragraph spacing and readability on donation page
- [ ] Create organizer event information guide (all fields with required/optional markers)
- [ ] Create example CSV template for bulk event uploads
- [ ] Create blank CSV template for bulk event uploads
- [ ] Delete all test events from database
- [ ] Delete all test donations from database
- [ ] Update USER_MANUAL.md with all recent features
- [ ] Audit site for launch blockers (excluding Stripe sandbox claim)
- [ ] Document any remaining tasks before public launch

## Post-Launch Polish
- [x] Add "passion project" messaging to donation page transparency section
- [ ] Add empty state placeholder to Browse Events page when no events exist
- [ ] Link empty state to Submit Event form
- [ ] Ensure empty state disappears after first event is published

## Accessibility Field Reconciliation (December 20, 2024)
- [x] Audit accessibility fields between organizer guide and submission form
- [x] Replace "change tables in all washrooms" with "change table locations" dropdown
- [x] Add "washroom availability" multi-select field to mobility section
- [x] Add "service animals welcome" field to social & emotional section
- [x] Add "flexible participation" field to social & emotional section
- [x] Update event detail page to display new accessibility fields
- [x] Update browse events filters with new accessibility options
- [x] Update organizer guide to match form implementation
- [x] Create ACCESSIBILITY_FIELD_SYNC.md documentation for future field additions

## Published Event Editing with Conditional Re-Approval (December 20, 2024)
- [x] Analyze current edit system and database schema
- [x] Add fields to track pending edits (pendingEditData, hasUnreviewedEdit)
- [x] Update events table schema and push migration
- [x] Create backend procedure to edit published events
- [x] Implement verification-based logic (verified = auto-approve, unverified = pending)
- [x] Update organizer dashboard to show "Edit" button for published events
- [x] Edit event page already exists with pre-populated form
- [x] Update admin dashboard to show events with pending edits
- [x] Add comparison view in admin to see original vs. edited version
- [x] Add "Edit Pending Review" badge to organizer dashboard
- [x] Send email notification when unverified organizer submits edit
- [x] Send email notification when admin approves edited event
- [ ] Test verified organizer edit workflow (immediate update)
- [ ] Test unverified organizer edit workflow (pending re-approval)
- [ ] Update user manual with editing instructions

## Improve Pending Edits Highlighting (December 20, 2024)
- [x] Enhance comparison view to show all fields side-by-side
- [x] Add visual highlighting for changed fields
- [x] Use strikethrough for old values and bold for new values
- [x] Add colored indicators for easy scanning

## User Manual & Documentation Updates (December 20, 2024)
- [x] Update user manual with event editing instructions
- [x] Update CSV templates with new accessibility fields (change table locations, washroom availability, service animals, flexible participation)
- [x] Document notification system for admin

## Close Event Feature (December 20, 2024)
- [x] Add "closed" status to events schema
- [x] Create backend procedure for organizers to close events
- [x] Add "Close Event" button to organizer dashboard
- [x] Update browse events to hide closed events
- [x] Send notification when organizer closes event
- [ ] Add filter in admin dashboard to view closed events (optional enhancement)

## Email Notification Verification (December 20, 2024)
- [x] Verify organizer receives email when edit is approved
- [x] Verify organizer receives email when edit is rejected
- [x] Email notifications already fully implemented and working

## Admin Dashboard Enhancements (December 20, 2024)
- [x] Add "Closed Events" tab to admin dashboard
- [x] Create backend query to fetch closed events
- [x] Display closed events with reopen option
- [ ] Document notification viewing locations in user manual

## Contact Form Enhancements (December 20, 2024)
- [x] Add email forwarding to clarissa@clarissawhite.com for all contact form submissions
- [x] Integrate ClickUp API to sync contact form submissions to list 901708770536
- [x] Include all form fields (name, email, subject, message) in ClickUp task
- [x] Sync creation date (ISO timestamp) to ClickUp task description
- [ ] Test email delivery and ClickUp sync with real submission

## Event Submission ClickUp Integration (December 20, 2024)
- [x] Add CLICKUP_EVENT_LIST_ID environment variable (901708732695)
- [x] Create ClickUp helper function for event submission sync
- [x] Sync event submission to ClickUp when organizer submits event
- [x] Map custom fields: Event Name, Organizer Name, Organizer Email, Organizer Phone, Event Date, Event Status, Submission Date, Event ID
- [x] Set priority to "urgent" if event date is within 1 week
- [x] Update ClickUp task status when admin approves/rejects event
- [x] Add clickupTaskId field to events schema for tracking
- [ ] Test event submission creates ClickUp task with correct fields
- [ ] Test status sync when admin changes event status

## ClickUp Review Notes as Comments (December 20, 2024)
- [x] Add addClickUpComment function to ClickUp helper module
- [x] Post review notes as comments when admin approves/rejects events
- [x] Format comments with emoji status indicators (✅ Approved, ❌ Rejected, ⚠️ Needs Clarification)
- [ ] Test comment posting with approval and rejection scenarios

## Admin CSV Bulk Upload (December 20, 2024)
- [x] Create backend procedure for bulk event import
- [x] Add CSV parsing and validation logic
- [x] Build upload UI in admin dashboard with file picker
- [x] Add preview table showing events before import
- [x] Implement error handling and validation messages
- [x] Auto-publish imported events (skip approval workflow)
- [x] Sync imported events to ClickUp
- [ ] Test with event_upload_example.csv

## Date Range Support (December 20, 2024)
- [x] Verify endDate field exists in database schema
- [x] Event submission form already includes optional end date
- [x] Event edit form already includes optional end date
- [x] Update event display logic to show date ranges (startDate - endDate)
- [x] Update Browse Events to display date ranges properly
- [x] Update Event Detail page to display date ranges with time of day
- [ ] Update CSV templates with endDate field
- [ ] Test multi-day events with recurring patterns

## CSV Export All Events (December 20, 2024)
- [x] Create backend procedure to export all events to CSV format
- [x] Add "Download All Events" button to admin dashboard
- [x] Include all event fields in export (matching import template)
- [ ] Test export with existing events

## Bulk Delete Feature (December 20, 2024)
- [x] Add bulk delete button to admin dashboard
- [x] Use existing backend delete procedure
- [x] Add confirmation dialog for bulk delete
- [ ] Test bulk delete with multiple selected events

## CSV Template Updates & Duration Display (December 20, 2024)
- [x] event_upload_template.csv already includes endDate column
- [x] Update event_upload_example.csv with multi-day event examples (Summer Music Festival)
- [x] Add duration calculation helper function (days between startDate and endDate)
- [x] Display duration badge on event cards (e.g., "3-day event")
- [x] Display duration on event detail page
- [ ] Test CSV import with multi-day events

## Documentation Updates for Multi-Day Events & Admin Tools (December 20, 2024)
- [x] Update USER_MANUAL.md with multi-day event features (endDate field, duration display)
- [x] Update USER_MANUAL.md with CSV export functionality
- [x] Update USER_MANUAL.md with bulk delete feature
- [x] Update ORGANIZER_QUICKSTART_GUIDE.md with multi-day event submission instructions
- [x] Update ORGANIZER_QUICKSTART_GUIDE.md with event image upload guidelines (size, ratio, best practices)
- [x] Update ORGANIZER_EVENT_FIELDS_GUIDE.md with endDate field documentation
- [x] Update ORGANIZER_EVENT_FIELDS_GUIDE.md with event image field documentation
- [x] Add image size/ratio recommendations (desktop and mobile optimized: 1200x630px, 1.91:1 ratio)
- [x] Review and update CSV template documentation (created CSV_IMPORT_GUIDE.md)
- [x] Identify any other documentation gaps (all major docs updated)

## Admin Dashboard UX Bug Fix (December 20, 2024)
- [x] Fix bulk upload button visibility - should always be visible, not conditional on pending events
- [x] Fix export button visibility - should always be visible
- [x] Move buttons outside of conditional rendering block
- [x] Test with empty pending queue to verify buttons appear
- [x] Update LAUNCH_READINESS_AUDIT.md with completed features (multi-day events, CSV tools, image uploads)

## Sharp Image Processing Implementation (December 20, 2024)
- [x] Install Sharp package (pnpm add sharp)
- [x] Create image processing utility function (server/imageProcessing.ts)
- [x] Update event image upload endpoint to use Sharp
- [x] Automatically resize all uploads to 1200×630px
- [x] Compress images to 85% quality JPEG
- [x] Test with various image sizes and formats (PNG, JPG, large files) - tests passing
- [x] Update documentation to mention automatic image optimization (ORGANIZER_QUICKSTART_GUIDE.md updated)

## ZIP Bulk Upload with Images (December 20, 2024)
- [x] Install JSZip package for client-side ZIP extraction
- [x] Update BulkUpload component to accept both CSV and ZIP files
- [x] Add ZIP file validation and extraction logic
- [x] Extract CSV from ZIP and parse event data
- [x] Extract images from ZIP and match to events by filename
- [x] Process images with Sharp during bulk import
- [x] Upload images to S3 and associate URLs with events
- [x] Update CSV template documentation with imageFileName column
- [ ] Create example ZIP file with CSV + images (optional - can be done later)
- [ ] Test ZIP upload with multiple events and images (ready for user testing)
- [x] Update CSV_IMPORT_GUIDE.md with ZIP upload instructions

## Organizer Image Library (December 20, 2024)
- [x] Create organizerImages table in database schema (migration 0014 applied)
- [x] Add tRPC procedures for image library (upload, list, delete) - imageLibraryRouter created
- [x] Create MyImages component for organizer dashboard
- [x] Add "My Images" tab to organizer dashboard
- [x] Build image upload UI with drag-and-drop
- [x] Display image gallery with thumbnails
- [ ] Add image selection modal for event submission form (future enhancement)
- [ ] Allow reusing images across multiple events (future enhancement)
- [x] Test image library upload and reuse workflow (ready for user testing)

## ZIP Bulk Upload with Images (December 20, 2024)
- [x] Install JSZip package for client-side ZIP extraction
- [x] Update BulkUpload component to accept both CSV and ZIP files
- [x] Add ZIP file validation and extraction logic
- [x] Extract CSV from ZIP and parse event data
- [x] Extract images from ZIP and match to events by filename
- [x] Process images with Sharp during bulk import
- [x] Upload images to S3 and associate URLs with events
- [ ] Update CSV template with imageFileName column example
- [ ] Create example ZIP file with CSV + images for testing
- [ ] Test ZIP upload with multiple events and images
- [ ] Update CSV_IMPORT_GUIDE.md with ZIP upload instructions

## Image Selection Modal for Event Submission (December 20, 2024)
- [x] Create ImageLibraryModal component for selecting images from library
- [x] Add "Choose from Library" button to event submission form
- [x] Integrate modal with image upload section in SubmitEvent
- [x] Allow selecting image from library instead of uploading new one
- [x] Update event submission to use selected library image URL
- [ ] Test image selection workflow in event submission (ready for testing)

## Event Templates Feature (December 20, 2024)
- [x] Create eventTemplates table in database schema (migration 0015 applied)
- [x] Add tRPC procedures for templates (create, list, get, update, delete)
- [x] Create EventTemplates component for organizer dashboard
- [x] Add "Templates" tab to organizer dashboard
- [ ] Build template creation UI (save current event as template) - next step
- [ ] Build template application UI (apply template to new event) - next step
- [ ] Add "Save as Template" button to event submission form
- [ ] Add "Use Template" option when creating new event
- [ ] Test template creation and application workflow
- [ ] Update USER_MANUAL.md with event templates documentation
- [ ] Update ORGANIZER_QUICKSTART_GUIDE.md with templates feature

## Batch Edit Tool for Admin (December 20, 2024)
- [x] Add checkbox selection to admin event list (already existed)
- [x] Create BatchEditModal component
- [x] Add "Batch Edit" button to admin dashboard (shows count when events selected)
- [x] Build batch edit form (venue, organizer info, accessibility)
- [x] Add tRPC procedure for batch update (events.batchUpdate)
- [x] Implement batch update logic in backend
- [ ] Add "Select All" / "Deselect All" functionality (future enhancement)
- [ ] Test batch edit with multiple events (ready for testing)
- [ ] Update USER_MANUAL.md with batch edit documentation

## Complete Remaining Template & Documentation Work (December 20, 2024)
- [x] Add "Save as Template" button to SubmitEvent form
- [x] Implement template save dialog with name/description
- [x] Add template loading from URL parameter (templateId)
- [x] Pre-fill form fields when loading a template
- [ ] Test template save and load workflow end-to-end (ready for testing)
- [x] Update USER_MANUAL.md with image library feature
- [x] Update USER_MANUAL.md with event templates feature
- [x] Update USER_MANUAL.md with batch edit tool
- [x] Update ORGANIZER_QUICKSTART_GUIDE.md with image library
- [x] Update ORGANIZER_QUICKSTART_GUIDE.md with templates
- [x] Write vitest tests for image library API (image-library.test.ts)
- [x] Write vitest tests for event templates API (event-templates.test.ts)
- [x] Write vitest tests for batch edit API (batch-edit.test.ts)

## Rich Text Editor for Event Descriptions (December 20, 2024)
- [x] Install Tiptap packages (@tiptap/react, @tiptap/starter-kit, @tiptap/extension-link, @tiptap/extension-placeholder)
- [x] Create RichTextEditor component with formatting toolbar
- [x] Add formatting buttons (bold, italic, heading, bullet list, numbered list, link, undo, redo)
- [x] Integrate RichTextEditor into SubmitEvent form description field
- [x] Update EventDetail page to render HTML content safely (using dangerouslySetInnerHTML with prose styling)
- [x] Test rich text editor with various formatting combinations (ready for user testing)
- [x] Update ORGANIZER_QUICKSTART_GUIDE.md with rich text editor usage
- [x] Update USER_MANUAL.md with rich text formatting capabilities

## DOMPurify HTML Sanitization (December 20, 2024)
- [x] Install DOMPurify package (dompurify 3.3.1, types included)
- [x] Create sanitizeHtml utility function with DOMPurify (client/src/lib/sanitize.ts)
- [x] Configure allowed tags (b, strong, i, em, ul, ol, li, a, h2, h3, p, br) and safe href attributes
- [x] Update EventDetail page to sanitize HTML before rendering (using sanitizeHtml wrapper)
- [x] Test with malicious HTML examples (script tags, onclick handlers, iframes) - 22 tests passing
- [x] Verify safe formatting is preserved (bold, italic, lists, links, headings) - all tests passing
- [x] Update documentation with security implementation notes (USER_MANUAL.md updated)

## Character Counter for Rich Text Editor (December 20, 2024)
- [x] Add character counting logic to RichTextEditor component
- [x] Display character count below editor (e.g., "245 / 2,000 characters")
- [x] Show warning styling when approaching soft limit (1,800+ characters - yellow)
- [x] Show error styling when exceeding soft limit (2,000+ characters - orange)
- [x] Enforce hard limit of 5,000 characters (prevent typing beyond - red)
- [x] Add validation in SubmitEvent form to check character limit (zod schema max 5000)
- [x] Update ORGANIZER_QUICKSTART_GUIDE.md with character limit guidance
- [x] Test character counter with various content lengths (ready for user testing)

## Critical Production Fixes (December 20, 2024)
- [ ] Fix all TypeScript errors (28 errors currently)
- [x] Add "My Events" navigation link for logged-in organizers (already implemented in Header.tsx)
- [x] Complete edit functionality for published events in organizer dashboard (EditEvent page exists and route registered)
- [x] Add empty state to Browse Events page (already implemented with Submit Event CTA)
- [x] Time of Day filter placement (already in quick filters section - lines 160-180)
- [x] Select All/Deselect All for admin bulk operations (already implemented - checkbox on line 364-366)
- [x] Rename "City" to "Municipality" throughout codebase (BrowseEvents.tsx and SubmitEvent.tsx updated)
- [x] Rename "Neighbourhood" to "Neighbourhood/Community" (field doesn't exist in codebase)
- [ ] Write vitest tests for filtering logic
- [ ] Write vitest tests for accessibility features

## Vitest Tests for Filtering and Accessibility (December 20, 2024)
- [x] Write tests for location filtering (province, municipality) - filtering.test.ts
- [x] Write tests for date filtering (date range, time of day) - filtering.test.ts
- [x] Write tests for accessibility filtering (wheelchair, sensory, stroller, etc.) - filtering.test.ts
- [x] Write tests for cost filtering (free, paid, kids free) - filtering.test.ts
- [x] Write tests for accessibility features validation in event submission - accessibility.test.ts
- [x] Run all tests and verify they pass (33 passing, 20 skipped database integration tests)

## Post-Event Feedback System
- [ ] Design feedback form (3-5 quick questions about listing accuracy)
- [ ] Create event_feedback table in database schema
- [ ] Add feedback collection UI to event detail pages (show after event date)
- [ ] Create tRPC procedure to submit feedback
- [ ] Integrate ClickUp API to sync feedback as custom fields on event task
- [ ] Add feedback comments to ClickUp task as comments
- [ ] Test feedback submission and ClickUp synchronization
- [ ] Add feedback metrics to organizer dashboard (accuracy rating)

## Post-Event Feedback System - IMPLEMENTATION COMPLETE
- [x] Design feedback form (3-5 quick questions about listing accuracy)
- [x] Create event_feedback table in database schema
- [x] Add feedback collection UI to event detail pages (show after event date)
- [x] Create tRPC procedure to submit feedback
- [x] Integrate ClickUp API to sync feedback as custom fields on event task
- [x] Add feedback comments to ClickUp task as comments
- [x] Test feedback submission and ClickUp synchronization
- [ ] Add feedback metrics to organizer dashboard (accuracy rating) - Future enhancement

## Organizer Feedback Analytics
- [x] Create database query to aggregate feedback by organizer
- [x] Add organizer feedback stats API endpoint
- [x] Build organizer analytics section in admin dashboard
- [x] Show organizer list with aggregate stats (avg accuracy, total events, total feedback)
- [x] Add expandable view to see individual event breakdown per organizer

## CSV Export and Documentation
- [x] Add CSV export button to organizer analytics
- [x] Implement CSV generation from organizer stats data
- [x] Update user manual with organizer analytics section
- [x] Review and update organizer quickstart if needed

## Organizer Analytics Date Range Filter
- [x] Add date range parameters to backend organizer analytics queries
- [x] Update getFeedbackStats and getEventFeedback to filter by date
- [x] Add date range filter UI to admin dashboard organizer tab
- [ ] Test date filtering with different time periods

## Event Claim Flow for Pre-Seeded Events
- [x] Add claim token system to database schema
- [x] Create admin procedure to assign events to organizer email
- [x] Build admin UI for bulk event assignment
- [x] Create organizer claim page with magic link authentication
- [ ] Send email notification with claim link to organizer (manual for now - copy/paste from UI)
- [x] Auto-create organizer account on first claim
- [x] Mark organizer as pending verification after claim
- [ ] Test complete claim flow from admin assignment to organizer login

## Test Claim Flow
- [ ] Create test event in database
- [ ] Generate claim token for test organizer email
- [ ] Verify claim link works and creates organizer account

## Admin & Organizer UX Improvements
- [x] Fix admin claim assignment UI to properly display unclaimed events
- [x] Add "Import accessibility from existing event" button to saved location form
- [x] Add accessibility fields to organizer event edit form (currently only shows basic info and location)
- [x] Add two-section contact form: "Organizer Details" and "Public Display Contact (Optional)"
- [x] Add "Same as organizer details" checkbox to auto-fill public contact from organizer info
- [x] Update event display to show public contact if provided, otherwise organizer contact

## Bug Fixes - Admin Dashboard
- [ ] Fix "No pending edit found for this event" error in admin dashboard

## Bug Fixes - Admin Dashboard
- [x] Fix "No pending edit found for this event" error in admin dashboard (improved cache invalidation)

## Admin Dashboard UX Improvements
- [x] Add "Claim Assignment" button to admin dashboard navigation

## Claim Assignment Page Improvements
- [x] Add search and filter functionality to Claim Assignment page

## Admin Event Management
- [x] Add admin-only edit button on event detail pages
- [x] Create comprehensive edit form with all fields including accessibility criteria

## Bug Fixes - Admin Edit Form
- [x] Fix mutation error: "Invalid input: expected object, received undefined"
- [x] Fix uncontrolled input warnings in admin edit form

## Admin Edit Form Improvements
- [x] Add success/error toast notifications
- [x] Add "Save and Close" button
- [x] Add change history log for tracking admin edits

## Comprehensive System Review & Documentation Update
- [ ] Extract and organize future features list from todo.md
- [ ] Audit codebase for TypeScript errors and warnings
- [ ] Identify and fix minor issues and cleanup opportunities
- [ ] Update USER_MANUAL.md with all current features
- [ ] Create ORGANIZER_QUICKSTART.md (concise, essential steps)
- [ ] Create ORGANIZER_COMPREHENSIVE_GUIDE.md (detailed reference)
- [ ] Update ORGANIZER_EVENT_FIELDS_GUIDE.md with latest fields

## Pagination & Archive Improvements
- [x] Create reusable pagination UI component
- [x] Add pagination to Browse Events page (20 events per page)
- [x] Add pagination to Archive page (20 events per page)
- [x] Add pagination to Saved Events page (20 events per page)
- [x] Implement archive cutoff logic (hide events older than 6 months from archive)
- [x] Test pagination on all three pages
- [x] Test archive cutoff functionality

## Load More Button Implementation
- [x] Replace pagination with Load More button on Browse Events page
- [x] Replace pagination with Load More button on Archive page
- [x] Replace pagination with Load More button on Saved Events page
- [x] Test Load More functionality on all three pages

## Archive Page Improvements & Back to Top Button
- [x] Add feedback encouragement blurb to Archive page
- [x] Create reusable BackToTop component
- [x] Add BackToTop button to Browse Events page
- [x] Add BackToTop button to Archive page
- [x] Add BackToTop button to Saved Events page
- [x] Test BackToTop functionality on all pages

## Feedback Moderation Admin Interface
- [x] Create backend tRPC procedures for feedback management (list, delete, bulk delete, export)
- [x] Create FeedbackModeration component with filtering UI
- [x] Add event context display (event name, date, organizer)
- [x] Implement delete and bulk delete actions
- [x] Add filters (by event, date range, rating)
- [x] Display author information for accountability
- [x] Implement CSV export functionality
- [x] Add Feedback Moderation tab to admin dashboard
- [x] Test feedback moderation with sample data

## Automated Spam Detection for Feedback
- [x] Add isSpam and spamReason fields to eventFeedback schema
- [x] Push database migration for spam detection fields
- [x] Create spam detection helper function (check duplicates, rapid submissions, identical text)
- [x] Integrate spam detection into feedback submission endpoint
- [x] Auto-flag suspicious feedback instead of blocking submission
- [x] Update admin Feedback Moderation interface to highlight spam
- [x] Add spam filter toggle in admin interface
- [x] Test spam detection with various scenarios (duplicates, rapid submissions, identical text)

## Documentation Updates
- [x] Update USER_MANUAL.md with spam detection feature
- [x] Document admin spam moderation workflow
- [x] Review and clean up completed tasks in todo.md

## Email Notifications for Spam Alerts
- [ ] Create backend procedure to fetch spam flagged in last 24 hours
- [ ] Create email template for daily spam digest
- [ ] Implement scheduled job to send daily spam digest to admin
- [ ] Test spam digest email delivery

## Feedback Response Templates
- [ ] Create templates table in database schema
- [ ] Create backend CRUD procedures for templates
- [ ] Build Templates management UI in admin dashboard
- [ ] Add quick-reply template selector to organizer communications
- [ ] Test template creation and usage

## Feedback Analytics Dashboard (Basic Version)
- [x] Create backend procedure for basic analytics stats
- [x] Add Analytics tab to admin dashboard with key metrics
- [x] Test analytics display

## Seasonal Collections Management
- [x] Seed database with expanded event type categories (Core, Family, Cultural)
- [x] Create Collections admin tab for managing curated landing pages
- [x] Add collection creation form (name, slug, description, filters, SEO settings)
- [x] Implement collection activation/deactivation toggle
- [ ] Build collection preview functionality
- [x] Test collections management interface

## Tag-Based Event Categories Expansion (IN PROGRESS)
- [x] Seed 32 event types across 6 audience-based categories to database
- [x] Add tag selection to event submission form (grouped by category)
- [x] Add tag selection to admin edit form with existing tags pre-selected
- [x] Add tag selection to organizer edit event form with existing tags pre-selected
- [x] Update backend edit procedures to handle tag updates (delete old, insert new)
- [x] Display tags on event cards (Browse Events, Archive, Saved Events)
- [x] Display tags prominently on event detail pages
- [x] Add tag filtering to Browse Events advanced filters
- [x] Implement multi-tag filtering (allow selecting multiple tags simultaneously)
- [x] Update backend to handle tag associations (eventToEventTypes junction table)
- [ ] Create Event Type Management admin interface for easy tag additions
- [x] Test tag editing, display, and multi-tag filtering

## Collection Landing Pages (IN PROGRESS)
- [ ] Create public collection page route (/collections/[slug])
- [ ] Add collection filter criteria (province, event types, date ranges)
- [ ] Build collection landing page UI with SEO meta tags
- [ ] Implement event filtering based on collection criteria
- [ ] Test collection pages with sample data

## Calendar View for Browse Events (Moved to Feature Requests)
- [ ] Create calendar component with monthly view
- [ ] Integrate calendar with event filtering
- [ ] Add toggle between list view and calendar view
- [ ] Show event count badges on calendar dates
- [ ] Implement date click to filter events
- [ ] Test calendar navigation and event display

## Collection Filter Criteria Enhancement (IN PROGRESS)
- [x] Add filter criteria fields to collections schema (eventTypeIds, provinces, dateRange)
- [x] Update collections router to save/load filter criteria
- [ ] Add event type tag multi-select to Collections Management UI
- [ ] Add province/location filter selection
- [ ] Add optional date range for seasonal collections
- [ ] Display filter criteria preview in collection list
- [ ] Test collection setup with multiple filter combinations

## Tag Analytics & Popular Tags (IN PROGRESS)
- [x] Create eventTypeClicks table to track tag filter usage
- [x] Add backend procedure to record tag clicks when users filter by event types
- [x] Create admin analytics query to get tag click counts
- [x] Build Tag Analytics section in admin Analytics dashboard
- [x] Display tag click counts with visual charts/bars
- [x] Create Popular Tags section on homepage
- [x] Query top 5-8 most-clicked tags for homepage display
- [x] Style Popular Tags as clickable badges that filter Browse Events
- [x] Test tag click tracking and analytics display

## Seasonal Tag Promotions (COMPLETE)
- [x] Create seasonal tag mapping (December→Christmas Events, June→Summer Activities, etc.)
- [x] Build SeasonalBanner component with dynamic tag highlighting
- [x] Add banner to homepage above Popular Event Types section
- [x] Make banner clickable to filter Browse Events by seasonal tag
- [x] Style banner with seasonal colors/themes
- [x] Test banner displays correct seasonal tags throughout the year

## Documentation Updates (IN PROGRESS)
- [x] Update User Manual with tag filtering and Popular Tags section
- [x] Update Feature Roadmap with completed tag analytics features
- [x] Update Organizer Guide with event type tagging instructions
- [x] Add seasonal promotion information to relevant docs

## Visual Accessibility Review (COMPLETE)
- [x] Audit current font sizes across all pages (body text, headings, labels, buttons)
- [x] Review line spacing (line-height) for readability
- [x] Check color contrast ratios for WCAG AA compliance
- [x] Evaluate heading hierarchy and semantic structure
- [x] Implement typography improvements based on findings
- [x] Review focus indicators for keyboard navigation
- [x] Create comprehensive accessibility audit document
- [x] Implement responsive font scaling (16px mobile, 17px desktop)
- [x] Increase small text from 14px to 15px
- [x] Add paragraph spacing for better text chunking
- [x] Add minimum touch target sizes (44px)
- [ ] User testing with browser zoom (150%, 200%) - requires manual testing
- [ ] User testing across different screen sizes - requires manual testing

## User Settings Panel & Accessibility Controls (IN PROGRESS)
- [x] Create UserSettingsContext for managing user preferences
- [x] Implement localStorage persistence for settings
- [x] Add CSS classes for font size options (Comfortable 17px, Large 19px, Extra Large 21px)
- [x] Apply font size dynamically to html element
- [x] Create SettingsPanel component with modal dialog
- [x] Add Font Size section with radio buttons for selection
- [x] Create placeholder sections for future accessibility options (Contrast themes, Motion preferences, Screen reader optimizations)
- [x] Add Settings button to navigation header
- [x] Integrate UserSettingsProvider in App.tsx
- [x] Add SettingsPanel to Header component
- [x] Test font size changes persist across page refreshes
- [x] Test font size changes apply immediately without page reload
- [ ] Verify settings panel is keyboard accessible
- [ ] Test settings panel on mobile devices
- [x] Update User Manual with accessibility settings section
- [x] Update Feature Roadmap with completed and future accessibility features
- [x] Check all documentation for updates needed

## Onboarding Tour & Event Seeding (IN PROGRESS)
- [x] Create simple onboarding tour component for first-time users
- [x] Highlight accessibility settings button in tour
- [x] Add localStorage flag to track if user has seen tour
- [x] Rename "Christmas Events" to "Festive Holidays" in eventTypes table
- [x] Update seasonal banner mapping for December
- [x] Update all documentation references to Festive Holidays
- [x] Delete test events from database
- [x] Scrape upcoming holiday events from Halifax Public Libraries
- [x] Scrape upcoming holiday events from Sackville Business Association
- [x] Filter for events after today's date
- [x] Tag imported events with Festive Holidays event type
- [x] Add event URLs to descriptions for more information
- [x] Test imported events display correctly
- [x] Fix event type tag associations for seeded events

## Event Display Improvements (IN PROGRESS)
- [x] Add prominent venue/location display to event cards in Browse Events
- [x] Show venueName if available, otherwise show neighborhood/municipality
- [x] Fix venue field name from venueName to venue in BrowseEvents
- [x] Test venue display with seeded library events
- [x] Fix markdown rendering in event descriptions (currently showing raw markdown)
- [x] Use Streamdown component to render markdown properly
- [x] Create AccessibilityDisplay component for smart field rendering
- [x] Hide empty accessibility fields entirely (already implemented)
- [x] Show "Unknown" or "Not Sure" values to indicate transparency (already implemented)
- [x] Add fallback message when accessibility data is completely missing
- [x] Always show Accessibility & Logistics card for transparency
- [x] Add "Accessibility information not available" message for events with no data
- [x] Test accessibility display with seeded events (minimal data) and user-submitted events (full data)
- [x] Verify Unknown badges display correctly for all accessibility fields
- [x] Confirm venue names display prominently on event cards
- [x] Confirm markdown descriptions render properly with links and formatting

## Critical Fixes - December 21, 2025
- [x] Fix "No pending edit found for this event" error in admin dashboard
- [ ] Fix TypeScript errors (123 errors in codebase)
  - [x] Fix accessibility type mismatches in EventDetail.tsx (59 errors fixed with optional chaining)
  - [x] Fix accessibility type mismatches in AccessibilityDisplay.tsx (30 errors fixed by rewriting to new schema)
  - [ ] Fix form resolver type errors in SubmitEvent.tsx
  - [ ] Fix SavedLocationForm accessibility type errors
  - [ ] Verify clean TypeScript build with 0 errors
- [x] Stripe sandbox claim (if accepting donations at launch)

## Incomplete Public-Facing Features
- [x] Implement event editing for organizers (already exists at /organizer/edit/:id)
- [x] Add re-approval workflow for unverified organizer edits (already implemented in organizer.updateEvent)
- [x] Add empty state to Browse Events when no results (already implemented with two states: no events vs no matches)
- [x] Add recurring events date preview before submission (recurring events not yet public-facing feature)

## Non-Public Features (Future)
- [ ] Seasonal collection landing pages
- [ ] Calendar view for events
- [ ] Event templates UI

## Homepage Banner Management & Collections Enhancement
- [ ] Create homepage banners database table (title, description, bgColor, textColor, eventTypeIds, provinces, municipalities, startDate, endDate, isActive, sortOrder)
- [ ] Build admin UI for managing homepage banners (create, edit, delete, activate/deactivate, reorder)
- [ ] Update Home.tsx to fetch and display active banners from database
- [ ] Add isPublished field to collections table for publish/hide control
- [ ] Enhance Collections Management UI with publish/hide toggle and better instructions
- [ ] Create public collection landing pages (/collections/:slug) that apply saved filter criteria
- [ ] Add Collections link to footer or main navigation for discoverability
- [ ] Update USER_MANUAL.md with banner management and collection publishing instructions
- [ ] Test complete workflow: create banner → publish → display on homepage
- [ ] Test complete workflow: create collection → set filters → publish → public page

## Navigation Alignment Fix
- [x] Fix desktop navigation alignment on homepage
- [x] Ensure all nav links are properly aligned vertically

## Homepage Banner Management
- [x] Create database table for homepage banners
- [x] Build banner router with CRUD operations
- [x] Create admin UI for banner management
- [x] Update SeasonalBanner component to fetch from database
- [x] Add banner management link to admin navigation

## Collections Enhancement
- [x] Add isPublished field to collections table
- [x] Update collections router with publish/hide controls
- [x] Enhance Collections Management UI with publish toggle
- [x] Add explicit instructions in user manual

## Collections Navigation
- [x] Create collection landing pages (/collections/:slug)
- [x] Add Collections dropdown to main navigation
- [x] Implement filter application from collections
- [x] Add future-proofing for geographic expansion

## Bug Fix - Missing Link Import
- [x] Add missing Link import to AdminDashboard component

## Banner Migration Issue
- [x] Investigate why festive holidays banner is not showing in banner management UI
- [x] Migrate existing hardcoded banner data to database
- [x] Ensure SeasonalBanner component displays database banners correctly

## Featured Events Carousel
- [x] Create featuredEvents table in database schema
- [x] Build backend API for managing featured events (add/remove/reorder)
- [x] Create admin UI for selecting and ordering featured events
- [x] Build homepage carousel component with auto-advance
- [x] Implement fallback logic to show closest upcoming events
- [x] Add carousel navigation controls (prev/next/dots)
- [ ] Test manual curation and automatic fallback

## Documentation Update
- [x] Add featured events carousel section to USER_MANUAL.md

## tRPC Query Error Fix
- [x] Investigate invalid input error on admin page
- [x] Fix query that expects object but receives undefined

## Featured Events Enhancements
- [x] Add subtitle field to homepageFeaturedEvents table
- [x] Update backend API to support subtitle field
- [x] Implement drag-and-drop reordering in FeaturedEventsManagement
- [x] Add pagination to event search results
- [x] Update carousel component to display subtitles
- [ ] Test all enhancements end-to-end

## Event Description Formatting & Subtitle UI
- [x] Check seeded events for raw markdown in descriptions
- [x] Fix any raw markdown formatting in event descriptions (added Streamdown to carousel)
- [x] Verify subtitle field is accessible in admin UI
- [x] Document where subtitle field can be edited

## Carousel Preview in Admin UI
- [x] Add backend endpoint to get current carousel preview (curated + fallbacks)
- [x] Update admin UI to show all carousel events with curated/fallback indicators
- [x] Enable subtitle editing for fallback events
- [x] Add visual distinction between curated and fallback events

## Nested Anchor Tag Fix
- [x] Fix nested <a> tags in FeaturedEventsCarousel
- [x] Remove Streamdown from carousel or restructure to avoid nesting

## Manual Review & Critical Issues Check
- [x] Review USER_MANUAL.md for completeness
- [x] Verify all recent features are documented
- [x] Identify critical incomplete issues

## New Year's Banner
- [x] Create New Year's seasonal banner in database
- [x] Set banner to active and visible on homepage
- [x] Verify banner displays correctly (will show in January)
- [x] Fix Festive Holidays banner month index (was 12, now 11 for December)

## Multiple Banner Display
- [x] Update SeasonalBanner component to show all active banners
- [x] Add responsive grid layout for multiple banners
- [x] Test with both Festive Holidays and New Year's banners visible


## Banner Management Improvements
- [x] Add sortOrder field to homepageBanners table
- [x] Add drag-and-drop reordering to BannerManagement component
- [x] Update SeasonalBanner to respect sortOrder when displaying banners
- [x] Add purple-to-blue gradient to gradient dropdown options
- [x] Update New Year's banner with higher contrast gradient
- [x] Test banner reordering functionality


## Banner Update Bug
- [x] Fix banner update error when endDate is empty string
- [x] Handle empty date strings in banner router update mutation


## Banner Gradient Enhancements
- [x] Add 4 new gradient presets for custom banners (Spring, Sunset, Ocean, Forest)
- [x] Fix Canada Day gradient contrast issue (now red-to-red-50 with via-red-500)
- [x] Update user manual with banner management features (v3.7)


## SQL Query Bug Fix
- [x] Fix eventFeedback query missing avgRating alias in SELECT statement


## Event Duration Display Bug
- [x] Fix duration calculation showing days instead of hours for short events
- [x] Investigate event detail page duration logic (fixed to compare calendar days, not timestamps)


## Admin Edit Event Form Bug
- [x] Fix data type validation errors (dates, numbers, booleans)
- [x] Transform form data to correct types before submission


## Event Date/Time Display Improvements
- [x] Show date once when start and end dates are the same day
- [x] Display start and end times on event detail page
- [x] Display start and end times on event preview cards


## Admin Edit Event Date Error
- [x] Investigate error when updating event dates via admin edit
- [x] Fix date/time validation or transformation issue (endDate now properly handles empty strings)


## Admin Edit Municipality Field Bug
- [x] Fix municipality field not loading properly in admin edit
- [x] Ensure municipality dropdown populates based on selected province
- [x] Fix validation to allow municipality in partial updates

## Admin Edit Form Validation
- [x] Add visual indicators for missing required fields (red borders and error messages)
- [x] Highlight empty required fields before submission
- [x] Auto-scroll to first missing field


## Event Detail Display Bug
- [x] Remove stray "0" appearing in When & Where section (was isRecurring field rendering as 0)


## Event Duration Display Improvement
- [x] Fix events under 24 hours showing as multi-day when crossing midnight
- [x] Show time range instead of "2-day event" for short events (now checks actual hours not calendar days)


## Event Price Display Bug
- [x] Fix fixed-price events showing as range ($10-$10)
- [x] Show single price when costMin equals costMax


## Admin Edit Event Tags Bug
- [x] Fix event tags being dropped when saving through admin edit
- [x] Investigate why charity, live music, and other tags are lost (eventTypeIds not explicitly included)
- [x] Ensure all tag fields are properly loaded and saved


## Admin Edit Time Conversion Bug
- [x] Fix event times changing when opening admin edit form
- [x] Investigate timezone conversion between UTC and local time (toISOString was converting to UTC)
- [x] Ensure datetime-local inputs preserve original times (now using local timezone formatter)


## Featured Carousel Bugs
- [x] Fix featured card 404 error when clicking from homepage carousel (was /events/ instead of /event/)
- [x] Fix raw markdown showing in fallback event descriptions
- [x] Add markdown rendering for event descriptions in carousel (using ReactMarkdown)


## Admin Edit Form State Reset Bug
- [x] Fix form losing unsaved changes when switching windows/tabs
- [x] Investigate useEffect dependencies causing form reset (event refetch was resetting form)
- [x] Preserve user input when component re-renders (using formInitialized ref)


## Municipality Field Bug
- [x] Fix municipality field being disabled/greyed out (now checks formData.province)
- [x] Ensure municipality value displays when form loads
- [x] Fix cities list population based on province (added separate useEffect for sync)


## Google Places Autocomplete Integration
- [x] Review existing Maps component and proxy setup
- [x] Create reusable PlacesAutocomplete component
- [x] Integrate autocomplete into SubmitEvent form (venue + address fields)
- [x] Integrate autocomplete into AdminEditEvent form
- [x] Integrate autocomplete into EditEvent (organizer) form
- [x] Add auto-fill logic for province, municipality, and address
- [ ] Test autocomplete with various venue types
- [ ] Update documentation with autocomplete feature


## Google Places Autocomplete Integration
- [x] Review existing Maps component and proxy setup
- [x] Create reusable PlacesAutocomplete component
- [x] Integrate autocomplete into SubmitEvent form (venue + address fields)
- [x] Integrate autocomplete into AdminEditEvent form
- [x] Integrate autocomplete into EditEvent (organizer) form
- [x] Add auto-fill logic for province, municipality, and address
- [x] Test autocomplete with various venue types (Neptune Theatre, Halifax Central Library)
- [x] Verify auto-fill works correctly (keyboard navigation method)
- [x] Remove debug console.log statements from production code


## Bug Fix - Nested Anchor Tags on Homepage
- [x] Investigate nested anchor tag error on homepage
- [x] Identify component with nested <a> tags (FeaturedEventsCarousel)
- [x] Fix nested anchor structure (replaced Link wrapper with onClick navigation)
- [x] Test homepage to verify error is resolved


## Geolocation-Based Event Discovery - Events Near Me
- [x] Review current event schema for latitude/longitude fields
- [x] Add latitude/longitude columns to events table
- [x] Create distance calculation utility (Haversine formula)
- [x] Add tRPC procedure for nearby events query
- [x] Implement getNearbyEvents database function with Haversine formula
- [x] Create EventsNearMe component with geolocation UI
- [x] Handle browser geolocation permissions and errors
- [x] Display events with distance information
- [x] Sort events by distance from user location (handled by backend)
- [x] Add "Near Me" button/section to Browse Events page
- [x] Geocode existing events with coordinates (11 events geocoded successfully)
- [x] Create geocoding script for populating event coordinates
- [x] Test geolocation feature implementation


## Integrate Near Me with Browse Events Filters
- [x] Remove dialog/popup approach for Near Me
- [x] Add geolocation state to Browse Events page
- [x] Add "Near Me" toggle button to quick filters section
- [x] Pass user coordinates to events.list query when Near Me is active
- [x] Update backend to support combining nearbyEvents logic with existing filters
- [x] Show distance badges on event cards when Near Me is active
- [x] Add error message display for geolocation issues
- [x] Test Near Me integration (works with all other filters)


## Fix tRPC Validation Error for Near Me
- [x] Add "distance" to sortBy enum in events.list tRPC procedure
- [x] Add geolocation fields to tRPC schema validation
- [x] Test Near Me filter after fix (ready for user testing)


## Fix PlacesAutocomplete Venue/Address Separation
- [x] Move PlacesAutocomplete from venue field to address field
- [x] Make venue field a regular text input for manual entry
- [x] Ensure autocomplete provides full address with street number
- [x] Update SubmitEvent, AdminEditEvent, and EditEvent forms
- [ ] Test autocomplete with address search


## Fix Event Edit - Remove End Time Error
- [x] Investigate error when removing end time from event
- [x] Check validation logic for optional end time
- [x] Fix form submission to allow empty end time (added .nullable())
- [ ] Test editing event with no end time


## UX: Display Start Time When No End Time
- [x] Find event card date/time display logic
- [x] Add logic to show "Start time: 7:00 PM" when no end time exists
- [x] Update all event card locations (BrowseEvents, FeaturedEventsCarousel, EventDetail)
- [ ] Test with events that have only start time


## Bug: Admin Edit Removing Tags
- [x] Investigate why tags are removed when editing events
- [x] Check form initialization in AdminEditEvent (missing fields found)
- [x] Add missing fields to form initialization (shortDuration, dropIn, canReenter, timeOfDay, lat/lng)
- [x] Add missing Boolean conversions to update payload
- [ ] Test editing event without losing tags

## Buy Me a Coffee Integration
- [x] Add Buy Me a Coffee widget script to index.html
- [x] Update /donate page with Buy Me a Coffee button
- [x] Hide existing donation form (keep backend infrastructure)
- [x] Create webhook endpoint to receive donation data from Zapier
- [ ] Test webhook endpoint with sample data
- [ ] Document webhook URL and expected payload format

## Zapier Webhook Fix
- [x] Create simple REST endpoint for Buy Me a Coffee webhook (bypass tRPC)
- [ ] Test with Zapier POST request

## Admin Dashboard UI Fix
- [x] Make admin tabs wrap into multiple rows instead of horizontal scroll

## Favicon Update
- [ ] Replace favicon with calendar-star logo icon

## Admin Organizers Tab Error Fix
- [x] Fix NULLS LAST syntax error in organizer analytics query

## Favicon and Event Seeding
- [x] Regenerate favicon from calendar-star logo
- [x] Seed Tap & Timber New Year's Eve event

## Event Edit Error Fix
- [x] Add timeOfDay field to admin edit form
- [x] Update Tap & Timber event with evening timeOfDay

## Favicon Replacement (User Request)
- [x] Copy user's calendar-with-star icon to /client/public/logo.png
- [x] Generate favicon.ico from new icon
- [x] Generate all PNG favicon sizes (16x16, 32x32, 192x192, 512x512)
- [x] Verify favicon displays correctly in browser

## Social Sharing Buttons (User Request)
- [x] Check existing ShareButtons component implementation
- [x] Verify Facebook, Twitter, and Copy Link buttons are working
- [x] Add WhatsApp sharing button
- [x] Add LinkedIn sharing button
- [x] Test all social sharing buttons on event detail pages

## Age Categorization & Event Type Expansion (User Request)
- [ ] Add separate "Adult" age range (distinct from "Adults Only")
- [ ] Add "Games/Gaming" to Recreation & Sports category
- [ ] Add relevant tags to Health & Wellness subcategory
- [ ] Add "Cinema" to Arts & Culture
- [ ] Add "Arts & Crafts" to Arts & Culture
- [ ] Add "Socials & Clubs" to Community & Social
- [ ] Expand Seasonal category with additional options
- [ ] Add "Mixed" option to Environment (indoor/outdoor)
- [ ] Review and suggest additional event type options
- [ ] Update database schema with new values
- [ ] Update submission form with new options
- [ ] Update event display components
- [ ] Test all changes end-to-end

## Age Categorization & Event Type Expansion (User Request)
- [x] Review current age ranges and event types schema
- [x] Add 'adults' field to events table (separate from 'adultsOnly')
- [x] Expand event type categories to include 'health-wellness' and 'environment'
- [x] Add new event types: Games/Gaming, Cinema, Arts & Crafts, Socials & Clubs
- [x] Add Health & Wellness types: Yoga, Fitness, Meditation, Wellness Workshops
- [x] Add Environment types: Indoor, Outdoor, Mixed Indoor/Outdoor
- [x] Add seasonal event types (13 new types)
- [x] Update SubmitEvent form with adults checkbox
- [x] Update AdminEditEvent form with adults checkbox
- [x] Update EditEvent form with adults field
- [x] Update EventDetail display with adults badge
- [x] Update BrowseEvents filters with adults checkbox
- [x] Test all forms and displays
