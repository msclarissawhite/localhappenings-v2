import { useState, useEffect } from "react";
import { ImageLibraryModal } from "@/components/ImageLibraryModal";
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
import { useLocation, Link, useSearch } from "wouter";
import { Info, Eye, Save } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AccessibilityValue } from "@shared/types";
import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";
import { EventPreview } from "@/components/EventPreview";
import { RecurringPreview } from "@/components/RecurringPreview";

const submitEventSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string()
    .min(1, "Description is required")
    .max(5000, "Description must be 5,000 characters or less"),
  province: z.string().min(1, "Province is required"),
  municipality: z.string().min(1, "City is required"),
  neighborhoodCommunity: z.string().optional(),
  venue: z.string().optional(),
  address: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "all-day"]).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceFrequency: z.enum(["daily", "weekly", "monthly"]).optional(),
  recurrenceInterval: z.number().min(1).default(1).optional(),
  recurrenceDaysOfWeek: z.array(z.number()).optional(),
  recurrenceEndDate: z.string().optional(),
  recurrenceOccurrences: z.number().min(1).max(100).optional(),
  isFree: z.boolean(),
  fixedPrice: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
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
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [organizer, setOrganizer] = useState<{id: number; email: string; name: string | null} | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const searchParams = useSearch();
  const urlParams = new URLSearchParams(searchParams);

  // Check if organizer is logged in
  useEffect(() => {
    const storedOrganizer = localStorage.getItem("organizer");
    if (storedOrganizer) {
      try {
        setOrganizer(JSON.parse(storedOrganizer));
      } catch (error) {
        console.error("Failed to parse organizer data", error);
      }
    }
  }, []);

  // Load saved locations for organizer
  const { data: savedLocations } = trpc.savedLocations.getAll.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer }
  );

  // Load default location for organizer
  const { data: defaultLocation } = trpc.savedLocations.getDefault.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer }
  );

  // Initialize form BEFORE useEffect hooks that use setValue
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
      isRecurring: false,
      recurrenceInterval: 1,
    },
  });

  const isFree = watch("isFree");
  const costType = watch("costType");

  // Load template if templateId in URL
  const templateIdParam = urlParams.get("templateId");
  const { data: templateData } = trpc.eventTemplates.get.useQuery(
    { templateId: parseInt(templateIdParam || "0") },
    { enabled: !!templateIdParam && !isNaN(parseInt(templateIdParam)) }
  );

  useEffect(() => {
    if (templateData) {
      const data = templateData.templateData as any;
      
      // Fill form fields from template
      if (data.name) setValue("name", data.name);
      if (data.description) setValue("description", data.description);
      if (data.province) setValue("province", data.province);
      if (data.municipality) setValue("municipality", data.municipality);
      if (data.neighborhoodCommunity) setValue("neighborhoodCommunity", data.neighborhoodCommunity);
      if (data.venue) setValue("venue", data.venue);
      if (data.address) setValue("address", data.address);
      
      // Cost fields
      if (data.isFree !== undefined) setValue("isFree", data.isFree);
      if (data.costType) setValue("costType", data.costType);
      if (data.costMin !== undefined) setValue("costMin", data.costMin);
      if (data.costMax !== undefined) setValue("costMax", data.costMax);
      if (data.kidsFree !== undefined) setValue("kidsFree", data.kidsFree);
      if (data.freeCompanion !== undefined) setValue("freeCompanion", data.freeCompanion);
      
      // Age groups
      if (data.allAges !== undefined) setValue("allAges", data.allAges);
      if (data.familyFriendly !== undefined) setValue("familyFriendly", data.familyFriendly);
      if (data.youngChildren !== undefined) setValue("youngChildren", data.youngChildren);
      if (data.kids !== undefined) setValue("kids", data.kids);
      if (data.teens !== undefined) setValue("teens", data.teens);
      if (data.adultsOnly !== undefined) setValue("adultsOnly", data.adultsOnly);
      if (data.seniors !== undefined) setValue("seniors", data.seniors);
      
      // Environment
      if (data.isIndoor !== undefined) setValue("isIndoor", data.isIndoor);
      if (data.isOutdoor !== undefined) setValue("isOutdoor", data.isOutdoor);
      
      // Organizer info
      if (data.organizerName) setValue("organizerName", data.organizerName);
      if (data.organizerEmail) setValue("organizerEmail", data.organizerEmail);
      if (data.organizerPhone) setValue("organizerPhone", data.organizerPhone);
      if (data.organizerWebsite) setValue("organizerWebsite", data.organizerWebsite);
      if (data.displayOrganizerInfo !== undefined) setValue("displayOrganizerInfo", data.displayOrganizerInfo);
      
      // Accessibility
      if (data.accessibility) {
        setAccessibility(data.accessibility);
      }
      
      // Image
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        setImagePreview(data.imageUrl);
      }
      
      toast.success(`Template "${templateData.templateName}" loaded`);
    }
  }, [templateData, setValue]);

  // Load copied event data if available
  useEffect(() => {
    const copyEventData = localStorage.getItem("copyEventData");
    if (copyEventData) {
      try {
        const event = JSON.parse(copyEventData);
        
        // Fill all fields except date (user should set new date)
        setValue("name", event.name);
        setValue("description", event.description);
        setValue("province", event.province);
        setValue("municipality", event.municipality);
        if (event.neighborhoodCommunity) setValue("neighborhoodCommunity", event.neighborhoodCommunity);
        if (event.venue) setValue("venue", event.venue);
        if (event.address) setValue("address", event.address);
        
        // Cost fields
        setValue("isFree", event.isFree === 1);
        if (event.costType) setValue("costType", event.costType);
        if (event.fixedPrice) setValue("fixedPrice", event.fixedPrice);
        if (event.minPrice) setValue("minPrice", event.minPrice);
        if (event.maxPrice) setValue("maxPrice", event.maxPrice);
        setValue("kidsFree", event.kidsFree === 1);
        setValue("freeCompanion", event.freeCompanion === 1);
        
        // Age groups
        setValue("allAges", event.allAges === 1);
        setValue("familyFriendly", event.familyFriendly === 1);
        setValue("youngChildren", event.youngChildren === 1);
        setValue("kids", event.kids === 1);
        setValue("teens", event.teens === 1);
        setValue("adultsOnly", event.adultsOnly === 1);
        setValue("seniors", event.seniors === 1);
        
        // Environment
        setValue("isIndoor", event.isIndoor === 1);
        setValue("isOutdoor", event.isOutdoor === 1);
        
        // Accessibility
        if (event.accessibility) {
          try {
            const parsedAccessibility = typeof event.accessibility === "string"
              ? JSON.parse(event.accessibility)
              : event.accessibility;
            setAccessibility(parsedAccessibility);
            
            Object.entries(parsedAccessibility).forEach(([category, fields]: [string, any]) => {
              if (fields && typeof fields === 'object') {
                Object.entries(fields).forEach(([field, value]) => {
                  setValue(`accessibility.${category}.${field}` as any, value);
                });
              }
            });
          } catch (e) {
            console.error("Failed to parse accessibility", e);
          }
        }
        
        // Notes
        if (event.notes) setValue("notes", event.notes);
        
        // Update province/city state
        setSelectedProvince(event.province);
        const provinceCode = CANADIAN_PROVINCES.find(p => p.name === event.province)?.code || "";
        setAvailableCities(CANADIAN_CITIES[provinceCode] || []);
        
        // Clear the stored data
        localStorage.removeItem("copyEventData");
        
        toast.info("Event copied! Please set a new date and review all details before submitting.");
      } catch (error) {
        console.error("Failed to load copied event data", error);
        localStorage.removeItem("copyEventData");
      }
    }
  }, [setValue]);

  // Auto-select default location when form loads
  useEffect(() => {
    if (defaultLocation && !selectedLocationId) {
      setSelectedLocationId(defaultLocation.id);
      // Auto-fill location fields
      setValue("province", defaultLocation.province);
      setValue("municipality", defaultLocation.municipality);
      if (defaultLocation.neighborhoodCommunity) {
        setValue("neighborhoodCommunity", defaultLocation.neighborhoodCommunity);
      }
      if (defaultLocation.venue) {
        setValue("venue", defaultLocation.venue);
      }
      if (defaultLocation.address) {
        setValue("address", defaultLocation.address);
      }
      setValue("isIndoor", defaultLocation.isIndoor === 1);
      setValue("isOutdoor", defaultLocation.isOutdoor === 1);
      
      // Auto-fill accessibility fields
      if (defaultLocation.accessibility) {
        try {
          const accessibility = JSON.parse(defaultLocation.accessibility);
          Object.entries(accessibility).forEach(([category, fields]: [string, any]) => {
            if (fields && typeof fields === 'object') {
              Object.entries(fields).forEach(([field, value]) => {
                setValue(`accessibility.${category}.${field}` as any, value);
              });
            }
          });
        } catch (error) {
          console.error("Failed to parse accessibility data", error);
        }
      }
    }
  }, [defaultLocation, selectedLocationId, setValue]);

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

  const saveTemplateMutation = trpc.eventTemplates.create.useMutation({
    onSuccess: () => {
      toast.success(`Template "${templateName}" saved successfully`);
      setShowSaveTemplate(false);
      setTemplateName("");
      setTemplateDescription("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save template");
    },
  });

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    const formData = watch();
    const templateData = {
      ...formData,
      accessibility,
      imageUrl: imageUrl || imagePreview,
    };

    saveTemplateMutation.mutate({
      templateName: templateName.trim(),
      description: templateDescription.trim() || undefined,
      templateData,
    });
  };

  const submitMutation = trpc.events.submit.useMutation({
    onSuccess: () => {
      toast.success("Event submitted successfully! It will be reviewed by our team.");
      navigate("/browse");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit event");
    },
  });

  const handleSelectFromLibrary = (url: string) => {
    setImageUrl(url);
    setImagePreview(url);
    toast.success("Image selected from your library!");
  };

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
    // Build recurrence pattern if recurring event
    const recurrencePattern = data.isRecurring && data.recurrenceFrequency ? {
      frequency: data.recurrenceFrequency,
      interval: data.recurrenceInterval || 1,
      daysOfWeek: data.recurrenceDaysOfWeek,
      endDate: data.recurrenceEndDate ? new Date(data.recurrenceEndDate) : undefined,
      occurrences: data.recurrenceOccurrences,
    } : undefined;

    submitMutation.mutate({
      ...data,
      startDate: new Date(data.startDate),
      accessibility,
      imageUrl: imageUrl || undefined,
      organizerId: organizer?.id || undefined,
      recurrencePattern,
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

  const CrowdLevelField = () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="text-sm">Crowd level</Label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">How crowded will the event be? This helps families with sensory sensitivities plan accordingly.</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <RadioGroup
        value={accessibility.sensory?.crowdLevel || "unknown"}
        onValueChange={(value: AccessibilityValue) =>
          updateAccessibility("sensory", "crowdLevel", value)
        }
      >
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="spacious" id="sensory-crowdLevel-spacious" />
            <Label htmlFor="sensory-crowdLevel-spacious" className="cursor-pointer font-normal">
              Spacious
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="moderate" id="sensory-crowdLevel-moderate" />
            <Label htmlFor="sensory-crowdLevel-moderate" className="cursor-pointer font-normal">
              Moderate
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="crowded" id="sensory-crowdLevel-crowded" />
            <Label htmlFor="sensory-crowdLevel-crowded" className="cursor-pointer font-normal">
              Crowded
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="unknown" id="sensory-crowdLevel-unknown" />
            <Label htmlFor="sensory-crowdLevel-unknown" className="cursor-pointer font-normal">
              Unknown
            </Label>
          </div>
        </div>
      </RadioGroup>
    </div>
  );

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
            <p style={{fontSize: '16px'}}>
              Local Happenings is a community-first space. Our goal is to help people discover events they can realistically attend — especially families, caregivers, and community members with different access needs.
            </p>
            <p style={{fontSize: '16px'}}>
              All event submissions are reviewed by a real human before being published. To keep things useful, fair, and trustworthy for everyone, we follow a few simple guidelines.
            </p>
            <p className="text-muted-foreground italic" style={{fontSize: '16px'}}>
              The examples below aren't exhaustive, and we may add more over time as the platform grows.
            </p>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2" style={{fontSize: '18px', paddingTop: '20px'}}>Our Guiding Principle</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li style={{fontSize: '16px'}}>Be kind.</li>
                <li style={{fontSize: '16px'}}>Be honest.</li>
                <li style={{fontSize: '16px'}}>Share events you'd genuinely feel good inviting your community to attend.</li>
              </ul>
              <p className="mt-2" style={{fontSize: '16px'}}>
                If you're unsure whether something fits, you're welcome to submit it — we're happy to take a look and follow up.
              </p>
            </div>

            {/* Sponsorship Callout - Separate Section */}
            <Card className="mt-6 p-4 bg-muted/50 border-primary/20">
              <p className="text-sm" style={{fontSize: '16px'}}>
                <strong>Looking to promote your business more directly?</strong> We'd love to chat about sponsoring the project —{" "}
                <Link href="/contact" className="text-primary hover:underline font-medium">
                  reach out via our contact form
                </Link>.
              </p>
            </Card>

            {/* Collapsible Guidelines Sections */}
            <Accordion type="multiple" className="mt-6">
              <AccordionItem value="approval-guidelines">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  What We're Looking For (Approval Guidelines)
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-4" style={{fontSize: '16px'}}>Your event is likely to be approved if:</p>
                  
                  <div className="space-y-3 ml-2">
                    <div>
                      <p className="font-medium" style={{fontSize: '16px', paddingTop: '20px'}}>✅ Clear, Complete Event Details</p>
                      <p className="text-muted-foreground" style={{fontSize: '16px'}}>Please include: a clear event name and description, a valid location (at minimum: province and municipality), a start date (and end date, if applicable), and cost information (free, donation-based, or a price range).</p>
                    </div>

                    <div>
                      <p className="font-medium" style={{fontSize: '16px', paddingTop: '20px'}}>♿ Accessibility Information Is Thoughtfully Completed</p>
                      <p className="text-muted-foreground" style={{fontSize: '16px', paddingTop: '10px'}}>
                        The accessibility section must be completed. It's okay to select "Unknown" for any field if you're truly not sure — the section can't be left blank. If you select "Unknown," we ask that you confirm and update that information as soon as possible.
                      </p>
                      <p className="text-muted-foreground mt-1" style={{fontSize: '16px', paddingTop: '10px'}}>
                        The "Unknown" option exists to support honesty — not to avoid sharing available information. Clear, accurate accessibility details help people decide whether they can attend safely and comfortably.
                      </p>
                      <p className="text-muted-foreground mt-1 font-medium" style={{fontSize: '16px', paddingTop: '10px'}}>
                        Honesty and transparency are core values of Local Happenings. If accessibility information is intentionally withheld or misrepresented, we reserve the right to limit or remove an organizer's ability to submit future listings.
                      </p>
                    </div>

                    <div>
                      <p className="font-medium" style={{fontSize: '16px', paddingTop: '20px'}}>🤝 Community-Appropriate Content</p>
                      <p className="text-muted-foreground" style={{fontSize: '16px', paddingTop: '10px'}}>
                        Events should be suitable for a community platform. No hate speech, discrimination, or harassment. No illegal activities. No misleading or harmful content.
                      </p>
                      <p className="text-muted-foreground mt-1" style={{fontSize: '16px', paddingTop: '10px'}}>
                        Events hosted by businesses are absolutely welcome, as long as they offer clear community value (for example: markets, workshops, classes, performances, or public gatherings).
                      </p>
                    </div>

                    <div>
                      <p className="font-medium" style={{fontSize: '16px', paddingTop: '20px'}}>📍 Reasonably Accurate Information</p>
                      <p className="text-muted-foreground" style={{fontSize: '16px', paddingTop: '10px'}}>
                        Event dates and locations should be real and verifiable. If something appears unclear or incorrect, we may mark the submission as "Needs Info" and ask for clarification before publishing.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rejection-guidelines">
                <AccordionTrigger className="text-lg font-semibold hover:no-underline">
                  When Submissions Aren't Approved (Rejection Guidelines)
                </AccordionTrigger>
                <AccordionContent>
                  <p className="mb-2" style={{fontSize: '16px'}}>An event may be declined if it falls into one of the following categories:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                    <li style={{fontSize: '16px'}}>Spam or automated submissions</li>
                    <li style={{fontSize: '16px'}}>Duplicate events (if the same event is already published)</li>
                    <li style={{fontSize: '16px'}}>Purely promotional advertisements with no community event component</li>
                    <li style={{fontSize: '16px'}}>Events promoting illegal activity, discrimination, or harm</li>
                    <li style={{fontSize: '16px'}}>Completely fabricated, misleading, or nonsensical information</li>
                  </ul>
                  <p className="mt-2 text-muted-foreground" style={{fontSize: '16px', paddingTop: '10px'}}>
                    If an event is rejected, we'll always include a clear note explaining why. This helps organizers understand what happened and improve future submissions.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
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
                <RichTextEditor
                  content={watch("description") || ""}
                  onChange={(html) => setValue("description", html)}
                  placeholder="Describe your event... Use the toolbar to format text, add lists, and include links."
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="eventImage">Event Image (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Upload a photo or choose from your library
                </p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      id="eventImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                    />
                  </div>
                  {organizer && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImageLibrary(true)}
                      disabled={uploadingImage}
                    >
                      Choose from Library
                    </Button>
                  )}
                </div>
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        setImagePreview("");
                        setImageUrl("");
                      }}
                    >
                      Remove Image
                    </Button>
                  </div>
                )}
              </div>

              <ImageLibraryModal
                open={showImageLibrary}
                onOpenChange={setShowImageLibrary}
                onSelectImage={handleSelectFromLibrary}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date & Time *</Label>
                  <Input id="startDate" type="datetime-local" {...register("startDate")} />
                  {errors.startDate && (
                    <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endDate">End Date (optional - for multi-day events)</Label>
                  <Input id="endDate" type="datetime-local" {...register("endDate")} />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave blank for single-day events
                  </p>
                  {errors.endDate && (
                    <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    When the event happens each day (if multi-day)
                  </p>
                </div>
              </div>

              {/* Recurring Event Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isRecurring"
                    checked={watch("isRecurring") || false}
                    onCheckedChange={(checked) => setValue("isRecurring", !!checked)}
                  />
                  <Label htmlFor="isRecurring" className="font-medium">
                    This is a recurring event
                  </Label>
                </div>

                {watch("isRecurring") && (
                  <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recurrence-frequency">Frequency *</Label>
                        <Select
                          value={watch("recurrenceFrequency") || ""}
                          onValueChange={(value: any) => setValue("recurrenceFrequency", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="recurrence-interval">Every</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="recurrence-interval"
                            type="number"
                            min="1"
                            max="12"
                            defaultValue="1"
                            {...register("recurrenceInterval", { valueAsNumber: true })}
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">
                            {watch("recurrenceFrequency") === "daily" && "day(s)"}
                            {watch("recurrenceFrequency") === "weekly" && "week(s)"}
                            {watch("recurrenceFrequency") === "monthly" && "month(s)"}
                            {!watch("recurrenceFrequency") && "period(s)"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {watch("recurrenceFrequency") === "weekly" && (
                      <div>
                        <Label>Days of Week *</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                            <label key={day} className="flex items-center gap-2 cursor-pointer">
                              <Checkbox
                                checked={(watch("recurrenceDaysOfWeek") || []).includes(index)}
                                onCheckedChange={(checked) => {
                                  const current = watch("recurrenceDaysOfWeek") || [];
                                  if (checked) {
                                    setValue("recurrenceDaysOfWeek", [...current, index]);
                                  } else {
                                    setValue(
                                      "recurrenceDaysOfWeek",
                                      current.filter((d: number) => d !== index)
                                    );
                                  }
                                }}
                              />
                              <span className="text-sm">{day}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recurrence-end-date">End Date</Label>
                        <Input
                          id="recurrence-end-date"
                          type="date"
                          {...register("recurrenceEndDate")}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Leave blank to use occurrence count
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="recurrence-occurrences">Number of Occurrences</Label>
                        <Input
                          id="recurrence-occurrences"
                          type="number"
                          min="1"
                          max="100"
                          placeholder="e.g., 10"
                          {...register("recurrenceOccurrences", { valueAsNumber: true })}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 100 events per submission
                        </p>
                      </div>
                    </div>

                    <RecurringPreview
                      startDate={watch("startDate")}
                      frequency={watch("recurrenceFrequency")}
                      interval={watch("recurrenceInterval") || 1}
                      daysOfWeek={watch("recurrenceDaysOfWeek")}
                      endDate={watch("recurrenceEndDate")}
                      occurrences={watch("recurrenceOccurrences")}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Location</h2>
            <div className="space-y-4">
              {/* Saved Locations Quick Select */}
              {organizer && savedLocations && savedLocations.length > 0 && (
                <div className="bg-muted/50 p-4 rounded-lg border-2 border-dashed border-muted-foreground/20">
                  <Label htmlFor="savedLocation">Quick Fill from Saved Location</Label>
                  <Select
                    value={selectedLocationId?.toString() || "none"}
                    onValueChange={(value) => {
                      if (!value || value === "none") {
                        setSelectedLocationId(null);
                        return;
                      }
                      
                      const locationId = parseInt(value);
                      setSelectedLocationId(locationId);
                      
                      const location = savedLocations.find((loc: any) => loc.id === locationId);
                      if (location) {
                        // Auto-fill all location fields
                        setValue("province", location.province);
                        setValue("municipality", location.municipality);
                        setValue("neighborhoodCommunity", location.neighborhoodCommunity || "");
                        setValue("venue", location.venue || "");
                        setValue("address", location.address || "");
                        setValue("isIndoor", location.isIndoor === 1);
                        setValue("isOutdoor", location.isOutdoor === 1);
                        
                        // Update province/city state for dropdowns
                        setSelectedProvince(location.province);
                        const provinceCode = CANADIAN_PROVINCES.find(p => p.name === location.province)?.code || "";
                        setAvailableCities(CANADIAN_CITIES[provinceCode] || []);
                        
                        // Parse and set accessibility
                        try {
                          const parsedAccessibility = typeof location.accessibility === "string"
                            ? JSON.parse(location.accessibility)
                            : location.accessibility;
                          setAccessibility(parsedAccessibility);
                          
                          // Also set form values for accessibility
                          Object.entries(parsedAccessibility).forEach(([category, fields]: [string, any]) => {
                            if (fields && typeof fields === 'object') {
                              Object.entries(fields).forEach(([field, value]) => {
                                setValue(`accessibility.${category}.${field}` as any, value);
                              });
                            }
                          });
                        } catch (e) {
                          console.error("Failed to parse accessibility", e);
                        }
                        
                        toast.success(`Location details filled from "${location.name}"`);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a saved location..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (enter manually)</SelectItem>
                      {savedLocations.map((location: any) => (
                        <SelectItem key={location.id} value={location.id.toString()}>
                          {location.name} - {location.municipality}, {location.province}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Select a saved location to automatically fill in the location details below. You can still edit them after.
                  </p>
                </div>
              )}
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
                      setValue("municipality", ""); // Reset municipality when province changes
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
                  <Label htmlFor="municipality">City/Town/Municipality *</Label>
                  <Select
                    value={watch("municipality") || ""}
                    onValueChange={(value) => setValue("municipality", value)}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedProvince ? "Select municipality" : "Select province first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((municipality) => (
                        <SelectItem key={municipality} value={municipality}>
                          {municipality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.municipality && <p className="text-sm text-destructive mt-1">{errors.municipality.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="neighborhoodCommunity">Neighborhood</Label>
                <Input id="neighborhoodCommunity" {...register("neighborhoodCommunity")} placeholder="e.g., North End" />
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

                  {costType === "fixed" && (
                    <div>
                      <Label htmlFor="costMin">Price ($)</Label>
                      <Input
                        id="costMin"
                        type="number"
                        step="0.01"
                        {...register("costMin", { valueAsNumber: true })}
                        required
                      />
                    </div>
                  )}

                  {costType === "range" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="costMin">Minimum Cost ($)</Label>
                        <Input
                          id="costMin"
                          type="number"
                          step="0.01"
                          {...register("costMin", { valueAsNumber: true })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="costMax">Maximum Cost ($)</Label>
                        <Input
                          id="costMax"
                          type="number"
                          step="0.01"
                          {...register("costMax", { valueAsNumber: true })}
                          required
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
            <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6">
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Accessibility Information * — Why This Matters
              </h2>
              <p className="text-sm text-muted-foreground mb-2">
                Detailed accessibility information helps families make informed decisions about attending your event. Parents of children with disabilities, sensory sensitivities, or specific needs often rely on this information to know whether they can participate safely and comfortably.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                This section is required, but "Unknown" is always acceptable if you haven't been able to confirm a detail yet or if it can't be verified at this time.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>We strongly prefer "Unknown" over guessing or selecting an option that may not be accurate.</strong>
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                If you select "Unknown," we encourage you to confirm and update the information when and if possible. Accessibility details can often be clarified closer to the event date, and updating them helps families feel more confident about attending.
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Use "Not relevant" for features that don't apply to your venue or event type.
              </p>
              <p className="text-sm text-muted-foreground">
                When your event is published, the Event's Accessibility & Logistics section states that Unknowns are unconfirmed and may be updated at a later date. 

This transparency helps build trust with your community, even if not every detail is available right away.
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
                  {/* Change Table Locations - Dropdown Field */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Change table locations</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">Where are diaper changing tables located? Select the option that best describes availability.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={accessibility.caregiver?.changeTableLocations || "unknown"}
                      onValueChange={(value) => updateAccessibility("caregiver", "changeTableLocations", value as AccessibilityValue)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mens">Men's washroom</SelectItem>
                        <SelectItem value="womens">Women's washroom</SelectItem>
                        <SelectItem value="gender-neutral">Gender-neutral washroom</SelectItem>
                        <SelectItem value="family">Family washroom</SelectItem>
                        <SelectItem value="multiple">Multiple locations</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                        <SelectItem value="not-relevant">Not Relevant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                  {/* Washroom Availability - Multi-Select Checkboxes */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Washroom availability (select all that apply)</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">What types of washrooms are available at this venue? Check all that apply.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="space-y-2 pl-1">
                      {[
                        { value: "mens", label: "Men's washroom" },
                        { value: "womens", label: "Women's washroom" },
                        { value: "gender-neutral", label: "Gender-neutral washroom" },
                        { value: "family", label: "Family washroom" },
                        { value: "wheelchair-accessible", label: "Wheelchair accessible" },
                        { value: "unknown", label: "Unknown" },
                        { value: "not-relevant", label: "Not Relevant" },
                      ].map((option) => {
                        const currentValues = accessibility.mobility?.washroomAvailability || [];
                        const isChecked = Array.isArray(currentValues) && currentValues.includes(option.value as any);
                        
                        return (
                          <div key={option.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`washroom-${option.value}`}
                              checked={isChecked}
                              onChange={(e) => {
                                const currentValues = accessibility.mobility?.washroomAvailability || [];
                                let newValues: any[];
                                
                                if (e.target.checked) {
                                  // Add value
                                  newValues = [...(Array.isArray(currentValues) ? currentValues : []), option.value];
                                } else {
                                  // Remove value
                                  newValues = (Array.isArray(currentValues) ? currentValues : []).filter((v: any) => v !== option.value);
                                }
                                
                                updateAccessibility("mobility", "washroomAvailability", newValues as any);
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor={`washroom-${option.value}`} className="cursor-pointer font-normal text-sm">
                              {option.label}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
                      onValueChange={(value) => updateAccessibility("mobility", "terrainInfo", value as AccessibilityValue)}
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
                      onValueChange={(value) => updateAccessibility("mobility", "parkingDistance", value as AccessibilityValue)}
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

                  {/* Public Transit & Active Transportation */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Closest bus stop distance to entrance</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-sm">How far is the nearest public transit stop from the venue entrance? This helps families who use public transportation.</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Select
                      value={accessibility.mobility?.busStopDistance || "unknown"}
                      onValueChange={(value) => updateAccessibility("mobility", "busStopDistance", value as AccessibilityValue)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bus stop distance" />
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

                  <AccessibilityField
                    category="mobility"
                    field="accessibleSidewalks"
                    label="Accessible sidewalks to venue"
                    tooltip="Are the sidewalks leading to the venue accessible (smooth, curb cuts, well-maintained)?"
                  />

                  <AccessibilityField
                    category="mobility"
                    field="bikeRacks"
                    label="Bike racks available"
                    tooltip="Are there bike racks available near the venue entrance?"
                    showNotRelevant
                  />

                  <AccessibilityField
                    category="mobility"
                    field="coveredBikeParking"
                    label="Covered bike parking"
                    tooltip="Is there covered/sheltered bike parking available?"
                    showNotRelevant
                  />
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
                  <CrowdLevelField />
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
                    field="serviceAnimalsWelcome"
                    label="Service animals welcome"
                    tooltip="Are service animals permitted at this event?"
                  />
                  <AccessibilityField
                    category="social"
                    field="flexibleParticipation"
                    label="Flexible participation"
                    tooltip="Can attendees participate at their own pace or take breaks as needed?"
                  />
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
            <Button 
              type="button" 
              variant="secondary" 
              size="lg" 
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? "Hide Preview" : "Preview Event"}
            </Button>
            {organizer && (
              <Button 
                type="button" 
                variant="outline" 
                size="lg" 
                onClick={() => setShowSaveTemplate(true)}
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={() => navigate("/browse")}>
              Cancel
            </Button>
          </div>
        </form>

        {/* Preview Section */}
        {showPreview && (
          <div className="mt-8">
            <EventPreview 
              data={{
                ...watch(),
                imageUrl: imagePreview || imageUrl,
              }}
              accessibility={accessibility}
            />
          </div>
        )}

        {/* Save Template Dialog */}
        <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save as Template</DialogTitle>
              <DialogDescription>
                Save this event as a template for future use. You can load it later when creating similar events.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="templateName">Template Name *</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Weekly Storytime"
                />
              </div>
              <div>
                <Label htmlFor="templateDescription">Description (Optional)</Label>
                <Textarea
                  id="templateDescription"
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Brief description of this template"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveTemplate}
                disabled={!templateName.trim() || saveTemplateMutation.isPending}
              >
                {saveTemplateMutation.isPending ? "Saving..." : "Save Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <ImageLibraryModal
          open={showImageLibrary}
          onOpenChange={setShowImageLibrary}
          onSelectImage={(url) => {
            setImageUrl(url);
            setImagePreview(url);
            setShowImageLibrary(false);
          }}
        />
      </div>
    </div>
  );
}
