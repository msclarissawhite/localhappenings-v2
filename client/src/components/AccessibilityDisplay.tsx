
import type { AccessibilityData } from "@shared/types";

interface AccessibilityDisplayProps {
  accessibility: AccessibilityData;
}

export function AccessibilityDisplay({ accessibility }: AccessibilityDisplayProps) {
  // Helper function to check if a value is meaningful (not null, undefined, empty, or "unknown")
  const hasValue = (value: any): boolean => {
    if (value === null || value === undefined || value === "") return false;
    if (typeof value === "string" && value.toLowerCase() === "unknown") return false;
    return true;
  };

  // Helper function to render a field if it has a value
  const renderField = (label: string, value: any) => {
    if (!hasValue(value)) return null;
    
    // Handle boolean values
    if (typeof value === "boolean") {
      return (
        <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className="text-sm font-medium">{value ? "Yes" : "No"}</span>
        </div>
      );
    }
    
    // Handle string values
    return (
      <div className="flex justify-between items-center py-2 border-b border-border last:border-0">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">{value}</span>
      </div>
    );
  };

  // Check if mobility section has any data
  const hasMobilityData = 
    hasValue(accessibility.wheelchairAccessible) ||
    hasValue(accessibility.accessibleParking) ||
    hasValue(accessibility.accessibleRestrooms) ||
    hasValue(accessibility.elevatorAccess) ||
    hasValue(accessibility.stepFreeAccess);

  // Check if sensory section has any data
  const hasSensoryData =
    hasValue(accessibility.quietSpaceAvailable) ||
    hasValue(accessibility.lowLighting) ||
    hasValue(accessibility.noFlashingLights) ||
    hasValue(accessibility.noiseLevelInfo);

  // Check if family section has any data
  const hasFamilyData =
    hasValue(accessibility.strollerAccessible) ||
    hasValue(accessibility.nursingRoomAvailable) ||
    hasValue(accessibility.changingTableAvailable);

  // Check if transportation section has any data
  const hasTransportationData =
    hasValue(accessibility.publicTransitAccess) ||
    hasValue(accessibility.parkingAvailable) ||
    hasValue(accessibility.bikeRackAvailable);

  // If no accessibility data at all, show a message
  const hasAnyData = hasMobilityData || hasSensoryData || hasFamilyData || hasTransportationData;

  if (!hasAnyData) {
    return (
      <div className="text-sm text-muted-foreground italic">
        Accessibility information not available for this event. Please contact the organizer for specific accessibility details.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasMobilityData && (
        <div>
          <h4 className="font-medium mb-2">Mobility & Physical Access</h4>
          <div className="space-y-1">
            {renderField("Wheelchair Accessible", accessibility.wheelchairAccessible)}
            {renderField("Accessible Parking", accessibility.accessibleParking)}
            {renderField("Accessible Restrooms", accessibility.accessibleRestrooms)}
            {renderField("Elevator Access", accessibility.elevatorAccess)}
            {renderField("Step-Free Access", accessibility.stepFreeAccess)}
          </div>
        </div>
      )}

      {hasSensoryData && (
        <div>
          <h4 className="font-medium mb-2">Sensory Considerations</h4>
          <div className="space-y-1">
            {renderField("Quiet Space Available", accessibility.quietSpaceAvailable)}
            {renderField("Low Lighting", accessibility.lowLighting)}
            {renderField("No Flashing Lights", accessibility.noFlashingLights)}
            {renderField("Noise Level", accessibility.noiseLevelInfo)}
          </div>
        </div>
      )}

      {hasFamilyData && (
        <div>
          <h4 className="font-medium mb-2">Family Amenities</h4>
          <div className="space-y-1">
            {renderField("Stroller Accessible", accessibility.strollerAccessible)}
            {renderField("Nursing Room Available", accessibility.nursingRoomAvailable)}
            {renderField("Changing Table Available", accessibility.changingTableAvailable)}
          </div>
        </div>
      )}

      {hasTransportationData && (
        <div>
          <h4 className="font-medium mb-2">Transportation & Parking</h4>
          <div className="space-y-1">
            {renderField("Public Transit Access", accessibility.publicTransitAccess)}
            {renderField("Parking Available", accessibility.parkingAvailable)}
            {renderField("Bike Rack Available", accessibility.bikeRackAvailable)}
          </div>
        </div>
      )}
    </div>
  );
}
