
import type { AccessibilityData } from "@shared/types";

interface AccessibilityDisplayProps {
  accessibility: AccessibilityData;
}

export function AccessibilityDisplay({ accessibility }: AccessibilityDisplayProps) {
  // Helper function to check if a value is meaningful (not null, undefined, empty, "unknown", or "not-relevant")
  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "unknown" || lower === "not-relevant" || lower === "not relevant") return false;
    }
    return true;
  };

  // Helper function to render a field if it has a value
  const renderField = (label: string, value: any) => {
    if (!hasValue(value)) return null;
    
    // Handle boolean values
    if (typeof value === "boolean") {
      return (
        <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium">{value ? "Yes" : "No"}</span>
        </div>
      );
    }
    
    // Handle string values
    return (
      <div key={label} className="flex justify-between items-center py-2 border-b border-border last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium capitalize">{value}</span>
      </div>
    );
  };

  // Check if each category has any data
  const hasCaregiverData = accessibility.caregiver && Object.values(accessibility.caregiver).some(hasValue);
  const hasMobilityData = accessibility.mobility && Object.values(accessibility.mobility).some(hasValue);
  const hasSensoryData = accessibility.sensory && Object.values(accessibility.sensory).some(hasValue);
  const hasCognitiveData = accessibility.cognitive && Object.values(accessibility.cognitive).some(hasValue);
  const hasSocialData = accessibility.social && Object.values(accessibility.social).some(hasValue);

  // If no accessibility data at all, show a message
  const hasAnyData = hasCaregiverData || hasMobilityData || hasSensoryData || hasCognitiveData || hasSocialData;

  if (!hasAnyData) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Accessibility information not available for this event. Please contact the organizer for specific accessibility details.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasCaregiverData && (
        <div>
          <h4 className="font-medium mb-2">Caregiver & Infant</h4>
          <div className="space-y-1">
            {renderField("Change tables present", accessibility.caregiver?.changeTablesPresent)}
            {renderField("Change table locations", accessibility.caregiver?.changeTableLocations)}
            {renderField("Nursing/breastfeeding friendly", accessibility.caregiver?.nursingFriendly)}
            {renderField("Private feeding area", accessibility.caregiver?.privateFeedingArea)}
            {renderField("Bottle warming", accessibility.caregiver?.bottleWarming)}
            {renderField("High chairs", accessibility.caregiver?.highChairs)}
            {renderField("Stroller space", accessibility.caregiver?.strollerSpace)}
            {renderField("Bag/coat storage", accessibility.caregiver?.storage)}
          </div>
        </div>
      )}

      {hasMobilityData && (
        <div>
          <h4 className="font-medium mb-2">Mobility & Physical Access</h4>
          <div className="space-y-1">
            {renderField("Stroller accessible", accessibility.mobility?.strollerAccessible)}
            {renderField("Wheelchair accessible entrance", accessibility.mobility?.wheelchairEntrance)}
            {renderField("Step-free entry", accessibility.mobility?.stepFreeEntry)}
            {renderField("Elevator access", accessibility.mobility?.elevatorAccess)}
            {renderField("Wide doorways", accessibility.mobility?.wideDoorways)}
            {renderField("Accessible seating", accessibility.mobility?.accessibleSeating)}
            {renderField("Accessible washrooms", accessibility.mobility?.accessibleWashrooms)}
            {renderField("Accessible parking", accessibility.mobility?.accessibleParking)}
            {renderField("Terrain type", accessibility.mobility?.terrainInfo)}
            {renderField("Parking distance", accessibility.mobility?.parkingDistance)}
            {renderField("Bus stop distance", accessibility.mobility?.busStopDistance)}
            {renderField("Accessible sidewalks", accessibility.mobility?.accessibleSidewalks)}
            {renderField("Bike racks", accessibility.mobility?.bikeRacks)}
            {renderField("Covered bike parking", accessibility.mobility?.coveredBikeParking)}
          </div>
        </div>
      )}

      {hasSensoryData && (
        <div>
          <h4 className="font-medium mb-2">Sensory & Neurodivergent</h4>
          <div className="space-y-1">
            {renderField("Sensory-friendly environment", accessibility.sensory?.sensoryFriendly)}
            {renderField("Quiet environment", accessibility.sensory?.quietEnvironment)}
            {renderField("Loud noises expected", accessibility.sensory?.loudNoises)}
            {renderField("Flashing lights", accessibility.sensory?.flashingLights)}
            {renderField("Crowd level", accessibility.sensory?.crowdLevel)}
            {renderField("Quiet room available", accessibility.sensory?.quietRoom)}
            {renderField("Sensory-friendly time slot", accessibility.sensory?.sensoryTimeSlot)}
            {renderField("Predictable schedule", accessibility.sensory?.predictableSchedule)}
          </div>
        </div>
      )}

      {hasCognitiveData && (
        <div>
          <h4 className="font-medium mb-2">Cognitive & Communication</h4>
          <div className="space-y-1">
            {renderField("Clear signage", accessibility.cognitive?.clearSignage)}
            {renderField("Simple instructions", accessibility.cognitive?.simpleInstructions)}
            {renderField("Written materials", accessibility.cognitive?.writtenMaterials)}
            {renderField("ASL interpretation", accessibility.cognitive?.aslInterpretation)}
            {renderField("Live captions", accessibility.cognitive?.liveCaptions)}
            {renderField("Multilingual support", accessibility.cognitive?.multilingualSupport)}
          </div>
        </div>
      )}

      {hasSocialData && (
        <div>
          <h4 className="font-medium mb-2">Social & Emotional</h4>
          <div className="space-y-1">
            {renderField("Service animals welcome", accessibility.social?.serviceAnimalsWelcome)}
            {renderField("Flexible participation", accessibility.social?.flexibleParticipation)}
            {renderField("Gender-neutral washrooms", accessibility.social?.genderNeutralWashrooms)}
            {renderField("LGBTQIA+ friendly", accessibility.social?.lgbtqiaFriendly)}
            {renderField("Mask-friendly", accessibility.social?.maskFriendly)}
            {renderField("Scent-free", accessibility.social?.scentFree)}
            {renderField("Alcohol-free", accessibility.social?.alcoholFree)}
            {renderField("Substance-free", accessibility.social?.substanceFree)}
            {renderField("Trauma-informed approach", accessibility.social?.traumaInformed)}
          </div>
        </div>
      )}
    </div>
  );
}
