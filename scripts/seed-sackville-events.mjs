import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../drizzle/schema.js';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: 'default' });

// Sackville Business Association holiday events
const events = [
  {
    name: "Fa-la-la Christmas Stories",
    description: "With the dazzling Rouge Fatale! A family-friendly hour of holiday magic featuring festive storytelling and entertainment.\n\n**FREE admission**\n\n[More information on Sackville Business website](https://sackvillebusiness.com/holidays)",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Lower Sackville",
    venueName: "The Pink Piano Café & Lounge",
    address: "585 Sackville Drive, Lower Sackville, NS",
    startDate: new Date("2025-12-23T14:00:00"),
    endDate: new Date("2025-12-23T15:00:00"),
    isFree: true,
    allAges: true,
    familyFriendly: true,
    kids: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: {},
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "The Pink Piano Café & Lounge",
    organizerEmail: "info@sackvillebusiness.com",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30024], // Festive Holidays + Storytime
  },
  {
    name: "Tibb's Eve at Tap & Timber Social",
    description: "Join Tap & Timber Social on Tibb's Eve, December 23, the Newfoundland tradition of gathering on the night before Christmas Eve. They'll be offering food and drink specials all evening along with a touch of Newfoundland music in the mix.\n\nGrab your friends, get away from the holiday rush, and enjoy great food, good drinks, and even better company. Wear your best or worst holiday sweater to make it more festive!\n\n[More information on Sackville Business website](https://sackvillebusiness.com/holidays)",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Lower Sackville",
    venueName: "Tap & Timber Social",
    address: "963 Sackville Drive, Lower Sackville, NS",
    startDate: new Date("2025-12-23T16:00:00"),
    endDate: new Date("2025-12-23T23:00:00"),
    isFree: false,
    allAges: false,
    adultsOnly: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: {},
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Tap & Timber Social",
    organizerEmail: "info@sackvillebusiness.com",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30020, 30027], // Festive Holidays + Multicultural Festivals + Food & Drink
  },
  {
    name: "Tibb's Eve at Sackawa Canoe Club",
    description: "Join Sackawa for an evening of live music on Tibb's Eve! Tickets are available at the door, and all proceeds support charity.\n\nTibb's Eve is a Newfoundland tradition of gathering on the night before Christmas Eve to celebrate with friends and community.\n\n[More information on Sackville Business website](https://sackvillebusiness.com/holidays)",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Lower Sackville",
    venueName: "Sackawa Canoe Club",
    address: "159 First Lake Drive, Lower Sackville, NS",
    startDate: new Date("2025-12-23T19:00:00"),
    endDate: new Date("2025-12-23T23:00:00"),
    isFree: false,
    allAges: true,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: {},
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Sackawa Canoe Club",
    organizerEmail: "info@sackvillebusiness.com",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30017, 30020], // Festive Holidays + Live Music + Multicultural Festivals
  },
  {
    name: "New Year's Eve Dance at Sackawa Canoe Club",
    description: "Ring in 2026 at the Sackawa New Year's Dance! Join them for a night of celebration to count down to the New Year with great music, dancing, drinks, and friends.\n\n**Event highlights:**\n- Free snacks throughout the evening!\n- Midnight countdown & celebration with champagne\n\nGet your tickets early — this event always sells out!\n\n**$20 admission**\n\n[More information and tickets on Sackville Business website](https://sackvillebusiness.com/holidays)",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Lower Sackville",
    venueName: "Sackawa Canoe Club",
    address: "159 First Lake Drive, Lower Sackville, NS",
    startDate: new Date("2025-12-31T20:00:00"),
    endDate: new Date("2026-01-01T01:00:00"),
    isFree: false,
    costMin: 2000, // $20 in cents
    costMax: 2000,
    costType: "fixed",
    allAges: false,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: {},
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Sackawa Canoe Club",
    organizerEmail: "info@sackvillebusiness.com",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30017, 30026], // Festive Holidays + Live Music + Festivals & Fairs
  },
  {
    name: "New Year's Eve Party at Freeman's Little New York",
    description: "Ring in the new year with great music by Blackburn and James, champagne at midnight, and the incredible staff at Freeman's. Tickets are $10 and proceeds will be donated to the Salvation Army!\n\n**$10 admission (proceeds to charity)**\n\n[More information on Sackville Business website](https://sackvillebusiness.com/holidays)",
    province: "Nova Scotia",
    municipality: "Halifax",
    neighborhood: "Lower Sackville",
    venueName: "Freeman's Little New York",
    address: "552 Sackville Drive, Lower Sackville, NS",
    startDate: new Date("2025-12-31T20:00:00"),
    endDate: new Date("2026-01-01T01:00:00"),
    isFree: false,
    costMin: 1000, // $10 in cents
    costMax: 1000,
    costType: "fixed",
    allAges: false,
    adults: true,
    isIndoor: true,
    isOutdoor: false,
    accessibility: JSON.stringify({
      caregiver: {},
      mobility: {},
      sensory: {},
      cognitive: {},
      social: {}
    }),
    organizerName: "Freeman's Little New York",
    organizerEmail: "info@sackvillebusiness.com",
    displayOrganizerInfo: true,
    status: "published",
    eventTypeIds: [30031, 30017, 30022], // Festive Holidays + Live Music + Fundraisers
  },
];

console.log(`Seeding ${events.length} Sackville Business Association holiday events...`);

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
