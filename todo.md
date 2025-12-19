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
