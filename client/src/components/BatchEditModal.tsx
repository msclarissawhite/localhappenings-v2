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
    venue?: boolean;
    organizerName?: boolean;
    organizerEmail?: boolean;
    organizerPhone?: boolean;
    wheelchairAccessible?: boolean;
    accessibleParking?: boolean;
    accessibleWashrooms?: boolean;
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
    
    if (fieldsToUpdate.venue) updates.venue = data.venue;
    if (fieldsToUpdate.organizerName) updates.organizerName = data.organizerName;
    if (fieldsToUpdate.organizerEmail) updates.organizerEmail = data.organizerEmail;
    if (fieldsToUpdate.organizerPhone) updates.organizerPhone = data.organizerPhone;
    if (fieldsToUpdate.wheelchairAccessible) updates.wheelchairAccessible = data.wheelchairAccessible;
    if (fieldsToUpdate.accessibleParking) updates.accessibleParking = data.accessibleParking;
    if (fieldsToUpdate.accessibleWashrooms) updates.accessibleWashrooms = data.accessibleWashrooms;

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
          </div>

          {/* Accessibility Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Accessibility Features</h3>
            
            <div className="flex items-start gap-3">
              <Checkbox
                id="wheelchairAccessible"
                checked={fieldsToUpdate.wheelchairAccessible || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, wheelchairAccessible: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="wheelchairAccessibleInput">Wheelchair Accessible</Label>
                <Select
                  disabled={!fieldsToUpdate.wheelchairAccessible}
                  onValueChange={(value) => setValue("wheelchairAccessible", value)}
                >
                  <SelectTrigger id="wheelchairAccessibleInput">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accessibleParking"
                checked={fieldsToUpdate.accessibleParking || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, accessibleParking: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="accessibleParkingInput">Accessible Parking</Label>
                <Select
                  disabled={!fieldsToUpdate.accessibleParking}
                  onValueChange={(value) => setValue("accessibleParking", value)}
                >
                  <SelectTrigger id="accessibleParkingInput">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accessibleWashrooms"
                checked={fieldsToUpdate.accessibleWashrooms || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, accessibleWashrooms: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label htmlFor="accessibleWashroomsInput">Accessible Washrooms</Label>
                <Select
                  disabled={!fieldsToUpdate.accessibleWashrooms}
                  onValueChange={(value) => setValue("accessibleWashrooms", value)}
                >
                  <SelectTrigger id="accessibleWashroomsInput">
                    <SelectValue placeholder="Select value" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
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
