import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Event } from "@shared/types";
import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";

interface EventEditDialogProps {
  event: Event | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EventEditDialog({ event, open, onOpenChange, onSuccess }: EventEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    province: "",
    municipality: "",
    neighborhoodCommunity: "",
    venue: "",
    address: "",
    startDate: "",
    isFree: false,
    costMin: "",
    costMax: "",
    familyFriendly: false,
    youngChildren: false,
    kids: false,
    teens: false,
    adultsOnly: false,
    seniors: false,
    allAges: false,
    isIndoor: false,
    isOutdoor: false,
    organizerName: "",
    organizerEmail: "",
    organizerPhone: "",
    organizerWebsite: "",
  });

  const updateEventMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update event");
    },
  });

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || "",
        description: event.description || "",
        province: event.province || "",
        municipality: event.municipality || "",
        neighborhoodCommunity: event.neighborhoodCommunity || "",
        venue: event.venue || "",
        address: event.address || "",
        startDate: event.startDate ? new Date(event.startDate).toISOString().split("T")[0] : "",
        isFree: !!event.isFree,
        costMin: event.costMin?.toString() || "",
        costMax: event.costMax?.toString() || "",
        familyFriendly: !!event.familyFriendly,
        youngChildren: !!event.youngChildren,
        kids: !!event.kids,
        teens: !!event.teens,
        adultsOnly: !!event.adultsOnly,
        seniors: !!event.seniors,
        allAges: !!event.allAges,
        isIndoor: !!event.isIndoor,
        isOutdoor: !!event.isOutdoor,
        organizerName: event.organizerName || "",
        organizerEmail: event.organizerEmail || "",
        organizerPhone: event.organizerPhone || "",
        organizerWebsite: event.organizerWebsite || "",
      });
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    updateEventMutation.mutate({
      id: event.id,
      data: {
        name: formData.name,
        description: formData.description,
        province: formData.province,
        municipality: formData.municipality,
        neighborhoodCommunity: formData.neighborhoodCommunity || undefined,
        venue: formData.venue || undefined,
        address: formData.address || undefined,
        startDate: new Date(formData.startDate),
        isFree: formData.isFree,
        costMin: formData.costMin ? parseFloat(formData.costMin) : undefined,
        costMax: formData.costMax ? parseFloat(formData.costMax) : undefined,
        familyFriendly: formData.familyFriendly,
        youngChildren: formData.youngChildren,
        kids: formData.kids,
        teens: formData.teens,
        adultsOnly: formData.adultsOnly,
        seniors: formData.seniors,
        allAges: formData.allAges,
        isIndoor: formData.isIndoor,
        isOutdoor: formData.isOutdoor,
        organizerName: formData.organizerName || undefined,
        organizerEmail: formData.organizerEmail || undefined,
        organizerPhone: formData.organizerPhone || undefined,
        organizerWebsite: formData.organizerWebsite || undefined,
      },
    });
  };

  const availableCities = formData.province ? CANADIAN_CITIES[formData.province] || [] : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Event</DialogTitle>
          <DialogDescription>
            Make changes to the event details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>
            
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

            <div>
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold">Location</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Province *</Label>
                <Select
                  value={formData.province}
                  onValueChange={(value) => setFormData({ ...formData, province: value, municipality: "" })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select province" />
                  </SelectTrigger>
                  <SelectContent>
                  {CANADIAN_PROVINCES.map((prov) => (
                    <SelectItem key={prov.name} value={prov.name}>
                      {prov.name}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="municipality">City *</Label>
                <Select
                  value={formData.municipality}
                  onValueChange={(value) => setFormData({ ...formData, municipality: value })}
                  disabled={!formData.province}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select municipality" />
                  </SelectTrigger>
                  <SelectContent>
                  {availableCities.map((municipality: string) => (
                    <SelectItem key={municipality} value={municipality}>
                      {municipality}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue</Label>
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

          {/* Cost */}
          <div className="space-y-4">
            <h3 className="font-semibold">Cost</h3>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isFree"
                checked={formData.isFree}
                onCheckedChange={(checked) => setFormData({ ...formData, isFree: !!checked })}
              />
              <Label htmlFor="isFree">Free Event</Label>
            </div>

            {!formData.isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="costMin">Min Cost ($)</Label>
                  <Input
                    id="costMin"
                    type="number"
                    step="0.01"
                    value={formData.costMin}
                    onChange={(e) => setFormData({ ...formData, costMin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="costMax">Max Cost ($)</Label>
                  <Input
                    id="costMax"
                    type="number"
                    step="0.01"
                    value={formData.costMax}
                    onChange={(e) => setFormData({ ...formData, costMax: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Age Groups */}
          <div className="space-y-4">
            <h3 className="font-semibold">Age Groups</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allAges"
                  checked={formData.allAges}
                  onCheckedChange={(checked) => setFormData({ ...formData, allAges: !!checked })}
                />
                <Label htmlFor="allAges">All Ages</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="familyFriendly"
                  checked={formData.familyFriendly}
                  onCheckedChange={(checked) => setFormData({ ...formData, familyFriendly: !!checked })}
                />
                <Label htmlFor="familyFriendly">Family-Friendly</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="youngChildren"
                  checked={formData.youngChildren}
                  onCheckedChange={(checked) => setFormData({ ...formData, youngChildren: !!checked })}
                />
                <Label htmlFor="youngChildren">Young Children (0-5)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="kids"
                  checked={formData.kids}
                  onCheckedChange={(checked) => setFormData({ ...formData, kids: !!checked })}
                />
                <Label htmlFor="kids">Kids (6-12)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="teens"
                  checked={formData.teens}
                  onCheckedChange={(checked) => setFormData({ ...formData, teens: !!checked })}
                />
                <Label htmlFor="teens">Teens</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adultsOnly"
                  checked={formData.adultsOnly}
                  onCheckedChange={(checked) => setFormData({ ...formData, adultsOnly: !!checked })}
                />
                <Label htmlFor="adultsOnly">Adults Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="seniors"
                  checked={formData.seniors}
                  onCheckedChange={(checked) => setFormData({ ...formData, seniors: !!checked })}
                />
                <Label htmlFor="seniors">Seniors</Label>
              </div>
            </div>
          </div>

          {/* Venue Type */}
          <div className="space-y-4">
            <h3 className="font-semibold">Venue Type</h3>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isIndoor"
                  checked={formData.isIndoor}
                  onCheckedChange={(checked) => setFormData({ ...formData, isIndoor: !!checked })}
                />
                <Label htmlFor="isIndoor">Indoor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isOutdoor"
                  checked={formData.isOutdoor}
                  onCheckedChange={(checked) => setFormData({ ...formData, isOutdoor: !!checked })}
                />
                <Label htmlFor="isOutdoor">Outdoor</Label>
              </div>
            </div>
          </div>

          {/* Organizer */}
          <div className="space-y-4">
            <h3 className="font-semibold">Organizer Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="organizerName">Name</Label>
                <Input
                  id="organizerName"
                  value={formData.organizerName}
                  onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organizerEmail">Email</Label>
                <Input
                  id="organizerEmail"
                  type="email"
                  value={formData.organizerEmail}
                  onChange={(e) => setFormData({ ...formData, organizerEmail: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organizerPhone">Phone</Label>
                <Input
                  id="organizerPhone"
                  value={formData.organizerPhone}
                  onChange={(e) => setFormData({ ...formData, organizerPhone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="organizerWebsite">Website</Label>
                <Input
                  id="organizerWebsite"
                  type="url"
                  value={formData.organizerWebsite}
                  onChange={(e) => setFormData({ ...formData, organizerWebsite: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateEventMutation.isPending}>
              {updateEventMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
