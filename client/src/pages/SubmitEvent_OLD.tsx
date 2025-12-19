import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AccessibilityValue } from "@shared/types";

const submitEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  province: z.string().min(1, "Province is required"),
  city: z.string().min(1, "City is required"),
  neighborhood: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "all-day"]).optional(),
  isFree: z.boolean(),
  costMin: z.number().optional(),
  costMax: z.number().optional(),
  familyFriendly: z.boolean(),
  youngChildren: z.boolean(),
  kids: z.boolean(),
  teens: z.boolean(),
  seniors: z.boolean(),
  isIndoor: z.boolean(),
  isOutdoor: z.boolean(),
  organizerName: z.string().optional(),
  organizerEmail: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof submitEventSchema>;

export default function SubmitEvent() {
  const [, navigate] = useLocation();
  const [accessibility, setAccessibility] = useState<Record<string, Record<string, AccessibilityValue>>>({
    caregiver: {},
    mobility: {},
    sensory: {},
    cognitive: {},
    social: {},
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(submitEventSchema),
    defaultValues: {
      isFree: false,
      familyFriendly: false,
      youngChildren: false,
      kids: false,
      teens: false,
      seniors: false,
      isIndoor: false,
      isOutdoor: false,
    },
  });

  const isFree = watch("isFree");

  const submitMutation = trpc.events.submit.useMutation({
    onSuccess: () => {
      toast.success("Event submitted successfully! It will be reviewed by our team.");
      navigate("/browse");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit event");
    },
  });

  const onSubmit = (data: FormData) => {
    submitMutation.mutate({
      ...data,
      startDate: new Date(data.startDate),
      accessibility,
    } as any);
  };

  const updateAccessibility = (
    category: string,
    field: string,
    value: AccessibilityValue
  ) => {
    setAccessibility((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
  };

  const AccessibilityField = ({
    category,
    field,
    label,
    tooltip,
  }: {
    category: string;
    field: string;
    label: string;
    tooltip: string;
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
        <div className="flex gap-4">
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
        </div>
      </RadioGroup>
    </div>
  );

  return (
    <div className="py-8">
      <div className="container max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Submit an Event</h1>
          <p className="text-muted-foreground">
            Help your community discover new experiences. All submissions are reviewed before publishing.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Event Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea id="description" {...register("description")} rows={4} />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input id="startDate" type="datetime-local" {...register("startDate")} />
                  {errors.startDate && (
                    <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="timeOfDay">Time of Day</Label>
                  <Select onValueChange={(value: any) => setValue("timeOfDay", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="all-day">All Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <Input id="province" {...register("province")} placeholder="e.g., Nova Scotia" />
                  {errors.province && (
                    <p className="text-sm text-destructive mt-1">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register("city")} placeholder="e.g., Halifax" />
                  {errors.city && <p className="text-sm text-destructive mt-1">{errors.city.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhood">Neighborhood</Label>
                <Input id="neighborhood" {...register("neighborhood")} placeholder="e.g., North End" />
              </div>

              <div>
                <Label htmlFor="venue">Venue Name</Label>
                <Input id="venue" {...register("venue")} />
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>
          </Card>

          {/* Cost */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isFree"
                  checked={isFree}
                  onCheckedChange={(checked) => setValue("isFree", !!checked)}
                />
                <Label htmlFor="isFree" className="cursor-pointer">
                  This event is free
                </Label>
              </div>

              {!isFree && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="costMin">Minimum Cost ($)</Label>
                    <Input
                      id="costMin"
                      type="number"
                      {...register("costMin", { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="costMax">Maximum Cost ($)</Label>
                    <Input
                      id="costMax"
                      type="number"
                      {...register("costMax", { valueAsNumber: true })}
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Age Suitability */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Who is this event for?</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="familyFriendly"
                  {...register("familyFriendly")}
                  onCheckedChange={(checked) => setValue("familyFriendly", !!checked)}
                />
                <Label htmlFor="familyFriendly" className="cursor-pointer">
                  Family-Friendly
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="youngChildren"
                  {...register("youngChildren")}
                  onCheckedChange={(checked) => setValue("youngChildren", !!checked)}
                />
                <Label htmlFor="youngChildren" className="cursor-pointer">
                  Young Children (0-5)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="kids"
                  {...register("kids")}
                  onCheckedChange={(checked) => setValue("kids", !!checked)}
                />
                <Label htmlFor="kids" className="cursor-pointer">
                  Kids (6-12)
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="teens"
                  {...register("teens")}
                  onCheckedChange={(checked) => setValue("teens", !!checked)}
                />
                <Label htmlFor="teens" className="cursor-pointer">
                  Teens
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="seniors"
                  {...register("seniors")}
                  onCheckedChange={(checked) => setValue("seniors", !!checked)}
                />
                <Label htmlFor="seniors" className="cursor-pointer">
                  Seniors
                </Label>
              </div>
            </div>
          </Card>

          {/* Environment */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Environment</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isIndoor"
                  {...register("isIndoor")}
                  onCheckedChange={(checked) => setValue("isIndoor", !!checked)}
                />
                <Label htmlFor="isIndoor" className="cursor-pointer">
                  Indoor
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="isOutdoor"
                  {...register("isOutdoor")}
                  onCheckedChange={(checked) => setValue("isOutdoor", !!checked)}
                />
                <Label htmlFor="isOutdoor" className="cursor-pointer">
                  Outdoor
                </Label>
              </div>
            </div>
          </Card>

          {/* Accessibility Section */}
          <Card className="p-6 border-2 border-primary/20">
            <div className="mb-4">
              <h2 className="text-xl font-semibold mb-2">Accessibility Information *</h2>
              <p className="text-sm text-muted-foreground">
                This section is required, but "Unknown" is always acceptable. Honest information helps families plan with confidence.
              </p>
            </div>

            <div className="space-y-6">
              {/* Caregiver & Infant */}
              <div>
                <h3 className="font-semibold mb-3">Caregiver & Infant Accessibility</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="caregiver"
                    field="changeTablesPresent"
                    label="Change tables present"
                    tooltip="Are there diaper changing tables available at this event?"
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="nursingFriendly"
                    label="Nursing/breastfeeding friendly"
                    tooltip="Is this a welcoming space for nursing or breastfeeding?"
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="strollerSpace"
                    label="Space for strollers"
                    tooltip="Is there adequate space to bring and maneuver a stroller?"
                  />
                </div>
              </div>

              {/* Mobility */}
              <div>
                <h3 className="font-semibold mb-3">Mobility & Physical Access</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="mobility"
                    field="wheelchairEntrance"
                    label="Wheelchair accessible entrance"
                    tooltip="Is there a wheelchair-accessible entrance to the venue?"
                  />
                  <AccessibilityField
                    category="mobility"
                    field="stepFreeEntry"
                    label="Step-free entry"
                    tooltip="Can people enter without encountering steps?"
                  />
                  <AccessibilityField
                    category="mobility"
                    field="accessibleWashrooms"
                    label="Accessible washrooms"
                    tooltip="Are there accessible washroom facilities available?"
                  />
                </div>
              </div>

              {/* Sensory */}
              <div>
                <h3 className="font-semibold mb-3">Sensory & Neurodivergent Accessibility</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="sensory"
                    field="loudNoises"
                    label="Loud noises expected"
                    tooltip="Will there be loud music, announcements, or other loud sounds?"
                  />
                  <AccessibilityField
                    category="sensory"
                    field="flashingLights"
                    label="Flashing lights"
                    tooltip="Will there be flashing or strobe lights?"
                  />
                  <AccessibilityField
                    category="sensory"
                    field="quietRoom"
                    label="Quiet room/break space available"
                    tooltip="Is there a designated quiet space for people who need a sensory break?"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Organizer Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Organizer Information (Optional)</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="organizerName">Organization/Contact Name</Label>
                <Input id="organizerName" {...register("organizerName")} />
              </div>
              <div>
                <Label htmlFor="organizerEmail">Contact Email</Label>
                <Input id="organizerEmail" type="email" {...register("organizerEmail")} />
              </div>
            </div>
          </Card>

          {/* Additional Notes */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
            <Textarea
              {...register("notes")}
              rows={3}
              placeholder="Any other important information (e.g., weather dependent, registration required, etc.)"
            />
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button type="submit" size="lg" disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Submitting..." : "Submit Event"}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/browse")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
