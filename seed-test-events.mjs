import mysql from 'mysql2/promise';
import 'dotenv/config';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

const testEvents = [
  {
    name: 'Family Storytime at Halifax Library',
    description: 'Weekly storytime for families with young children. Interactive reading, songs, and crafts.',
    province: 'Nova Scotia',
    municipality: 'Halifax',
    startDate: '2025-01-22 10:00:00',
    endDate: '2025-01-22 11:00:00',
    venue: 'Halifax Central Library',
    address: '5440 Spring Garden Road, Halifax, NS',
    isRecurring: 1,
    isFree: 1,
    allAges: 0,
    familyFriendly: 1,
    youngChildren: 1,
    isIndoor: 1,
    accessibility: JSON.stringify({
      mobility: { wheelchairAccessible: true, elevatorAccess: true },
      caregiver: { nursingArea: true, changingTable: true }
    }),
    status: 'published',
    organizerName: 'Halifax Public Libraries',
    organizerEmail: 'test-library@example.com',
    organizerType: 'school-library'
  },
  {
    name: 'Community Yoga in the Park',
    description: 'Free outdoor yoga session for all skill levels. Bring your own mat.',
    province: 'Nova Scotia',
    municipality: 'Halifax',
    startDate: '2025-01-25 09:00:00',
    endDate: '2025-01-25 10:00:00',
    venue: 'Halifax Public Gardens',
    address: 'Spring Garden Road, Halifax, NS',
    isRecurring: 1,
    isFree: 1,
    allAges: 1,
    familyFriendly: 1,
    isOutdoor: 1,
    accessibility: JSON.stringify({
      mobility: { wheelchairAccessible: true },
      sensory: { quietSpace: true }
    }),
    status: 'published',
    organizerName: 'Halifax Wellness Collective',
    organizerEmail: 'test-wellness@example.com',
    organizerType: 'community'
  },
  {
    name: 'Kids Science Workshop',
    description: 'Hands-on science experiments for kids ages 6-12. Learn about chemistry and physics through fun activities.',
    province: 'Nova Scotia',
    municipality: 'Dartmouth',
    startDate: '2025-01-28 14:00:00',
    endDate: '2025-01-28 16:00:00',
    venue: 'Dartmouth Community Centre',
    address: '50 Wyse Road, Dartmouth, NS',
    isRecurring: 0,
    isFree: 0,
    costMin: 1500,
    costMax: 1500,
    costType: 'fixed',
    allAges: 0,
    kids: 1,
    familyFriendly: 1,
    isIndoor: 1,
    accessibility: JSON.stringify({
      mobility: { wheelchairAccessible: true, accessibleWashrooms: true },
      caregiver: { changingTable: true }
    }),
    status: 'published',
    organizerName: 'STEM Kids Halifax',
    organizerEmail: 'test-stem@example.com',
    organizerType: 'community'
  }
];

for (const event of testEvents) {
  const [result] = await connection.execute(
    `INSERT INTO events (
      name, description, province, municipality, startDate, endDate,
      venue, address, isRecurring, isFree, costMin, costMax, costType, allAges, familyFriendly,
      youngChildren, kids, isIndoor, isOutdoor, accessibility, status,
      organizerName, organizerEmail, organizerType, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      event.name, event.description, event.province, event.municipality,
      event.startDate, event.endDate, event.venue, event.address,
      event.isRecurring, event.isFree, event.costMin || null, event.costMax || null, event.costType || null,
      event.allAges, event.familyFriendly, event.youngChildren || 0,
      event.kids || 0, event.isIndoor || 0, event.isOutdoor || 0,
      event.accessibility, event.status, event.organizerName,
      event.organizerEmail, event.organizerType
    ]
  );
  console.log(`Created event: ${event.name} (ID: ${result.insertId})`);
}

await connection.end();
console.log('\n✅ Successfully seeded 3 test events');
