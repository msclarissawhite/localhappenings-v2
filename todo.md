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
- [ ] Create project checkpoint
- [ ] Deliver website to user
