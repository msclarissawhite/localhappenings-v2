import { db } from '../server/db';
import { eventTypes } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

const types = await db.select().from(eventTypes).where(eq(eventTypes.isDeprecated, 0)).orderBy(eventTypes.category, eventTypes.name);

const grouped = types.reduce((acc, type) => {
  if (!acc[type.category]) acc[type.category] = [];
  acc[type.category].push(type);
  return acc;
}, {});

console.log(JSON.stringify(grouped, null, 2));
