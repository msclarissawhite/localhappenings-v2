import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface BatchEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEventIds: number[];
  onSuccess: () => void;
}

export function BatchEditModal({
  open,
  onOpenChange,
  selectedEventIds,
  onSuccess,
}: BatchEditModalProps) {
  const [fieldsToUpdate, setFieldsToUpdate] = useState<{
    nameFind?: boolean;
    venue?: boolean;
    province?: boolean;
    municipality?: boolean;
    neighborhoodCommunity?: boolean;
    organizerName?: boolean;
    organizerEmail?: boolean;
    organizerPhone?: boolean;
    organizerWebsite?: boolean;
    status?: boolean;
    startTime?: boolean;
    endTime?: boolean;
  }>({});

  const { register, handleSubmit, watch, setValue } = useForm();

  const batchUpdateMutation = trpc.events.batchUpdate.useMutation({
    onSuccess: () => {
      toast.success(`Successfully updated ${selectedEventIds.length} events`);
      onSuccess();
      onOpenChange(false);
      setFieldsToUpdate({});
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update events");
    },
  });

  const onSubmit = (data: any) => {
    // Build updates object with only selected fields
    const updates: any = {};
    
    if (fieldsToUpdate.nameFind) {
      updates.nameFind = data.nameFind;
      updates.nameReplace = data.nameReplace;
    }
    if (fieldsToUpdate.venue) updates.venue = data.venue;
    if (fieldsToUpdate.province) updates.province = data.province;
    if (fieldsToUpdate.municipality) updates.municipality = data.municipality;
    if (fieldsToUpdate.neighborhoodCommunity) updates.neighborhoodCommunity = data.neighborhoodCommunity;
    if (fieldsToUpdate.organizerName) updates.organizerName = data.organizerName;
    if (fieldsToUpdate.organizerEmail) updates.organizerEmail = data.organizerEmail;
    if (fieldsToUpdate.organizerPhone) updates.organizerPhone = data.organizerPhone;
    if (fieldsToUpdate.organizerWebsite) updates.organizerWebsite = data.organizerWebsite;
    if (fieldsToUpdate.status) updates.status = data.status;
    if (fieldsToUpdate.startTime) updates.startTime = data.startTime;
    if (fieldsToUpdate.endTime) updates.endTime = data.endTime;

    if (Object.keys(updates).length === 0) {
      toast.error("Please select at least one field to update");
      return;
    }

    batchUpdateMutation.mutate({
      eventIds: selectedEventIds,
      updates,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Edit Events</DialogTitle>
          <DialogDescription>
            Update {selectedEventIds.length} selected event{selectedEventIds.length !== 1 ? "s" : ""}.
            Check the fields you want to update and enter new values.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name Find & Replace */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Event Name</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="nameFind"
                checked={fieldsToUpdate.nameFind || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, nameFind: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1 space-y-2">
                <Label htmlFor="nameFindInput">Find & Replace in Name</Label>
                <Input
                  id="nameFindInput"
                  {...register("nameFind")}
                  disabled={!fieldsToUpdate.nameFind}
                  placeholder="Text to find (e.g., 'with 707 Halifax')"
                />
                <Input
                  {...register("nameReplace")}
                  disabled={!fieldsToUpdate.nameFind}
                  placeholder="Replace with (e.g., 'with Tandy Leather (Dartmouth)')"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Location</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="province"
                checked={fieldsToUpdate.province || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, province: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="provinceInput">Province</Label>
                <Input
                  id="provinceInput"
                  {...register("province")}
                  disabled={!fieldsToUpdate.province}
                  placeholder="Enter province"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="municipality"
                checked={fieldsToUpdate.municipality || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, municipality: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="municipalityInput">Municipality</Label>
                <Input
                  id="municipalityInput"
                  {...register("municipality")}
                  disabled={!fieldsToUpdate.municipality}
                  placeholder="Enter municipality"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="neighborhoodCommunity"
                checked={fieldsToUpdate.neighborhoodCommunity || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, neighborhoodCommunity: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="neighborhoodCommunityInput">Neighborhood/Community</Label>
                <Input
                  id="neighborhoodCommunityInput"
                  {...register("neighborhoodCommunity")}
                  disabled={!fieldsToUpdate.neighborhoodCommunity}
                  placeholder="Enter neighborhood/community"
                />
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Date & Time</h3>
            <p className="text-sm text-muted-foreground">
              Update event times across all selected events. The date will remain the same, only the time portion will be updated.
            </p>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="startTime"
                checked={fieldsToUpdate.startTime || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, startTime: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="startTimeInput">Start Time</Label>
                <Input
                  id="startTimeInput"
                  type="time"
                  {...register("startTime")}
                  disabled={!fieldsToUpdate.startTime}
                  placeholder="HH:MM"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: 19:30 for 7:30 PM
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="endTime"
                checked={fieldsToUpdate.endTime || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, endTime: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="endTimeInput">End Time</Label>
                <Input
                  id="endTimeInput"
                  type="time"
                  {...register("endTime")}
                  disabled={!fieldsToUpdate.endTime}
                  placeholder="HH:MM"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Example: 22:30 for 10:30 PM
                </p>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="venue"
              checked={fieldsToUpdate.venue || false}
              onCheckedChange={(checked) =>
                setFieldsToUpdate({ ...fieldsToUpdate, venue: checked as boolean })
              }
              className="mt-2"
            />
            <div className="flex-1">
              <Label htmlFor="venueInput">Venue</Label>
              <Input
                id="venueInput"
                {...register("venue")}
                disabled={!fieldsToUpdate.venue}
                placeholder="Enter venue name"
              />
            </div>
          </div>

          {/* Organizer Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Organizer Information</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="organizerName"
                checked={fieldsToUpdate.organizerName || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, organizerName: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="organizerNameInput">Organizer Name</Label>
                <Input
                  id="organizerNameInput"
                  {...register("organizerName")}
                  disabled={!fieldsToUpdate.organizerName}
                  placeholder="Enter organizer name"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="organizerEmail"
                checked={fieldsToUpdate.organizerEmail || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, organizerEmail: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="organizerEmailInput">Organizer Email</Label>
                <Input
                  id="organizerEmailInput"
                  type="email"
                  {...register("organizerEmail")}
                  disabled={!fieldsToUpdate.organizerEmail}
                  placeholder="Enter organizer email"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="organizerPhone"
                checked={fieldsToUpdate.organizerPhone || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, organizerPhone: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="organizerPhoneInput">Organizer Phone</Label>
                <Input
                  id="organizerPhoneInput"
                  type="tel"
                  {...register("organizerPhone")}
                  disabled={!fieldsToUpdate.organizerPhone}
                  placeholder="Enter organizer phone"
                />
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="organizerWebsite"
                checked={fieldsToUpdate.organizerWebsite || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, organizerWebsite: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="organizerWebsiteInput">Organizer Website</Label>
                <Input
                  id="organizerWebsiteInput"
                  type="url"
                  {...register("organizerWebsite")}
                  disabled={!fieldsToUpdate.organizerWebsite}
                  placeholder="Enter organizer website"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Event Status</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="status"
                checked={fieldsToUpdate.status || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, status: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="statusInput">Status</Label>
                <Select
                  disabled={!fieldsToUpdate.status}
                  onValueChange={(value) => setValue("status", value)}
                >
                  <SelectTrigger id="statusInput">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="needs-clarification">Needs Clarification</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={batchUpdateMutation.isPending}>
              {batchUpdateMutation.isPending
                ? "Updating..."
                : `Update ${selectedEventIds.length} Event${selectedEventIds.length !== 1 ? "s" : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
