import { drizzle } from "drizzle-orm/mysql2";
import { events } from "../drizzle/schema.js";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

const sampleEvents = [
  {
    name: "Halifax Winter Festival",
    description: "Join us for a magical winter celebration featuring ice sculptures, hot chocolate, live music, and family activities. Bundle up and enjoy the beauty of winter in downtown Halifax!",
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "Downtown",
    venue: "Grand Parade Square",
    address: "1841 Argyle St, Halifax, NS B3J 3N8",
    startDate: new Date("2025-12-28T14:00:00"),
    endDate: new Date("2025-12-28T18:00:00"),
    timeOfDay: "afternoon",
    isFree: true,
    costMin: null,
    costMax: null,
    familyFriendly: true,
    youngChildren: true,
    kids: true,
    teens: false,
    seniors: false,
    isIndoor: false,
    isOutdoor: true,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "unknown",
        nursingFriendly: "yes",
        strollerSpace: "yes"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "yes",
        flashingLights: "no",
        quietRoom: "no"
      }
    }),
    status: "published",
    organizerName: "Halifax Events Committee",
    organizerEmail: "events@halifax.ca",
    organizerWebsite: "https://www.halifax.ca/events",
    notes: "Dress warmly! Event continues rain or shine.",
    kidsFree: true,
    freeCompanion: false
  },
  {
    name: "Story Time at the Library",
    description: "Weekly story time for young children featuring interactive storytelling, songs, and crafts. A wonderful opportunity for early literacy development in a welcoming environment.",
    province: "Nova Scotia",
    city: "Dartmouth",
    neighborhood: "Downtown Dartmouth",
    venue: "Dartmouth Public Library",
    address: "100 Wyse Rd, Dartmouth, NS B3A 1M1",
    startDate: new Date("2025-12-20T10:30:00"),
    endDate: new Date("2025-12-20T11:15:00"),
    timeOfDay: "morning",
    isFree: true,
    costMin: null,
    costMax: null,
    familyFriendly: true,
    youngChildren: true,
    kids: false,
    teens: false,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        nursingFriendly: "yes",
        strollerSpace: "yes"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "no",
        flashingLights: "no",
        quietRoom: "yes"
      }
    }),
    status: "published",
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpubliclibraries.ca",
    organizerWebsite: "https://www.halifaxpubliclibraries.ca",
    notes: "No registration required. Drop-in welcome!",
    kidsFree: true,
    freeCompanion: false
  },
  {
    name: "New Year's Eve Fireworks",
    description: "Ring in the New Year with a spectacular fireworks display over the Halifax Harbour. Best viewing locations include the waterfront boardwalk and Citadel Hill.",
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "Waterfront",
    venue: "Halifax Waterfront",
    address: "Halifax Waterfront Boardwalk, Halifax, NS",
    startDate: new Date("2025-12-31T23:45:00"),
    endDate: new Date("2026-01-01T00:15:00"),
    timeOfDay: "evening",
    isFree: true,
    costMin: null,
    costMax: null,
    familyFriendly: true,
    youngChildren: false,
    kids: true,
    teens: true,
    seniors: true,
    isIndoor: false,
    isOutdoor: true,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "unknown",
        nursingFriendly: "unknown",
        strollerSpace: "yes"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "unknown"
      },
      sensory: {
        loudNoises: "yes",
        flashingLights: "yes",
        quietRoom: "no"
      }
    }),
    status: "published",
    organizerName: "Halifax Regional Municipality",
    organizerEmail: "events@halifax.ca",
    notes: "Very loud! Not recommended for noise-sensitive individuals. Arrive early for best viewing spots.",
    kidsFree: true,
    freeCompanion: false
  },
  {
    name: "Pottery Workshop for Beginners",
    description: "Learn the basics of pottery in this hands-on workshop. All materials provided. Create your own bowl or mug to take home! Perfect for adults looking to try something new.",
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "North End",
    venue: "Clay Studio Halifax",
    address: "2156 Gottingen St, Halifax, NS B3K 3B5",
    startDate: new Date("2026-01-05T14:00:00"),
    endDate: new Date("2026-01-05T16:30:00"),
    timeOfDay: "afternoon",
    isFree: false,
    costMin: 4500,
    costMax: 4500,
    familyFriendly: false,
    youngChildren: false,
    kids: false,
    teens: true,
    seniors: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "no",
        nursingFriendly: "unknown",
        strollerSpace: "no"
      },
      mobility: {
        wheelchairEntrance: "no",
        stepFreeEntry: "no",
        accessibleWashrooms: "no"
      },
      sensory: {
        loudNoises: "no",
        flashingLights: "no",
        quietRoom: "yes"
      }
    }),
    status: "published",
    organizerName: "Clay Studio Halifax",
    organizerEmail: "info@claystudiohalifax.com",
    organizerWebsite: "https://www.claystudiohalifax.com",
    notes: "Registration required. Limited to 8 participants. Building has stairs at entrance.",
    kidsFree: false,
    freeCompanion: false
  },
  {
    name: "Sensory-Friendly Movie Morning",
    description: "Enjoy a movie in a sensory-friendly environment with lights dimmed (not off), lower volume, and freedom to move around. This month: Moana 2. All families welcome!",
    province: "Nova Scotia",
    city: "Bedford",
    neighborhood: null,
    venue: "Cineplex Bedford",
    address: "1441 Bedford Hwy, Bedford, NS B4A 3Z6",
    startDate: new Date("2025-12-21T10:00:00"),
    endDate: new Date("2025-12-21T12:00:00"),
    timeOfDay: "morning",
    isFree: false,
    costMin: 800,
    costMax: 1200,
    familyFriendly: true,
    youngChildren: true,
    kids: true,
    teens: false,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        nursingFriendly: "yes",
        strollerSpace: "yes"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "no",
        flashingLights: "no",
        quietRoom: "yes"
      }
    }),
    status: "published",
    organizerName: "Cineplex Entertainment",
    organizerEmail: "guestservices@cineplex.com",
    organizerWebsite: "https://www.cineplex.com",
    notes: "Sensory-friendly: lights stay on low, volume reduced, movement and noise welcome. Kids under 3 are free.",
    kidsFree: true,
    freeCompanion: true
  },
  {
    name: "Farmers Market - Holiday Edition",
    description: "Shop local for the holidays! Fresh produce, baked goods, handmade crafts, and artisan products from Nova Scotia makers. Live music and hot apple cider available.",
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "Seaport",
    venue: "Halifax Seaport Farmers Market",
    address: "1209 Marginal Rd, Halifax, NS B3H 4P7",
    startDate: new Date("2025-12-22T08:00:00"),
    endDate: new Date("2025-12-22T13:00:00"),
    timeOfDay: "morning",
    isFree: true,
    costMin: null,
    costMax: null,
    familyFriendly: true,
    youngChildren: true,
    kids: true,
    teens: false,
    seniors: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        nursingFriendly: "yes",
        strollerSpace: "yes"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "yes",
        flashingLights: "no",
        quietRoom: "no"
      }
    }),
    status: "published",
    organizerName: "Halifax Seaport Farmers Market",
    organizerEmail: "info@halifaxfarmersmarket.com",
    organizerWebsite: "https://www.halifaxfarmersmarket.com",
    notes: "Can get crowded on weekends. Arrive early for best selection. Free entry, but bring cash for vendors.",
    kidsFree: true,
    freeCompanion: false
  },
  {
    name: "Gentle Yoga for Seniors",
    description: "A gentle yoga class designed specifically for seniors and those with limited mobility. Focus on flexibility, balance, and relaxation. All levels welcome, modifications provided.",
    province: "Nova Scotia",
    city: "Dartmouth",
    neighborhood: "Woodside",
    venue: "Woodside Community Centre",
    address: "58 Elliot St, Dartmouth, NS B2Y 2R9",
    startDate: new Date("2025-12-19T14:00:00"),
    endDate: new Date("2025-12-19T15:00:00"),
    timeOfDay: "afternoon",
    isFree: false,
    costMin: 1000,
    costMax: 1000,
    familyFriendly: false,
    youngChildren: false,
    kids: false,
    teens: false,
    seniors: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "no",
        nursingFriendly: "no",
        strollerSpace: "no"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "no",
        flashingLights: "no",
        quietRoom: "yes"
      }
    }),
    status: "published",
    organizerName: "Dartmouth Recreation",
    organizerEmail: "recreation@dartmouth.ca",
    notes: "Bring your own mat or use ours. Chairs available for seated modifications. Drop-in or register for the full session.",
    kidsFree: false,
    freeCompanion: true
  },
  {
    name: "Teen Game Night",
    description: "Board games, video games, snacks, and fun! A safe space for teens to hang out and make friends. Hosted by youth workers. Ages 13-17 welcome.",
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "Spryfield",
    venue: "Captain William Spry Community Centre",
    address: "10 Kidston Rd, Halifax, NS B3R 1V3",
    startDate: new Date("2025-12-27T18:00:00"),
    endDate: new Date("2025-12-27T21:00:00"),
    timeOfDay: "evening",
    isFree: true,
    costMin: null,
    costMax: null,
    familyFriendly: false,
    youngChildren: false,
    kids: false,
    teens: true,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        nursingFriendly: "no",
        strollerSpace: "no"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "yes",
        flashingLights: "no",
        quietRoom: "yes"
      }
    }),
    status: "published",
    organizerName: "Spryfield Youth Centre",
    organizerEmail: "youth@spryfield.ca",
    notes: "Snacks provided. Bring your own controller if you have one! Quiet room available if you need a break.",
    kidsFree: true,
    freeCompanion: false
  },
  {
    name: "Christmas Craft Fair",
    description: "Support local artisans and find unique handmade gifts for the holidays. Jewelry, pottery, textiles, woodwork, and more. Over 40 vendors!",
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "Downtown",
    venue: "Halifax Forum",
    address: "2901 Windsor St, Halifax, NS B3K 5E5",
    startDate: new Date("2025-12-23T10:00:00"),
    endDate: new Date("2025-12-23T17:00:00"),
    timeOfDay: "all-day",
    isFree: false,
    costMin: 500,
    costMax: 500,
    familyFriendly: true,
    youngChildren: false,
    kids: true,
    teens: false,
    seniors: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        nursingFriendly: "unknown",
        strollerSpace: "yes"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "no",
        flashingLights: "no",
        quietRoom: "no"
      }
    }),
    status: "published",
    organizerName: "Nova Scotia Craft Council",
    organizerEmail: "info@craft-design.ns.ca",
    organizerWebsite: "https://www.craft-design.ns.ca",
    notes: "$5 admission, kids under 12 free. Cash and card accepted at entrance.",
    kidsFree: true,
    freeCompanion: false
  },
  {
    name: "Family Skate Night",
    description: "Bring the whole family for an evening of skating! Music, hot chocolate, and fun on the ice. Skate rentals available. All ages and skill levels welcome.",
    province: "Nova Scotia",
    city: "Lower Sackville",
    neighborhood: null,
    venue: "Sackville Sports Stadium",
    address: "45 Connolly Rd, Lower Sackville, NS B4C 3P7",
    startDate: new Date("2026-01-03T18:30:00"),
    endDate: new Date("2026-01-03T20:30:00"),
    timeOfDay: "evening",
    isFree: false,
    costMin: 300,
    costMax: 700,
    familyFriendly: true,
    youngChildren: true,
    kids: true,
    teens: true,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        nursingFriendly: "yes",
        strollerSpace: "no"
      },
      mobility: {
        wheelchairEntrance: "yes",
        stepFreeEntry: "yes",
        accessibleWashrooms: "yes"
      },
      sensory: {
        loudNoises: "yes",
        flashingLights: "yes",
        quietRoom: "no"
      }
    }),
    status: "published",
    organizerName: "Sackville Recreation",
    organizerEmail: "recreation@sackville.ca",
    notes: "$3 admission, $4 skate rental. Helmets required for children under 12. Skating aids available for beginners.",
    kidsFree: false,
    freeCompanion: false
  }
];

async function seedEvents() {
  console.log("🌱 Starting to seed events...");
  
  try {
    for (const event of sampleEvents) {
      await db.insert(events).values(event);
      console.log(`✅ Added: ${event.name}`);
    }
    
    console.log(`\n🎉 Successfully seeded ${sampleEvents.length} events!`);
    console.log("\nEvent breakdown:");
    console.log(`- Free events: ${sampleEvents.filter(e => e.isFree).length}`);
    console.log(`- Family-friendly: ${sampleEvents.filter(e => e.familyFriendly).length}`);
    console.log(`- Young children (0-5): ${sampleEvents.filter(e => e.youngChildren).length}`);
    console.log(`- Indoor: ${sampleEvents.filter(e => e.isIndoor).length}`);
    console.log(`- Outdoor: ${sampleEvents.filter(e => e.isOutdoor).length}`);
    
  } catch (error) {
    console.error("❌ Error seeding events:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seedEvents();
