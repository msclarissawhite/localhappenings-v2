/**
 * Event Type Subcategory Mappings
 * 
 * Organizes event types into collapsible subcategories for better UX.
 * Based on EVENT_TYPE_UI_DESIGN.md v2.0
 */

export interface EventTypeSubcategory {
  name: string;
  typeNames: string[]; // Event type names that belong to this subcategory
}

export interface EventTypeCategoryStructure {
  category: string; // Database category enum value
  displayName: string;
  icon: string;
  subcategories: EventTypeSubcategory[];
  flatTypes: string[]; // Types not grouped into subcategories
}

/**
 * Subcategory structure for all event type categories
 */
export const EVENT_TYPE_SUBCATEGORIES: EventTypeCategoryStructure[] = [
  {
    category: "family-kids",
    displayName: "Family & Kids",
    icon: "👨‍👩‍👧‍👦",
    subcategories: [
      {
        name: "Age & Learning",
        typeNames: [
          "Toddler Activities",
          "STEM for Kids",
          "Kids Workshops",
          "Kids Camps",
          "Homeschool Events",
        ],
      },
      {
        name: "Entertainment",
        typeNames: [
          "Kids Shows",
          "Character Meet & Greets",
          "Magicians & Performers",
          "Kids Movie Screenings",
        ],
      },
      {
        name: "Play & Parties",
        typeNames: [
          "Playgroups",
          "Birthday Party Venues",
          "Indoor Play Centers",
          "Bounce Houses",
          "Family Game Nights",
        ],
      },
    ],
    flatTypes: [
      "Face Painting",
      "Kids Crafts",
      "Petting Zoos",
      "Puppet Shows",
      "Santa Visits",
      "Skating",
      "Storytime",
      "Swimming",
    ],
  },
  {
    category: "arts-culture",
    displayName: "Arts & Culture",
    icon: "🎭",
    subcategories: [
      {
        name: "Visual & Maker Arts",
        typeNames: [
          "Art Workshops",
          "Pottery & Ceramics",
          "Photography",
          "Maker Fairs",
        ],
      },
      {
        name: "Performing Arts",
        typeNames: [
          "Comedy Shows",
          "Dance Performances",
          "Spoken Word & Poetry",
        ],
      },
      {
        name: "Film & Media",
        typeNames: [
          "Film Screenings",
          "Film Festivals",
          "Documentary Screenings",
        ],
      },
    ],
    flatTypes: [
      "Art Exhibition",
      "Arts & Crafts",
      "Cinema",
      "Concert",
      "Indigenous Events",
      "Live Music",
      "Multicultural Events",
      "Opera",
      "Theatre",
    ],
  },
  {
    category: "community-social",
    displayName: "Community & Social",
    icon: "🧑‍🤝‍🧑",
    subcategories: [
      {
        name: "Casual Social",
        typeNames: [
          "Happy Hours",
          "Singles Mixers",
          "Social Walks",
        ],
      },
      {
        name: "Learning & Interest",
        typeNames: [
          "Lecture Series",
          "Skill Shares",
          "Study Groups",
        ],
      },
      {
        name: "Identity & Community",
        typeNames: [
          "Newcomer Meetups",
        ],
      },
    ],
    flatTypes: [
      "Trivia",
      "Pub Trivia",
      "Board Games",
      "Coffee Meetups",
      "Book Clubs",
      "Craft Circles",
      "Karaoke",
      "Open Mic",
      "Potlucks",
      "Speed Dating",
      "Pride Events",
      "Faith-Based Events",
      "Networking Events",
      "Workshops",
      "Language Exchange",
      "Social Events",
      "Community Meetings",
      "Fundraisers",
    ],
  },
  {
    category: "recreation-sports",
    displayName: "Recreation & Sports",
    icon: "🏃",
    subcategories: [
      {
        name: "Organized & Competitive",
        typeNames: [
          "Team Sports (Soccer/Hockey/Baseball)",
          "Individual Sports (Tennis/Golf/Track)",
          "Tournaments & Leagues",
          "Youth Sports",
          "Adult Recreational Leagues",
        ],
      },
      {
        name: "Active Lifestyle",
        typeNames: [
          "Walking",
          "Running",
          "Cycling",
          "Skating",
          "Swimming",
          "Pickleball",
          "Disc Golf",
          "Skateboarding",
        ],
      },
      {
        name: "Outdoor & Adventure",
        typeNames: [
          "Hiking",
          "Camping",
          "Kayaking & Canoeing",
          "Rock Climbing",
          "Snow Sports (Skiing/Snowboarding)",
          "Mountain Biking",
          "Trail Running",
        ],
      },
    ],
    flatTypes: [
      "Games/Gaming",
    ],
  },
  {
    category: "health-wellness",
    displayName: "Health & Wellness",
    icon: "🧘",
    subcategories: [
      {
        name: "Movement & Body",
        typeNames: [
          "Pilates",
          "Dance Fitness",
          "Walking for Wellness",
          "Stretching & Flexibility",
          "Seniors Fitness",
        ],
      },
      {
        name: "Mental & Emotional",
        typeNames: [
          "Mindfulness",
          "Breathwork",
          "Stress Management",
          "Support Groups",
          "Grief Circles",
        ],
      },
      {
        name: "Holistic & Alternative",
        typeNames: [
          "Sound Baths",
          "Reiki & Energy Healing",
          "Herbalism",
          "Wellness Fairs",
          "Acupuncture",
          "Nutrition Workshops",
        ],
      },
    ],
    flatTypes: [
      "Meditation",
      "Yoga",
    ],
  },
  {
    category: "markets-festivals",
    displayName: "Markets & Festivals",
    icon: "🎪",
    subcategories: [
      {
        name: "Market Types",
        typeNames: [
          "Farmers Markets",
          "Artisan Markets",
          "Night Markets",
          "Holiday Markets",
          "Vintage Markets",
          "Pop-Up Markets",
          "Makers Markets",
        ],
      },
      {
        name: "Festival Types",
        typeNames: [
          "Food Festivals",
          "Beer & Wine Festivals",
          "Music Festivals",
          "Cultural Festivals",
          "Street Festivals",
          "Seasonal Festivals",
          "Film Festivals",
          "Literary Festivals",
          "Kids Festivals",
          "Art Festivals",
          "Heritage Festivals",
          "Community Festivals",
        ],
      },
      {
        name: "Special Events",
        typeNames: [
          "Food Trucks",
          "Tastings & Samplings",
          "Vendor Fairs",
        ],
      },
    ],
    flatTypes: [],
  },
  {
    category: "seasonal",
    displayName: "Seasonal & Holiday",
    icon: "🗓",
    subcategories: [],
    flatTypes: [
      "Back to School Events",
      "Canada Day",
      "Christmas Events",
      "Easter Events",
      "Fall Events",
      "Festive Holidays",
      "Halloween Events",
      "Holiday Events",
      "Holiday Light Displays",
      "Holiday Shows & Performances",
      "New Year Events",
      "Remembrance Day Events",
      "Spring Events",
      "St. Patrick's Day",
      "Summer Events",
      "Thanksgiving Events",
      "Valentine's Day",
      "Winter Events",
    ],
  },
  {
    category: "environment",
    displayName: "Environment",
    icon: "🌱",
    subcategories: [],
    flatTypes: [
      "Environmental Events",
      "Nature Education",
      "Conservation Projects",
      "Clean-Up Events",
      "Sustainability Workshops",
    ],
  },
];

/**
 * Get subcategory for a specific event type name
 */
export function getSubcategoryForType(typeName: string): {
  category: string;
  subcategory: string | null;
} | null {
  for (const cat of EVENT_TYPE_SUBCATEGORIES) {
    // Check subcategories
    for (const subcat of cat.subcategories) {
      if (subcat.typeNames.includes(typeName)) {
        return {
          category: cat.category,
          subcategory: subcat.name,
        };
      }
    }
    
    // Check flat types
    if (cat.flatTypes.includes(typeName)) {
      return {
        category: cat.category,
        subcategory: null,
      };
    }
  }
  
  return null;
}

/**
 * Get display icon for a category
 */
export function getCategoryIcon(category: string): string {
  const cat = EVENT_TYPE_SUBCATEGORIES.find(c => c.category === category);
  return cat?.icon || "📅";
}

/**
 * Get display name for a category
 */
export function getCategoryDisplayName(category: string): string {
  const cat = EVENT_TYPE_SUBCATEGORIES.find(c => c.category === category);
  return cat?.displayName || category;
}
