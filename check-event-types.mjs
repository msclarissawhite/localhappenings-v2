import { db } from './server/db.ts';
import { eventTypes } from './drizzle/schema.ts';

const types = await db.select().from(eventTypes).orderBy(eventTypes.category, eventTypes.name);
console.log(JSON.stringify(types, null, 2));
process.exit(0);
