import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { eventTypes } from '../drizzle/schema.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection);

const eventTypesData = [
  // Family & Kids (8 types)
  { name: 'Story Time', category: 'family-kids' },
  { name: 'Playgroup', category: 'family-kids' },
  { name: 'Kids Workshop', category: 'family-kids' },
  { name: 'Family Movie', category: 'family-kids' },
  { name: 'Outdoor Play', category: 'family-kids' },
  { name: 'Craft Activity', category: 'family-kids' },
  { name: 'Educational Program', category: 'family-kids' },
  { name: 'Youth Program', category: 'family-kids' },

  // Arts & Culture (7 types)
  { name: 'Art Exhibition', category: 'arts-culture' },
  { name: 'Live Music', category: 'arts-culture' },
  { name: 'Theatre Performance', category: 'arts-culture' },
  { name: 'Dance Performance', category: 'arts-culture' },
  { name: 'Film Screening', category: 'arts-culture' },
  { name: 'Art Workshop', category: 'arts-culture' },
  { name: 'Cultural Festival', category: 'arts-culture' },

  // Community & Social (6 types)
  { name: 'Community Meeting', category: 'community-social' },
  { name: 'Volunteer Opportunity', category: 'community-social' },
  { name: 'Social Gathering', category: 'community-social' },
  { name: 'Support Group', category: 'community-social' },
  { name: 'Fundraiser', category: 'community-social' },
  { name: 'Networking Event', category: 'community-social' },

  // Recreation & Sports (5 types)
  { name: 'Fitness Class', category: 'recreation-sports' },
  { name: 'Sports Game', category: 'recreation-sports' },
  { name: 'Outdoor Adventure', category: 'recreation-sports' },
  { name: 'Yoga/Meditation', category: 'recreation-sports' },
  { name: 'Recreation Program', category: 'recreation-sports' },

  // Markets & Festivals (3 types)
  { name: 'Farmers Market', category: 'markets-festivals' },
  { name: 'Craft Fair', category: 'markets-festivals' },
  { name: 'Food Festival', category: 'markets-festivals' },

  // Seasonal (3 types)
  { name: 'Holiday Event', category: 'seasonal' },
  { name: 'Seasonal Festival', category: 'seasonal' },
  { name: 'Seasonal Activity', category: 'seasonal' },
];

console.log(`Seeding ${eventTypesData.length} event types...`);

try {
  // Insert all event types
  await db.insert(eventTypes).values(eventTypesData);
  
  console.log('✅ Successfully seeded event types!');
  console.log('\nEvent types by category:');
  console.log('- Family & Kids: 8 types');
  console.log('- Arts & Culture: 7 types');
  console.log('- Community & Social: 6 types');
  console.log('- Recreation & Sports: 5 types');
  console.log('- Markets & Festivals: 3 types');
  console.log('- Seasonal: 3 types');
  console.log('\nTotal: 32 event types');
} catch (error) {
  if (error.code === 'ER_DUP_ENTRY') {
    console.log('⚠️  Event types already exist in database. Skipping seed.');
  } else {
    console.error('Error seeding event types:', error);
    process.exit(1);
  }
}

await connection.end();
process.exit(0);
