import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, MapPin, DollarSign, Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function CollectionPage() {
  const { slug } = useParams();
  const [, navigate] = useLocation();
  
  const { data: collection, isLoading: collectionLoading } = trpc.collections.getBySlug.useQuery({ slug: slug! });
  
  // Build filter params from collection
  const filterParams = {
    eventTypeIds: collection?.eventTypeIds || [],
    provinces: collection?.provinces || [],
    municipalities: collection?.municipalities || [],
    startDate: collection?.startDate ? new Date(collection.startDate).toISOString() : undefined,
    endDate: collection?.endDate ? new Date(collection.endDate).toISOString() : undefined,
  };
  
  const { data: events = [], isLoading: eventsLoading } = trpc.events.list.useQuery(filterParams, {
    enabled: !!collection,
  });
  
  if (collectionLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">Loading collection...</div>
      </div>
    );
  }
  
  if (!collection) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The collection you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section
        className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-accent/10"
        style={collection.imageUrl ? {
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${collection.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="container">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="max-w-3xl">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 ${collection.imageUrl ? 'text-white' : 'text-foreground'}`}>
              {collection.name}
            </h1>
            {collection.description && (
              <p className={`text-lg md:text-xl ${collection.imageUrl ? 'text-white/90' : 'text-muted-foreground'}`}>
                {collection.description}
              </p>
            )}
          </div>
        </div>
      </section>
      
      {/* Events Section */}
      <section className="py-12">
        <div className="container">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Events in this Collection
              {events.length > 0 && (
                <span className="text-muted-foreground ml-2">({events.length})</span>
              )}
            </h2>
            <Button onClick={() => {
              const params = new URLSearchParams();
              if (collection.eventTypeIds && collection.eventTypeIds.length > 0) {
                collection.eventTypeIds.forEach((id: number) => params.append('tagId', id.toString()));
              }
              if (collection.provinces && collection.provinces.length > 0) {
                params.set('province', collection.provinces[0]);
              }
              if (collection.municipalities && collection.municipalities.length > 0) {
                params.set('municipality', collection.municipalities[0]);
              }
              navigate(`/browse?${params.toString()}`);
            }}>
              View All in Browse
            </Button>
          </div>
          
          {eventsLoading ? (
            <div className="text-center py-12">Loading events...</div>
          ) : events.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">
                No events found in this collection yet. Check back soon!
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <Link key={event.id} href={`/event/${event.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {event.imageUrls && event.imageUrls.length > 0 && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={event.imageUrls[0]}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.name}</h3>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                        
                        {event.venue && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {event.isFree ? (
                            <>
                              <DollarSign className="w-4 h-4" />
                              <span>Free</span>
                            </>
                          ) : event.costMin && event.costMax ? (
                            <>
                              <DollarSign className="w-4 h-4" />
                              <span>${event.costMin} - ${event.costMax}</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      
                      {event.eventTypes && event.eventTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {event.eventTypes.slice(0, 3).map((type: any) => (
                            <Badge key={type.id} variant="secondary" className="text-xs">
                              {type.name}
                            </Badge>
                          ))}
                          {event.eventTypes.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{event.eventTypes.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
