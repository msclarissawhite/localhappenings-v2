/**
 * Event Type Migration Suggestions
 * 
 * Maps deprecated event types to suggested replacements.
 * Used by the admin bulk reassignment tool to help migrate existing events
 * from generic types to specific types.
 */

export interface MigrationSuggestion {
  deprecatedTypeId: number;
  deprecatedTypeName: string;
  category: string;
  suggestedReplacements: {
    id: number;
    name: string;
    description: string; // Why this replacement makes sense
  }[];
  migrationNote: string; // Guidance for admin on how to choose
}

export const migrationSuggestions: MigrationSuggestion[] = [
  {
    deprecatedTypeId: 30022,
    deprecatedTypeName: "Sports & Recreation",
    category: "Recreation & Sports",
    suggestedReplacements: [
      { id: 200024, name: "Team Sports", description: "For organized team activities like soccer, hockey, basketball" },
      { id: 200025, name: "Individual Sports", description: "For solo activities like running, swimming, cycling" },
      { id: 200026, name: "Tournaments", description: "For competitive events and competitions" },
      { id: 200027, name: "Pickleball", description: "Specifically for pickleball events" },
      { id: 200028, name: "Tennis", description: "Specifically for tennis events" },
      { id: 200029, name: "Golf", description: "Specifically for golf events" },
      { id: 200030, name: "Disc Golf", description: "Specifically for disc golf events" },
      { id: 200031, name: "Bowling", description: "Specifically for bowling events" },
      { id: 200032, name: "Skating", description: "For ice skating or roller skating events" },
      { id: 200033, name: "Curling", description: "Specifically for curling events" },
      { id: 120001, name: "Trivia", description: "If it's a sports trivia event" },
      { id: 90005, name: "Games/Gaming", description: "For recreational games and gaming events" },
    ],
    migrationNote: "Choose the most specific sport or activity. If multiple sports are offered, select all that apply.",
  },
  {
    deprecatedTypeId: 30023,
    deprecatedTypeName: "Outdoor Adventure",
    category: "Recreation & Sports",
    suggestedReplacements: [
      { id: 200034, name: "Hiking", description: "For trail walks and hikes" },
      { id: 200035, name: "Camping", description: "For overnight camping events" },
      { id: 200036, name: "Kayaking/Canoeing", description: "For paddling activities" },
      { id: 200037, name: "Rock Climbing", description: "For climbing activities (indoor or outdoor)" },
      { id: 200038, name: "Mountain Biking", description: "For off-road cycling" },
      { id: 200039, name: "Fishing", description: "For fishing events or derbies" },
      { id: 200040, name: "Snowshoeing", description: "For winter snowshoe activities" },
      { id: 200041, name: "Cross-Country Skiing", description: "For Nordic skiing" },
      { id: 200042, name: "Downhill Skiing/Snowboarding", description: "For alpine skiing or snowboarding" },
      { id: 200043, name: "Sledding/Tobogganing", description: "For winter sliding activities" },
    ],
    migrationNote: "Choose the primary outdoor activity. For multi-activity events, select all relevant types.",
  },
  {
    deprecatedTypeId: 90006,
    deprecatedTypeName: "Fitness",
    category: "Health & Wellness",
    suggestedReplacements: [
      { id: 90007, name: "Yoga", description: "For yoga classes and sessions" },
      { id: 200044, name: "Pilates", description: "For Pilates classes" },
      { id: 200045, name: "Dance Fitness", description: "For Zumba, dance cardio, etc." },
      { id: 200046, name: "Seniors Fitness", description: "For fitness classes designed for seniors" },
      { id: 200047, name: "Prenatal/Postnatal Fitness", description: "For pregnancy and postpartum fitness" },
      { id: 200048, name: "Kids Fitness", description: "For children's fitness programs" },
      { id: 200025, name: "Individual Sports", description: "If it's a sports-based fitness activity" },
    ],
    migrationNote: "Choose the specific fitness modality. Yoga and Pilates are separate from general fitness.",
  },
  {
    deprecatedTypeId: 90008,
    deprecatedTypeName: "Wellness Workshops",
    category: "Health & Wellness",
    suggestedReplacements: [
      { id: 90009, name: "Meditation", description: "For meditation sessions and mindfulness" },
      { id: 200049, name: "Breathwork", description: "For breathing exercises and workshops" },
      { id: 200050, name: "Sound Baths", description: "For sound healing sessions" },
      { id: 200051, name: "Reiki/Energy Healing", description: "For energy healing sessions" },
      { id: 200052, name: "Massage Therapy", description: "For massage events or workshops" },
      { id: 200053, name: "Acupuncture", description: "For acupuncture sessions" },
      { id: 200054, name: "Nutrition Workshops", description: "For nutrition education" },
      { id: 200055, name: "Mental Health Support Groups", description: "For support groups and mental health workshops" },
      { id: 200056, name: "Herbalism/Natural Medicine", description: "For herbal medicine workshops" },
      { id: 200057, name: "Chronic Illness Support", description: "For chronic illness support groups" },
      { id: 200058, name: "Addiction Recovery", description: "For recovery support groups" },
      { id: 200059, name: "Grief Support", description: "For grief and loss support groups" },
    ],
    migrationNote: "Choose the specific wellness modality. Support groups are separate from workshops.",
  },
  {
    deprecatedTypeId: 30025,
    deprecatedTypeName: "Craft Shows & Markets",
    category: "Markets & Festivals",
    suggestedReplacements: [
      { id: 200060, name: "Farmers Markets", description: "For produce and food markets" },
      { id: 200061, name: "Craft Fairs", description: "For handmade crafts and artisan goods" },
      { id: 200062, name: "Artisan Markets", description: "For local artisan vendors" },
      { id: 200063, name: "Flea Markets", description: "For second-hand and vintage goods" },
      { id: 200064, name: "Night Markets", description: "For evening markets" },
      { id: 200065, name: "Holiday Markets", description: "For seasonal/holiday markets" },
      { id: 200066, name: "Pop-Up Markets", description: "For temporary or rotating markets" },
    ],
    migrationNote: "Choose based on the primary type of goods sold. Holiday markets are seasonal.",
  },
  {
    deprecatedTypeId: 30024,
    deprecatedTypeName: "Festivals & Fairs",
    category: "Markets & Festivals",
    suggestedReplacements: [
      { id: 200067, name: "Music Festivals", description: "For multi-artist music events" },
      { id: 200068, name: "Food Festivals", description: "For food-focused festivals" },
      { id: 200069, name: "Cultural Festivals", description: "For cultural celebrations" },
      { id: 200070, name: "Art Festivals", description: "For visual arts festivals" },
      { id: 200071, name: "Film Festivals", description: "For film screenings and festivals" },
      { id: 200072, name: "Beer/Wine Festivals", description: "For beverage tasting events" },
      { id: 200073, name: "Street Festivals", description: "For neighborhood street festivals" },
      { id: 200074, name: "County/Agricultural Fairs", description: "For traditional fairs with rides and exhibits" },
      { id: 200075, name: "Renaissance Fairs", description: "For historical reenactment fairs" },
      { id: 200076, name: "Pride Festivals", description: "For LGBTQ+ pride celebrations" },
      { id: 200077, name: "Multicultural Festivals", description: "For diverse cultural celebrations" },
    ],
    migrationNote: "Choose based on the festival's primary focus. Large festivals may have multiple types.",
  },
  {
    deprecatedTypeId: 90024,
    deprecatedTypeName: "Food & Drink",
    category: "Markets & Festivals",
    suggestedReplacements: [
      { id: 200068, name: "Food Festivals", description: "For food-focused events" },
      { id: 200072, name: "Beer/Wine Festivals", description: "For beverage tasting events" },
      { id: 200078, name: "Cooking Classes", description: "For culinary instruction" },
      { id: 200079, name: "Food Trucks", description: "For food truck events" },
      { id: 200080, name: "Restaurant Weeks", description: "For restaurant promotion events" },
      { id: 200060, name: "Farmers Markets", description: "If it's a market with food vendors" },
      { id: 120010, name: "Potlucks", description: "For community potluck gatherings" },
    ],
    migrationNote: "Choose based on whether it's a festival, class, or market. Food trucks are a separate category.",
  },
];

/**
 * Get migration suggestions for a specific deprecated type
 */
export function getMigrationSuggestions(deprecatedTypeId: number): MigrationSuggestion | undefined {
  return migrationSuggestions.find(s => s.deprecatedTypeId === deprecatedTypeId);
}

/**
 * Get all deprecated type IDs
 */
export function getDeprecatedTypeIds(): number[] {
  return migrationSuggestions.map(s => s.deprecatedTypeId);
}
