import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AccessibilityData } from "@shared/types";

interface ImportAccessibilitySelectorProps {
  organizerId: number;
  onImport: (accessibility: AccessibilityData) => void;
}

export function ImportAccessibilitySelector({ organizerId, onImport }: ImportAccessibilitySelectorProps) {
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Get organizer's published events
  const { data: events, isLoading } = trpc.events.list.useQuery({
    status: "published",
    limit: 100,
    offset: 0,
  });

  // Filter to only this organizer's events
  const organizerEvents = events?.events?.filter(
    (item: any) => item.event?.organizerId === organizerId
  ).map((item: any) => item.event) || [];

  const handleImport = () => {
    if (!selectedEventId) return;

    const selectedEvent = organizerEvents.find((e: any) => e.id === selectedEventId);
    if (!selectedEvent) return;

    try {
      const accessibility = typeof selectedEvent.accessibility === "string"
        ? JSON.parse(selectedEvent.accessibility)
        : selectedEvent.accessibility;
      
      onImport(accessibility);
    } catch (e) {
      console.error("Failed to parse accessibility data", e);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading your events...</div>;
  }

  if (organizerEvents.length === 0) {
    return (
      <div className="bg-muted/50 p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          You don't have any published events yet. Create an event first, then you can import its accessibility details here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div>
        <Label>Select an event to import accessibility from</Label>
        <Select
          value={selectedEventId?.toString() || ""}
          onValueChange={(value) => setSelectedEventId(parseInt(value))}
        >
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Choose an event..." />
          </SelectTrigger>
          <SelectContent>
            {organizerEvents.map((event: any) => (
              <SelectItem key={event.id} value={event.id.toString()}>
                {event.name} - {new Date(event.startDate).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="button"
        onClick={handleImport}
        disabled={!selectedEventId}
        className="w-full"
      >
        Import Accessibility Details
      </Button>
    </div>
  );
}
