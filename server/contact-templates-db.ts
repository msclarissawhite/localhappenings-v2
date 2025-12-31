import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { contactInfoTemplates } from "../drizzle/schema";

/**
 * Get all contact templates for an organizer
 */
export async function getContactTemplatesByOrganizerId(organizerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(contactInfoTemplates)
    .where(eq(contactInfoTemplates.organizerId, organizerId))
    .orderBy(contactInfoTemplates.isDefault, contactInfoTemplates.createdAt);
}

/**
 * Create a new contact template
 */
export async function createContactTemplate(data: {
  organizerId: number;
  name: string;
  contactName: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWebsite?: string | null;
  displayPublicly: number;
  isDefault: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");
  
  // If setting as default, unset any existing default
  if (data.isDefault === 1) {
    await db
      .update(contactInfoTemplates)
      .set({ isDefault: 0 })
      .where(eq(contactInfoTemplates.organizerId, data.organizerId));
  }

  const [result] = await db.insert(contactInfoTemplates).values(data);
  
  // Fetch and return the created template
  const [created] = await db
    .select()
    .from(contactInfoTemplates)
    .where(eq(contactInfoTemplates.id, result.insertId))
    .limit(1);
  
  if (!created) throw new Error("Failed to retrieve created template");
  return created;
}

/**
 * Update an existing contact template
 */
export async function updateContactTemplate(
  id: number,
  organizerId: number,
  data: Partial<{
    name: string;
    contactName: string;
    contactEmail: string | null;
    contactPhone: string | null;
    contactWebsite: string | null;
    displayPublicly: number;
    isDefault: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Verify ownership
  const existing = await db
    .select()
    .from(contactInfoTemplates)
    .where(
      and(
        eq(contactInfoTemplates.id, id),
        eq(contactInfoTemplates.organizerId, organizerId)
      )
    )
    .limit(1);

  if (!existing || existing.length === 0) {
    throw new Error("Template not found or access denied");
  }

  // If setting as default, unset any existing default
  if (data.isDefault === 1) {
    await db
      .update(contactInfoTemplates)
      .set({ isDefault: 0 })
      .where(eq(contactInfoTemplates.organizerId, organizerId));
  }

  await db
    .update(contactInfoTemplates)
    .set(data)
    .where(eq(contactInfoTemplates.id, id));
  
  // Fetch and return the updated template
  const [updated] = await db
    .select()
    .from(contactInfoTemplates)
    .where(eq(contactInfoTemplates.id, id))
    .limit(1);
  
  if (!updated) throw new Error("Failed to retrieve updated template");
  return updated;
}

/**
 * Delete a contact template
 */
export async function deleteContactTemplate(id: number, organizerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Verify ownership before deleting
  const existing = await db
    .select()
    .from(contactInfoTemplates)
    .where(
      and(
        eq(contactInfoTemplates.id, id),
        eq(contactInfoTemplates.organizerId, organizerId)
      )
    )
    .limit(1);

  if (!existing || existing.length === 0) {
    throw new Error("Template not found or access denied");
  }

  await db
    .delete(contactInfoTemplates)
    .where(eq(contactInfoTemplates.id, id));
}

/**
 * Set a template as default
 */
export async function setDefaultContactTemplate(id: number, organizerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Verify ownership
  const existing = await db
    .select()
    .from(contactInfoTemplates)
    .where(
      and(
        eq(contactInfoTemplates.id, id),
        eq(contactInfoTemplates.organizerId, organizerId)
      )
    )
    .limit(1);

  if (!existing || existing.length === 0) {
    throw new Error("Template not found or access denied");
  }

  // Unset all defaults for this organizer
  await db
    .update(contactInfoTemplates)
    .set({ isDefault: 0 })
    .where(eq(contactInfoTemplates.organizerId, organizerId));

  // Set the selected template as default
  await db
    .update(contactInfoTemplates)
    .set({ isDefault: 1 })
    .where(eq(contactInfoTemplates.id, id));
}
