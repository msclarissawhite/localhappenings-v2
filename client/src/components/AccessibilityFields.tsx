import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

type AccessibilityValue = "yes" | "no" | "unknown" | "not-relevant" | "flat" | "gravel" | "hills" | "short" | "moderate" | "long" | "spacious" | "crowded";

interface AccessibilityData {
  caregiver?: Record<string, AccessibilityValue>;
  mobility?: Record<string, AccessibilityValue>;
  sensory?: Record<string, AccessibilityValue>;
  cognitive?: Record<string, AccessibilityValue>;
  social?: Record<string, AccessibilityValue>;
}

interface AccessibilityFieldsProps {
  accessibility: AccessibilityData;
  updateAccessibility: (category: string, field: string, value: AccessibilityValue) => void;
}

export function AccessibilityFields({ accessibility, updateAccessibility }: AccessibilityFieldsProps) {
  const AccessibilityField = ({
    category,
    field,
    label,
    tooltip,
    showNotRelevant = false,
    customOptions,
  }: {
    category: string;
    field: string;
    label: string;
    tooltip: string;
    showNotRelevant?: boolean;
    customOptions?: { value: string; label: string }[];
  }) => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm">{label}</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <RadioGroup
        value={accessibility[category]?.[field] || "unknown"}
        onValueChange={(value: AccessibilityValue) =>
          updateAccessibility(category, field, value)
        }
      >
        <div className="flex flex-wrap gap-4">
          {customOptions ? (
            customOptions.map((option) => (
              <div key={option.value} className="flex items-center gap-2">
                <RadioGroupItem value={option.value} id={`${category}-${field}-${option.value}`} />
                <Label htmlFor={`${category}-${field}-${option.value}`} className="cursor-pointer font-normal">
                  {option.label}
                </Label>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="yes" id={`${category}-${field}-yes`} />
                <Label htmlFor={`${category}-${field}-yes`} className="cursor-pointer font-normal">
                  Yes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="no" id={`${category}-${field}-no`} />
                <Label htmlFor={`${category}-${field}-no`} className="cursor-pointer font-normal">
                  No
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="unknown" id={`${category}-${field}-unknown`} />
                <Label htmlFor={`${category}-${field}-unknown`} className="cursor-pointer font-normal">
                  Unknown
                </Label>
              </div>
              {showNotRelevant && (
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="not-relevant" id={`${category}-${field}-not-relevant`} />
                  <Label htmlFor={`${category}-${field}-not-relevant`} className="cursor-pointer font-normal">
                    Not Relevant
                  </Label>
                </div>
              )}
            </>
          )}
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Accessibility Information</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Help families find events that meet their needs. Select "Unknown" if you're unsure - you can update this later.
      </p>
      <div className="space-y-6">
        {/* Caregiver & Family Needs */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted">
            <h3 className="text-lg font-semibold">Caregiver & Family Needs</h3>
            <ChevronDown className="w-5 h-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <AccessibilityField
              category="caregiver"
              field="changeTablesPresent"
              label="Change Tables Available"
              tooltip="Are diaper changing stations available at the venue?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="changeTablesAllWashrooms"
              label="Change Tables in All Washrooms"
              tooltip="Are changing tables available in all washrooms, not just gendered ones?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="nursingFriendly"
              label="Nursing/Feeding Friendly"
              tooltip="Is there a comfortable, welcoming space for nursing or bottle feeding?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="privateFeedingArea"
              label="Private Feeding Area"
              tooltip="Is there a private, quiet space available for feeding if needed?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="bottleWarming"
              label="Bottle Warming Available"
              tooltip="Can bottles be warmed on-site (microwave, hot water, etc.)?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="highChairs"
              label="High Chairs Available"
              tooltip="Are high chairs or booster seats provided?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="strollerSpace"
              label="Stroller Parking/Storage"
              tooltip="Is there designated space to park or store strollers?"
              showNotRelevant
            />
            <AccessibilityField
              category="caregiver"
              field="storage"
              label="Bag/Coat Storage"
              tooltip="Is there a place to store bags, coats, or other belongings?"
              showNotRelevant
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Mobility & Physical Access */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted">
            <h3 className="text-lg font-semibold">Mobility & Physical Access</h3>
            <ChevronDown className="w-5 h-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <AccessibilityField
              category="mobility"
              field="strollerAccessible"
              label="Stroller Accessible"
              tooltip="Can the venue be navigated with a stroller?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="wheelchairEntrance"
              label="Wheelchair Accessible Entrance"
              tooltip="Is there a wheelchair-accessible entrance to the venue?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="stepFreeEntry"
              label="Step-Free Entry"
              tooltip="Can you enter the venue without climbing stairs?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="elevatorAccess"
              label="Elevator Access"
              tooltip="If the event is on an upper floor, is there elevator access?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="wideDoorways"
              label="Wide Doorways"
              tooltip="Are doorways wide enough for wheelchairs and mobility aids?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="accessibleSeating"
              label="Accessible Seating"
              tooltip="Is there seating that accommodates wheelchairs or mobility devices?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="accessibleWashrooms"
              label="Accessible Washrooms"
              tooltip="Are there wheelchair-accessible washrooms?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="accessibleParking"
              label="Accessible Parking"
              tooltip="Is there designated accessible parking nearby?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="terrainInfo"
              label="Terrain Type"
              tooltip="What is the terrain like around the venue?"
              customOptions={[
                { value: "flat", label: "Flat" },
                { value: "gravel", label: "Gravel" },
                { value: "hills", label: "Hills" },
                { value: "unknown", label: "Unknown" },
                { value: "not-relevant", label: "Not Relevant" },
              ]}
            />
            <AccessibilityField
              category="mobility"
              field="parkingDistance"
              label="Parking Distance"
              tooltip="How far is parking from the venue entrance?"
              customOptions={[
                { value: "short", label: "Short (< 50m)" },
                { value: "moderate", label: "Moderate (50-200m)" },
                { value: "long", label: "Long (> 200m)" },
                { value: "unknown", label: "Unknown" },
                { value: "not-relevant", label: "Not Relevant" },
              ]}
            />
            <AccessibilityField
              category="mobility"
              field="busStopDistance"
              label="Bus Stop Distance"
              tooltip="How far is the nearest bus stop from the venue?"
              customOptions={[
                { value: "short", label: "Short (< 100m)" },
                { value: "moderate", label: "Moderate (100-400m)" },
                { value: "long", label: "Long (> 400m)" },
                { value: "unknown", label: "Unknown" },
                { value: "not-relevant", label: "Not Relevant" },
              ]}
            />
            <AccessibilityField
              category="mobility"
              field="accessibleSidewalks"
              label="Accessible Sidewalks"
              tooltip="Are sidewalks leading to the venue accessible (curb cuts, smooth surface)?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="bikeRacks"
              label="Bike Racks Available"
              tooltip="Are there bike racks near the venue?"
              showNotRelevant
            />
            <AccessibilityField
              category="mobility"
              field="coveredBikeParking"
              label="Covered Bike Parking"
              tooltip="Is there covered or sheltered bike parking?"
              showNotRelevant
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Sensory Considerations */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted">
            <h3 className="text-lg font-semibold">Sensory Considerations</h3>
            <ChevronDown className="w-5 h-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <AccessibilityField
              category="sensory"
              field="sensoryFriendly"
              label="Sensory-Friendly Environment"
              tooltip="Is the event designed to be sensory-friendly (low stimulation)?"
              showNotRelevant
            />
            <AccessibilityField
              category="sensory"
              field="quietEnvironment"
              label="Quiet Environment"
              tooltip="Is the venue generally quiet?"
              showNotRelevant
            />
            <AccessibilityField
              category="sensory"
              field="loudNoises"
              label="Loud Noises Expected"
              tooltip="Will there be loud noises (music, announcements, etc.)?"
              showNotRelevant
            />
            <AccessibilityField
              category="sensory"
              field="flashingLights"
              label="Flashing Lights"
              tooltip="Will there be flashing or strobe lights?"
              showNotRelevant
            />
            <AccessibilityField
              category="sensory"
              field="crowdLevel"
              label="Expected Crowd Level"
              tooltip="How crowded will the event be?"
              customOptions={[
                { value: "spacious", label: "Spacious" },
                { value: "moderate", label: "Moderate" },
                { value: "crowded", label: "Crowded" },
                { value: "unknown", label: "Unknown" },
                { value: "not-relevant", label: "Not Relevant" },
              ]}
            />
            <AccessibilityField
              category="sensory"
              field="quietRoom"
              label="Quiet Room Available"
              tooltip="Is there a quiet room or calm-down space available?"
              showNotRelevant
            />
            <AccessibilityField
              category="sensory"
              field="sensoryTimeSlot"
              label="Sensory-Friendly Time Slot"
              tooltip="Is there a designated sensory-friendly time slot?"
              showNotRelevant
            />
            <AccessibilityField
              category="sensory"
              field="predictableSchedule"
              label="Predictable Schedule"
              tooltip="Does the event follow a predictable, structured schedule?"
              showNotRelevant
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Cognitive & Communication */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted">
            <h3 className="text-lg font-semibold">Cognitive & Communication</h3>
            <ChevronDown className="w-5 h-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <AccessibilityField
              category="cognitive"
              field="clearSignage"
              label="Clear Signage"
              tooltip="Is the venue well-marked with clear, easy-to-read signs?"
              showNotRelevant
            />
            <AccessibilityField
              category="cognitive"
              field="simpleInstructions"
              label="Simple Instructions"
              tooltip="Are instructions provided in simple, clear language?"
              showNotRelevant
            />
            <AccessibilityField
              category="cognitive"
              field="writtenMaterials"
              label="Written Materials Available"
              tooltip="Are written materials (schedules, instructions) available?"
              showNotRelevant
            />
            <AccessibilityField
              category="cognitive"
              field="aslInterpretation"
              label="ASL Interpretation"
              tooltip="Is ASL interpretation available?"
              showNotRelevant
            />
            <AccessibilityField
              category="cognitive"
              field="liveCaptions"
              label="Live Captions"
              tooltip="Are live captions provided for spoken content?"
              showNotRelevant
            />
            <AccessibilityField
              category="cognitive"
              field="multilingualSupport"
              label="Multilingual Support"
              tooltip="Is support available in multiple languages?"
              showNotRelevant
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Social & Cultural */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-muted/50 rounded-lg hover:bg-muted">
            <h3 className="text-lg font-semibold">Social & Cultural</h3>
            <ChevronDown className="w-5 h-5" />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <AccessibilityField
              category="social"
              field="genderNeutralWashrooms"
              label="Gender-Neutral Washrooms"
              tooltip="Are gender-neutral or all-gender washrooms available?"
              showNotRelevant
            />
            <AccessibilityField
              category="social"
              field="lgbtqiaFriendly"
              label="LGBTQIA+ Friendly"
              tooltip="Is the event welcoming and inclusive of LGBTQIA+ individuals and families?"
              showNotRelevant
            />
            <AccessibilityField
              category="social"
              field="maskFriendly"
              label="Mask-Friendly"
              tooltip="Is mask-wearing welcomed and normalized?"
              showNotRelevant
            />
            <AccessibilityField
              category="social"
              field="scentFree"
              label="Scent-Free"
              tooltip="Is the venue scent-free or low-scent?"
              showNotRelevant
            />
            <AccessibilityField
              category="social"
              field="alcoholFree"
              label="Alcohol-Free"
              tooltip="Is the event alcohol-free?"
              showNotRelevant
            />
            <AccessibilityField
              category="social"
              field="substanceFree"
              label="Substance-Free"
              tooltip="Is the event substance-free (no drugs, alcohol, smoking)?"
              showNotRelevant
            />
            <AccessibilityField
              category="social"
              field="traumaInformed"
              label="Trauma-Informed Approach"
              tooltip="Does the event use trauma-informed practices?"
              showNotRelevant
            />
          </CollapsibleContent>
        </Collapsible>
      </div>
    </Card>
  );
}
