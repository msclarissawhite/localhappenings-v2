import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Edit, Eye, LogOut, MapPinned, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Organizer {
  id: number;
  email: string;
  name: string | null;
}

export default function OrganizerDashboard() {
  const [, navigate] = useLocation();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "locations">("events");

  useEffect(() => {
    // Check if organizer is logged in
    const storedOrganizer = localStorage.getItem("organizer");
    if (!storedOrganizer) {
      navigate("/organizer/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedOrganizer);
      setOrganizer(parsed);
    } catch (error) {
      navigate("/organizer/login");
    }
  }, [navigate]);

  const { data: events, isLoading } = trpc.organizer.getMyEvents.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer }
  );

  const { data: savedLocations, isLoading: locationsLoading, refetch: refetchLocations } = trpc.savedLocations.getAll.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer && activeTab === "locations" }
  );

  const deleteLocationMutation = trpc.savedLocations.delete.useMutation({
    onSuccess: () => {
      toast.success("Location deleted successfully");
      refetchLocations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete location");
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("organizer");
    toast.success("Logged out successfully");
    navigate("/organizer/login");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      pending: { variant: "secondary", label: "Pending Review" },
      published: { variant: "default", label: "Published" },
      rejected: { variant: "destructive", label: "Rejected" },
      "needs-clarification": { variant: "outline", label: "Needs Info" },
    };

    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!organizer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Organizer Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Welcome back, {organizer.name || organizer.email}
              </p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => setActiveTab("events")}
            className="rounded-b-none"
          >
            <Calendar className="w-4 h-4 mr-2" />
            My Events
          </Button>
          <Button
            variant={activeTab === "locations" ? "default" : "ghost"}
            onClick={() => setActiveTab("locations")}
            className="rounded-b-none"
          >
            <MapPinned className="w-4 h-4 mr-2" />
            Saved Locations
          </Button>
        </div>

        {activeTab === "events" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Events</h2>
              <Button onClick={() => navigate("/submit")}>
                Submit New Event
              </Button>
            </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event: any) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{event.name}</h3>
                          {getStatusBadge(event.status)}
                        </div>

                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {event.description}
                        </p>

                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.startDate)}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{event.municipality}, {event.province}</span>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>Submitted {formatDate(event.createdAt)}</span>
                          </div>
                        </div>

                        {event.reviewNotes && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-1">Review Notes:</p>
                            <p className="text-sm text-muted-foreground">{event.reviewNotes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {event.status === "published" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/event/${event.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    )}
                    {(event.status === "published" || event.status === "needs-clarification") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/organizer/edit/${event.id}`)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    You haven't submitted any events yet.
                  </p>
                  <Button onClick={() => navigate("/submit")}>
                    Submit Your First Event
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === "locations" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Saved Locations</h2>
              <Button onClick={() => navigate("/organizer/locations/new")}>
                <Plus className="w-4 h-4 mr-2" />
                Add Location
              </Button>
            </div>

            {locationsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading saved locations...</p>
              </div>
            ) : savedLocations && savedLocations.length > 0 ? (
              <div className="grid gap-4">
                {savedLocations.map((location: any) => (
                  <Card key={location.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{location.name}</h3>
                        
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{location.municipality}, {location.province}</span>
                          </div>
                          
                          {location.venue && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPinned className="w-4 h-4" />
                              <span>{location.venue}</span>
                            </div>
                          )}
                          
                          {location.address && (
                            <div className="col-span-2 text-muted-foreground">
                              {location.address}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 mt-3">
                          {location.isIndoor === 1 && (
                            <Badge variant="secondary">Indoor</Badge>
                          )}
                          {location.isOutdoor === 1 && (
                            <Badge variant="secondary">Outdoor</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/organizer/locations/edit/${location.id}`)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (confirm(`Delete "${location.name}"?`)) {
                              deleteLocationMutation.mutate({
                                id: location.id,
                                organizerId: organizer!.id,
                              });
                            }
                          }}
                          disabled={deleteLocationMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <MapPinned className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">
                    No saved locations yet. Add your frequently used venues to save time when creating events.
                  </p>
                  <Button onClick={() => navigate("/organizer/locations/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Location
                  </Button>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}
