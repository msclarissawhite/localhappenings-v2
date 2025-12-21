# Local Happenings - Event Fields Guide

**Version:** 2.0  
**Last Updated:** December 21, 2025  
**Author:** Manus AI

---

This guide provides detailed explanations for every field in the Local Happenings event submission form. Fields marked **REQUIRED** must be completed before submission. All other fields are optional but strongly encouraged—the more information you provide, the easier it is for families to find events that meet their needs.

---

## Table of Contents

1. [Basic Event Information](#basic-event-information)
2. [Location](#location)
3. [Date & Time](#date--time)
4. [Recurring Events](#recurring-events)
5. [Cost & Pricing](#cost--pricing)
6. [Age Suitability](#age-suitability)
7. [Event Environment](#event-environment)
8. [Accessibility Information](#accessibility-information)
9. [Organizer Information](#organizer-information)
10. [Additional Notes](#additional-notes)

---

## Basic Event Information

### Event Name
**Required:** Yes  
**Type:** Text (max 200 characters)  
**Description:** The name of your event as it will appear in listings and search results.  
**Example:** "Winter Carnival at City Park" or "Family Storytime at Central Library"  
**Tips:** Keep it concise and descriptive. Include the location if it helps distinguish your event from similar ones.

### Description
**Required:** Yes  
**Type:** Rich text (supports formatting)  
**Description:** A detailed explanation of what happens at your event, what attendees can expect, and any important details.  
**Formatting Tools:** The description editor includes a toolbar with options for bold text, italic text, bullet lists, numbered lists, headings, hyperlinks, and undo/redo.  
**Example:** "Join us for an afternoon of ice skating, hot chocolate, and live music. Activities for all ages including a kids' zone with face painting, crafts, and storytelling. Bring your own skates or rent on-site for $5. Hot chocolate provided by local café."  
**Tips:** Answer these questions in your description: What will attendees do? Who is the event for? What should they bring? How can they register? Use headings and bullet lists to organize long descriptions.

### Event Image
**Required:** No (but strongly recommended)  
**Type:** Image upload (JPG, PNG, or WebP)  
**Size Limit:** 5MB  
**Optimal Dimensions:** 1200×630px (horizontal/landscape orientation)  
**Description:** A photo of the event, venue, or activity that represents what attendees will experience.  
**Tips:** Events with images receive significantly more views. Use horizontal photos for best display. The platform automatically resizes images to 1200×630px. Ensure you have permission to use the image.

---

## Location

### Province/Territory
**Required:** Yes  
**Type:** Dropdown  
**Options:** All Canadian provinces and territories  
**Description:** The province or territory where your event takes place.  
**Example:** Nova Scotia  
**Tips:** Local Happenings currently focuses on Nova Scotia events, but the platform supports all Canadian locations for future expansion.

### Municipality
**Required:** Yes  
**Type:** Dropdown (populated based on selected province)  
**Options:** Cities and towns within the selected province  
**Description:** The city, town, or municipality where your event takes place.  
**Example:** Halifax, Dartmouth, Bedford, Truro  
**Tips:** Select the official municipality name. The dropdown automatically updates based on your province selection.

### Neighbourhood/Community
**Required:** No  
**Type:** Text  
**Description:** The specific neighborhood or community area within the municipality.  
**Example:** North End, Downtown, Clayton Park, Hydrostone  
**Tips:** This helps local residents find events in their immediate area. Use commonly recognized neighborhood names.

### Venue Name
**Required:** No  
**Type:** Text  
**Description:** The name of the location where the event takes place.  
**Example:** Halifax Central Library, Citadel Hill, Point Pleasant Park, Community Centre  
**Tips:** Include the full official name of the venue. This helps with recognition and search.

### Street Address
**Required:** No  
**Type:** Text  
**Description:** The complete street address of the venue.  
**Example:** 5440 Spring Garden Road, Halifax, NS B3J 1E9  
**Tips:** Providing the full address helps attendees plan their route and assess accessibility before arriving. Include postal code if possible.

---

## Date & Time

### Start Date
**Required:** Yes  
**Type:** Date picker  
**Description:** The date when your event begins.  
**Format:** YYYY-MM-DD  
**Example:** 2025-01-15  
**Tips:** Submit events at least 2-3 weeks in advance to allow time for approval and promotion.

### End Date
**Required:** No  
**Type:** Date picker  
**Description:** The date when your event ends. Used for multi-day events like festivals, camps, or exhibitions.  
**Format:** YYYY-MM-DD  
**Example:** 2025-01-17 (for a 3-day event from Jan 15-17)  
**Tips:** Leave blank for single-day events. The platform automatically calculates and displays duration (e.g., "3-day event").

### Time of Day
**Required:** No  
**Type:** Dropdown  
**Options:** Morning, Afternoon, Evening, All-day  
**Description:** The general timeframe when activities occur.  
**Tips:** For multi-day events, this indicates the time of day for each day. Select "All-day" for events that run continuously throughout the day.

---

## Recurring Events

### Is this a recurring event?
**Required:** No  
**Type:** Checkbox  
**Description:** Check this box if your event repeats on a regular schedule.  
**Tips:** Use this for weekly storytimes, monthly markets, or seasonal programs. Each instance is created as a separate event.

### Frequency
**Required:** If recurring event is checked  
**Type:** Dropdown  
**Options:** Daily, Weekly, Monthly  
**Description:** How often the event repeats.  
**Example:** Weekly (for every Saturday storytime)

### Interval
**Required:** If recurring event is checked  
**Type:** Number  
**Description:** The interval between occurrences.  
**Example:** "1" for every week, "2" for every other week  
**Tips:** Combine with frequency to create patterns like "every 2 weeks" or "every 3 months."

### Days of Week
**Required:** If frequency is "Weekly"  
**Type:** Checkboxes  
**Options:** Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday  
**Description:** Which days of the week the event occurs.  
**Example:** Check "Saturday" and "Sunday" for weekend events  
**Tips:** You can select multiple days for events that happen several times per week.

### End Condition
**Required:** If recurring event is checked  
**Type:** Radio buttons  
**Options:** End by date, End after X occurrences  
**Description:** When the recurring series should stop.  
**Example:** End by date: 2025-03-31, or End after 12 occurrences  
**Tips:** The platform will generate a preview showing all dates before you submit. Review carefully—you cannot bulk-edit after creation.

---

## Cost & Pricing

### Is this event free?
**Required:** Yes  
**Type:** Checkbox  
**Description:** Check if there is no admission cost.  
**Tips:** Free events are highlighted in search results and attract more attendees.

### Minimum Cost
**Required:** If event is not free  
**Type:** Number (dollars)  
**Description:** The lowest admission price.  
**Example:** $10.00  
**Tips:** For fixed-price events, enter the same value in both minimum and maximum cost.

### Maximum Cost
**Required:** If event is not free  
**Type:** Number (dollars)  
**Description:** The highest admission price.  
**Example:** $25.00  
**Tips:** Use this for tiered pricing (adult/child) or sliding scale events.

### Cost Type
**Required:** If event is not free  
**Type:** Dropdown  
**Options:** Fixed price, Donation-based, Pay-what-you-can, Sliding scale  
**Description:** How pricing works for your event.  
**Example:** "Sliding scale" for events where families pay based on income  
**Tips:** "Donation-based" and "Pay-what-you-can" are popular for community events.

### Kids Free?
**Required:** No  
**Type:** Checkbox  
**Description:** Check if children attend at no cost.  
**Tips:** Specify age limits in the description if applicable (e.g., "Kids under 12 free").

### Free Companion/Support Worker?
**Required:** No  
**Type:** Checkbox  
**Description:** Check if one caregiver, companion, or support worker is admitted free with a paying attendee.  
**Tips:** This is important accessibility information for families with members who require support.

---

## Age Suitability

Check all age groups that your event is appropriate for. Multiple selections are encouraged.

### All Ages
**Type:** Checkbox  
**Description:** Suitable for everyone from infants to seniors.  
**Tips:** Use this for community festivals, parades, or events with activities for all age groups.

### Family-Friendly
**Type:** Checkbox  
**Description:** Designed for families with children of various ages.  
**Tips:** This is the most commonly used age filter. Check this for most community events.

### Young Children (0-5)
**Type:** Checkbox  
**Description:** Appropriate for toddlers and preschoolers.  
**Tips:** Use for storytimes, play groups, or events with age-appropriate activities for the youngest children.

### Kids (6-12)
**Type:** Checkbox  
**Description:** Appropriate for school-age children.  
**Tips:** Use for workshops, sports programs, or activities designed for elementary school ages.

### Teens
**Type:** Checkbox  
**Description:** Appropriate for teenagers (roughly 13-18).  
**Tips:** Use for youth programs, teen nights, or events specifically designed for adolescents.

### Adults Only
**Type:** Checkbox  
**Description:** Event is restricted to adults (18+ or 19+).  
**Tips:** Specify the age limit in your description. Use for evening events, workshops, or programs not suitable for children.

### Seniors
**Type:** Checkbox  
**Description:** Designed with older adults in mind.  
**Tips:** Use for programs specifically for seniors, though seniors are welcome at "All Ages" events too.

---

## Event Environment

### Indoor
**Type:** Checkbox  
**Description:** The event takes place indoors.  
**Tips:** Check both Indoor and Outdoor if your event has components in both environments.

### Outdoor
**Type:** Checkbox  
**Description:** The event takes place outdoors.  
**Tips:** Mention weather contingency plans in your description if applicable.

---

## Accessibility Information

This is the most detailed and important section for many families. All accessibility fields use the same answer options: **Yes**, **No**, **Unknown**, or **Not Relevant**.

**Important:** It's better to answer "Unknown" than to guess. Families trust accurate information. "Not Relevant" is appropriate when a question doesn't apply to your event (e.g., "Change table available" for an adults-only event).

Each field includes a tooltip icon (ℹ️) with additional explanation. Hover over the icon to see why the question matters and what information to provide.

### Caregiver & Infant Accessibility

| Field | Description | Why It Matters |
|-------|-------------|----------------|
| **Change Tables Present** | Are diaper changing tables available? | Parents with young children need to know if they can change diapers on-site. |
| **Change Table Locations** | Where are change tables located? (Men's washroom, Women's washroom, Gender-neutral, Family washroom, Multiple locations) | Helps caregivers of all genders plan ahead. |
| **Nursing/Breastfeeding Friendly** | Is there a welcoming space for nursing? | Indicates whether nursing parents will feel comfortable feeding their baby. |
| **Private Feeding Area** | Is a private space available for feeding? | Some parents prefer privacy when feeding. |
| **Bottle Warming Available** | Can bottles be warmed on-site? | Important for parents who bottle-feed. |
| **High Chairs Available** | Are high chairs provided for young children? | Helps families with toddlers who need seating support. |
| **Space for Strollers** | Is there adequate space to bring and maneuver strollers? | Critical for families with infants or young children. |
| **Bag/Coat Storage** | Is there a designated area to store belongings? | Helps families manage diaper bags, coats, and other items. |

### Mobility & Physical Access

| Field | Description | Why It Matters |
|-------|-------------|----------------|
| **Stroller Accessible** | Can strollers navigate the space easily? | Indicates whether pathways are wide enough and surfaces are smooth. |
| **Wheelchair Accessible Entrance** | Is there a wheelchair-accessible entrance? | Essential for wheelchair users and people with mobility aids. |
| **Step-Free Entry** | Can people enter without encountering steps? | Important for strollers, wheelchairs, and people who cannot use stairs. |
| **Elevator Access** | Is there elevator access to all event areas? | Necessary for multi-level venues. |
| **Wide Doorways** | Are doorways wide enough for wheelchairs? | Standard wheelchair width is 24-32 inches. |
| **Accessible Seating** | Is accessible seating available? | Includes wheelchair spaces and seats for people who cannot stand long. |
| **Accessible Washrooms** | Are accessible washroom facilities available? | Must meet accessibility standards with grab bars, space, etc. |
| **Washroom Availability** | What types of washrooms are available? (Men's, Women's, Gender-neutral, Family, Wheelchair accessible) | Helps all attendees plan ahead. |
| **Accessible Parking** | Is reserved accessible parking nearby? | Essential for people with mobility challenges. |
| **Terrain Type** | What is the ground surface type? (Flat, Paved, Gravel, Hills, Unpaved, Mixed) | Affects wheelchair and stroller navigation. |
| **Parking Distance** | Walking distance from parking to entrance? (Short <2min, Moderate 2-5min, Long 5+min) | Helps people with mobility challenges plan their arrival. |
| **Bus Stop Distance** | Distance from nearest bus stop? (Short <2min, Moderate 2-5min, Long 5+min) | Important for families using public transit. |
| **Accessible Sidewalks** | Are sidewalks leading to venue accessible? | Indicates whether the route to the venue is barrier-free. |
| **Bike Racks Available** | Are bike racks near venue entrance? | Supports active transportation. |
| **Covered Bike Parking** | Is covered/sheltered bike parking available? | Protects bikes from weather. |

### Sensory & Neurodivergent

| Field | Description | Why It Matters |
|-------|-------------|----------------|
| **Sensory-Friendly** | Is the environment designed to minimize sensory overload? | Important for people with autism, ADHD, or sensory processing differences. |
| **Quiet Environment** | Is the environment generally quiet? | Helps people sensitive to noise. |
| **Loud Noises Expected** | Will there be loud noises (music, announcements, etc.)? | Allows families to prepare or bring ear protection. |
| **Flashing Lights** | Will there be flashing or strobe lights? | Critical for people with epilepsy or light sensitivity. |
| **Crowd Level** | Expected crowd density? (Spacious, Moderate, Crowded) | Helps people who are uncomfortable in crowds. |
| **Quiet Room/Break Space** | Is there a quiet area to take sensory breaks? | Allows overwhelmed attendees to decompress. |
| **Sensory Time Slot** | Is there a specific low-sensory time slot? | Some events offer quiet hours with reduced stimulation. |
| **Predictable Schedule** | Does the event follow a predictable schedule? | Helps people who need structure and routine. |

### Cognitive & Communication

| Field | Description | Why It Matters |
|-------|-------------|----------------|
| **Clear Signage** | Are there easy-to-read directional signs? | Helps people navigate the space independently. |
| **Simple Instructions** | Are instructions provided in simple language? | Important for people with cognitive disabilities or language barriers. |
| **Written Materials** | Are written materials provided? | Supports people who process information better through reading. |
| **ASL Interpretation** | Is American Sign Language interpretation available? | Essential for Deaf attendees. |
| **Live Captions** | Are live captions provided for spoken content? | Helps Deaf and hard-of-hearing attendees. |
| **Multilingual Support** | Is support available in multiple languages? | Important for newcomers and non-English speakers. |

### Social & Emotional

| Field | Description | Why It Matters |
|-------|-------------|----------------|
| **Service Animals Welcome** | Are service animals permitted? | Required by law in most cases, but confirmation is reassuring. |
| **Flexible Participation** | Can attendees participate at their own pace? | Important for people who need breaks or modified participation. |
| **Gender-Neutral Washrooms** | Are gender-neutral washroom facilities available? | Important for transgender and non-binary people. |
| **LGBTQIA+ Friendly** | Is this explicitly an LGBTQIA+ welcoming space? | Signals intentional inclusivity. |
| **Mask-Friendly** | Are masks welcomed or encouraged? | Important for immunocompromised people and during illness seasons. |
| **Scent-Free Environment** | Is the environment scent-free or low-scent? | Critical for people with chemical sensitivities or asthma. |
| **Alcohol-Free** | Is the event alcohol-free? | Important for families and people in recovery. |
| **Substance-Free** | Is the event substance-free? | Indicates a safe environment for all ages. |
| **Trauma-Informed Approach** | Is the event designed with trauma-informed principles? | Signals awareness of trauma and commitment to safety. |

---

## Organizer Information

### Organization/Contact Name
**Required:** Yes  
**Type:** Text  
**Description:** Your name or organization name as it will appear publicly.  
**Example:** Halifax Recreation Department, Maritime Museum, Community Volunteers  
**Tips:** Use your official organization name if representing a group.

### Organizer Email
**Required:** Yes (email OR phone required)  
**Type:** Email  
**Description:** Contact email for questions about the event.  
**Example:** events@halifax.ca  
**Tips:** Use an email you check regularly. This is how admins will contact you if they need clarification.

### Organizer Phone
**Required:** Yes (email OR phone required)  
**Type:** Phone number  
**Description:** Contact phone number for questions about the event.  
**Example:** (902) 555-0123  
**Tips:** Provide a number where you can be reached during business hours.

### Display organizer information publicly?
**Required:** No  
**Type:** Checkbox (default: checked)  
**Description:** Controls whether your contact information appears on the public event page.  
**Tips:** Uncheck this if you prefer not to display contact info publicly. Admins will always see your contact information regardless of this setting.

---

## Additional Notes

### Additional Notes
**Required:** No  
**Type:** Text area  
**Description:** Any other important details that don't fit in other fields.  
**Example:** "Event cancelled if raining. Check website for updates." or "Pre-registration required at [link]." or "Bring your own skates or rent on-site for $5."  
**Tips:** Use this field for weather contingencies, registration requirements, parking instructions, or anything else attendees should know.

---

## Tips for Great Event Listings

**Be specific in descriptions.** Instead of "fun for all ages," describe actual activities: "Face painting, crafts, storytelling, and outdoor games for children 3-10."

**Answer accessibility questions honestly.** "Unknown" is better than guessing. Families trust accurate information and will contact you if they need more details.

**Include practical logistics.** Mention parking availability, public transit access, what to bring, and registration requirements.

**Upload a clear photo.** Events with images receive significantly more views. Use horizontal photos that clearly show the activity or venue.

**Keep information current.** If details change after submission, log in to your organizer dashboard and edit the event. Changes require admin re-approval.

**Provide complete location details.** The more specific you are, the easier it is for families to find you and assess accessibility before arriving.

**Use the rich text editor.** Format your description with headings, bullet lists, and links to make it easy to read.

**Don't skip accessibility fields.** Even if you select "Unknown" for many fields, showing that you considered the questions builds trust.

---

## Questions?

For help with specific fields or the submission process, see the [Organizer Quickstart Guide](./ORGANIZER_QUICKSTART.md) or [Organizer Comprehensive Guide](./ORGANIZER_COMPREHENSIVE_GUIDE.md).

To contact the admin team, use the **Contact** form in the website footer.

---

**Event listings are free and always will be. Thank you for helping families find accessible, inclusive events!**
