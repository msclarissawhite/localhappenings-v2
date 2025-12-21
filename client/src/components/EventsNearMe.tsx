import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Loader2, AlertCircle, Navigation } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useLocation } from "wouter";
import { formatDistance } from "@shared/distance";

type GeolocationState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; latitude: number; longitude: number }
  | { status: "error"; message: string };

export function EventsNearMe() {
  const [, navigate] = useLocation();
  const [geoState, setGeoState] = useState<GeolocationState>({ status: "idle" });
  
  const { data: nearbyEvents = [], isLoading: eventsLoading } = trpc.events.nearbyEvents.useQuery(
    {
      latitude: geoState.status === "success" ? geoState.latitude : 0,
      longitude: geoState.status === "success" ? geoState.longitude : 0,
      radiusKm: 50,
      limit: 20,
    },
    {
      enabled: geoState.status === "success",
    }
  );

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setGeoState({
        status: "error",
        message: "Geolocation is not supported by your browser",
      });
      return;
    }

    setGeoState({ status: "loading" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoState({
          status: "success",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = "Unable to retrieve your location";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }
        setGeoState({ status: "error", message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  };

  const renderContent = () => {
    if (geoState.status === "idle") {
      return (
        <div className="text-center py-12">
          <Navigation className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Find Events Near You</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Discover accessible events happening within 50 km of your current location, sorted by distance.
          </p>
          <Button onClick={handleFindNearMe} size="lg">
            <MapPin className="w-5 h-5 mr-2" />
            Use My Location
          </Button>
        </div>
      );
    }

    if (geoState.status === "loading" || eventsLoading) {
      return (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {geoState.status === "loading" ? "Getting your location..." : "Finding nearby events..."}
          </p>
        </div>
      );
    }

    if (geoState.status === "error") {
      return (
        <div className="py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{geoState.message}</AlertDescription>
          </Alert>
          <div className="text-center mt-6">
            <Button onClick={handleFindNearMe} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    if (geoState.status === "success" && nearbyEvents.length === 0) {
      return (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Events Found Nearby</h3>
          <p className="text-muted-foreground mb-6">
            We couldn't find any upcoming events within 50 km of your location.
          </p>
          <Button onClick={handleFindNearMe} variant="outline">
            <Navigation className="w-4 h-4 mr-2" />
            Refresh Location
          </Button>
        </div>
      );
    }

    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">
              {nearbyEvents.length} {nearbyEvents.length === 1 ? "Event" : "Events"} Near You
            </h3>
            <p className="text-sm text-muted-foreground">
              Within 50 km of your location
            </p>
          </div>
          <Button onClick={handleFindNearMe} variant="outline" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {nearbyEvents.map((event) => (
            <Card
              key={event.id}
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/event/${event.id}`)}
            >
              <div className="flex gap-4">
                {event.imageUrl && (
                  <div className="w-32 h-32 flex-shrink-0 rounded overflow-hidden">
                    <img
                      src={event.imageUrl}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-semibold text-lg line-clamp-1">{event.name}</h4>
                    <div className="flex items-center gap-1 text-primary font-semibold text-sm whitespace-nowrap">
                      <MapPin className="w-4 h-4" />
                      {formatDistance(event.distance)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="font-medium">
                        {format(new Date(event.startDate), "MMM d, yyyy")}
                      </span>
                      {event.timeOfDay && (
                        <span className="capitalize">• {event.timeOfDay.replace("-", " ")}</span>
                      )}
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span className="line-clamp-1">{event.venue}</span>
                      </div>
                    )}
                    {event.isFree === 1 && (
                      <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
}
