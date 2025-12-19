import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Users, Clock, Building, Mail, Phone, Globe, ArrowLeft, Share2, Link2, Check } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { AccessibilityData } from "@shared/types";

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
    if (value === "yes") return <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">Yes</Badge>;
    if (value === "no") return <Badge variant="outline">No</Badge>;
    if (value === "not-relevant") return <Badge variant="outline" className="bg-gray-100 text-gray-600">Not Relevant</Badge>;
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
        {/* Back Button */}
        <Link href="/browse">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>

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
            <ShareButtons eventName={event.name} eventId={event.id} />
          </div>
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
            <p className="text-foreground leading-relaxed">{event.description}</p>
          </Card>

          {/* When & Where */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">When & Where</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startDate), "EEEE, MMMM d, yyyy")}
                  </p>
                  {event.endDate && (
                    <p className="text-sm text-muted-foreground">
                      Until {format(new Date(event.endDate), "MMMM d, yyyy")}
                    </p>
                  )}
                  {event.timeOfDay && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {event.timeOfDay.replace("-", " ")}
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
                    {event.neighborhood && `${event.neighborhood}, `}
                    {event.city}, {event.province}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${event.venue || ""} ${event.address || ""} ${event.city} ${event.province}`.trim()
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
          {accessibility && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility & Logistics</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Accessibility information helps families plan with confidence. "Unknown" means the organizer hasn't confirmed this detail yet. "Not Relevant" means this feature doesn't apply to this event.
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
                        label="Change tables in all washrooms" 
                        value={accessibility.caregiver.changeTablesAllWashrooms} 
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
            </Card>
          )}

          {/* Organizer Info */}
          {!!event.displayOrganizerInfo && (event.organizerName || event.organizerEmail || event.organizerPhone || event.organizerWebsite) && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Organizer Information</h2>
              <div className="space-y-3">
                {event.organizerName && (
                  <div>
                    <p className="font-medium">{event.organizerName}</p>
                    {event.organizerType && (
                      <p className="text-sm text-muted-foreground capitalize">
                        {event.organizerType.replace("-", " ")}
                      </p>
                    )}
                  </div>
                )}
                {event.organizerEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${event.organizerEmail}`} className="text-primary hover:underline">
                      {event.organizerEmail}
                    </a>
                  </div>
                )}
                {event.organizerPhone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${event.organizerPhone}`} className="text-primary hover:underline">
                      {event.organizerPhone}
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
          )}

          {/* Additional Notes */}
          {event.notes && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-3">Additional Information</h2>
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">{event.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
