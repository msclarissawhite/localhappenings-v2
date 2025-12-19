import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Edit, Eye, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Organizer {
  id: number;
  email: string;
  name: string | null;
}

export default function OrganizerDashboard() {
  const [, navigate] = useLocation();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

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
                            <span>{event.city}, {event.province}</span>
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
      </div>
    </div>
  );
}
