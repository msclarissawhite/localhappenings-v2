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
