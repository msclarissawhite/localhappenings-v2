import { db } from './server/db.ts';
import { events } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const event = await db.select().from(events).where(eq(events.id, 360001)).limit(1);
console.log('Event 360001:');
console.log('hasUnreviewedEdit:', event[0]?.hasUnreviewedEdit);
console.log('pendingEditData:', event[0]?.pendingEditData);
console.log('status:', event[0]?.status);
console.log('Full event:', JSON.stringify(event[0], null, 2));
