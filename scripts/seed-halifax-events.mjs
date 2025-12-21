import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Halifax Public Libraries holiday events
const events = [
  {
    name: "BreakSpace \"Winter Breakz\" Dance Showcase",
    description: "Join us for \"Winter Breakz,\" where we will be ending the year off with a 2-versus-2 breaking competition. This will be focusing on showcasing new and upcoming breaking talent in the local scene.\n\nBreakSpace is a weekly event featuring breaking (breakdancing) workshops and competitions.",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Downtown Halifax",
    venueName: "Central Library",
    address: "5440 Spring Garden Road, Halifax, NS",
    startDate: new Date("2025-12-21T14:00:00"),
    endDate: new Date("2025-12-21T17:00:00"),
    isFree: true,
    allAges: false,
    teens: true,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: { wheelchairAccessible: "Yes", stepFreeEntry: "Yes", elevatorAvailable: "Yes", accessibleWashrooms: "Yes" },
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpublicliclibraries.ca",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30017], // Festive Holidays + Live Music/Performance
  },
  {
    name: "Holiday Movie: Red One",
    description: "**PG | 2025 | 2h 3min**\n\nRed One is a comedy action film starring Dwayne Johnson, Chris Evans, and Lucy Liu.\n\nAfter Santa Claus (code name: Red One) is kidnapped, the North Pole's Head of Security must team up with the world's most infamous bounty hunter in a globe-trotting, action-packed mission to save Christmas.\n\nFree popcorn and refreshments provided!",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Woodlawn",
    venueName: "Woodlawn Public Library",
    address: "31 Eisener Boulevard, Dartmouth, NS",
    startDate: new Date("2025-12-22T13:30:00"),
    endDate: new Date("2025-12-22T15:30:00"),
    isFree: true,
    allAges: false,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: { wheelchairAccessible: "Yes", stepFreeEntry: "Yes", elevatorAvailable: "Yes", accessibleWashrooms: "Yes" },
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpubliclibraries.ca",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031], // Festive Holidays
  },
  {
    name: "Tibb's Eve Celebration",
    description: "Every December 23 in Newfoundland and Labrador, folks get together with friends for Tibb's Eve to celebrate the season before the family festivities begin.\n\nNewfoundlanders and non-Newfoundlanders alike are invited to drop by the Sackville Public Library to celebrate this unique Maritime tradition with music, refreshments, and good company!\n\nAll ages welcome.",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Lower Sackville",
    venueName: "Sackville Public Library",
    address: "636 Sackville Drive, Lower Sackville, NS",
    startDate: new Date("2025-12-23T13:00:00"),
    endDate: new Date("2025-12-23T15:00:00"),
    isFree: true,
    allAges: true,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: { wheelchairAccessible: "Yes", stepFreeEntry: "Yes", elevatorAvailable: "Not Relevant", accessibleWashrooms: "Yes" },
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpubliclibraries.ca",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30020], // Festive Holidays + Multicultural Festivals
  },
  {
    name: "Holiday Movie & Craft: Elf",
    description: "Enjoy the holiday favourite **Elf** while crafting some movie-themed ornaments like a movable elf, a narwhal, or Buddy's famous plate of breakfast spaghetti.\n\n**Rated PG | 2003 | 1h 37min**\n\nElf is the story of Buddy (Will Ferrell) who was accidentally transported to the North Pole as a toddler and raised to adulthood among Santa's elves. Unable to shake the feeling that he doesn't fit in, the adult Buddy travels to New York to find his birth father.\n\nAll craft materials provided!",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Clayton Park",
    venueName: "Keshen Goodman Public Library",
    address: "330 Lacewood Drive, Halifax, NS",
    startDate: new Date("2025-12-23T14:00:00"),
    endDate: new Date("2025-12-23T15:45:00"),
    isFree: true,
    allAges: true,
    kids: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: { wheelchairAccessible: "Yes", stepFreeEntry: "Yes", elevatorAvailable: "Yes", accessibleWashrooms: "Yes" },
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpubliclibraries.ca",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30001], // Festive Holidays + Kids Crafts
  },
  {
    name: "Teen Night: Reindeer Games",
    description: "With only two days left until Christmas, the Reindeer Games are well underway! To earn a spot on the sleigh team you'll need speed, mental acuity, and vast knowledge of all things Christmas.\n\nTuesday night is Teen Night at the Library! Join us for games, challenges, and holiday-themed fun. Snacks and prizes provided.\n\n**Ages 13-18 only**",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Cole Harbour",
    venueName: "Cole Harbour Public Library",
    address: "1 Forest Hills Parkway, Dartmouth, NS",
    startDate: new Date("2025-12-23T18:00:00"),
    endDate: new Date("2025-12-23T19:30:00"),
    isFree: true,
    allAges: false,
    teens: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: { wheelchairAccessible: "Yes", stepFreeEntry: "Yes", elevatorAvailable: "Not Relevant", accessibleWashrooms: "Yes" },
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpubliclibraries.ca",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031], // Festive Holidays
  },
  {
    name: "16mm Holiday Films",
    description: "Enjoy some vintage holiday entertainment as we watch some classic 16mm films using our original projector!\n\nExperience the magic of old-school cinema with a curated selection of festive short films from decades past. A nostalgic treat for film lovers of all ages.\n\nPopcorn and hot chocolate provided!",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Hubbards",
    venueName: "J. D. Shatford Memorial Public Library",
    address: "15 School Street, Hubbards, NS",
    startDate: new Date("2025-12-27T11:00:00"),
    endDate: new Date("2025-12-27T12:00:00"),
    isFree: true,
    allAges: true,
    kids: true,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: { wheelchairAccessible: "Yes", stepFreeEntry: "Yes", elevatorAvailable: "Not Relevant", accessibleWashrooms: "Yes" },
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Halifax Public Libraries",
    organizerEmail: "info@halifaxpubliclibraries.ca",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031], // Festive Holidays
  },
];

console.log(`Seeding ${events.length} Halifax Public Libraries holiday events...`);

for (const eventData of events) {
  const { eventTypeIds, ...eventFields } = eventData;
  
  // Insert event
  const [result] = await db.insert(schema.events).values(eventFields);
  const eventId = result.insertId;
  
  console.log(`✓ Created event: ${eventData.name} (ID: ${eventId})`);
  
  // Associate event types
  if (eventTypeIds && eventTypeIds.length > 0) {
    for (const typeId of eventTypeIds) {
      await db.insert(schema.eventToEventTypes).values({
        eventId,
        eventTypeId: typeId,
      });
    }
    console.log(`  ✓ Tagged with ${eventTypeIds.length} event type(s)`);
  }
}

console.log('\n✅ All events seeded successfully!');
await connection.end();
