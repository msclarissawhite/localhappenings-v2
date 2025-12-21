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
import { Loader2, ArrowLeft } from "lucide-react";
import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";
import { AccessibilityFields } from "@/components/AccessibilityFields";
import { EventTypeSelector } from "@/components/EventTypeSelector";

export default function EditEvent() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();


  const { data: event, isLoading } = trpc.events.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );
  
  const { data: eventTypes = [] } = trpc.events.getEventTypes.useQuery();

  const updateMutation = trpc.organizer.updateEvent.useMutation({
    onSuccess: (result) => {
      if (result.requiresApproval) {
        toast.success("Edit Submitted", {
          description: "Your changes are pending admin approval. The original event remains published.",
        });
      } else {
        toast.success("Event Updated", {
          description: "Your changes are now live!",
        });
      }
      navigate("/organizer/dashboard");
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message,
      });
    },
  });

  const [formData, setFormData] = useState<any>({});
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
        accessibility: event.accessibility || {},
        organizerName: event.organizerName || "",
        organizerEmail: event.organizerEmail || "",
        organizerPhone: event.organizerPhone || "",
        notes: event.notes || "",
        eventTypeIds: (event as any).eventTypes?.map((t: any) => t.id) || [],
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

    const storedOrganizer = localStorage.getItem("organizer");
    if (!storedOrganizer) {
      toast.error("Not logged in", {
        description: "Please log in to edit events.",
      });
      navigate("/organizer/login");
      return;
    }
    
    const organizer = JSON.parse(storedOrganizer);
    
    updateMutation.mutate({
      eventId: Number(id),
      organizerId: organizer.id,
      data: {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
      },
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
        onClick={() => navigate("/organizer/dashboard")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
      <p className="text-muted-foreground mb-6">
        Changes will be submitted for re-approval before being published.
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
                rows={4}
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
                <Label htmlFor="endDate">End Date & Time (Optional)</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Types</h2>
          <EventTypeSelector
            eventTypes={eventTypes}
            selectedIds={formData.eventTypeIds || []}
            onChange={(ids) => setFormData({ ...formData, eventTypeIds: ids })}
          />
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

        <div className="flex gap-4">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
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
    </div>
  );
}
