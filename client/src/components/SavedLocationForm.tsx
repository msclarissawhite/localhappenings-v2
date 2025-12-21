import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import type { AccessibilityData } from "@shared/types";
import { ImportAccessibilitySelector } from "@/components/ImportAccessibilitySelector";

interface SavedLocationFormProps {
  locationId?: number;
  organizerId: number;
}

export function SavedLocationForm({ locationId, organizerId }: SavedLocationFormProps) {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [province, setProvince] = useState("Nova Scotia");
  const [municipality, setMunicipality] = useState("");
  const [neighborhoodCommunity, setNeighborhoodCommunity] = useState("");
  const [venue, setVenue] = useState("");
  const [address, setAddress] = useState("");
  const [isIndoor, setIsIndoor] = useState(false);
  const [isOutdoor, setIsOutdoor] = useState(false);
  const [accessibility, setAccessibility] = useState<AccessibilityData>({
    caregiver: {},
    mobility: {},
    sensory: {},
    cognitive: {},
    social: {},
  });
  const [showEventSelector, setShowEventSelector] = useState(false);

  // Load existing location if editing
  const { data: existingLocation } = trpc.savedLocations.getById.useQuery(
    { id: locationId!, organizerId },
    { enabled: !!locationId }
  );

  useEffect(() => {
    if (existingLocation) {
      setName(existingLocation.name);
      setProvince(existingLocation.province);
      setMunicipality(existingLocation.municipality);
      setNeighborhoodCommunity(existingLocation.neighborhoodCommunity || "");
      setVenue(existingLocation.venue || "");
      setAddress(existingLocation.address || "");
      setIsIndoor(existingLocation.isIndoor === 1);
      setIsOutdoor(existingLocation.isOutdoor === 1);
      
      try {
        const parsedAccessibility = typeof existingLocation.accessibility === "string"
          ? JSON.parse(existingLocation.accessibility)
          : existingLocation.accessibility;
        setAccessibility(parsedAccessibility);
      } catch (e) {
        console.error("Failed to parse accessibility data", e);
      }
    }
  }, [existingLocation]);

  const createMutation = trpc.savedLocations.create.useMutation({
    onSuccess: () => {
      toast.success("Location saved successfully");
      navigate("/organizer/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save location");
    },
  });

  const updateMutation = trpc.savedLocations.update.useMutation({
    onSuccess: () => {
      toast.success("Location updated successfully");
      navigate("/organizer/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update location");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !province || !municipality) {
      toast.error("Please fill in all required fields");
      return;
    }

    const locationData = {
      organizerId,
      name,
      province,
      municipality,
      neighborhoodCommunity: neighborhoodCommunity || undefined,
      venue: venue || undefined,
      address: address || undefined,
      accessibility,
      isIndoor,
      isOutdoor,
    };

    if (locationId) {
      updateMutation.mutate({ id: locationId, ...locationData });
    } else {
      createMutation.mutate(locationData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-muted/30 py-8">
      <div className="container max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/organizer/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="p-8">
          <h1 className="text-3xl font-bold mb-6">
            {locationId ? "Edit" : "Add"} Saved Location
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Name */}
            <div>
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Library, Community Center"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                Give this location a memorable name for easy selection
              </p>
            </div>

            {/* Province */}
            <div>
              <Label htmlFor="province">Province *</Label>
              <Input
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />
            </div>

            {/* Municipality */}
            <div>
              <Label htmlFor="municipality">Municipality *</Label>
              <Input
                id="municipality"
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder="e.g., Halifax, Dartmouth"
                required
              />
            </div>

            {/* Neighborhood/Community */}
            <div>
              <Label htmlFor="neighborhood">Neighborhood/Community</Label>
              <Input
                id="neighborhood"
                value={neighborhoodCommunity}
                onChange={(e) => setNeighborhoodCommunity(e.target.value)}
                placeholder="e.g., North End, Clayton Park"
              />
            </div>

            {/* Venue */}
            <div>
              <Label htmlFor="venue">Venue Name</Label>
              <Input
                id="venue"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g., Halifax Central Library"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 5440 Spring Garden Road"
              />
            </div>

            {/* Indoor/Outdoor */}
            <div className="space-y-3">
              <Label>Location Type</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="indoor"
                    checked={isIndoor}
                    onCheckedChange={(checked) => setIsIndoor(!!checked)}
                  />
                  <Label htmlFor="indoor" className="font-normal cursor-pointer">
                    Indoor
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="outdoor"
                    checked={isOutdoor}
                    onCheckedChange={(checked) => setIsOutdoor(!!checked)}
                  />
                  <Label htmlFor="outdoor" className="font-normal cursor-pointer">
                    Outdoor
                  </Label>
                </div>
              </div>
            </div>

            {/* Accessibility Import */}
            <div className="space-y-4">
              <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg">
                <h3 className="font-semibold mb-2">Accessibility Information (Optional)</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Save accessibility details for this location so you can reuse them across multiple events. 
                  Import from an existing event or fill in manually when creating events.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEventSelector(!showEventSelector)}
                  className="w-full sm:w-auto"
                >
                  {showEventSelector ? "Cancel Import" : "Import from Existing Event"}
                </Button>
              </div>

              {showEventSelector && (
                <ImportAccessibilitySelector
                  organizerId={organizerId}
                  onImport={(importedAccessibility) => {
                    setAccessibility(importedAccessibility);
                    setShowEventSelector(false);
                    toast.success("Accessibility details imported successfully");
                  }}
                />
              )}

              {Object.keys(accessibility.caregiver || {}).length > 0 || 
               Object.keys(accessibility.mobility || {}).length > 0 || 
               Object.keys(accessibility.sensory || {}).length > 0 ? (
                <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Accessibility details saved for this location
                  </p>
                </div>
              ) : null}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : locationId ? "Update Location" : "Save Location"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/organizer/dashboard")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
