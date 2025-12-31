import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Edit, Eye, LogOut, MapPinned, Plus, Trash2, Copy, Bookmark, DollarSign, Image, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { MyImages } from "@/components/MyImages";
import { EventTemplates } from "@/components/EventTemplates";

interface Organizer {
  id: number;
  email: string;
  name: string | null;
}

// Saved Events Content Component
function SavedEventsContent({ organizerId }: { organizerId: number }) {
  const utils = trpc.useUtils();
  const [, navigate] = useLocation();

  const { data: savedEvents, isLoading } = trpc.savedEvents.list.useQuery();

  const unsaveMutation = trpc.savedEvents.unsave.useMutation({
    onSuccess: () => {
      utils.savedEvents.list.invalidate();
      toast.success("Event removed from your saved list");
    },
  });

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Time TBA";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getReminderBadge = (pref: string) => {
    const labels: Record<string, string> = {
      none: "No Reminders",
      "24h": "24h Reminder",
      "48h": "48h Reminder",
      both: "24h & 48h Reminders",
    };
    return labels[pref] || "No Reminders";
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading your saved events...</p>
      </div>
    );
  }

  if (!savedEvents || savedEvents.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-4">
          <Bookmark className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-semibold">No saved events yet</h3>
          <p className="text-muted-foreground">
            Browse events and click the bookmark icon to save them here. You'll receive email reminders before events start!
          </p>
          <Button onClick={() => navigate("/browse")}>
            Browse Events
          </Button>
        </div>
      </Card>
    );
  }

  const upcomingEvents = savedEvents.filter(
    (event) => new Date(event.startDate) >= new Date()
  );
  const pastEvents = savedEvents.filter(
    (event) => new Date(event.startDate) < new Date()
  );

  return (
    <div className="space-y-8">
      {upcomingEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Upcoming Events ({upcomingEvents.length})</h3>
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold mb-2">{event.name}</h4>
                    <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                    
                    <div className="grid md:grid-cols-2 gap-3 text-sm mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(event.startDate ? new Date(event.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : null)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{event.municipality}, {event.province}</span>
                      </div>
                      {event.isFree && (
                        <div className="flex items-center gap-2 text-green-600">
                          <DollarSign className="w-4 h-4" />
                          <span>Free Event</span>
                        </div>
                      )}
                    </div>
                    
                    <Badge variant="secondary" className="text-xs">
                      {getReminderBadge(event.reminderPreference)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/event/${event.id}`)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => unsaveMutation.mutate({ eventId: event.id })}
                      disabled={unsaveMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {pastEvents.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Past Events ({pastEvents.length})</h3>
          <div className="grid gap-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="p-6 opacity-60">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold mb-2">{event.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(event.startDate)}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unsaveMutation.mutate({ eventId: event.id })}
                    disabled={unsaveMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrganizerDashboard() {
  const [, navigate] = useLocation();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "locations" | "contacts" | "saved" | "images" | "templates">("events");

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

  const { data: events, isLoading, refetch } = trpc.organizer.getMyEvents.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer }
  );

  const { data: savedLocations, isLoading: locationsLoading, refetch: refetchLocations } = trpc.savedLocations.getAll.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer && activeTab === "locations" }
  );

  const setDefaultMutation = trpc.savedLocations.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default location updated");
      refetchLocations();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default location");
    },
  });

  const closeEventMutation = trpc.organizer.closeEvent.useMutation({
    onSuccess: () => {
      toast.success("Event closed successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to close event");
    },
  });

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

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
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
          <Button
            variant={activeTab === "contacts" ? "default" : "ghost"}
            onClick={() => setActiveTab("contacts")}
            className="rounded-b-none"
          >
            <Save className="w-4 h-4 mr-2" />
            Contact Templates
          </Button>
          <Button
            variant={activeTab === "saved" ? "default" : "ghost"}
            onClick={() => setActiveTab("saved")}
            className="rounded-b-none"
          >
            <Bookmark className="w-4 h-4 mr-2" />
            Saved Events
          </Button>
          <Button
            variant={activeTab === "images" ? "default" : "ghost"}
            onClick={() => setActiveTab("images")}
            className="rounded-b-none"
          >
            <Image className="w-4 h-4 mr-2" />
            My Images
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
                          {event.hasUnreviewedEdit === 1 && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                              Edit Pending Review
                            </Badge>
                          )}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Store event data for copying
                        localStorage.setItem("copyEventData", JSON.stringify(event));
                        navigate("/submit");
                        toast.success(`Copying "${event.name}" - update the date and submit`);
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
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
                    {event.status === "published" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm("Are you sure you want to close this event? It will no longer appear in public listings.")) {
                            closeEventMutation.mutate({ eventId: event.id, organizerId: organizer!.id });
                          }
                        }}
                        disabled={closeEventMutation.isPending}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Close Event
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

        {activeTab === "saved" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">My Saved Events</h2>
              <Button onClick={() => navigate("/browse")}>
                Browse Events
              </Button>
            </div>
            <SavedEventsContent organizerId={organizer.id} />
          </>
        )}

        {activeTab === "images" && <MyImages />}
        {activeTab === "templates" && <EventTemplates />}

        {activeTab === "contacts" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Contact Templates</h2>
              <Button onClick={() => navigate("/organizer/contact-templates")}>
                Manage Templates
              </Button>
            </div>
            <p className="text-muted-foreground">
              Save and reuse contact information for event submissions. Visit the management page to create, edit, and organize your templates.
            </p>
          </div>
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
                          {location.isDefault === 1 && (
                            <Badge variant="default" className="bg-green-600">Default Location</Badge>
                          )}
                          {location.isIndoor === 1 && (
                            <Badge variant="secondary">Indoor</Badge>
                          )}
                          {location.isOutdoor === 1 && (
                            <Badge variant="secondary">Outdoor</Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        {location.isDefault !== 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDefaultMutation.mutate({
                                id: location.id,
                                organizerId: organizer!.id,
                              });
                            }}
                            disabled={setDefaultMutation.isPending}
                          >
                            Set as Default
                          </Button>
                        )}
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
