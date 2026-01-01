/**
 * Event Type Migration Tool
 * 
 * Admin interface for bulk reassigning events from deprecated types to specific types
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { toast } from "sonner";

export function EventTypeMigration() {
  const [selectedEvents, setSelectedEvents] = useState<Record<number, number[]>>({});
  const [selectedReplacements, setSelectedReplacements] = useState<Record<number, number[]>>({});
  const [migrating, setMigrating] = useState<number | null>(null);

  // Fetch data
  const { data: suggestions, isLoading: loadingSuggestions } = trpc.eventTypeMigration.getMigrationSuggestions.useQuery();
  const { data: eventsByType, isLoading: loadingEvents, refetch } = trpc.eventTypeMigration.getEventsByDeprecatedTypes.useQuery();
  const { data: usageCounts, isLoading: loadingCounts } = trpc.eventTypeMigration.getDeprecatedTypeUsageCounts.useQuery();

  const migrateMutation = trpc.eventTypeMigration.migrateEvents.useMutation({
    onSuccess: (result, variables) => {
      toast.success(`Migration Successful: Updated ${result.eventsUpdated} events. Removed ${result.typesRemoved} deprecated type, added ${result.typesAdded} new types.`);
      
      // Clear selections for this deprecated type
      setSelectedEvents(prev => {
        const updated = { ...prev };
        delete updated[variables.deprecatedTypeId];
        return updated;
      });
      setSelectedReplacements(prev => {
        const updated = { ...prev };
        delete updated[variables.deprecatedTypeId];
        return updated;
      });
      
      setMigrating(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Migration Failed: ${error.message}`);
      setMigrating(null);
    },
  });

  const handleEventToggle = (deprecatedTypeId: number, eventId: number) => {
    setSelectedEvents(prev => {
      const current = prev[deprecatedTypeId] || [];
      const updated = current.includes(eventId)
        ? current.filter(id => id !== eventId)
        : [...current, eventId];
      return { ...prev, [deprecatedTypeId]: updated };
    });
  };

  const handleSelectAll = (deprecatedTypeId: number, allEventIds: number[]) => {
    setSelectedEvents(prev => ({
      ...prev,
      [deprecatedTypeId]: allEventIds,
    }));
  };

  const handleDeselectAll = (deprecatedTypeId: number) => {
    setSelectedEvents(prev => {
      const updated = { ...prev };
      delete updated[deprecatedTypeId];
      return updated;
    });
  };

  const handleReplacementToggle = (deprecatedTypeId: number, replacementId: number) => {
    setSelectedReplacements(prev => {
      const current = prev[deprecatedTypeId] || [];
      const updated = current.includes(replacementId)
        ? current.filter(id => id !== replacementId)
        : [...current, replacementId];
      return { ...prev, [deprecatedTypeId]: updated };
    });
  };

  const handleMigrate = async (deprecatedTypeId: number) => {
    const eventIds = selectedEvents[deprecatedTypeId] || [];
    const newTypeIds = selectedReplacements[deprecatedTypeId] || [];

    if (eventIds.length === 0) {
      toast.error("No Events Selected: Please select at least one event to migrate.");
      return;
    }

    if (newTypeIds.length === 0) {
      toast.error("No Replacement Types Selected: Please select at least one replacement type.");
      return;
    }

    setMigrating(deprecatedTypeId);
    migrateMutation.mutate({
      eventIds,
      deprecatedTypeId,
      newTypeIds,
    });
  };

  if (loadingSuggestions || loadingEvents || loadingCounts) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!suggestions || !eventsByType || !usageCounts) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Loading Data</AlertTitle>
        <AlertDescription>
          Failed to load migration data. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  // Filter to only show deprecated types that have events
  const deprecatedTypesWithEvents = suggestions.filter(suggestion => {
    const count = usageCounts.find(c => c.typeId === suggestion.deprecatedTypeId);
    return count && count.eventCount > 0;
  });

  if (deprecatedTypesWithEvents.length === 0) {
    return (
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>All Clear!</AlertTitle>
        <AlertDescription>
          No events are currently using deprecated event types. All events have been migrated to specific types.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Event Type Migration</h2>
        <p className="text-muted-foreground mt-1">
          Migrate events from generic deprecated types to specific event types for better categorization.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How This Works</AlertTitle>
        <AlertDescription>
          Select events using deprecated types, choose specific replacement types, and click "Migrate Selected Events" to update them.
          The deprecated type will be removed and replaced with your selected specific types.
        </AlertDescription>
      </Alert>

      {deprecatedTypesWithEvents.map(suggestion => {
        const groupData = eventsByType.find(g => g.deprecatedType.id === suggestion.deprecatedTypeId);
        const events = groupData?.events || [];
        const selectedEventIds = selectedEvents[suggestion.deprecatedTypeId] || [];
        const selectedReplacementIds = selectedReplacements[suggestion.deprecatedTypeId] || [];
        const count = usageCounts.find(c => c.typeId === suggestion.deprecatedTypeId)?.eventCount || 0;
        const isMigrating = migrating === suggestion.deprecatedTypeId;

        return (
          <Card key={suggestion.deprecatedTypeId}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="destructive">Deprecated</Badge>
                    {suggestion.deprecatedTypeName}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    {suggestion.category} • {count} event{count !== 1 ? 's' : ''} using this type
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Migration Note */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>{suggestion.migrationNote}</AlertDescription>
              </Alert>

              {/* Event Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm">
                    Select Events to Migrate ({selectedEventIds.length} of {events.length} selected)
                  </h4>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSelectAll(suggestion.deprecatedTypeId, events.map(e => e.id))}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeselectAll(suggestion.deprecatedTypeId)}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                  {events.map(event => (
                    <label
                      key={event.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedEventIds.includes(event.id)}
                        onCheckedChange={() => handleEventToggle(suggestion.deprecatedTypeId, event.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{event.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString()} • {event.status}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Replacement Type Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">
                  Select Replacement Types ({selectedReplacementIds.length} selected)
                </h4>
                <div className="grid gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                  {suggestion.suggestedReplacements.map(replacement => (
                    <label
                      key={replacement.id}
                      className="flex items-start gap-3 p-2 rounded hover:bg-accent cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedReplacementIds.includes(replacement.id)}
                        onCheckedChange={() => handleReplacementToggle(suggestion.deprecatedTypeId, replacement.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{replacement.name}</div>
                        <div className="text-xs text-muted-foreground">{replacement.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Migrate Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => handleMigrate(suggestion.deprecatedTypeId)}
                  disabled={isMigrating || selectedEventIds.length === 0 || selectedReplacementIds.length === 0}
                >
                  {isMigrating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Migrate Selected Events
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
