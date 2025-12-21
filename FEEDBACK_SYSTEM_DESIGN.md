# Post-Event Feedback System Design

## Overview
Allow event attendees to provide quick feedback about listing accuracy after attending an event. This helps identify reliable organizers for verified status and improves data quality.

## User Experience

### When Feedback Appears
- Show feedback prompt on event detail page **after** the event's end date/time has passed
- Display as a collapsible card: "Attended this event? Help us improve!"
- Non-intrusive, optional participation

### Feedback Form (3-5 Questions)

**Question 1: Did you attend this event?**
- Yes
- No (if No, hide remaining questions)

**Question 2: How accurate was the event listing?**
- Very Accurate (5/5) - Everything matched perfectly
- Mostly Accurate (4/5) - Minor differences
- Somewhat Accurate (3/5) - Some important details were wrong
- Not Accurate (2/5) - Many things didn't match
- Very Inaccurate (1/5) - Almost nothing was correct

**Question 3: Which details were most helpful? (Select all that apply)**
- Accessibility information
- Parking/transit details
- Cost information
- Age appropriateness
- Venue/location details
- Time/schedule

**Question 4: What was inaccurate or missing? (Optional, select all that apply)**
- Accessibility features
- Parking/transit info
- Cost details
- Age appropriateness
- Venue/location
- Time/schedule
- Event was cancelled/rescheduled
- Other (specify in comments)

**Question 5: Additional comments (Optional)**
- Free text field (max 500 characters)
- Placeholder: "Any other feedback to help us improve this listing?"

## Database Schema

```sql
CREATE TABLE event_feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  eventId INT NOT NULL,
  attended BOOLEAN NOT NULL,
  accuracyRating INT, -- 1-5 scale
  helpfulDetails JSON, -- array of selected helpful categories
  inaccurateDetails JSON, -- array of selected inaccurate categories
  comments TEXT,
  submittedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (eventId) REFERENCES events(id)
);
```

## ClickUp Integration

### Custom Fields to Add to Event Tasks
1. **Feedback Count** (Number) - Total feedback submissions
2. **Average Accuracy** (Number) - Average of accuracyRating (1-5 scale)
3. **Attended Count** (Number) - How many people said they attended
4. **Last Feedback Date** (Date) - When most recent feedback was received

### Sync Logic
When feedback is submitted:
1. Calculate aggregated metrics for the event (count, average rating, attended count)
2. Update ClickUp custom fields via API
3. Add individual feedback comment to ClickUp task as a comment with format:
   ```
   📊 Event Feedback Received
   Rating: ⭐⭐⭐⭐⭐ (5/5)
   Attended: Yes
   Helpful: Accessibility information, Parking/transit details
   Inaccurate: Cost details
   Comments: "The event was great but parking was $10, not free as listed."
   Submitted: Dec 20, 2024 7:30 PM
   ```

## Implementation Plan

### Phase 1: Database & Backend
- Add event_feedback table to schema
- Create tRPC procedures:
  - `feedback.submit` - Submit new feedback
  - `feedback.getForEvent` - Get all feedback for an event (admin only)
  - `feedback.getStats` - Get aggregated stats for an event

### Phase 2: Frontend UI
- Create FeedbackForm component
- Add feedback section to EventDetail page (conditional on event date passed)
- Show "Thank you" message after submission
- Display aggregate feedback stats to admins in admin dashboard

### Phase 3: ClickUp Integration
- Install ClickUp API client
- Create ClickUp service helper
- Implement custom field updates
- Implement comment posting
- Add error handling and retry logic

### Phase 4: Testing
- Test feedback submission flow
- Verify ClickUp sync works correctly
- Test edge cases (no ClickUp task ID, API failures)
- Test aggregate calculations

## Benefits

### For You (Admin)
- **Organizer Trust Score**: Identify reliable organizers based on accuracy ratings
- **Fast-track Verification**: Auto-approve organizers with 4.5+ average rating and 5+ feedback submissions
- **Data Quality**: Know which fields need improvement
- **Community Engagement**: Show attendees their feedback matters

### For Organizers
- **Reputation Building**: High accuracy ratings lead to verified status
- **Improvement Insights**: Learn what to improve in future listings
- **Visibility Boost**: Verified organizers get priority placement (future feature)

### For Users
- **Trust Signals**: See verified organizers with proven accuracy
- **Better Listings**: Feedback loop improves data quality over time
- **Community Contribution**: Feel good about helping others

## Privacy & Moderation
- Feedback is **anonymous** (no user accounts required)
- Comments are **moderated** before showing publicly (optional future feature)
- Only **aggregate stats** shown publicly (e.g., "4.5/5 based on 12 reviews")
- Individual feedback visible only to admins in ClickUp

## Future Enhancements
- Email organizers when they receive feedback
- Show aggregate feedback stats on event cards ("4.5★ accuracy")
- Add "Verified Organizer" badge based on feedback threshold
- Public feedback display (moderated comments only)
- Feedback trends dashboard for admins
