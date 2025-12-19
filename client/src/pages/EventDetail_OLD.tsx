import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Users, Clock, Building, Mail, Phone, Globe, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { AccessibilityData } from "@shared/types";

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
    return <Badge variant="outline">{value}</Badge>;
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

        {/* Event Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.name}</h1>
          <div className="flex flex-wrap gap-3">
            {!!event.isFree && (
              <Badge variant="secondary" className="text-base px-3 py-1">
                FREE
              </Badge>
            )}
            {!!event.familyFriendly && (
              <Badge variant="outline" className="text-base px-3 py-1">
                <Users className="w-4 h-4 mr-1" />
                Family-Friendly
              </Badge>
            )}
            {!!event.youngChildren && <Badge variant="outline" className="text-base px-3 py-1">Ages 0-5</Badge>}
            {!!event.kids && <Badge variant="outline" className="text-base px-3 py-1">Ages 6-12</Badge>}
            {!!event.teens && <Badge variant="outline" className="text-base px-3 py-1">Teens</Badge>}
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
                <Calendar className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">
                    {format(new Date(event.startDate), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  {event.timeOfDay && (
                    <p className="text-sm text-muted-foreground capitalize">
                      {event.timeOfDay.replace("-", " ")}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">Location</p>
                  {event.venue && <p className="text-foreground">{event.venue}</p>}
                  {event.address && <p className="text-muted-foreground">{event.address}</p>}
                  <p className="text-muted-foreground">
                    {event.neighborhood && `${event.neighborhood}, `}
                    {event.city}, {event.province}
                  </p>
                </div>
              </div>

              {(event.isIndoor || event.isOutdoor) && (
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Environment</p>
                    <p className="text-muted-foreground">
                      {[event.isIndoor && "Indoor", event.isOutdoor && "Outdoor"]
                        .filter(Boolean)
                        .join(" & ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Cost */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Cost</h2>
            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary mt-0.5" />
              <div>
                {event.isFree ? (
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
                {!!event.kidsFree && <p className="text-sm text-muted-foreground">Kids attend free</p>}
                {!!event.freeCompanion && (
                  <p className="text-sm text-muted-foreground">Free companion/support worker ticket</p>
                )}
              </div>
            </div>
          </Card>

          {/* Accessibility & Logistics */}
          {accessibility && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Accessibility & Logistics</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Accessibility information helps families plan with confidence. "Unknown" means the organizer hasn't confirmed this detail yet.
              </p>

              <div className="space-y-6">
                {/* Caregiver & Infant */}
                {accessibility.caregiver && Object.keys(accessibility.caregiver).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Caregiver & Infant</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {accessibility.caregiver.changeTablesPresent && (
                        <div className="flex justify-between">
                          <span>Change tables present</span>
                          {renderAccessibilityValue(accessibility.caregiver.changeTablesPresent)}
                        </div>
                      )}
                      {accessibility.caregiver.nursingFriendly && (
                        <div className="flex justify-between">
                          <span>Nursing/breastfeeding friendly</span>
                          {renderAccessibilityValue(accessibility.caregiver.nursingFriendly)}
                        </div>
                      )}
                      {accessibility.caregiver.strollerSpace && (
                        <div className="flex justify-between">
                          <span>Space for strollers</span>
                          {renderAccessibilityValue(accessibility.caregiver.strollerSpace)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Mobility */}
                {accessibility.mobility && Object.keys(accessibility.mobility).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Mobility & Physical Access</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {accessibility.mobility.wheelchairEntrance && (
                        <div className="flex justify-between">
                          <span>Wheelchair accessible entrance</span>
                          {renderAccessibilityValue(accessibility.mobility.wheelchairEntrance)}
                        </div>
                      )}
                      {accessibility.mobility.stepFreeEntry && (
                        <div className="flex justify-between">
                          <span>Step-free entry</span>
                          {renderAccessibilityValue(accessibility.mobility.stepFreeEntry)}
                        </div>
                      )}
                      {accessibility.mobility.accessibleWashrooms && (
                        <div className="flex justify-between">
                          <span>Accessible washrooms</span>
                          {renderAccessibilityValue(accessibility.mobility.accessibleWashrooms)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sensory */}
                {accessibility.sensory && Object.keys(accessibility.sensory).length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Sensory & Neurodivergent</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      {accessibility.sensory.loudNoises && (
                        <div className="flex justify-between">
                          <span>Loud noises expected</span>
                          {renderAccessibilityValue(accessibility.sensory.loudNoises)}
                        </div>
                      )}
                      {accessibility.sensory.flashingLights && (
                        <div className="flex justify-between">
                          <span>Flashing lights</span>
                          {renderAccessibilityValue(accessibility.sensory.flashingLights)}
                        </div>
                      )}
                      {accessibility.sensory.quietRoom && (
                        <div className="flex justify-between">
                          <span>Quiet room/break space</span>
                          {renderAccessibilityValue(accessibility.sensory.quietRoom)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Organizer Info */}
          {(event.organizerName || event.organizerEmail || event.organizerPhone || event.organizerWebsite) && (
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
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${event.organizerEmail}`} className="text-primary hover:underline">
                      {event.organizerEmail}
                    </a>
                  </div>
                )}
                {event.organizerPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${event.organizerPhone}`} className="text-primary hover:underline">
                      {event.organizerPhone}
                    </a>
                  </div>
                )}
                {event.organizerWebsite && (
                  <div className="flex items-center gap-2 text-sm">
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
              <h2 className="text-xl font-semibold mb-3">Additional Notes</h2>
              <p className="text-foreground leading-relaxed">{event.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
