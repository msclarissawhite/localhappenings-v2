import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, decimal, date, json } from "drizzle-orm/mysql-core";

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
  pendingEmail: varchar("pendingEmail", { length: 320 }), // New email awaiting verification
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
  latitude: decimal("latitude", { precision: 10, scale: 7 }), // Geocoded latitude (-90 to 90)
  longitude: decimal("longitude", { precision: 10, scale: 7 }), // Geocoded longitude (-180 to 180)
  
  // Date & Time
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate"),
  timeOfDay: mysqlEnum("timeOfDay", ["morning", "afternoon", "evening", "all-day"]),
  
  // Recurrence
  isRecurring: int("isRecurring").default(0).notNull(), // 0 = false, 1 = true
  recurrenceType: mysqlEnum("recurrenceType", ["one-time", "weekly", "monthly", "seasonal"]).default("one-time"),
  
  // Series Grouping
  seriesId: int("seriesId"), // Links to eventSeries table for recurring event grouping
  
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
  adults: int("adults").default(0).notNull(), // General adult audience (18+)
  adultsOnly: int("adultsOnly").default(0).notNull(), // Adults only (no children allowed)
  seniors: int("seniors").default(0).notNull(),
  
  // Basic Attributes
  isIndoor: int("isIndoor").default(0).notNull(),
  isOutdoor: int("isOutdoor").default(0).notNull(),
  isMixed: int("isMixed").default(0).notNull(), // Mixed Indoor/Outdoor
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
  
  // Public Contact Info (optional - for displaying different contact than organizer account)
  publicContactName: varchar("publicContactName", { length: 255 }),
  publicContactEmail: varchar("publicContactEmail", { length: 320 }),
  publicContactPhone: varchar("publicContactPhone", { length: 50 }),
  
  // Additional Info
  notes: text("notes"),
  imageUrl: text("imageUrl"),
  
  // Moderation
  status: mysqlEnum("status", ["pending", "published", "rejected", "needs-clarification", "closed"]).default("pending").notNull(),
  submittedBy: int("submittedBy"), // user id if logged in, null if anonymous
  reviewedBy: int("reviewedBy"), // admin user id
  reviewNotes: text("reviewNotes"),
  
  // Pending Edits (for unverified organizers editing published events)
  hasUnreviewedEdit: int("hasUnreviewedEdit").default(0).notNull(), // 0 = no pending edit, 1 = has pending edit
  pendingEditData: text("pendingEditData"), // JSON string containing the edited event data awaiting approval
  clickupTaskId: text("clickupTaskId"), // ClickUp task ID for syncing status updates
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  publishedAt: timestamp("publishedAt"),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;

/**
 * Event series - Groups of recurring events (e.g., "Weekly Trivia at The Pub")
 */
export const eventSeries = mysqlTable("eventSeries", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Weekly Trivia at The Pub"
  description: text("description"), // Optional description of the series
  slug: varchar("slug", { length: 255 }).notNull().unique(), // URL-friendly identifier
  organizerId: int("organizerId").notNull(), // Links to organizers table
  imageUrl: text("imageUrl"), // Optional series image
  isActive: int("isActive").default(1).notNull(), // 0 = archived, 1 = active
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventSeries = typeof eventSeries.$inferSelect;
export type InsertEventSeries = typeof eventSeries.$inferInsert;

/**
 * Event types/tags - Many-to-many relationship with events
 */
export const eventTypes = mysqlTable("eventTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["family-kids", "arts-culture", "community-social", "recreation-sports", "health-wellness", "markets-festivals", "seasonal", "environment"]).default("community-social").notNull(),
  isDeprecated: int("isDeprecated").default(0).notNull(), // 0 = active, 1 = deprecated (hidden from primary UI)
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
 * Homepage banners for seasonal/promotional content
 */
export const homepageBanners = mysqlTable("homepageBanners", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  bgGradient: varchar("bgGradient", { length: 255 }).notNull(), // Tailwind gradient classes like "from-red-500 to-green-600"
  textColor: varchar("textColor", { length: 100 }).notNull(), // Tailwind text color like "text-white"
  icon: varchar("icon", { length: 50 }), // Icon name from lucide-react
  // Filter criteria to apply when clicked
  eventTypeIds: json("eventTypeIds").$type<number[]>(),
  provinces: json("provinces").$type<string[]>(),
  municipalities: json("municipalities").$type<string[]>(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  // Display control
  isActive: int("isActive").default(1).notNull(),
  sortOrder: int("sortOrder").default(0).notNull(),
  // Auto-activation based on month (optional)
  activeMonths: json("activeMonths").$type<number[]>(), // Array of month numbers (0-11) for automatic activation
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HomepageBanner = typeof homepageBanners.$inferSelect;
export type InsertHomepageBanner = typeof homepageBanners.$inferInsert;

/**
 * Homepage featured events - manually curated events for homepage carousel
 * Separate from paid featured events
 */
export const homepageFeaturedEvents = mysqlTable("homepageFeaturedEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
  subtitle: text("subtitle"),
  sortOrder: int("sortOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HomepageFeaturedEvent = typeof homepageFeaturedEvents.$inferSelect;
export type InsertHomepageFeaturedEvent = typeof homepageFeaturedEvents.$inferInsert;

/**
 * Curated collections for seasonal/themed event groupings
 */
export const collections = mysqlTable("collections", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: text("imageUrl"),
  // Filter criteria stored as JSON
  eventTypeIds: json("eventTypeIds").$type<number[]>(), // Array of event type IDs
  provinces: json("provinces").$type<string[]>(),
  municipalities: json("municipalities").$type<string[]>(),
  startDate: date("startDate"),
  endDate: date("endDate"),
  sortOrder: int("sortOrder").default(0).notNull(),
  isPublished: int("isPublished").default(0).notNull(), // 0 = draft, 1 = published
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
 * Organizers table - Stores organizer accounts for event management
 */
export const organizers = mysqlTable("organizers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  website: text("website"),
  organizerType: mysqlEnum("organizerType", ["business", "nonprofit", "community", "municipality", "school-library", "other"]),
  loginMethod: varchar("loginMethod", { length: 64 }).default("email").notNull(), // "email" for magic link, "oauth" for Manus OAuth
  isVerified: int("isVerified").default(0).notNull(), // 0 = unverified, 1 = verified (auto-approval)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organizer = typeof organizers.$inferSelect;
export type InsertOrganizer = typeof organizers.$inferInsert;

/**
 * Magic link tokens for organizer authentication
 */
export const magicLinkTokens = mysqlTable("magicLinkTokens", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MagicLinkToken = typeof magicLinkTokens.$inferSelect;
export type InsertMagicLinkToken = typeof magicLinkTokens.$inferInsert;

/**
 * Saved locations for organizers - Reusable venue information
 */
export const savedLocations = mysqlTable("savedLocations", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Halifax Central Library"
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 150 }).notNull(),
  neighborhoodCommunity: varchar("neighborhoodCommunity", { length: 150 }),
  venue: text("venue"),
  address: text("address"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  accessibility: text("accessibility"), // JSON string with accessibility info
  isIndoor: int("isIndoor").default(0).notNull(),
  isOutdoor: int("isOutdoor").default(0).notNull(),
  isMixed: int("isMixed").default(0).notNull(),
  isDefault: int("isDefault").default(0).notNull(), // 0 = not default, 1 = default location
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = typeof savedLocations.$inferInsert;

/**
 * Contact info templates for organizers - Reusable contact information
 */
export const contactTemplates = mysqlTable("contactTemplates", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Business Contact", "Personal Contact"
  organizerName: varchar("organizerName", { length: 255 }),
  organizerEmail: varchar("organizerEmail", { length: 320 }),
  organizerPhone: varchar("organizerPhone", { length: 50 }),
  organizerWebsite: text("organizerWebsite"),
  publicContactName: varchar("publicContactName", { length: 255 }),
  publicContactEmail: varchar("publicContactEmail", { length: 320 }),
  publicContactPhone: varchar("publicContactPhone", { length: 50 }),
  isDefault: int("isDefault").default(0).notNull(), // 0 = not default, 1 = default template
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContactTemplate = typeof contactTemplates.$inferSelect;
export type InsertContactTemplate = typeof contactTemplates.$inferInsert;

/**
 * Event templates for organizers - Reusable event configurations
 */
export const eventTemplates = mysqlTable("eventTemplates", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Weekly Storytime Template"
  templateData: text("templateData").notNull(), // JSON string containing all event fields except date/time
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventTemplate = typeof eventTemplates.$inferSelect;
export type InsertEventTemplate = typeof eventTemplates.$inferInsert;

/**
 * Organizer images library - Reusable images for events
 */
export const organizerImages = mysqlTable("organizerImages", {
  id: int("id").autoincrement().primaryKey(),
  organizerId: int("organizerId").notNull(),
  imageUrl: text("imageUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  description: text("description"), // Optional description for organizing images
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrganizerImage = typeof organizerImages.$inferSelect;
export type InsertOrganizerImage = typeof organizerImages.$inferInsert;

/**
 * Saved events for users - Bookmark events with reminder preferences
 */
export const savedEvents = mysqlTable("savedEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  reminderPreference: mysqlEnum("reminderPreference", ["none", "24h", "48h", "both"]).default("none").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedEvent = typeof savedEvents.$inferSelect;
export type InsertSavedEvent = typeof savedEvents.$inferInsert;

/**
 * Feature requests from users
 */
export const featureRequests = mysqlTable("featureRequests", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  submitterName: varchar("submitterName", { length: 255 }),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  upvotes: int("upvotes").default(0).notNull(),
  status: mysqlEnum("status", ["proposed", "under-consideration", "in-review", "parked", "duplicate", "rejected", "approved-for-development"]).default("proposed").notNull(),
  clickupTaskId: text("clickupTaskId"), // ClickUp task ID for two-way sync
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeatureRequest = typeof featureRequests.$inferSelect;
export type InsertFeatureRequest = typeof featureRequests.$inferInsert;

/**
 * Feature request upvotes - Track which users upvoted which requests
 */
export const featureRequestUpvotes = mysqlTable("featureRequestUpvotes", {
  id: int("id").autoincrement().primaryKey(),
  featureRequestId: int("featureRequestId").notNull(),
  userIdentifier: varchar("userIdentifier", { length: 255 }).notNull(), // IP address or user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * Donations from Buy Me a Coffee
 */
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  donorName: varchar("donorName", { length: 255 }),
  donorEmail: varchar("donorEmail", { length: 320 }),
  amount: int("amount").notNull(), // in cents
  message: text("message"),
  isRecurring: int("isRecurring").default(0).notNull(),
  stripePaymentIntentId: text("stripePaymentIntentId"), // Also used for Buy Me a Coffee transaction ID
  stripeSubscriptionId: text("stripeSubscriptionId"),
  stripeCustomerId: text("stripeCustomerId"),
  isAnonymous: int("isAnonymous").default(0).notNull(),
  showAmount: int("showAmount").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

/**
 * Event feedback from attendees
 */
export const eventFeedback = mysqlTable("eventFeedback", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  attended: int("attended").default(0).notNull(), // 0 = didn't attend, 1 = attended
  accuracyRating: int("accuracyRating"), // 1-5 stars for listing accuracy
  comment: text("comment"),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  isSpam: int("isSpam").default(0).notNull(), // 0 = not spam, 1 = flagged as spam
  spamReason: text("spamReason"), // Reason for spam flag
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventFeedback = typeof eventFeedback.$inferSelect;
export type InsertEventFeedback = typeof eventFeedback.$inferInsert;

/**
 * Feedback templates for common responses
 */
export const feedbackTemplates = mysqlTable("feedbackTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedbackTemplate = typeof feedbackTemplates.$inferSelect;
export type InsertFeedbackTemplate = typeof feedbackTemplates.$inferInsert;

/**
 * Event type clicks for analytics
 */
export const eventTypeClicks = mysqlTable("eventTypeClicks", {
  id: int("id").autoincrement().primaryKey(),
  eventTypeId: int("eventTypeId").notNull(),
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
});

export type EventTypeClick = typeof eventTypeClicks.$inferSelect;
export type InsertEventTypeClick = typeof eventTypeClicks.$inferInsert;

/**
 * Event claim tokens for pre-seeded events
 */
export const eventClaimTokens = mysqlTable("eventClaimTokens", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  eventIds: json("eventIds").$type<number[]>().notNull(), // Array of event IDs to claim
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventClaimToken = typeof eventClaimTokens.$inferSelect;
export type InsertEventClaimToken = typeof eventClaimTokens.$inferInsert;

/**
 * Event change history for admin tracking
 */
export const eventChangeHistory = mysqlTable("eventChangeHistory", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  changedBy: int("changedBy").notNull(), // admin user id
  changeType: mysqlEnum("changeType", ["created", "edited", "status-changed", "deleted"]).notNull(),
  changeDetails: text("changeDetails"), // JSON string with before/after values
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EventChangeHistory = typeof eventChangeHistory.$inferSelect;
export type InsertEventChangeHistory = typeof eventChangeHistory.$inferInsert;
