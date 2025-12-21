import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useUserAuth } from "@/hooks/useUserAuth";
import { getLoginUrl } from "@/const";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Bookmark, Calendar, MapPin, DollarSign, Trash2, ArrowLeft } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";

import { toast } from "sonner";

const EVENTS_PER_PAGE = 20;

export default function MySavedEvents() {
  const [, navigate] = useLocation();
  const [upcomingDisplayed, setUpcomingDisplayed] = useState(EVENTS_PER_PAGE);
  const [pastDisplayed, setPastDisplayed] = useState(EVENTS_PER_PAGE);
  
  // Support both organizer (Manus OAuth) and user (magic link) authentication
  const organizerAuth = useAuth();
  const userAuth = useUserAuth();
  
  // Use whichever authentication is active
  const user = organizerAuth.user || userAuth.user;
  const authLoading = organizerAuth.loading || userAuth.isLoading;
  const isOrganizer = organizerAuth.isAuthenticated;
  
  const utils = trpc.useUtils();

  const { data: savedEvents, isLoading } = trpc.savedEvents.list.useQuery(undefined, {
    enabled: !!user,
  });

  const unsaveMutation = trpc.savedEvents.unsave.useMutation({
    onSuccess: () => {
      utils.savedEvents.list.invalidate();
      toast.success("Event removed from your saved list");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="container py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your saved events...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card className="p-8 text-center max-w-md mx-auto">
          <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sign In Required</h2>
          <p className="text-muted-foreground mb-6">
            Please sign in to view and manage your saved events.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Sign In</a>
          </Button>
        </Card>
      </div>
    );
  }

  const upcomingEvents = savedEvents?.filter(
    (event) => new Date(event.startDate) >= new Date()
  ) || [];
  
  const pastEvents = savedEvents?.filter(
    (event) => new Date(event.startDate) < new Date()
  ) || [];

  // Display control for upcoming events
  const displayedUpcoming = upcomingEvents.slice(0, upcomingDisplayed);
  const hasMoreUpcoming = upcomingDisplayed < upcomingEvents.length;

  // Display control for past events
  const displayedPast = pastEvents.slice(0, pastDisplayed);
  const hasMorePast = pastDisplayed < pastEvents.length;

  const loadMoreUpcoming = () => {
    setUpcomingDisplayed((prev) => prev + EVENTS_PER_PAGE);
  };

  const loadMorePast = () => {
    setPastDisplayed((prev) => prev + EVENTS_PER_PAGE);
  };

  return (
    <>
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">My Saved Events</h1>
          </div>
          
          {/* Show Back to Dashboard for organizers */}
          {isOrganizer && (
            <Button 
              variant="outline" 
              onClick={() => navigate("/organizer/dashboard")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          )}
        </div>

        {savedEvents && savedEvents.length === 0 && (
          <Card className="p-8 text-center">
            <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No saved events yet</h2>
            <p className="text-muted-foreground mb-6">
              Browse events and click the bookmark icon to save them here. You'll receive email reminders before events start!
            </p>
            <Button asChild>
              <Link href="/browse">Browse Events</Link>
            </Button>
          </Card>
        )}

        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Upcoming Events ({upcomingEvents.length})</h2>
            <div className="space-y-4">
              {displayedUpcoming.map((event) => (
                <Card key={event.id} className="p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <Link href={`/events/${event.id}`}>
                        <h3 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
                          {event.name}
                        </h3>
                      </Link>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {event.municipality}, {event.province}
                          </span>
                        </div>
                        
                        {event.isFree ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-semibold text-green-600">FREE</span>
                          </div>
                        ) : (
                          event.costMin !== null && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              <span>
                                ${event.costMin}
                                {event.costMax && event.costMax !== event.costMin && ` - $${event.costMax}`}
                              </span>
                            </div>
                          )
                        )}
                      </div>

                      <div className="mt-3 text-sm">
                        <span className="text-muted-foreground">Reminder: </span>
                        <span className="font-medium">
                          {event.reminderPreference === "none" && "No reminders"}
                          {event.reminderPreference === "24h" && "24 hours before"}
                          {event.reminderPreference === "48h" && "48 hours before"}
                          {event.reminderPreference === "both" && "24 and 48 hours before"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => unsaveMutation.mutate({ eventId: event.id })}
                      disabled={unsaveMutation.isPending}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {hasMoreUpcoming && (
              <div className="mt-6 text-center">
                <Button onClick={loadMoreUpcoming} variant="outline" size="lg">
                  Load More Upcoming Events
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {displayedUpcoming.length} of {upcomingEvents.length}
                </p>
              </div>
            )}
          </div>
        )}

        {pastEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Past Events ({pastEvents.length})</h2>
            <div className="space-y-4">
              {displayedPast.map((event) => (
                <Card key={event.id} className="p-6 opacity-60">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <Link href={`/events/${event.id}`}>
                        <h3 className="text-xl font-semibold hover:text-primary transition-colors mb-2">
                          {event.name}
                        </h3>
                      </Link>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {event.municipality}, {event.province}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => unsaveMutation.mutate({ eventId: event.id })}
                      disabled={unsaveMutation.isPending}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            {hasMorePast && (
              <div className="mt-6 text-center">
                <Button onClick={loadMorePast} variant="outline" size="lg">
                  Load More Past Events
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Showing {displayedPast.length} of {pastEvents.length}
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
