/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

/**
 * Shared types for accessibility data structure
 * Used across frontend and backend to ensure consistency
 */

export type AccessibilityValue = "yes" | "no" | "unknown" | "not-relevant";

export interface AccessibilityData {
  caregiver: {
    changeTablesPresent?: AccessibilityValue;
    changeTableLocations?: "mens" | "womens" | "gender-neutral" | "family" | "multiple" | "unknown" | "not-relevant";
    nursingFriendly?: AccessibilityValue;
    privateFeedingArea?: AccessibilityValue;
    bottleWarming?: AccessibilityValue;
    highChairs?: AccessibilityValue;
    strollerSpace?: AccessibilityValue;
    storage?: AccessibilityValue;
  };
  mobility: {
    strollerAccessible?: AccessibilityValue;
    wheelchairEntrance?: AccessibilityValue;
    stepFreeEntry?: AccessibilityValue;
    elevatorAccess?: AccessibilityValue;
    wideDoorways?: AccessibilityValue;
    accessibleSeating?: AccessibilityValue;
    accessibleWashrooms?: AccessibilityValue;
    accessibleParking?: AccessibilityValue;
    washroomAvailability?: Array<"mens" | "womens" | "gender-neutral" | "family" | "wheelchair-accessible" | "unknown" | "not-relevant">;
    terrainInfo?: "flat" | "gravel" | "hills" | "paved" | "unpaved" | "mixed" | "unknown" | "not-relevant";
    parkingDistance?: "short" | "moderate" | "long" | "unknown" | "not-relevant";
    busStopDistance?: "short" | "moderate" | "long" | "unknown" | "not-relevant";
    accessibleSidewalks?: AccessibilityValue;
    bikeRacks?: AccessibilityValue;
    coveredBikeParking?: AccessibilityValue;
  };
  sensory: {
    sensoryFriendly?: AccessibilityValue;
    quietEnvironment?: AccessibilityValue;
    loudNoises?: AccessibilityValue;
    flashingLights?: AccessibilityValue;
    crowdLevel?: "spacious" | "moderate" | "crowded" | "unknown";
    quietRoom?: AccessibilityValue;
    sensoryTimeSlot?: AccessibilityValue;
    predictableSchedule?: AccessibilityValue;
  };
  cognitive: {
    clearSignage?: AccessibilityValue;
    simpleInstructions?: AccessibilityValue;
    writtenMaterials?: AccessibilityValue;
    aslInterpretation?: AccessibilityValue;
    liveCaptions?: AccessibilityValue;
    multilingualSupport?: AccessibilityValue;
  };
  social: {
    serviceAnimalsWelcome?: AccessibilityValue;
    flexibleParticipation?: AccessibilityValue;
    genderNeutralWashrooms?: AccessibilityValue;
    lgbtqiaFriendly?: AccessibilityValue;
    maskFriendly?: AccessibilityValue;
    scentFree?: AccessibilityValue;
    alcoholFree?: AccessibilityValue;
    substanceFree?: AccessibilityValue;
    traumaInformed?: AccessibilityValue;
  };
}

/**
 * Event filter parameters for advanced search
 */
export interface EventFilters {
  // Location
  province?: string;
  municipality?: string;
  neighborhoodCommunity?: string;
  
  // Date & Time
  dateFrom?: Date;
  dateTo?: Date;
  timeOfDay?: "morning" | "afternoon" | "evening" | "all-day";
  isRecurring?: boolean;
  
  // Quick filters
  today?: boolean;
  tomorrow?: boolean;
  thisWeekend?: boolean;
  thisWeek?: boolean;
  thisMonth?: boolean;
  
  // Cost
  isFree?: boolean;
  costMax?: number;
  
  // Age
  allAges?: boolean;
  familyFriendly?: boolean;
  youngChildren?: boolean;
  kids?: boolean;
  teens?: boolean;
  adults?: boolean;
  adultsOnly?: boolean;
  excludeAdultsOnly?: boolean; // When adults is true, exclude adultsOnly events
  seniors?: boolean;
  
  // Attributes
  isIndoor?: boolean;
  isOutdoor?: boolean;
  isMixed?: boolean;
  
  // Accessibility filters
  strollerAccessible?: boolean;
  changeTablesPresent?: boolean;
  changeTableLocations?: string; // Filter by specific location type
  nursingFriendly?: boolean;
  strollerSpace?: boolean;
  wheelchairEntrance?: boolean;
  stepFreeEntry?: boolean;
  accessibleWashrooms?: boolean;
  washroomAvailability?: string; // Filter by washroom type
  sensoryFriendly?: boolean;
  quietRoom?: boolean;
  quietEnvironment?: boolean;
  serviceAnimalsWelcome?: boolean;
  flexibleParticipation?: boolean;
  genderNeutralWashrooms?: boolean;
  lgbtqiaFriendly?: boolean;
  scentFree?: boolean;
  // Public transit & active transportation
  busStopDistance?: boolean;
  accessibleSidewalks?: boolean;
  bikeRacks?: boolean;
  coveredBikeParking?: boolean;
  crowdLevel?: boolean;
  
  // Event types
  eventTypeIds?: number[];
  
  // Search
  search?: string;
  
  // Geolocation (Near Me)
  nearMe?: boolean;
  userLatitude?: number;
  userLongitude?: number;
  radiusKm?: number;
  
  // Sorting
  sortBy?: "soonest" | "latest" | "name-az" | "name-za" | "distance";
  
  // Archive
  showArchived?: boolean;
  
  // Admin filters
  status?: "pending" | "published" | "rejected" | "needs-clarification" | "closed";
  hasUnreviewedEdit?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
}
