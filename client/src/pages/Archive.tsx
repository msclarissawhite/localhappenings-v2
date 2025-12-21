import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react";
import { format, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { BackToTop } from "@/components/BackToTop";
import { MessageCircle } from "lucide-react";

const EVENTS_PER_PAGE = 20;
const ARCHIVE_CUTOFF_MONTHS = 6; // Hide events older than 6 months

export default function Archive() {
  const [displayedCount, setDisplayedCount] = useState(EVENTS_PER_PAGE);

  const { data: eventsData, isLoading } = trpc.events.list.useQuery({
    showArchived: true,
    sortBy: "latest",
    limit: 1000, // Get all archived events to filter client-side
    offset: 0,
  });

  // Filter to only show past events within the cutoff period
  const filteredEvents = useMemo(() => {
    if (!eventsData?.events) return [];
    
    const now = new Date();
    const cutoffDate = subMonths(now, ARCHIVE_CUTOFF_MONTHS);
    
    return eventsData.events.filter((event) => {
      const eventDate = new Date(event.startDate);
      // Event must be in the past but not older than cutoff
      return eventDate < now && eventDate >= cutoffDate;
    });
  }, [eventsData]);

  // Show only the first displayedCount events
  const displayedEvents = useMemo(() => {
    return filteredEvents.slice(0, displayedCount);
  }, [filteredEvents, displayedCount]);
  
  const hasMore = displayedCount < filteredEvents.length;

  const loadMore = () => {
    setDisplayedCount((prev) => prev + EVENTS_PER_PAGE);
  };

  return (
    <>
    <div className="py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Archive</h1>
          <p className="text-muted-foreground mb-4">
            Browse past events from the last {ARCHIVE_CUTOFF_MONTHS} months. These events have already occurred but remain here for reference.
          </p>
          
          {/* Feedback Encouragement Blurb */}
          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="flex items-start gap-4">
              <MessageCircle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-2">Help Us Improve Event Listings</h3>
                <p className="text-sm text-muted-foreground">
                  Did you attend one of these events? Your feedback is invaluable! Click on any event you attended to review the listing details and let us know if the accessibility information, venue details, or other information was accurate. Your insights help future attendees make informed decisions.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading archived events...</p>
          </div>
        )}

        {!isLoading && filteredEvents.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No archived events found.</p>
          </Card>
        )}

        {!isLoading && filteredEvents.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{filteredEvents.length} archived events</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEvents.map((event) => (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col opacity-75">
                    {event.imageUrl && (
                      <div className="relative h-48 bg-muted">
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground">
                          Past Event
                        </Badge>
                      </div>
                    )}
                    {!event.imageUrl && (
                      <div className="relative h-48 bg-muted flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-muted-foreground" />
                        <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground">
                          Past Event
                        </Badge>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.name}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                        </div>
                        
                        {event.timeOfDay && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 flex-shrink-0" />
                            <span className="capitalize">{event.timeOfDay.replace('-', ' ')}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {event.municipality}, {event.province}
                          </span>
                        </div>
                        
                        {!!event.isFree && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 flex-shrink-0" />
                            <span className="font-medium text-green-600">Free</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        {!!event.familyFriendly && (
                          <Badge variant="secondary" className="text-xs">
                            Family-Friendly
                          </Badge>
                        )}
                        {!!event.youngChildren && (
                          <Badge variant="secondary" className="text-xs">
                            Young Children
                          </Badge>
                        )}
                        {!!event.isIndoor && (
                          <Badge variant="outline" className="text-xs">
                            Indoor
                          </Badge>
                        )}
                        {!!event.isOutdoor && (
                          <Badge variant="outline" className="text-xs">
                            Outdoor
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <Button onClick={loadMore} variant="outline" size="lg">
                  Load More Events
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {displayedEvents.length} of {filteredEvents.length} archived events
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    <BackToTop />
    </>
  );
}
