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
    eventTypes?: boolean;
    accessibility?: boolean;
    cost?: boolean;
    ageGroups?: boolean;
    image?: boolean;
  }>({});

  const [selectedEventTypes, setSelectedEventTypes] = useState<number[]>([]);
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([]);
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    if (fieldsToUpdate.eventTypes) updates.eventTypeIds = selectedEventTypes;
    if (fieldsToUpdate.accessibility) updates.accessibility = selectedAccessibility;
    if (fieldsToUpdate.cost) {
      updates.isFree = data.isFree === 'true';
      updates.costType = data.costType;
      updates.costMin = data.costMin ? parseFloat(data.costMin) : undefined;
      updates.costMax = data.costMax ? parseFloat(data.costMax) : undefined;
      updates.fixedPrice = data.fixedPrice ? parseFloat(data.fixedPrice) : undefined;
      updates.kidsFree = data.kidsFree === 'true';
    }
    if (fieldsToUpdate.ageGroups) updates.ageGroups = selectedAgeGroups;
    if (fieldsToUpdate.image && imagePreview) {
      // Send base64 image data
      updates.imageData = imagePreview;
    }

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

          {/* Event Types */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Event Types</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="eventTypes"
                checked={fieldsToUpdate.eventTypes || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, eventTypes: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label>Select Event Types (replaces existing)</Label>
                <div className="mt-2 p-3 border rounded-md max-h-48 overflow-y-auto space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Select the event types to apply to all selected events. This will replace their current event types.
                  </p>
                  {[
                    { category: 'Arts & Culture', types: [
                      { id: 1, name: 'Visual Arts' }, { id: 2, name: 'Performing Arts' }, { id: 3, name: 'Music' },
                      { id: 4, name: 'Theatre' }, { id: 5, name: 'Dance' }, { id: 6, name: 'Film & Cinema' },
                      { id: 7, name: 'Literary Arts' }, { id: 8, name: 'Craft & DIY' }, { id: 9, name: 'Cultural Festivals' },
                      { id: 10, name: 'Museums & Galleries' }
                    ]},
                    { category: 'Sports & Recreation', types: [
                      { id: 11, name: 'Team Sports' }, { id: 12, name: 'Individual Sports' }, { id: 13, name: 'Outdoor Activities' },
                      { id: 14, name: 'Fitness & Wellness' }, { id: 15, name: 'Water Sports' }, { id: 16, name: 'Winter Sports' },
                      { id: 17, name: 'Extreme Sports' }, { id: 18, name: 'Recreational Leagues' }, { id: 19, name: 'Youth Sports' },
                      { id: 20, name: 'Adaptive Sports' }
                    ]},
                    { category: 'Education & Learning', types: [
                      { id: 21, name: 'Workshops' }, { id: 22, name: 'Lectures & Talks' }, { id: 23, name: 'Classes & Courses' },
                      { id: 24, name: 'Conferences' }, { id: 25, name: 'Seminars' }, { id: 26, name: 'Training Programs' },
                      { id: 27, name: 'Academic Events' }, { id: 28, name: 'Career Development' }, { id: 29, name: 'Language Learning' },
                      { id: 30, name: 'STEM Education' }
                    ]},
                    { category: 'Community & Social', types: [
                      { id: 31, name: 'Community Gatherings' }, { id: 32, name: 'Festivals' }, { id: 33, name: 'Parades' },
                      { id: 34, name: 'Markets & Fairs' }, { id: 35, name: 'Fundraisers' }, { id: 36, name: 'Volunteer Events' },
                      { id: 37, name: 'Social Clubs' }, { id: 38, name: 'Support Groups' }, { id: 39, name: 'Religious Events' },
                      { id: 40, name: 'Holiday Celebrations' }
                    ]},
                    { category: 'Health & Wellness', types: [
                      { id: 41, name: 'Yoga & Meditation' }, { id: 42, name: 'Mental Health' }, { id: 43, name: 'Nutrition' },
                      { id: 44, name: 'Alternative Medicine' }, { id: 45, name: 'Support & Recovery' }, { id: 46, name: 'Health Screenings' },
                      { id: 47, name: 'Wellness Workshops' }, { id: 48, name: 'Fitness Classes' }, { id: 49, name: 'Outdoor Wellness' },
                      { id: 50, name: 'Senior Wellness' }
                    ]},
                    { category: 'Business & Professional', types: [
                      { id: 51, name: 'Networking' }, { id: 52, name: 'Business Conferences' }, { id: 53, name: 'Trade Shows' },
                      { id: 54, name: 'Professional Development' }, { id: 55, name: 'Entrepreneurship' }, { id: 56, name: 'Industry Events' },
                      { id: 57, name: 'Job Fairs' }, { id: 58, name: 'Business Meetups' }
                    ]},
                    { category: 'Other', types: [
                      { id: 59, name: 'Food & Drink' }, { id: 60, name: 'Other' }
                    ]}
                  ].map(categoryGroup => (
                    <div key={categoryGroup.category} className="space-y-1">
                      <p className="text-xs font-semibold text-muted-foreground">{categoryGroup.category}</p>
                      {categoryGroup.types.map(type => (
                        <div key={type.id} className="flex items-center gap-2 ml-2">
                          <Checkbox
                            id={`eventType-${type.id}`}
                            checked={selectedEventTypes.includes(type.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEventTypes([...selectedEventTypes, type.id]);
                              } else {
                                setSelectedEventTypes(selectedEventTypes.filter(id => id !== type.id));
                              }
                            }}
                            disabled={!fieldsToUpdate.eventTypes}
                          />
                          <label htmlFor={`eventType-${type.id}`} className="text-sm cursor-pointer">
                            {type.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Accessibility Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Accessibility Features</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="accessibility"
                checked={fieldsToUpdate.accessibility || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, accessibility: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label>Select Accessibility Features (replaces existing)</Label>
                <div className="mt-2 p-3 border rounded-md space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Select the accessibility features to apply to all selected events. This will replace their current accessibility settings.
                  </p>
                  {[
                    { id: 'wheelchairAccessible', label: 'Wheelchair Accessible' },
                    { id: 'signLanguage', label: 'Sign Language Interpretation' },
                    { id: 'closedCaptioning', label: 'Closed Captioning' },
                    { id: 'audioDescription', label: 'Audio Description' },
                    { id: 'accessibleParking', label: 'Accessible Parking' },
                    { id: 'accessibleRestrooms', label: 'Accessible Restrooms' },
                    { id: 'serviceAnimalsWelcome', label: 'Service Animals Welcome' },
                    { id: 'sensoryFriendly', label: 'Sensory-Friendly' },
                    { id: 'mobilityAids', label: 'Mobility Aids Available' },
                    { id: 'braillePrograms', label: 'Braille Programs' },
                    { id: 'quietSpace', label: 'Quiet Space Available' },
                    { id: 'lowSensoryLighting', label: 'Low Sensory Lighting' }
                  ].map(feature => (
                    <div key={feature.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`accessibility-${feature.id}`}
                        checked={selectedAccessibility.includes(feature.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAccessibility([...selectedAccessibility, feature.id]);
                          } else {
                            setSelectedAccessibility(selectedAccessibility.filter(id => id !== feature.id));
                          }
                        }}
                        disabled={!fieldsToUpdate.accessibility}
                      />
                      <label htmlFor={`accessibility-${feature.id}`} className="text-sm cursor-pointer">
                        {feature.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Cost & Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Cost & Pricing</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="cost"
                checked={fieldsToUpdate.cost || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, cost: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1 space-y-3">
                <Label>Update Cost Information (replaces existing)</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="isFreeYes"
                      value="true"
                      {...register("isFree")}
                      disabled={!fieldsToUpdate.cost}
                    />
                    <label htmlFor="isFreeYes" className="text-sm">Free Event</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="isFreeNo"
                      value="false"
                      {...register("isFree")}
                      disabled={!fieldsToUpdate.cost}
                    />
                    <label htmlFor="isFreeNo" className="text-sm">Paid Event</label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costTypeInput">Cost Type</Label>
                  <Select
                    disabled={!fieldsToUpdate.cost}
                    onValueChange={(value) => setValue("costType", value)}
                  >
                    <SelectTrigger id="costTypeInput">
                      <SelectValue placeholder="Select cost type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed Price</SelectItem>
                      <SelectItem value="range">Price Range</SelectItem>
                      <SelectItem value="donation">Donation-Based</SelectItem>
                      <SelectItem value="pay-what-you-can">Pay What You Can</SelectItem>
                      <SelectItem value="sliding-scale">Sliding Scale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fixedPriceInput">Fixed Price ($)</Label>
                    <Input
                      id="fixedPriceInput"
                      type="number"
                      step="0.01"
                      {...register("fixedPrice")}
                      disabled={!fieldsToUpdate.cost}
                      placeholder="10.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="kidsFreeInput">Kids Free?</Label>
                    <Select
                      disabled={!fieldsToUpdate.cost}
                      onValueChange={(value) => setValue("kidsFree", value)}
                    >
                      <SelectTrigger id="kidsFreeInput">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="costMinInput">Min Price ($)</Label>
                    <Input
                      id="costMinInput"
                      type="number"
                      step="0.01"
                      {...register("costMin")}
                      disabled={!fieldsToUpdate.cost}
                      placeholder="5.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="costMaxInput">Max Price ($)</Label>
                    <Input
                      id="costMaxInput"
                      type="number"
                      step="0.01"
                      {...register("costMax")}
                      disabled={!fieldsToUpdate.cost}
                      placeholder="20.00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Age Groups */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Age Groups</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="ageGroups"
                checked={fieldsToUpdate.ageGroups || false}
                onCheckedChange={(checked) =>
                  setFieldsToUpdate({ ...fieldsToUpdate, ageGroups: checked as boolean })
                }
                className="mt-2"
              />
              <div className="flex-1">
                <Label>Select Age Groups (replaces existing)</Label>
                <div className="mt-2 p-3 border rounded-md space-y-2">
                  <p className="text-xs text-muted-foreground mb-2">
                    Select the age groups to apply to all selected events. This will replace their current age group settings.
                  </p>
                  {[
                    { id: 'allAges', label: 'All Ages' },
                    { id: 'familyFriendly', label: 'Family-Friendly' },
                    { id: 'youngChildren', label: 'Young Children (0-5)' },
                    { id: 'kids', label: 'Kids (6-12)' },
                    { id: 'teens', label: 'Teens (13-17)' },
                    { id: 'adults', label: 'Adults' },
                    { id: 'adultsOnly', label: 'Adults Only (19+)' },
                    { id: 'seniors', label: 'Seniors (55+)' }
                  ].map(ageGroup => (
                    <div key={ageGroup.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`ageGroup-${ageGroup.id}`}
                        checked={selectedAgeGroups.includes(ageGroup.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAgeGroups([...selectedAgeGroups, ageGroup.id]);
                          } else {
                            setSelectedAgeGroups(selectedAgeGroups.filter(id => id !== ageGroup.id));
                          }
                        }}
                        disabled={!fieldsToUpdate.ageGroups}
                      />
                      <label htmlFor={`ageGroup-${ageGroup.id}`} className="text-sm cursor-pointer">
                        {ageGroup.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Event Image */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Event Image</h3>
            <div className="flex items-start gap-3">
              <Checkbox
                id="image"
                checked={fieldsToUpdate.image || false}
                onCheckedChange={(checked) => {
                  setFieldsToUpdate({ ...fieldsToUpdate, image: checked as boolean });
                  if (!checked) {
                    setImageFile(null);
                    setImagePreview(null);
                  }
                }}
                className="mt-2"
              />
              <div className="flex-1">
                <Label>Upload Image (applies to all selected events)</Label>
                <div className="mt-2 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    disabled={!fieldsToUpdate.image}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setImagePreview(reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-w-xs h-auto rounded-md border"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    This image will be applied to all {selectedEventIds.length} selected events. Recommended size: 1200×630px.
                  </p>
                </div>
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
