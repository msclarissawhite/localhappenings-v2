import { useRoute } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sanitizeHtml } from "@/lib/sanitize";
import { Streamdown } from "streamdown";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Users, Clock, Building, Mail, Phone, Globe, ArrowLeft, Share2, Link2, Check, ShieldCheck, Bookmark, BookmarkCheck, Edit } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { AccessibilityData } from "@shared/types";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserAuth } from "@/hooks/useUserAuth";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FeedbackForm } from "@/components/FeedbackForm";
import { EventTypeTags } from "@/components/EventTypeTags";

// Bookmark Button Component
function BookmarkButton({ eventId }: { eventId: number }) {
  // Check both authentication methods: Manus OAuth (organizers) and magic link (users)
  const organizerAuth = useAuth();
  const userAuth = useUserAuth();
  
  // Use whichever authentication is active
  const user = organizerAuth.user || userAuth.user;
  const isAuthenticated = organizerAuth.isAuthenticated || userAuth.isAuthenticated;
  
  const [showDialog, setShowDialog] = useState(false);
  const [reminderPref, setReminderPref] = useState<"none" | "24h" | "48h" | "both">("24h");
  const utils = trpc.useUtils();

  const { data: isSaved } = trpc.savedEvents.isSaved.useQuery(
    { eventId },
    { enabled: !!user }
  );

  const saveMutation = trpc.savedEvents.save.useMutation({
    onSuccess: () => {
      utils.savedEvents.isSaved.invalidate({ eventId });
      utils.savedEvents.list.invalidate();
      setShowDialog(false);
      toast.success("Event saved! You'll receive email reminders based on your preference.");
    },
  });

  const unsaveMutation = trpc.savedEvents.unsave.useMutation({
    onSuccess: () => {
      utils.savedEvents.isSaved.invalidate({ eventId });
      utils.savedEvents.list.invalidate();
      toast.success("Event removed from your saved list.");
    },
  });

  const handleClick = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save events and receive reminders");
      window.location.href = userAuth.getLoginUrl();
      return;
    }

    if (isSaved) {
      unsaveMutation.mutate({ eventId });
    } else {
      setShowDialog(true);
    }
  };

  const handleSave = () => {
    saveMutation.mutate({ eventId, reminderPreference: reminderPref });
  };

  return (
    <>
      <Button
        variant={isSaved ? "default" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={saveMutation.isPending || unsaveMutation.isPending}
        className="gap-2"
      >
        {isSaved ? (
          <>
            <BookmarkCheck className="h-4 w-4" />
            Saved
          </>
        ) : (
          <>
            <Bookmark className="h-4 w-4" />
            Save Event
          </>
        )}
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Event & Set Reminder</DialogTitle>
            <DialogDescription>
              Choose when you'd like to receive email reminders for this event.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <RadioGroup value={reminderPref} onValueChange={(v) => setReminderPref(v as typeof reminderPref)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h" className="font-normal cursor-pointer">
                  24 hours before the event
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="48h" id="48h" />
                <Label htmlFor="48h" className="font-normal cursor-pointer">
                  48 hours (2 days) before the event
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="both" />
                <Label htmlFor="both" className="font-normal cursor-pointer">
                  Both 24 and 48 hours before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="none" />
                <Label htmlFor="none" className="font-normal cursor-pointer">
                  No reminders (just save the event)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              Save Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Share Buttons Component
function ShareButtons({ eventName, eventId }: { eventName: string; eventId: number }) {
  const [copied, setCopied] = useState(false);
  const eventUrl = `${window.location.origin}/event/${eventId}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(eventName)}&url=${encodeURIComponent(eventUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyToClipboard}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4" />
            Copy Link
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareToFacebook}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Facebook
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={shareToTwitter}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Twitter
      </Button>
    </div>
  );
}

export default function EventDetail() {
  const [, params] = useRoute("/event/:id");
  const eventId = params?.id ? parseInt(params.id) : 0;
  const [, navigate] = useLocation();
  
  // Check if user is an organizer
  const { user: organizer, isAuthenticated: isOrganizer } = useAuth();

  const { data: event, isLoading, error } = trpc.events.getById.useQuery({ id: eventId });

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="container text-center">
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="py-16">
        <div className="container text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist or has been removed.</p>
          <Link href="/browse">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  let accessibility: AccessibilityData | null = null;
  try {
    accessibility = JSON.parse(event.accessibility);
  } catch (e) {
    console.error("Failed to parse accessibility data", e);
  }

  const renderAccessibilityValue = (value?: string) => {
    if (!value || value === "unknown") return <Badge variant="outline">Unknown</Badge>;
    // Use muted green for "yes" - accessible and calm
    if (value === "yes") return <Badge variant="secondary" className="bg-emerald-50 text-emerald-800 border-emerald-200">Yes</Badge>;
    if (value === "no") return <Badge variant="outline">No</Badge>;
    if (value === "not-relevant") return <Badge variant="outline" className="bg-gray-50 text-gray-700">Not Relevant</Badge>;
    // For special values like terrain and crowd level
    return <Badge variant="outline" className="capitalize">{value}</Badge>;
  };

  // Helper to render accessibility field row
  const AccessibilityRow = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-center py-2 border-b last:border-0">
        <span className="text-sm">{label}</span>
        {renderAccessibilityValue(value)}
      </div>
    );
  };

  return (
    <div className="py-8">
      <div className="container max-w-4xl">
        {/* Back Buttons */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/browse">
            <Button variant="ghost">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </Link>
          
          {/* Show Back to Dashboard for organizers */}
          {isOrganizer && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/organizer/dashboard")}
              className="ml-auto"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </div>

        {/* Event Image */}
        {event.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl font-bold flex-1">{event.name}</h1>
            <div className="flex items-center gap-2">
              {organizer?.role === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/admin/edit-event/${event.id}`)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Admin Edit
                </Button>
              )}
              <BookmarkButton eventId={event.id} />
              <ShareButtons eventName={event.name} eventId={event.id} />
            </div>
          </div>
          
          {/* Event Type Tags */}
          {(event as any).eventTypes && (event as any).eventTypes.length > 0 && (
            <div className="mb-4">
              <EventTypeTags eventTypes={(event as any).eventTypes} />
            </div>
          )}
          
          <div className="flex flex-wrap gap-3">
            {!!event.isFree && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                FREE
              </Badge>
            )}
            {!!event.allAges && <Badge variant="outline" className="text-base px-3 py-1">All Ages</Badge>}
            {!!event.familyFriendly && (
              <Badge variant="outline" className="text-base px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                Family-Friendly
              </Badge>
            )}
            {!!event.youngChildren && <Badge variant="outline" className="text-base px-3 py-1">Ages 0-5</Badge>}
            {!!event.kids && <Badge variant="outline" className="text-base px-3 py-1">Ages 6-12</Badge>}
            {!!event.teens && <Badge variant="outline" className="text-base px-3 py-1">Teens</Badge>}
            {!!event.adultsOnly && <Badge variant="outline" className="text-base px-3 py-1">Adults Only</Badge>}
            {!!event.seniors && <Badge variant="outline" className="text-base px-3 py-1">Seniors</Badge>}
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What It Is */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-3">What It Is</h2>
            <div className="prose prose-sm max-w-none text-foreground leading-relaxed">
              <Streamdown>{event.description}</Streamdown>
            </div>
          </Card>

          {/* When & Where */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">When & Where</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {event.endDate && event.endDate !== event.startDate
                      ? `${format(new Date(event.startDate), "MMMM d")} - ${format(new Date(event.endDate), "MMMM d, yyyy")}`
                      : format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                  </p>
                  {event.endDate && event.endDate !== event.startDate && (() => {
                    const days = Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <p className="text-sm text-muted-foreground">
                        {days}-day event
                      </p>
                    );
                  })()}
                  {event.timeOfDay && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {event.timeOfDay.replace("-", " ")}
                      {event.endDate && event.endDate !== event.startDate && " (each day)"}
                    </p>
                  )}
                  {event.isRecurring && event.recurrenceType && (
                    <p className="text-sm text-muted-foreground capitalize">
                      Recurring: {event.recurrenceType.replace("-", " ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  {event.venue && <p className="font-medium">{event.venue}</p>}
                  {event.address && <p className="text-sm">{event.address}</p>}
                  <p className="text-sm">
                    {event.neighborhoodCommunity && `${event.neighborhoodCommunity}, `}
                    {event.municipality}, {event.province}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${event.venue || ""} ${event.address || ""} ${event.municipality} ${event.province}`.trim()
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    <MapPin className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                </div>
              </div>

              {!!event.isIndoor && (
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm">Indoor event</span>
                </div>
              )}
              {!!event.isOutdoor && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">Outdoor event</span>
                </div>
              )}
            </div>
          </Card>

          {/* Cost */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                {!!event.isFree ? (
                  <p className="text-lg font-medium text-accent">FREE</p>
                ) : (
                  <>
                    {event.costMin !== null && event.costMax !== null ? (
                      <p className="text-lg font-medium">
                        ${(event.costMin / 100).toFixed(2)} - ${(event.costMax / 100).toFixed(2)}
                      </p>
                    ) : event.costMin !== null ? (
                      <p className="text-lg font-medium">${(event.costMin / 100).toFixed(2)}</p>
                    ) : (
                      <p className="text-muted-foreground">Cost not specified</p>
                    )}
                  </>
                )}
              </div>
              {event.costType && event.costType !== "fixed" && event.costType !== "range" && (
                <p className="text-sm text-muted-foreground capitalize pl-8">
                  {event.costType.replace("-", " ")}
                </p>
              )}
              {!!event.kidsFree && <p className="text-sm text-muted-foreground pl-8">Kids attend free</p>}
              {!!event.freeCompanion && (
                <p className="text-sm text-muted-foreground pl-8">Free companion/support worker ticket</p>
              )}
            </div>
          </Card>

          {/* Accessibility & Logistics - COMPREHENSIVE */}
          {true && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility & Logistics</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Accessibility information helps families plan with confidence.
                <br />
                "Unknown" means this detail hasn't been confirmed yet or couldn't be verified at the time of posting. Organizers may update this information as details are confirmed.
                <br />
                "Not relevant" means the feature doesn't apply to this event.
              </p>

              <div className="space-y-6">
                {/* Caregiver & Infant - ALL 8 FIELDS */}
                {accessibility.caregiver && Object.keys(accessibility.caregiver).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Caregiver & Infant</h3>
                    <div className="space-y-1">
                      <AccessibilityRow 
                        label="Change tables present" 
                        value={accessibility.caregiver.changeTablesPresent} 
                      />
                      <AccessibilityRow 
                        label="Change table locations" 
                        value={accessibility.caregiver.changeTableLocations} 
                      />
                      <AccessibilityRow 
                        label="Nursing/breastfeeding friendly" 
                        value={accessibility.caregiver.nursingFriendly} 
                      />
                      <AccessibilityRow 
                        label="Private feeding area available" 
                        value={accessibility.caregiver.privateFeedingArea} 
                      />
                      <AccessibilityRow 
                        label="Bottle warming available" 
                        value={accessibility.caregiver.bottleWarming} 
                      />
                      <AccessibilityRow 
                        label="High chairs available" 
                        value={accessibility.caregiver.highChairs} 
                      />
                      <AccessibilityRow 
                        label="Space for strollers" 
                        value={accessibility.caregiver.strollerSpace} 
                      />
                      <AccessibilityRow 
                        label="Bag/coat storage" 
                        value={accessibility.caregiver.storage} 
                      />
                    </div>
                  </div>
                )}

                {/* Mobility & Physical Access - ALL 10 FIELDS */}
                {accessibility.mobility && Object.keys(accessibility.mobility).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Mobility & Physical Access</h3>
                    <div className="space-y-1">
                      <AccessibilityRow 
                        label="Stroller accessible" 
                        value={accessibility.mobility.strollerAccessible} 
                      />
                      <AccessibilityRow 
                        label="Wheelchair accessible entrance" 
                        value={accessibility.mobility.wheelchairEntrance} 
                      />
                      <AccessibilityRow 
                        label="Step-free entry" 
                        value={accessibility.mobility.stepFreeEntry} 
                      />
                      <AccessibilityRow 
                        label="Elevator access" 
                        value={accessibility.mobility.elevatorAccess} 
                      />
                      <AccessibilityRow 
                        label="Wide doorways (32 inches+ clear width)" 
                        value={accessibility.mobility.wideDoorways} 
                      />
                      <AccessibilityRow 
                        label="Accessible seating" 
                        value={accessibility.mobility.accessibleSeating} 
                      />
                      <AccessibilityRow 
                        label="Accessible washrooms" 
                        value={accessibility.mobility.accessibleWashrooms} 
                      />
                      {/* Washroom Availability - Array Display */}
                      {accessibility.mobility.washroomAvailability && Array.isArray(accessibility.mobility.washroomAvailability) && accessibility.mobility.washroomAvailability.length > 0 && (
                        <div className="flex justify-between items-center py-2 border-b last:border-0">
                          <span className="text-sm">Washroom availability</span>
                          <span className="text-sm font-medium text-right">
                            {accessibility.mobility.washroomAvailability
                              .map((type: string) => {
                                const labels: Record<string, string> = {
                                  "mens": "Men's",
                                  "womens": "Women's",
                                  "gender-neutral": "Gender-neutral",
                                  "family": "Family",
                                  "wheelchair-accessible": "Wheelchair accessible",
                                  "unknown": "Unknown",
                                  "not-relevant": "Not relevant"
                                };
                                return labels[type] || type;
                              })
                              .join(", ")}
                          </span>
                        </div>
                      )}
                      <AccessibilityRow 
                        label="Accessible parking nearby" 
                        value={accessibility.mobility.accessibleParking} 
                      />
                      <AccessibilityRow 
                        label="Terrain type" 
                        value={accessibility.mobility.terrainInfo} 
                      />
                      <AccessibilityRow 
                        label="Parking distance to entrance" 
                        value={accessibility.mobility.parkingDistance} 
                      />
                      <AccessibilityRow 
                        label="Bus stop distance to entrance" 
                        value={accessibility.mobility.busStopDistance} 
                      />
                      <AccessibilityRow 
                        label="Accessible sidewalks to venue" 
                        value={accessibility.mobility.accessibleSidewalks} 
                      />
                      <AccessibilityRow 
                        label="Bike racks available" 
                        value={accessibility.mobility.bikeRacks} 
                      />
                      <AccessibilityRow 
                        label="Covered bike parking" 
                        value={accessibility.mobility.coveredBikeParking} 
                      />
                    </div>
                  </div>
                )}

                {/* Sensory & Neurodivergent - ALL 8 FIELDS */}
                {accessibility.sensory && Object.keys(accessibility.sensory).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Sensory & Neurodivergent</h3>
                    <div className="space-y-1">
                      <AccessibilityRow 
                        label="Sensory-friendly environment" 
                        value={accessibility.sensory.sensoryFriendly} 
                      />
                      <AccessibilityRow 
                        label="Quiet environment" 
                        value={accessibility.sensory.quietEnvironment} 
                      />
                      <AccessibilityRow 
                        label="Loud noises expected" 
                        value={accessibility.sensory.loudNoises} 
                      />
                      <AccessibilityRow 
                        label="Flashing lights" 
                        value={accessibility.sensory.flashingLights} 
                      />
                      <AccessibilityRow 
                        label="Crowd level" 
                        value={accessibility.sensory.crowdLevel} 
                      />
                      <AccessibilityRow 
                        label="Quiet room/break space available" 
                        value={accessibility.sensory.quietRoom} 
                      />
                      <AccessibilityRow 
                        label="Sensory-friendly time slot available" 
                        value={accessibility.sensory.sensoryTimeSlot} 
                      />
                      <AccessibilityRow 
                        label="Predictable schedule/routine" 
                        value={accessibility.sensory.predictableSchedule} 
                      />
                    </div>
                  </div>
                )}

                {/* Cognitive & Communication - ALL 6 FIELDS */}
                {accessibility.cognitive && Object.keys(accessibility.cognitive).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Cognitive & Communication</h3>
                    <div className="space-y-1">
                      <AccessibilityRow 
                        label="Clear signage" 
                        value={accessibility.cognitive.clearSignage} 
                      />
                      <AccessibilityRow 
                        label="Simple instructions provided" 
                        value={accessibility.cognitive.simpleInstructions} 
                      />
                      <AccessibilityRow 
                        label="Written materials available" 
                        value={accessibility.cognitive.writtenMaterials} 
                      />
                      <AccessibilityRow 
                        label="ASL interpretation available" 
                        value={accessibility.cognitive.aslInterpretation} 
                      />
                      <AccessibilityRow 
                        label="Live captions/subtitles" 
                        value={accessibility.cognitive.liveCaptions} 
                      />
                      <AccessibilityRow 
                        label="Multilingual support" 
                        value={accessibility.cognitive.multilingualSupport} 
                      />
                    </div>
                  </div>
                )}

                {/* Social & Emotional - ALL 7 FIELDS */}
                {accessibility.social && Object.keys(accessibility.social).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3 text-lg">Social & Emotional</h3>
                    <div className="space-y-1">
                      <AccessibilityRow 
                        label="Service animals welcome" 
                        value={accessibility.social.serviceAnimalsWelcome} 
                      />
                      <AccessibilityRow 
                        label="Flexible participation" 
                        value={accessibility.social.flexibleParticipation} 
                      />
                      <AccessibilityRow 
                        label="Gender-neutral washrooms" 
                        value={accessibility.social.genderNeutralWashrooms} 
                      />
                      <AccessibilityRow 
                        label="LGBTQIA+ friendly" 
                        value={accessibility.social.lgbtqiaFriendly} 
                      />
                      <AccessibilityRow 
                        label="Mask-friendly" 
                        value={accessibility.social.maskFriendly} 
                      />
                      <AccessibilityRow 
                        label="Scent-free environment" 
                        value={accessibility.social.scentFree} 
                      />
                      <AccessibilityRow 
                        label="Alcohol-free" 
                        value={accessibility.social.alcoholFree} 
                      />
                      <AccessibilityRow 
                        label="Substance-free" 
                        value={accessibility.social.substanceFree} 
                      />
                      <AccessibilityRow 
                        label="Trauma-informed approach" 
                        value={accessibility.social.traumaInformed} 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Show message if no accessibility data at all */}
              {!accessibility && (
                <div className="text-sm text-muted-foreground italic mt-4">
                  Accessibility information not available for this event. Please contact the organizer for specific accessibility details.
                </div>
              )}
            </Card>
          )}

          {/* Contact Info */}
          {!!event.displayOrganizerInfo && (() => {
            // Use public contact if provided, otherwise fall back to organizer contact
            const displayName = event.publicContactName || event.organizerName;
            const displayEmail = event.publicContactEmail || event.organizerEmail;
            const displayPhone = event.publicContactPhone || event.organizerPhone;
            const hasContact = displayName || displayEmail || displayPhone || event.organizerWebsite;
            
            if (!hasContact) return null;
            
            return (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {displayName && (
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{displayName}</p>
                        {event.organizerIsVerified && (
                          <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      {event.organizerType && (
                        <p className="text-sm text-muted-foreground capitalize">
                          {event.organizerType.replace("-", " ")}
                        </p>
                      )}
                    </div>
                  )}
                  {displayEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${displayEmail}`} className="text-primary hover:underline">
                        {displayEmail}
                      </a>
                    </div>
                  )}
                  {displayPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${displayPhone}`} className="text-primary hover:underline">
                        {displayPhone}
                      </a>
                    </div>
                  )}
                  {event.organizerWebsite && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={event.organizerWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit website
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            );
          })()}

          {/* Additional Notes */}
          {event.notes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">Additional Information</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{event.notes}</p>
            </Card>
          )}

          {/* Post-Event Feedback - Show after event ends */}
          {new Date(event.endDate || event.startDate) < new Date() && (
            <FeedbackForm eventId={event.id} eventName={event.name} />
          )}
        </div>
      </div>
    </div>
  );
}
