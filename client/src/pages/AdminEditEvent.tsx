import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Shield } from "lucide-react";
import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";
import { AccessibilityFields } from "@/components/AccessibilityFields";

export default function AdminEditEvent() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();

  const { data: event, isLoading } = trpc.events.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const updateMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Event Updated", {
        description: "Changes saved successfully!",
      });
      navigate(`/event/${id}`);
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const [formData, setFormData] = useState<any>({
    accessibility: {
      caregiver: {},
      mobility: {},
      sensory: {},
      cognitive: {},
      social: {},
    },
  });
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : "",
        endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : "",
        province: event.province || "",
        municipality: event.municipality || "",
        neighborhoodCommunity: event.neighborhoodCommunity || "",
        venue: event.venue || "",
        address: event.address || "",
        isFree: event.isFree || false,
        costType: event.costType || "",
        costMin: event.costMin || "",
        costMax: event.costMax || "",
        kidsFree: event.kidsFree || false,
        freeCompanion: event.freeCompanion || false,
        allAges: event.allAges || false,
        familyFriendly: event.familyFriendly || false,
        youngChildren: event.youngChildren || false,
        kids: event.kids || false,
        teens: event.teens || false,
        adultsOnly: event.adultsOnly || false,
        seniors: event.seniors || false,
        isIndoor: event.isIndoor || false,
        isOutdoor: event.isOutdoor || false,
        accessibility: (() => {
          let parsed = {};
          if (typeof event.accessibility === 'string' && event.accessibility) {
            try {
              parsed = JSON.parse(event.accessibility);
            } catch (e) {
              console.error('Failed to parse accessibility', e);
            }
          } else if (event.accessibility) {
            parsed = event.accessibility;
          }
          // Ensure all categories exist
          return {
            caregiver: parsed.caregiver || {},
            mobility: parsed.mobility || {},
            sensory: parsed.sensory || {},
            cognitive: parsed.cognitive || {},
            social: parsed.social || {},
          };
        })(),
        organizerName: event.organizerName || "",
        organizerEmail: event.organizerEmail || "",
        organizerPhone: event.organizerPhone || "",
        organizerWebsite: event.organizerWebsite || "",
        displayOrganizerInfo: event.displayOrganizerInfo || false,
        notes: event.notes || "",
        imageUrl: event.imageUrl || "",
      });
      
      if (event.province) {
        setSelectedProvince(event.province);
        const provinceCode = CANADIAN_PROVINCES.find(p => p.name === event.province)?.code;
        if (provinceCode) {
          setCities(CANADIAN_CITIES[provinceCode] || []);
        }
      }
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;
    
    updateMutation.mutate({
      id: Number(id),
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Event not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(`/event/${id}`)}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Event
      </Button>

      <div className="flex items-center gap-2 mb-2">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Admin Edit Event</h1>
      </div>
      <p className="text-muted-foreground mb-6">
        Changes will be applied immediately without requiring approval.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date & Time *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Location</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Province/Territory *</Label>
              <Select
                value={formData.province}
                onValueChange={(value) => {
                  setFormData({ ...formData, province: value, municipality: "" });
                  setSelectedProvince(value);
                  const provinceCode = CANADIAN_PROVINCES.find(p => p.name === value)?.code;
                  if (provinceCode) {
                    setCities(CANADIAN_CITIES[provinceCode] || []);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province/territory" />
                </SelectTrigger>
                <SelectContent>
                  {CANADIAN_PROVINCES.map((prov) => (
                    <SelectItem key={prov.code} value={prov.name}>
                      {prov.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>City/Town *</Label>
              <Select
                value={formData.municipality}
                onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                disabled={!selectedProvince}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedProvince ? "Select municipality" : "Select province first"} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((municipality) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <Label htmlFor="neighborhoodCommunity">Neighborhood</Label>
              <Input
                id="neighborhoodCommunity"
                value={formData.neighborhoodCommunity}
                onChange={(e) => setFormData({ ...formData, neighborhoodCommunity: e.target.value })}
                placeholder="e.g., North End"
              />
            </div>

            <div>
              <Label htmlFor="venue">Venue Name</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Cost & Pricing</h2>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData({ ...formData, isFree: checked })}
              />
              <Label htmlFor="isFree" className="font-normal cursor-pointer">
                This event is free
              </Label>
            </div>

            {!formData.isFree && (
              <>
                <div>
                  <Label>Cost Type</Label>
                  <Select
                    value={formData.costType}
                    onValueChange={(value) => setFormData({ ...formData, costType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cost type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="range">Price Range</SelectItem>
                      <SelectItem value="donation">Donation</SelectItem>
                      <SelectItem value="pay-what-you-can">Pay What You Can</SelectItem>
                      <SelectItem value="sliding-scale">Sliding Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costMin">Minimum Cost ($)</Label>
                    <Input
                      id="costMin"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costMin}
                      onChange={(e) => setFormData({ ...formData, costMin: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="costMax">Maximum Cost ($)</Label>
                    <Input
                      id="costMax"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.costMax}
                      onChange={(e) => setFormData({ ...formData, costMax: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="kidsFree"
                checked={formData.kidsFree}
                onCheckedChange={(checked) => setFormData({ ...formData, kidsFree: checked })}
              />
              <Label htmlFor="kidsFree" className="font-normal cursor-pointer">
                Kids attend free
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="freeCompanion"
                checked={formData.freeCompanion}
                onCheckedChange={(checked) => setFormData({ ...formData, freeCompanion: checked })}
              />
              <Label htmlFor="freeCompanion" className="font-normal cursor-pointer">
                Free companion/support person
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Age Groups</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="allAges"
                checked={formData.allAges}
                onCheckedChange={(checked) => setFormData({ ...formData, allAges: checked })}
              />
              <Label htmlFor="allAges" className="font-normal cursor-pointer">
                All Ages
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="familyFriendly"
                checked={formData.familyFriendly}
                onCheckedChange={(checked) => setFormData({ ...formData, familyFriendly: checked })}
              />
              <Label htmlFor="familyFriendly" className="font-normal cursor-pointer">
                Family-Friendly
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="youngChildren"
                checked={formData.youngChildren}
                onCheckedChange={(checked) => setFormData({ ...formData, youngChildren: checked })}
              />
              <Label htmlFor="youngChildren" className="font-normal cursor-pointer">
                Young Children (0-5)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="kids"
                checked={formData.kids}
                onCheckedChange={(checked) => setFormData({ ...formData, kids: checked })}
              />
              <Label htmlFor="kids" className="font-normal cursor-pointer">
                Kids (6-12)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="teens"
                checked={formData.teens}
                onCheckedChange={(checked) => setFormData({ ...formData, teens: checked })}
              />
              <Label htmlFor="teens" className="font-normal cursor-pointer">
                Teens (13-17)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="adultsOnly"
                checked={formData.adultsOnly}
                onCheckedChange={(checked) => setFormData({ ...formData, adultsOnly: checked })}
              />
              <Label htmlFor="adultsOnly" className="font-normal cursor-pointer">
                Adults Only (18+)
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="seniors"
                checked={formData.seniors}
                onCheckedChange={(checked) => setFormData({ ...formData, seniors: checked })}
              />
              <Label htmlFor="seniors" className="font-normal cursor-pointer">
                Seniors (65+)
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isIndoor"
                checked={formData.isIndoor}
                onCheckedChange={(checked) => setFormData({ ...formData, isIndoor: checked })}
              />
              <Label htmlFor="isIndoor" className="font-normal cursor-pointer">
                Indoor
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOutdoor"
                checked={formData.isOutdoor}
                onCheckedChange={(checked) => setFormData({ ...formData, isOutdoor: checked })}
              />
              <Label htmlFor="isOutdoor" className="font-normal cursor-pointer">
                Outdoor
              </Label>
            </div>
          </div>
        </Card>

        <AccessibilityFields
          accessibility={formData.accessibility}
          updateAccessibility={(category, field, value) => {
            setFormData(prev => ({
              ...prev,
              accessibility: {
                ...prev.accessibility,
                [category]: {
                  ...prev.accessibility[category],
                  [field]: value,
                },
              },
            }));
          }}
        />

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Organizer Information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="organizerName">Organizer Name</Label>
              <Input
                id="organizerName"
                value={formData.organizerName}
                onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="organizerEmail">Organizer Email</Label>
              <Input
                id="organizerEmail"
                type="email"
                value={formData.organizerEmail}
                onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="organizerPhone">Organizer Phone</Label>
              <Input
                id="organizerPhone"
                value={formData.organizerPhone}
                onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="organizerWebsite">Organizer Website</Label>
              <Input
                id="organizerWebsite"
                value={formData.organizerWebsite}
                onChange={(e) => setFormData({ ...formData, organizerWebsite: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="displayOrganizerInfo"
                checked={formData.displayOrganizerInfo}
                onCheckedChange={(checked) => setFormData({ ...formData, displayOrganizerInfo: checked })}
              />
              <Label htmlFor="displayOrganizerInfo" className="font-normal cursor-pointer">
                Display organizer contact information publicly
              </Label>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
          
          <div>
            <Label htmlFor="notes">Internal Notes (not shown to public)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              placeholder="Any additional information for admin reference..."
            />
          </div>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/event/${id}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
