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
    changeTablesAllWashrooms?: AccessibilityValue;
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
    terrainInfo?: "flat" | "gravel" | "hills" | "paved" | "unpaved" | "mixed" | "unknown" | "not-relevant";
    parkingDistance?: "short" | "moderate" | "long" | "unknown" | "not-relevant";
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
  city?: string;
  neighborhood?: string;
  
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
  adultsOnly?: boolean;
  seniors?: boolean;
  
  // Attributes
  isIndoor?: boolean;
  isOutdoor?: boolean;
  
  // Accessibility filters
  changeTablesPresent?: boolean;
  nursingFriendly?: boolean;
  strollerSpace?: boolean;
  wheelchairEntrance?: boolean;
  stepFreeEntry?: boolean;
  accessibleWashrooms?: boolean;
  sensoryFriendly?: boolean;
  quietRoom?: boolean;
  quietEnvironment?: boolean;
  genderNeutralWashrooms?: boolean;
  lgbtqiaFriendly?: boolean;
  scentFree?: boolean;
  
  // Event types
  eventTypeIds?: number[];
  
  // Search
  search?: string;
  
  // Sorting
  sortBy?: "soonest" | "latest" | "name-az" | "name-za";
  
  // Archive
  showArchived?: boolean;
  
  // Pagination
  limit?: number;
  offset?: number;
}
