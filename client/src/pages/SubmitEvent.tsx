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
import { useLocation, Link } from "wouter";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AccessibilityValue } from "@shared/types";
import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";

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
  costType: z.enum(["fixed", "range", "donation", "pay-what-you-can", "sliding-scale"]).optional(),
  kidsFree: z.boolean(),
  freeCompanion: z.boolean(),
  allAges: z.boolean(),
  familyFriendly: z.boolean(),
  youngChildren: z.boolean(),
  kids: z.boolean(),
  teens: z.boolean(),
  adultsOnly: z.boolean(),
  seniors: z.boolean(),
  isIndoor: z.boolean(),
  isOutdoor: z.boolean(),
  organizerName: z.string().min(1, "Organizer name is required"),
  organizerEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  organizerPhone: z.string().optional(),
  organizerWebsite: z.string().optional(),
  displayOrganizerInfo: z.boolean(),
  notes: z.string().optional(),
}).refine(
  (data) => {
    // Require either email or phone
    return (data.organizerEmail && data.organizerEmail.length > 0) || (data.organizerPhone && data.organizerPhone.length > 0);
  },
  {
    message: "Please provide either an email or phone number for contact",
    path: ["organizerEmail"],
  }
);

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
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);

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
      kidsFree: false,
      freeCompanion: false,
      allAges: false,
      familyFriendly: false,
      youngChildren: false,
      kids: false,
      teens: false,
      adultsOnly: false,
      seniors: false,
      isIndoor: false,
      isOutdoor: false,
    },
  });

  const isFree = watch("isFree");
  const costType = watch("costType");

  const uploadImageMutation = trpc.upload.uploadImage.useMutation({
    onSuccess: (data) => {
      setImageUrl(data.url);
      setUploadingImage(false);
      toast.success("Image uploaded successfully!");
    },
    onError: (error) => {
      setUploadingImage(false);
      toast.error(error.message || "Failed to upload image");
    },
  });

  const submitMutation = trpc.events.submit.useMutation({
    onSuccess: () => {
      toast.success("Event submitted successfully! It will be reviewed by our team.");
      navigate("/browse");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit event");
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploadingImage(true);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);

      // Upload to S3
      uploadImageMutation.mutate({
        imageData: base64String,
        fileName: file.name,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = (data: FormData) => {
    submitMutation.mutate({
      ...data,
      startDate: new Date(data.startDate),
      accessibility,
      imageUrl: imageUrl || undefined,
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
    showNotRelevant = false,
  }: {
    category: string;
    field: string;
    label: string;
    tooltip: string;
    showNotRelevant?: boolean;
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

        {/* Submission Guidelines */}
        <Card className="p-6 mb-8 bg-muted/30">
          <h2 className="text-xl font-semibold mb-4">Before You Submit</h2>
          <div className="space-y-4 text-sm">
            <p>
              Local Happenings is a community-first space. Our goal is to help people discover events they can realistically attend — especially families, caregivers, and community members with different access needs.
            </p>
            <p>
              All event submissions are reviewed by a real human before being published. To keep things useful, fair, and trustworthy for everyone, we follow a few simple guidelines.
            </p>
            <p className="text-muted-foreground italic">
              The examples below aren't exhaustive, and we may add more over time as the platform grows.
            </p>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Our Guiding Principle</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Be kind.</li>
                <li>Be honest.</li>
                <li>Share events you'd genuinely feel good inviting your community to attend.</li>
              </ul>
              <p className="mt-2">
                If you're unsure whether something fits, you're welcome to submit it — we're happy to take a look and follow up.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">What We're Looking For (Approval Guidelines)</h3>
              <p className="mb-2">Your event is likely to be approved if:</p>
              
              <div className="space-y-3 ml-2">
                <div>
                  <p className="font-medium">✅ Clear, Complete Event Details</p>
                  <p className="text-muted-foreground">Please include: a clear event name and description, a valid location (at minimum: province and city), a start date (and end date, if applicable), and cost information (free, donation-based, or a price range).</p>
                </div>

                <div>
                  <p className="font-medium">♿ Accessibility Information Is Thoughtfully Completed</p>
                  <p className="text-muted-foreground">
                    The accessibility section must be completed. It's okay to select "Unknown" for any field if you're truly not sure — the section can't be left blank. If you select "Unknown," we ask that you confirm and update that information as soon as possible.
                  </p>
                  <p className="text-muted-foreground mt-1">
                    The "Unknown" option exists to support honesty — not to avoid sharing available information. Clear, accurate accessibility details help people decide whether they can attend safely and comfortably.
                  </p>
                  <p className="text-muted-foreground mt-1 font-medium">
                    Honesty and transparency are core values of Local Happenings. If accessibility information is intentionally withheld or misrepresented, we reserve the right to limit or remove an organizer's ability to submit future listings.
                  </p>
                </div>

                <div>
                  <p className="font-medium">🤝 Community-Appropriate Content</p>
                  <p className="text-muted-foreground">
                    Events should be suitable for a community platform. No hate speech, discrimination, or harassment. No illegal activities. No misleading or harmful content.
                  </p>
                  <p className="text-muted-foreground mt-1">
                    Events hosted by businesses are absolutely welcome, as long as they offer clear community value (for example: markets, workshops, classes, performances, or public gatherings).
                  </p>
                  <p className="text-muted-foreground mt-1">
                    If you're looking to promote a business more directly, we'd love to chat about sponsoring the project —{" "}
                    <Link href="/contact" className="text-primary hover:underline font-medium">
                      you can reach out via our contact form
                    </Link>.
                  </p>
                </div>

                <div>
                  <p className="font-medium">📍 Reasonably Accurate Information</p>
                  <p className="text-muted-foreground">
                    Event dates and locations should be real and verifiable. If something appears unclear or incorrect, we may mark the submission as "Needs Info" and ask for clarification before publishing.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-semibold mb-2">When Submissions Aren't Approved (Rejection Guidelines)</h3>
              <p className="mb-2">An event may be declined if it falls into one of the following categories:</p>
              <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                <li>Spam or automated submissions</li>
                <li>Duplicate events (if the same event is already published)</li>
                <li>Purely promotional advertisements with no community event component</li>
                <li>Events promoting illegal activity, discrimination, or harm</li>
                <li>Completely fabricated, misleading, or nonsensical information</li>
              </ul>
              <p className="mt-2 text-muted-foreground">
                If an event is rejected, we'll always include a clear note explaining why. This helps organizers understand what happened and improve future submissions.
              </p>
            </div>
          </div>
        </Card>

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
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={4}
                  placeholder="Describe your event..."
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="eventImage">Event Image (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a photo to make your event stand out (max 5MB)
                </p>
                <Input
                  id="eventImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground mt-2">Uploading image...</p>
                )}
                {imagePreview && (
                  <div className="mt-4">
                    <img
                      src={imagePreview}
                      alt="Event preview"
                      className="max-w-md rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
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
                  <Label htmlFor="province">Province/Territory *</Label>
                  <Select
                    value={selectedProvince}
                    onValueChange={(value) => {
                      setSelectedProvince(value);
                      const provinceCode = CANADIAN_PROVINCES.find(p => p.name === value)?.code || "";
                      setAvailableCities(CANADIAN_CITIES[provinceCode] || []);
                      setValue("province", value);
                      setValue("city", ""); // Reset city when province changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select province/territory" />
                    </SelectTrigger>
                    <SelectContent>
                      {CANADIAN_PROVINCES.map((province) => (
                        <SelectItem key={province.code} value={province.name}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.province && (
                    <p className="text-sm text-destructive mt-1">{errors.province.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city">City/Town *</Label>
                  <Select
                    value={watch("city") || ""}
                    onValueChange={(value) => setValue("city", value)}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProvince ? "Select city" : "Select province first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <>
                  <div>
                    <Label htmlFor="costType">Cost Type</Label>
                    <Select onValueChange={(value: any) => setValue("costType", value)}>
                      <SelectTrigger>
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

                  {(costType === "fixed" || costType === "range" || !costType) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="costMin">Minimum Cost ($)</Label>
                        <Input
                          id="costMin"
                          type="number"
                          step="0.01"
                          {...register("costMin", { valueAsNumber: true })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="costMax">Maximum Cost ($)</Label>
                        <Input
                          id="costMax"
                          type="number"
                          step="0.01"
                          {...register("costMax", { valueAsNumber: true })}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="kidsFree"
                    {...register("kidsFree")}
                    onCheckedChange={(checked) => setValue("kidsFree", !!checked)}
                  />
                  <Label htmlFor="kidsFree" className="cursor-pointer">
                    Kids attend free
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="freeCompanion"
                    {...register("freeCompanion")}
                    onCheckedChange={(checked) => setValue("freeCompanion", !!checked)}
                  />
                  <Label htmlFor="freeCompanion" className="cursor-pointer">
                    Free companion/support worker ticket
                  </Label>
                </div>
              </div>
            </div>
          </Card>

          {/* Age Suitability */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Who is this event for?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Select all age groups that would enjoy this event.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="allAges"
                  {...register("allAges")}
                  onCheckedChange={(checked) => setValue("allAges", !!checked)}
                />
                <Label htmlFor="allAges" className="cursor-pointer">
                  All Ages
                </Label>
              </div>
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
                  id="adultsOnly"
                  {...register("adultsOnly")}
                  onCheckedChange={(checked) => setValue("adultsOnly", !!checked)}
                />
                <Label htmlFor="adultsOnly" className="cursor-pointer">
                  Adults Only
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
                This section is required, but "Unknown" is always acceptable. Honest information helps families plan with confidence. Select "Not Relevant" for features that don't apply to your venue or event type.
              </p>
            </div>

            <div className="space-y-6">
              {/* Caregiver & Infant */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Caregiver & Infant Accessibility</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="caregiver"
                    field="changeTablesPresent"
                    label="Change tables present"
                    tooltip="Are there diaper changing tables available at this event?"
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="changeTablesAllWashrooms"
                    label="Change tables in all washrooms"
                    tooltip="Are changing tables available in all washroom facilities?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="nursingFriendly"
                    label="Nursing/breastfeeding friendly"
                    tooltip="Is this a welcoming space for nursing or breastfeeding?"
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="privateFeedingArea"
                    label="Private feeding area"
                    tooltip="Is there a private space available for feeding?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="bottleWarming"
                    label="Bottle warming available"
                    tooltip="Can bottles be warmed on-site?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="highChairs"
                    label="High chairs available"
                    tooltip="Are high chairs provided for young children?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="strollerSpace"
                    label="Space for strollers"
                    tooltip="Is there adequate space to bring and maneuver a stroller?"
                  />
                  <AccessibilityField
                    category="caregiver"
                    field="storage"
                    label="Coat/stroller storage"
                    tooltip="Is there a designated area to store coats, bags, or strollers?"
                    showNotRelevant
                  />
                </div>
              </div>

              {/* Mobility & Physical Access */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Mobility & Physical Access</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="mobility"
                    field="strollerAccessible"
                    label="Stroller accessible"
                    tooltip="Can strollers navigate the space easily?"
                  />
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
                    field="elevatorAccess"
                    label="Elevator access"
                    tooltip="Is there elevator access to all event areas?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="mobility"
                    field="wideDoorways"
                    label="Wide doorways"
                    tooltip="Are doorways wide enough for wheelchairs and mobility devices?"
                  />
                  <AccessibilityField
                    category="mobility"
                    field="accessibleSeating"
                    label="Accessible seating"
                    tooltip="Is accessible seating available?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="mobility"
                    field="accessibleWashrooms"
                    label="Accessible washrooms"
                    tooltip="Are there accessible washroom facilities available?"
                  />
                  <AccessibilityField
                    category="mobility"
                    field="accessibleParking"
                    label="Reserved accessible parking nearby"
                    tooltip="Is accessible parking available close to the venue?"
                  />
                  {/* Terrain Info - Dropdown */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Terrain Type</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">What is the terrain like at this event location?</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={accessibility.mobility?.terrainInfo || "unknown"}
                      onValueChange={(value) => updateAccessibility("mobility", "terrainInfo", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select terrain type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="paved">Paved</SelectItem>
                        <SelectItem value="gravel">Gravel</SelectItem>
                        <SelectItem value="hills">Hills</SelectItem>
                        <SelectItem value="unpaved">Unpaved</SelectItem>
                        <SelectItem value="mixed">Mixed Terrain</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                        <SelectItem value="not-relevant">Not Relevant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Parking Distance - Dropdown */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Parking Distance to Entrance</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">How far is parking from the event entrance?</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={accessibility.mobility?.parkingDistance || "unknown"}
                      onValueChange={(value) => updateAccessibility("mobility", "parkingDistance", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parking distance" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short">Short walk (under 2 minutes)</SelectItem>
                        <SelectItem value="moderate">Moderate walk (2-5 minutes)</SelectItem>
                        <SelectItem value="long">Long walk (5+ minutes)</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                        <SelectItem value="not-relevant">Not Relevant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sensory & Neurodivergent */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Sensory & Neurodivergent Accessibility</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="sensory"
                    field="sensoryFriendly"
                    label="Sensory-friendly"
                    tooltip="Is this event designed to be sensory-friendly?"
                  />
                  <AccessibilityField
                    category="sensory"
                    field="quietEnvironment"
                    label="Quiet/low-stimulus environment"
                    tooltip="Is the environment generally quiet and low-stimulus?"
                  />
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
                    field="crowdLevel"
                    label="Crowd level (spacious/moderate/crowded)"
                    tooltip="How crowded will the event be?"
                  />
                  <AccessibilityField
                    category="sensory"
                    field="quietRoom"
                    label="Quiet room/break space available"
                    tooltip="Is there a designated quiet space for people who need a sensory break?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="sensory"
                    field="sensoryTimeSlot"
                    label="Sensory-friendly time slot"
                    tooltip="Is there a specific time slot designed for sensory-sensitive attendees?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="sensory"
                    field="predictableSchedule"
                    label="Predictable schedule"
                    tooltip="Does the event follow a predictable, structured schedule?"
                  />
                </div>
              </div>

              {/* Cognitive & Communication */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Cognitive & Communication Accessibility</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="cognitive"
                    field="clearSignage"
                    label="Clear signage"
                    tooltip="Is signage clear, visible, and easy to understand?"
                  />
                  <AccessibilityField
                    category="cognitive"
                    field="simpleInstructions"
                    label="Simple instructions"
                    tooltip="Are instructions provided in simple, clear language?"
                  />
                  <AccessibilityField
                    category="cognitive"
                    field="writtenMaterials"
                    label="Written materials available"
                    tooltip="Are written materials (schedules, maps, etc.) available?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="cognitive"
                    field="aslInterpretation"
                    label="ASL interpretation"
                    tooltip="Is American Sign Language interpretation available?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="cognitive"
                    field="liveCaptions"
                    label="Live captions"
                    tooltip="Are live captions provided for spoken content?"
                    showNotRelevant
                  />
                  <AccessibilityField
                    category="cognitive"
                    field="multilingualSupport"
                    label="Multilingual support"
                    tooltip="Is support available in multiple languages?"
                    showNotRelevant
                  />
                </div>
              </div>

              {/* Social & Emotional */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Social & Emotional Accessibility</h3>
                <div className="space-y-4">
                  <AccessibilityField
                    category="social"
                    field="genderNeutralWashrooms"
                    label="Gender-neutral washrooms"
                    tooltip="Are gender-neutral washroom facilities available?"
                  />
                  <AccessibilityField
                    category="social"
                    field="lgbtqiaFriendly"
                    label="LGBTQIA+ friendly"
                    tooltip="Is this an explicitly LGBTQIA+ welcoming space?"
                  />
                  <AccessibilityField
                    category="social"
                    field="maskFriendly"
                    label="Mask-friendly/mask-encouraged"
                    tooltip="Are masks welcomed or encouraged?"
                  />
                  <AccessibilityField
                    category="social"
                    field="scentFree"
                    label="Scent-free/low-scent environment"
                    tooltip="Is this a scent-free or low-scent environment?"
                  />
                  <AccessibilityField
                    category="social"
                    field="alcoholFree"
                    label="Alcohol-free"
                    tooltip="Is this event alcohol-free?"
                  />
                  <AccessibilityField
                    category="social"
                    field="substanceFree"
                    label="Substance-free"
                    tooltip="Is this event substance-free?"
                  />
                  <AccessibilityField
                    category="social"
                    field="traumaInformed"
                    label="Trauma-informed space"
                    tooltip="Is this event designed with trauma-informed principles?"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Organizer Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Organizer Information *</h2>
            <p className="text-sm text-muted-foreground mb-4">
              We need contact information to reach you about this event if needed. At least one contact method (email or phone) is required.
            </p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="organizerName">Organization/Contact Name *</Label>
                <Input id="organizerName" {...register("organizerName")} />
                {errors.organizerName && (
                  <p className="text-sm text-destructive mt-1">{errors.organizerName.message}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="organizerEmail">Contact Email *</Label>
                  <Input id="organizerEmail" type="email" {...register("organizerEmail")} />
                  {errors.organizerEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.organizerEmail.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="organizerPhone">Contact Phone *</Label>
                  <Input id="organizerPhone" type="tel" {...register("organizerPhone")} placeholder="(902) 555-1234" />
                  {errors.organizerPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.organizerPhone.message}</p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="organizerWebsite">Website (Optional)</Label>
                <Input id="organizerWebsite" type="url" {...register("organizerWebsite")} placeholder="https://" />
              </div>
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="displayOrganizerInfo"
                  {...register("displayOrganizerInfo")}
                  defaultChecked
                />
                <div className="space-y-1">
                  <Label htmlFor="displayOrganizerInfo" className="cursor-pointer font-normal">
                    Display organizer contact information publicly
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    If checked, your contact information will be visible on the event page. If unchecked, only admins can see it.
                  </p>
                </div>
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
