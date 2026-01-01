# Event Type Selector - UI Design Specification

**Version:** 2.0  
**Date:** January 1, 2026  
**Component:** Event Type Selection (Submit Form & Edit Form)

---

## Design Goals

1. **Reduce Cognitive Load** - Don't show all 138 options at once
2. **Fast Selection** - Users should find their event type in <10 seconds
3. **Discoverable** - Users can browse categories if unsure
4. **Flexible** - Support single or multiple event type selection
5. **Mobile-Friendly** - Works on all screen sizes

---

## Component Structure

### Layout Overview

```
┌─────────────────────────────────────────────────┐
│ Event Type(s) *                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🔍 Search event types...                    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ▼ 👨‍👩‍👧‍👦 Family & Kids (8)                        │
│ ▶ 🎭 Arts & Culture (9)                         │
│ ▶ 🧑‍🤝‍🧑 Community & Social (18)                    │
│ ▶ 🏃 Recreation & Sports (21)                   │
│ ▶ 🧘 Health & Wellness (18)                     │
│ ▶ 🎪 Markets & Festivals (22)                   │
│ ▶ 🗓 Seasonal & Holiday (18)                     │
│                                                 │
│ Selected: [Trivia] [Book Clubs] [x]            │
└─────────────────────────────────────────────────┘
```

---

## Interaction Patterns

### 1. Collapsed State (Default)

- All categories start **collapsed** (except if editing existing event)
- Show category icon, name, and count of types
- Click anywhere on category header to expand

```tsx
▶ 🏃 Recreation & Sports (21)
```

### 2. Expanded State

- Show all subcategories and event types within
- Subcategories are **collapsible** too
- Checkboxes for multi-select

```tsx
▼ 🏃 Recreation & Sports (21)
  
  ▼ Organized & Competitive (5)
    ☐ Team Sports (Soccer/Hockey/Baseball)
    ☐ Individual Sports (Tennis/Golf/Track)
    ☐ Tournaments & Leagues
    ☐ Youth Sports
    ☐ Adult Recreational Leagues
  
  ▶ Active Lifestyle (8)
  ▶ Outdoor & Adventure (7)
  ☐ Games/Gaming
```

### 3. Search/Filter

- Real-time search as user types
- Matches event type name
- Auto-expands matching categories
- Highlights matched text

```tsx
🔍 Search: "yoga"

Results (2):
▼ 🧘 Health & Wellness
  ✓ Yoga
  ☐ Walking for Wellness
```

### 4. Selection Display

- Show selected types as removable chips
- Click X to deselect
- Clear all button if multiple selected

```tsx
Selected: [Trivia ×] [Book Clubs ×] [Networking Events ×] Clear All
```

---

## Category & Subcategory Definitions

### 👨‍👩‍👧‍👦 Family & Kids (22 types)

**Subcategories:**
- **Age & Learning** (5): Toddler Activities, STEM, Workshops, Camps, Homeschool
- **Entertainment** (4): Kids Shows, Character Meets, Magicians, Movie Screenings
- **Play & Parties** (5): Playgroups, Birthday Parties, Indoor Play, Bounce Houses, Game Nights
- **Existing Activities** (8): Face Painting, Kids Crafts, Petting Zoos, Puppet Shows, Santa, Skating, Storytime, Swimming

---

### 🎭 Arts & Culture (19 types)

**Subcategories:**
- **Visual & Maker Arts** (4): Art Workshops, Pottery, Photography, Maker Fairs
- **Performing Arts** (3): Comedy, Dance, Spoken Word
- **Film & Media** (3): Film Screenings, Film Festivals, Documentaries
- **Existing** (9): Art Exhibition, Arts & Crafts, Cinema, Concert, Indigenous, Live Music, Multicultural, Opera, Theatre

---

### 🧑‍🤝‍🧑 Community & Social (25 types)

**Subcategories:**
- **Casual Social** (3): Happy Hours, Singles Mixers, Social Walks
- **Learning & Interest** (3): Lecture Series, Skill Shares, Study Groups
- **Identity & Community** (1): Newcomer Meetups
- **Existing Social** (18): Trivia, Pub Trivia, Board Games, Coffee, Book Clubs, Craft Circles, Karaoke, Open Mic, Potlucks, Speed Dating, Pride, Faith, Networking, Workshops, Language, Socials, Community Meetings, Fundraisers

---

### 🏃 Recreation & Sports (21 types)

**Subcategories:**
- **Organized & Competitive** (5): Team Sports, Individual Sports, Tournaments, Youth Sports, Adult Leagues
- **Active Lifestyle** (8): Walking, Running, Cycling, Skating, Swimming, Pickleball, Disc Golf, Skateboarding
- **Outdoor & Adventure** (7): Hiking, Camping, Kayaking, Climbing, Snow Sports, Mountain Biking, Trail Running
- **Existing** (1): Games/Gaming

---

### 🧘 Health & Wellness (18 types)

**Subcategories:**
- **Movement & Body** (5): Pilates, Dance Fitness, Walking, Stretching, Seniors Fitness
- **Mental & Emotional** (5): Mindfulness, Breathwork, Stress Support, Support Groups, Grief Circles
- **Holistic & Alternative** (6): Sound Baths, Reiki, Herbalism, Wellness Fairs, Acupuncture, Nutrition
- **Existing** (2): Meditation, Yoga

---

### 🎪 Markets & Festivals (22 types)

**Subcategories:**
- **Market Types** (7): Farmers, Artisan, Night, Holiday, Vintage, Pop-Up, Makers
- **Festival Types** (12): Food, Beer/Wine, Music, Cultural, Street, Seasonal, Film, Literary, Kids, Art, Heritage, Community
- **Special Events** (3): Food Trucks, Tastings, Vendor Fairs

---

### 🗓 Seasonal & Holiday (18 types)

**No Subcategories** (flat list works better for holidays):
- Back to School
- Canada Day
- Christmas
- Easter
- Fall Events
- Festive Holidays
- Halloween
- Holiday Events
- Holiday Light Displays
- Holiday Shows & Performances
- New Year
- Remembrance Day Events
- Spring Events
- St. Patrick's Day
- Summer Events
- Thanksgiving
- Valentine's Day
- Winter Events

---

## Technical Implementation

### Component Props

```typescript
interface EventTypeSelectorProps {
  selectedTypeIds: number[];
  onChange: (typeIds: number[]) => void;
  maxSelections?: number; // Optional limit
  showSearch?: boolean; // Default: true
  defaultExpanded?: string[]; // Category names to expand by default
  mode?: 'single' | 'multiple'; // Default: 'multiple'
}
```

### Data Structure

```typescript
interface EventTypeCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: EventTypeSubcategory[];
  flatTypes: EventType[]; // Types not in subcategories
}

interface EventTypeSubcategory {
  name: string;
  types: EventType[];
}

interface EventType {
  id: number;
  name: string;
  category: string;
  isDeprecated: boolean;
}
```

### State Management

```typescript
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
const [searchQuery, setSearchQuery] = useState('');
const [selectedTypes, setSelectedTypes] = useState<number[]>(props.selectedTypeIds);
```

---

## Behavior Specifications

### On Load (New Event)
- All categories collapsed
- No types selected
- Search empty

### On Load (Edit Event)
- Expand categories containing selected types
- Expand subcategories containing selected types
- Scroll to first selected type
- Show selected chips

### Search Behavior
- Debounce input (300ms)
- Case-insensitive matching
- Match against event type name
- Auto-expand matching categories
- Collapse non-matching categories
- Highlight matched text
- Show "No results" if no matches

### Selection Behavior
- Click checkbox to select/deselect
- Add to chips area immediately
- Allow multiple selections
- Optional: Set max limit (e.g., "Select up to 5 types")
- Validation: Require at least 1 type

### Mobile Considerations
- Touch-friendly tap targets (min 44px)
- Collapsible sections prevent endless scrolling
- Search sticky at top
- Selected chips sticky at bottom
- Smooth scroll to selections

---

## Visual Design

### Colors & Icons

```css
/* Category Icons */
family-kids: 👨‍👩‍👧‍👦
arts-culture: 🎭
community-social: 🧑‍🤝‍🧑
recreation-sports: 🏃
health-wellness: 🧘
markets-festivals: 🎪
seasonal: 🗓

/* States */
.category-header {
  background: hsl(var(--muted));
  hover: hsl(var(--accent));
}

.subcategory-header {
  background: transparent;
  font-weight: 600;
}

.event-type-checkbox {
  padding-left: 2rem; /* Indent under subcategory */
}
```

### Spacing

- Category header: py-3 px-4
- Subcategory header: py-2 px-6
- Event type checkbox: py-1.5 px-8
- Search input: mb-4
- Selected chips: mt-4

---

## Accessibility

- **Keyboard Navigation**: Tab through categories, Enter to expand/collapse
- **Screen Readers**: Announce expanded/collapsed state, selection count
- **ARIA Labels**: 
  - `aria-expanded` on category headers
  - `aria-label` on checkboxes with full type name
  - `role="group"` for categories
- **Focus Management**: Focus first checkbox when category expands

---

## Example Component Usage

```tsx
<EventTypeSelector
  selectedTypeIds={formData.eventTypeIds}
  onChange={(typeIds) => setFormData({ ...formData, eventTypeIds: typeIds })}
  maxSelections={5}
  showSearch={true}
  mode="multiple"
/>
```

---

## Migration Strategy for Existing Forms

1. **Submit Event Form** - Replace current multi-select dropdown with new component
2. **Edit Event Form** - Same component, pre-populate selections
3. **Admin Batch Edit** - Same component for bulk type assignment
4. **Browse/Filter** - Simplified version (no selection, just filtering)

---

## Performance Considerations

- **Lazy Rendering**: Only render expanded categories
- **Virtualization**: If category has >50 types, use virtual scrolling
- **Memoization**: Memoize filtered results
- **Debounced Search**: Prevent excessive re-renders

---

## Future Enhancements

1. **Popular Types**: Show "Most Used" section at top
2. **Recent Types**: Remember user's recent selections
3. **Smart Suggestions**: "Events like yours usually use..."
4. **Bulk Actions**: "Select all in category"
5. **Custom Sorting**: Allow users to sort by name/popularity

---

This design balances **discoverability** (browsing categories) with **efficiency** (search + collapse) while keeping the interface clean and accessible.
