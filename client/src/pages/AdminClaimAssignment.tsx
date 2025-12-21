import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Copy, Mail, Check, Search } from "lucide-react";

export function AdminClaimAssignment() {
  const [organizerEmail, setOrganizerEmail] = useState("");
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [claimUrl, setClaimUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMunicipality, setFilterMunicipality] = useState<string>("all");

  // Get all unclaimed published events
  const { data: unclaimedEvents, isLoading } = trpc.claim.getUnclaimedEvents.useQuery();

  const createClaimMutation = trpc.claim.createClaimToken.useMutation({
    onSuccess: (data) => {
      setClaimUrl(data.claimUrl);
      toast.success(`Claim link created! Assigned ${data.eventCount} events to ${organizerEmail}`);
      setSelectedEventIds([]);
    },
    onError: (error) => {
      toast.error(`Error creating claim link: ${error.message}`);
    },
  });

  const handleCreateClaim = () => {
    if (!organizerEmail || selectedEventIds.length === 0) {
      toast.error("Please enter an email and select at least one event");
      return;
    }

    createClaimMutation.mutate({
      organizerEmail,
      eventIds: selectedEventIds,
    });
  };

  const handleToggleEvent = (eventId: number) => {
    setSelectedEventIds((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(claimUrl);
    toast.success("Claim URL copied to clipboard");
  };

  // Events are already filtered on the backend
  const allEvents = unclaimedEvents || [];
  
  // Get unique municipalities for filter
  const municipalities = Array.from(new Set(allEvents.map(e => e.municipality))).sort();
  
  // Apply search and filter
  const eventsToAssign = allEvents.filter(event => {
    const matchesSearch = searchQuery === "" || 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.municipality.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMunicipality = filterMunicipality === "all" || event.municipality === filterMunicipality;
    
    return matchesSearch && matchesMunicipality;
  });

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Assign Events to Organizer</h1>
        <p className="text-muted-foreground">
          Create a claim link to assign pre-seeded events to an organizer. They'll receive a magic link to claim ownership.
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Organizer Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="organizer@example.com"
              value={organizerEmail}
              onChange={(e) => setOrganizerEmail(e.target.value)}
            />
          </div>

          <div>
            <Label>Search and Filter Events</Label>
            <div className="flex gap-2 mt-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, venue, or municipality..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <select
                value={filterMunicipality}
                onChange={(e) => setFilterMunicipality(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Municipalities</option>
                {municipalities.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Select Events to Assign ({selectedEventIds.length} selected, {eventsToAssign.length} shown)</Label>
            <div className="mt-2 max-h-96 overflow-y-auto border rounded-md p-4 space-y-2">
              {isLoading && <p className="text-sm text-muted-foreground">Loading events...</p>}
              
              {eventsToAssign && eventsToAssign.length === 0 && (
                <p className="text-sm text-muted-foreground">No unclaimed events available</p>
              )}

              {eventsToAssign.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded">
                  <Checkbox
                    checked={selectedEventIds.includes(event.id)}
                    onCheckedChange={() => handleToggleEvent(event.id)}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.municipality} • {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCreateClaim}
            disabled={!organizerEmail || selectedEventIds.length === 0 || createClaimMutation.isPending}
            className="w-full"
          >
            {createClaimMutation.isPending ? "Creating..." : "Create Claim Link"}
          </Button>
        </div>
      </Card>

      {claimUrl && (
        <Card className="p-6 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3 mb-4">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-900 dark:text-green-100">Claim Link Created!</h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Send this link to {organizerEmail} to claim their events
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={claimUrl}
              readOnly
              className="font-mono text-sm bg-white dark:bg-gray-900"
            />
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded border">
            <p className="text-sm font-medium mb-2">Email template:</p>
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Subject:</strong> Claim your event listings on Local Happenings</p>
              <p><strong>Body:</strong></p>
              <div className="pl-4 border-l-2 border-muted">
                <p>Hi,</p>
                <p className="mt-2">
                  I've added your events to Local Happenings, a platform helping Nova Scotia families find accessible events. 
                  Click the link below to claim your listings:
                </p>
                <p className="mt-2 font-mono text-xs bg-muted p-2 rounded">{claimUrl}</p>
                <p className="mt-2">
                  Once claimed, you can update details, add future events, and get verified status for instant publishing.
                </p>
                <p className="mt-2">Best regards</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
