import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Events table - Core event listings with moderation workflow
 */
export const events = mysqlTable("events", {
  id: int("id").autoincrement().primaryKey(),
  
  // Basic Info
  name: text("name").notNull(),
  description: text("description").notNull(),
  
  // Location
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 150 }).notNull(),
  neighborhoodCommunity: varchar("neighborhoodCommunity", { length: 150 }),
  venue: text("venue"),
  address: text("address"),
  
  // Date & Time
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  timeOfDay: mysqlEnum("timeOfDay", ["morning", "afternoon", "evening", "all-day"]),
  
  // Recurrence
  isRecurring: int("isRecurring").default(0).notNull(), // 0 = false, 1 = true
  recurrenceType: mysqlEnum("recurrenceType", ["one-time", "weekly", "monthly", "seasonal"]).default("one-time"),
  
  // Cost
  isFree: int("isFree").default(0).notNull(),
  costMin: int("costMin"), // in cents
  costMax: int("costMax"), // in cents
  costType: mysqlEnum("costType", ["fixed", "range", "donation", "pay-what-you-can", "sliding-scale"]),
  kidsFree: int("kidsFree").default(0).notNull(),
  freeCompanion: int("freeCompanion").default(0).notNull(),
  
  // Age Suitability
  allAges: int("allAges").default(0).notNull(),
  familyFriendly: int("familyFriendly").default(0).notNull(),
  youngChildren: int("youngChildren").default(0).notNull(), // 0-5
  kids: int("kids").default(0).notNull(), // 6-12
  teens: int("teens").default(0).notNull(),
  adultsOnly: int("adultsOnly").default(0).notNull(),
  seniors: int("seniors").default(0).notNull(),
  
  // Basic Attributes
  isIndoor: int("isIndoor").default(0).notNull(),
  isOutdoor: int("isOutdoor").default(0).notNull(),
  shortDuration: int("shortDuration").default(0).notNull(), // under 2 hours
  dropIn: int("dropIn").default(0).notNull(),
  canReenter: int("canReenter").default(0).notNull(),
  
  // Accessibility (stored as JSON for flexibility)
  // Structure: { caregiver: {}, mobility: {}, sensory: {}, cognitive: {}, social: {} }
  accessibility: text("accessibility").notNull(), // JSON string
  
  // Organizer Info
  organizerId: int("organizerId"), // Links to organizers table if submitted by logged-in organizer
  organizerName: varchar("organizerName", { length: 255 }),
  organizerType: mysqlEnum("organizerType", ["business", "nonprofit", "community", "municipality", "school-library", "other"]),
  organizerEmail: varchar("organizerEmail", { length: 320 }),
  organizerPhone: varchar("organizerPhone", { length: 50 }),
  organizerWebsite: text("organizerWebsite"),
  displayOrganizerInfo: int("displayOrganizerInfo").default(1).notNull(), // 0 = hide, 1 = show publicly
  
  // Additional Info
  notes: text("notes"),
  imageUrl: text("imageUrl"),
  
  // Moderation
  status: mysqlEnum("status", ["pending", "published", "rejected", "needs-clarification"]).default("pending").notNull(),
  submittedBy: int("submittedBy"), // user id if logged in, null if anonymous
  reviewedBy: int("reviewedBy"), // admin user id
  reviewNotes: text("reviewNotes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event types/tags - Many-to-many relationship with events
 */
export const eventTypes = mysqlTable("eventTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["core", "family", "cultural", "seasonal"]).default("core").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventType = typeof eventTypes.$inferSelect;
export type InsertEventType = typeof eventTypes.$inferInsert;

/**
 * Junction table for events and event types
 */
export const eventToEventTypes = mysqlTable("eventToEventTypes", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  eventTypeId: int("eventTypeId").notNull(),
});

/**
 * Curated collections for seasonal/themed event groupings
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = typeof collections.$inferInsert;

/**
 * Junction table for collections and events
 */
export const collectionToEvents = mysqlTable("collectionToEvents", {
  id: int("id").autoincrement().primaryKey(),
  collectionId: int("collectionId").notNull(),
  eventId: int("eventId").notNull(),
});

/**
 * Organizer accounts - Separate from admin users, uses magic link authentication
 */
export const organizers = mysqlTable("organizers", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  organizationName: varchar("organizationName", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  isVerified: int("isVerified").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastLoginAt: timestamp("lastLoginAt"),
});

export type Organizer = typeof organizers.$inferSelect;
export type InsertOrganizer = typeof organizers.$inferInsert;

/**
 * Magic link tokens for organizer authentication
 */
export const magicLinkTokens = mysqlTable("magicLinkTokens", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type InsertMagicLinkToken = typeof magicLinkTokens.$inferInsert;

/**
 * Saved locations for organizers - Remembers frequently used venues
 */
export const savedLocations = mysqlTable("savedLocations", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  
  // Location name/label
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Main Library", "Community Center"
  
  // Location details (same fields as events table)
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 150 }).notNull(),
  neighborhoodCommunity: varchar("neighborhoodCommunity", { length: 150 }),
  venue: text("venue"),
  address: text("address"),
  
  // Accessibility info (stored as JSON, same structure as events)
  accessibility: text("accessibility").notNull(),
  
  // Indoor/Outdoor defaults
  isIndoor: int("isIndoor").default(0).notNull(),
  isOutdoor: int("isOutdoor").default(0).notNull(),
  
  // Default location flag - only one location per organizer can be default
  isDefault: int("isDefault").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = typeof savedLocations.$inferInsert;