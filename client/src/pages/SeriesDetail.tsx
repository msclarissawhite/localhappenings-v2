import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export default function SeriesDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();

  const { data: series, isLoading, error } = trpc.series.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading series...</p>
        </div>
      </div>
    );
  }

  if (error || !series) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-2xl font-bold mb-2">Series Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The event series you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/browse")}>
              Browse All Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingEvents = series.events.filter(
    (event: any) => new Date(event.startDate) >= new Date()
  );
  const pastEvents = series.events.filter(
    (event: any) => new Date(event.startDate) < new Date()
  );

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/browse")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Events
      </Button>

      {/* Series Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>Event Series</Badge>
                {series.isActive === 0 && <Badge variant="secondary">Archived</Badge>}
              </div>
              <CardTitle className="text-3xl mb-2">{series.name}</CardTitle>
              {series.description && (
                <CardDescription className="text-base">
                  {series.description}
                </CardDescription>
              )}
            </div>
            {series.imageUrl && (
              <img
                src={series.imageUrl}
                alt={series.name}
                className="w-32 h-32 object-cover rounded-lg ml-4"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{series.events.length} event{series.events.length !== 1 ? 's' : ''} in this series</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            Upcoming Events ({upcomingEvents.length})
          </h2>
          <div className="grid gap-4">
            {upcomingEvents.map((event: any) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)}</span>
                            {event.startDate && (
                              <>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{formatTime(event.startDate)}</span>
                              </>
                            )}
                          </div>
                          {event.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue}, {event.municipality}</span>
                            </div>
                          )}
                        </div>
                        {event.isFree === 1 && (
                          <Badge variant="secondary" className="mt-3">Free</Badge>
                        )}
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">
            Past Events ({pastEvents.length})
          </h2>
          <div className="grid gap-4">
            {pastEvents.map((event: any) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.startDate)}</span>
                            {event.startDate && (
                              <>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{formatTime(event.startDate)}</span>
                              </>
                            )}
                          </div>
                          {event.venue && (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{event.venue}, {event.municipality}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {series.events.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              This series doesn't have any events yet. Check back later!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
