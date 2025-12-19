import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, MapPin, Clock, DollarSign } from "lucide-react";
import { format } from "date-fns";

export default function Archive() {
  const { data: events, isLoading } = trpc.events.list.useQuery({
    showArchived: true,
    sortBy: "latest",
  });

  // Filter to only show past events
  const pastEvents = events?.filter((event) => new Date(event.startDate) < new Date()) || [];

  return (
    <div className="py-12">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Event Archive</h1>
          <p className="text-muted-foreground">
            Browse past events from our community. These events have already occurred but remain here for reference.
          </p>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading archived events...</p>
          </div>
        )}

        {!isLoading && pastEvents.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No archived events found.</p>
          </Card>
        )}

        {!isLoading && pastEvents.length > 0 && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">{pastEvents.length} archived events</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event) => (
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
          </div>
        )}
      </div>
    </div>
  );
}
