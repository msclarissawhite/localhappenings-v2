# Local Happenings - Future Features List

This document contains features that have been identified but not yet implemented. They are organized by priority and category.

## High Priority - User Experience

### Seasonal/Curated Collections
- [x] Create seasonal banner system highlighting timely event types
- [x] Implement tag-based event categorization (32 types across 6 categories)
- [x] Build tag analytics tracking system
- [x] Add Popular Tags section on homepage
- [ ] Build full curated collection system with admin controls
- [ ] Add collection badges to event cards

### Municipality Field Refactoring
- [ ] Scrape Wikipedia for complete Nova Scotia municipalities list
- [ ] Rename "City" field to "Municipality" throughout system
- [ ] Rename "Neighbourhood" field to "Neighbourhood/Community"
- [ ] Update all client component and page references
- [ ] Replace cities list with municipalities in canadian-locations.ts
- [ ] Test all forms and displays after refactoring

### Accessibility Testing & Tooltips
- [ ] Create tooltip content for all 40+ accessibility fields explaining "why this matters"
- [ ] Add tooltip component to submission form
- [ ] Test tooltip display and accessibility
- [ ] Test accessibility features and mobile responsiveness across devices

## Medium Priority - Organizer Features

### Organizer Documentation
- [ ] Create comprehensive PDF quickstart guide for organizers
- [ ] Create web version of quickstart guide
- [ ] Add download link to organizer dashboard
- [ ] Document how to edit email templates
- [ ] Document how to configure email settings
- [ ] Document how to test email delivery

### Feature Request System Enhancements
- [ ] Add admin controls for feature request status management
- [ ] Test ClickUp integration end-to-end
- [ ] Implement automated sync between ClickUp and feature request board

## Medium Priority - Revenue Features

### Voluntary Donations System
- [ ] Test Stripe connection with live keys
- [ ] Create donation checkout flow
- [ ] Build payment success/cancel handlers
- [ ] Add donation tracking to analytics dashboard
- [ ] Create donor wall page
- [ ] Write vitest tests for donation flow

### Featured Event Placement (Paid)
- [ ] Create Stripe checkout session for featured event payment
- [ ] Add isFeatured logic to event queries with date range check
- [ ] Update Browse Events to show featured events at top with badge
- [ ] Update Archive page to show featured events prominently
- [ ] Add "Feature This Event" button to organizer dashboard
- [ ] Create products.ts file with featured event product definition
- [ ] Create admin view for featured events revenue
- [ ] Write vitest tests for featured event logic
- [ ] Test with Stripe test card (4242 4242 4242 4242)
- [ ] Discuss UI placement options with user

## Low Priority - Technical Improvements

### Testing & Quality Assurance
- [ ] Write vitest tests for filtering logic
- [ ] Write vitest tests for all new accessibility fields
- [ ] Test user login and event saving workflow end-to-end
- [ ] Align accessibility features with browse/filter options
- [ ] Verify new fields display correctly on event detail pages

### Advanced Filtering
- [ ] Add all accessibility options to Browse Events advanced filters
- [ ] Move Time of Day filter from advanced to quick filters section
- [ ] Test complete accessibility workflow end-to-end

## Completed Features (Marked for Reference)

### Recently Completed
- [x] Admin edit functionality with change history log
- [x] Save and Close button for admin edits
- [x] Toast notifications for save success/failure
- [x] Claim Assignment page with search and filters
- [x] Admin-only edit button on event detail pages
- [x] Comprehensive edit form with all fields including accessibility

### Major Completed Features
- [x] Event type tagging system (32 types across 6 categories)
- [x] Tag analytics dashboard for admins
- [x] Popular Tags section on homepage
- [x] Seasonal banner promotions
- [x] Multi-tag filtering in Browse Events
- [x] Tag display on event cards and detail pages
- [x] Organizer dashboard with magic link authentication
- [x] Event edit and re-approval workflow
- [x] Bulk recurring events with preview
- [x] Admin bulk approval with keyboard shortcuts
- [x] Duplicate event detection
- [x] Email notifications via Resend
- [x] Organizer verification system
- [x] Saved locations feature
- [x] User authentication and bookmarking
- [x] Feature request board with upvoting
- [x] Email reminders for saved events
- [x] Analytics dashboard
- [x] Social media sharing
- [x] Image upload to S3
- [x] Google Maps integration
- [x] Archive page for past events
- [x] Contact form

## Notes

- Total uncompleted tasks: 127
- Most uncompleted tasks are future enhancements, not bugs
- System is fully functional for current use case
- Priority should be given to documentation updates before adding new features
