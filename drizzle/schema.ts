import { date, decimal, int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
 * Event types/tags - Many-to-many relationship with events
 */
export const eventTypes = mysqlTable("eventTypes", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  category: mysqlEnum("category", ["family-kids", "arts-culture", "community-social", "recreation-sports", "health-wellness", "markets-festivals", "seasonal", "environment"]).default("community-social").notNull(),
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
  provinces: json("provinces").$type<string[]>(), // Array of province codes
  municipalities: json("municipalities").$type<string[]>(), // Array of municipality names
  startDate: date("startDate"), // Optional start date for seasonal collections
  endDate: date("endDate"), // Optional end date for seasonal collections
  isActive: int("isActive").default(1).notNull(),
  isPublished: int("isPublished").default(0).notNull(), // Whether collection landing page is publicly visible
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
  isMixed: int("isMixed").default(0).notNull(), // Mixed Indoor/Outdoor
  
  // Default location flag - only one location per organizer can be default
  isDefault: int("isDefault").default(0).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SavedLocation = typeof savedLocations.$inferSelect;
export type InsertSavedLocation = typeof savedLocations.$inferInsert;

/**
 * Saved events for users - Bookmarking system with email reminders
 */
export const savedEvents = mysqlTable("savedEvents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  
  // Email reminder preferences
  reminderPreference: mysqlEnum("reminderPreference", ["none", "24h", "48h", "both"]).default("24h").notNull(),
  
  // Tracking
  reminder24hSent: int("reminder24hSent").default(0).notNull(), // Boolean: has 24h reminder been sent?
  reminder48hSent: int("reminder48hSent").default(0).notNull(), // Boolean: has 48h reminder been sent?
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedEvent = typeof savedEvents.$inferSelect;
export type InsertSavedEvent = typeof savedEvents.$inferInsert;

/**
 * Feature requests - User-submitted feature ideas with upvoting
 */
export const featureRequests = mysqlTable("featureRequests", {
  id: int("id").autoincrement().primaryKey(),
  
  // Request details
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  
  // Submitter info (optional - can be anonymous or authenticated)
  userId: int("userId"), // null if anonymous
  submitterName: varchar("submitterName", { length: 100 }), // For anonymous submissions
  submitterEmail: varchar("submitterEmail", { length: 255 }), // For notifications
  
  // Status management
  status: mysqlEnum("status", ["pending", "under_review", "planned", "in_progress", "completed", "declined"]).default("pending").notNull(),
  adminNotes: text("adminNotes"), // Internal notes for admins
  
  // ClickUp integration
  clickupTaskId: varchar("clickupTaskId", { length: 100 }), // ClickUp task ID for two-way sync
  clickupTaskUrl: text("clickupTaskUrl"), // Direct link to ClickUp task
  
  // Metrics
  upvoteCount: int("upvoteCount").default(0).notNull(),
  
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
  userId: int("userId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeatureRequestUpvote = typeof featureRequestUpvotes.$inferSelect;
export type InsertFeatureRequestUpvote = typeof featureRequestUpvotes.$inferInsert;

/**
 * Featured events - Paid promotion for events to appear at top of browse/archive pages
 * $10 per week, 1-8 weeks maximum
 */
export const featuredEvents = mysqlTable("featuredEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(),
  organizerId: int("organizerId").notNull(),
  
  // Duration and pricing
  weeksPurchased: int("weeksPurchased").notNull(), // 1-8 weeks
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(), // Calculated: startDate + (weeksPurchased * 7 days)
  amountPaid: int("amountPaid").notNull(), // In cents: weeksPurchased * 1000 ($10 per week)
  
  // Stripe payment tracking
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }).notNull(),
  
  // Status
  status: mysqlEnum("status", ["active", "expired"]).default("active").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FeaturedEvent = typeof featuredEvents.$inferSelect;
export type InsertFeaturedEvent = typeof featuredEvents.$inferInsert;

/**
 * Donations - Voluntary financial support from community members
 * Supports one-time and recurring monthly donations
 */
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  
  // Donor information
  donorName: varchar("donorName", { length: 255 }), // null if anonymous
  donorEmail: varchar("donorEmail", { length: 320 }).notNull(), // For receipt, not displayed publicly
  message: text("message"), // Optional message (max 200 chars, enforced in frontend)
  
  // Amount
  amount: int("amount").notNull(), // In cents
  
  // Recurring vs one-time
  isRecurring: int("isRecurring").default(0).notNull(), // 0 = one-time, 1 = monthly recurring
  
  // Stripe payment tracking
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }), // For one-time donations
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }), // For recurring donations
  
  // Privacy preferences
  isAnonymous: int("isAnonymous").default(0).notNull(), // 0 = show name, 1 = show "Anonymous Supporter"
  showAmount: int("showAmount").default(1).notNull(), // 0 = hide amount, 1 = show amount on donor wall
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

/**
 * Organizer Image Library - Reusable images for events
 * Allows organizers to upload and manage a library of photos
 * that can be reused across multiple events
 */
export const organizerImages = mysqlTable("organizerImages", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id
  
  // Image details
  url: text("url").notNull(), // S3 URL
  fileKey: text("fileKey").notNull(), // S3 file key for deletion
  fileName: varchar("fileName", { length: 255 }).notNull(), // Original filename
  
  // Optional metadata
  description: text("description"), // Optional description/caption
  
  // Timestamps
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type OrganizerImage = typeof organizerImages.$inferSelect;
export type InsertOrganizerImage = typeof organizerImages.$inferInsert;

/**
 * Event Templates - Reusable event configurations
 * Allows organizers to save recurring event types as templates
 * for faster event creation with pre-filled fields
 */
export const eventTemplates = mysqlTable("eventTemplates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id (organizer)
  
  // Template metadata
  templateName: varchar("templateName", { length: 255 }).notNull(), // User-friendly name
  description: text("description"), // Optional description of what this template is for
  
  // Event data (JSON-encoded event fields)
  templateData: json("templateData").notNull(), // Stores all event fields as JSON
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EventTemplate = typeof eventTemplates.$inferSelect;
export type InsertEventTemplate = typeof eventTemplates.$inferInsert;

/**
 * Event Feedback - Post-event attendee feedback for listing accuracy
 * Helps identify reliable organizers and improve data quality
 */
export const eventFeedback = mysqlTable("eventFeedback", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(), // References events.id
  
  // Feedback responses
  attended: int("attended").notNull(), // Did they actually attend? (0=no, 1=yes)
  accuracyRating: int("accuracyRating"), // 1-5 scale, null if didn't attend
  helpfulDetails: json("helpfulDetails"), // Array of helpful categories
  inaccurateDetails: json("inaccurateDetails"), // Array of inaccurate categories
  comments: text("comments"), // Optional free-text feedback
  
  // Metadata
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  
  // ClickUp sync tracking
  syncedToClickUp: int("syncedToClickUp").default(0).notNull(), // 0=not synced, 1=synced
  clickUpSyncedAt: timestamp("clickUpSyncedAt"),
  
  // Spam detection
  isSpam: int("isSpam").default(0).notNull(), // 0=not spam, 1=flagged as spam
  spamReason: text("spamReason"), // Reason for spam flag (duplicate, rapid_submission, identical_text)
});

export type EventFeedback = typeof eventFeedback.$inferSelect;
export type InsertEventFeedback = typeof eventFeedback.$inferInsert;

/**
 * Event claim tokens - For assigning pre-seeded events to organizers
 */
export const eventClaimTokens = mysqlTable("event_claim_tokens", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  organizerEmail: varchar("organizerEmail", { length: 320 }).notNull(),
  eventIds: text("eventIds").notNull(), // JSON array of event IDs to claim
  claimed: int("claimed").default(0).notNull(), // 0 = not claimed, 1 = claimed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  claimedAt: timestamp("claimedAt"),
  expiresAt: timestamp("expiresAt").notNull(), // Tokens expire after 30 days
});

export type EventClaimToken = typeof eventClaimTokens.$inferSelect;
export type InsertEventClaimToken = typeof eventClaimTokens.$inferInsert;

/**
 * Event Edit History - Tracks all admin edits to events for audit trail
 */
export const eventEditHistory = mysqlTable("eventEditHistory", {
  id: int("id").autoincrement().primaryKey(),
  eventId: int("eventId").notNull(), // References events.id
  adminId: int("adminId").notNull(), // References users.id
  adminName: text("adminName"), // Snapshot of admin name at time of edit
  changedFields: json("changedFields"), // Object with field names and their old/new values
  editedAt: timestamp("editedAt").defaultNow().notNull(),
});

export type EventEditHistory = typeof eventEditHistory.$inferSelect;
export type InsertEventEditHistory = typeof eventEditHistory.$inferInsert;

/**
 * Feedback Response Templates - Reusable email templates for responding to organizers
 * Helps admins quickly respond to common organizer questions about feedback
 */
export const feedbackTemplates = mysqlTable("feedbackTemplates", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(),
  category: varchar("category", { length: 100 }), // e.g., "accuracy_improvement", "general_inquiry", "technical_support"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeedbackTemplate = typeof feedbackTemplates.$inferSelect;
export type InsertFeedbackTemplate = typeof feedbackTemplates.$inferInsert;

/**
 * Event Type Clicks - Analytics tracking for tag filter usage
 * Tracks when users click/filter by event types to understand interest patterns
 */
export const eventTypeClicks = mysqlTable("eventTypeClicks", {
  id: int("id").autoincrement().primaryKey(),
  eventTypeId: int("eventTypeId").notNull(), // References eventTypes.id
  clickedAt: timestamp("clickedAt").defaultNow().notNull(),
  // Optional: track user session or IP for more detailed analytics
  sessionId: varchar("sessionId", { length: 64 }),
});

export type EventTypeClick = typeof eventTypeClicks.$inferSelect;
export type InsertEventTypeClick = typeof eventTypeClicks.$inferInsert;
