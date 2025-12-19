import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, DollarSign, Users, Info, Shield, Check, X, HelpCircle } from "lucide-react";
import type { AccessibilityValue } from "@shared/types";

interface EventPreviewProps {
  data: {
    name: string;
    description: string;
    province: string;
    city: string;
    neighborhood?: string;
    venue?: string;
    address?: string;
    startDate: string;
    timeOfDay?: string;
    isFree: boolean;
    costMin?: number;
    costMax?: number;
    costType?: string;
    kidsFree: boolean;
    freeCompanion: boolean;
    allAges: boolean;
    familyFriendly: boolean;
    youngChildren: boolean;
    kids: boolean;
    teens: boolean;
    adultsOnly: boolean;
    seniors: boolean;
    isIndoor: boolean;
    isOutdoor: boolean;
    organizerName: string;
    organizerEmail?: string;
    organizerPhone?: string;
    organizerWebsite?: string;
    displayOrganizerInfo: boolean;
    imageUrl?: string;
  };
  accessibility: Record<string, Record<string, AccessibilityValue>>;
}

export function EventPreview({ data, accessibility }: EventPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatCost = () => {
    if (data.isFree) return "Free";
    if (!data.costMin && !data.costMax) return "Cost TBD";
    
    if (data.costType === "donation" || data.costType === "pay-what-you-can") {
      return data.costType === "donation" ? "Donation-based" : "Pay What You Can";
    }
    
    if (data.costMin && data.costMax && data.costMin !== data.costMax) {
      return `$${data.costMin} - $${data.costMax}`;
    }
    
    return `$${data.costMin || data.costMax || 0}`;
  };

  const getAgeGroups = () => {
    const groups = [];
    if (data.allAges) groups.push("All Ages");
    if (data.familyFriendly) groups.push("Family-Friendly");
    if (data.youngChildren) groups.push("Young Children (0-5)");
    if (data.kids) groups.push("Kids (6-12)");
    if (data.teens) groups.push("Teens");
    if (data.adultsOnly) groups.push("Adults Only");
    if (data.seniors) groups.push("Seniors");
    return groups;
  };

  const getAccessibilityIcon = (value: AccessibilityValue) => {
    switch (value) {
      case "yes":
        return <Check className="w-4 h-4 text-green-600" />;
      case "no":
        return <X className="w-4 h-4 text-red-600" />;
      case "unknown":
        return <HelpCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatAccessibilityLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border-l-4 border-primary p-4 rounded">
        <p className="text-sm font-medium flex items-center gap-2">
          <Info className="w-4 h-4" />
          Preview Mode - This is how your event will appear to visitors
        </p>
      </div>

      <Card className="overflow-hidden">
        {data.imageUrl && (
          <div className="w-full h-64 bg-muted">
            <img
              src={data.imageUrl}
              alt={data.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{data.name || "Event Name"}</h1>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {data.description || "Event description will appear here..."}
            </p>
          </div>

          {/* Key Details */}
          <div className="grid md:grid-2 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">When</p>
                <p className="text-sm text-muted-foreground">{formatDate(data.startDate)}</p>
                {data.timeOfDay && (
                  <p className="text-sm text-muted-foreground capitalize">{data.timeOfDay}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Where</p>
                {data.venue && <p className="text-sm">{data.venue}</p>}
                {data.address && <p className="text-sm text-muted-foreground">{data.address}</p>}
                <p className="text-sm text-muted-foreground">
                  {[data.neighborhood, data.city, data.province].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <DollarSign className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Cost</p>
                <p className="text-sm text-muted-foreground">{formatCost()}</p>
                {data.kidsFree && <p className="text-sm text-green-600">Kids attend free</p>}
                {data.freeCompanion && (
                  <p className="text-sm text-green-600">Free companion ticket available</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold">Who Can Attend</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {getAgeGroups().map((group) => (
                    <Badge key={group} variant="secondary" className="text-xs">
                      {group}
                    </Badge>
                  ))}
                  {getAgeGroups().length === 0 && (
                    <p className="text-sm text-muted-foreground">Age groups not specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Environment */}
          {(data.isIndoor || data.isOutdoor) && (
            <div>
              <p className="font-semibold mb-2">Environment</p>
              <div className="flex gap-2">
                {data.isIndoor && <Badge variant="outline">Indoor</Badge>}
                {data.isOutdoor && <Badge variant="outline">Outdoor</Badge>}
              </div>
            </div>
          )}

          {/* Accessibility */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Accessibility Information</h2>
            </div>

            <div className="space-y-4">
              {Object.entries(accessibility).map(([category, features]) => {
                const featureCount = Object.keys(features).length;
                if (featureCount === 0) return null;

                return (
                  <div key={category}>
                    <h3 className="font-semibold capitalize mb-2">
                      {category.replace(/([A-Z])/g, " $1").trim()} Accessibility
                    </h3>
                    <div className="grid gap-2">
                      {Object.entries(features).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          {getAccessibilityIcon(value)}
                          <span className="text-muted-foreground">
                            {formatAccessibilityLabel(key)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Organizer Info */}
          {data.displayOrganizerInfo && (
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Organizer Information</h2>
              <div className="space-y-2">
                <p className="font-medium">{data.organizerName || "Organizer Name"}</p>
                {data.organizerEmail && (
                  <p className="text-sm text-muted-foreground">Email: {data.organizerEmail}</p>
                )}
                {data.organizerPhone && (
                  <p className="text-sm text-muted-foreground">Phone: {data.organizerPhone}</p>
                )}
                {data.organizerWebsite && (
                  <p className="text-sm">
                    <a
                      href={data.organizerWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {data.organizerWebsite}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
