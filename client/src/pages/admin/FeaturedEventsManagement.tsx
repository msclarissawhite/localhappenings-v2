import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { GripVertical, X, Plus, Star } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/types";

export function FeaturedEventsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  const { data: featuredEvents = [], refetch: refetchFeatured } =
    trpc.homepageFeatured.listAll.useQuery();
  
  const { data: eventsData } = trpc.events.list.useQuery({});
  
  const searchResults = searchQuery.length > 2 && eventsData?.events
    ? eventsData.events.filter((event: Event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        event.status === "published"
      )
    : [];

  const addMutation = trpc.homepageFeatured.add.useMutation({
    onSuccess: () => {
      toast.success("Event added to featured carousel");
      refetchFeatured();
      setSearchQuery("");
      setSelectedEventId(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.homepageFeatured.remove.useMutation({
    onSuccess: () => {
      toast.success("Event removed from featured carousel");
      refetchFeatured();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const reorderMutation = trpc.homepageFeatured.reorder.useMutation({
    onSuccess: () => {
      toast.success("Featured events reordered");
      refetchFeatured();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleAddEvent = (eventId: number) => {
    addMutation.mutate({ eventId });
  };

  const handleRemoveEvent = (id: number) => {
    removeMutation.mutate({ id });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newOrder = [...featuredEvents];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    
    const items = newOrder.map((item, idx) => ({
      id: item.id,
      sortOrder: idx,
    }));
    
    reorderMutation.mutate({ items });
  };

  const handleMoveDown = (index: number) => {
    if (index === featuredEvents.length - 1) return;
    
    const newOrder = [...featuredEvents];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    
    const items = newOrder.map((item, idx) => ({
      id: item.id,
      sortOrder: idx,
    }));
    
    reorderMutation.mutate({ items });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Featured Events Carousel</h2>
        <p className="text-muted-foreground">
          Manually curate events to display on the homepage carousel. If no events are selected,
          the carousel will automatically show the closest upcoming events.
        </p>
      </div>

      {/* Add Event Section */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Event to Carousel
        </h3>
        
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Search events by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {searchQuery.length > 2 && searchResults.length > 0 && (
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {searchResults.map((event: Event) => (
                <div
                  key={event.id}
                  className="p-3 hover:bg-accent cursor-pointer flex items-center justify-between"
                  onClick={() => handleAddEvent(event.id)}
                >
                  <div>
                    <div className="font-medium">{event.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(event.startDate), "MMM d, yyyy")} • {event.municipality}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {searchQuery.length > 2 && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No published events found
            </p>
          )}
        </div>
      </Card>

      {/* Featured Events List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5" />
          Current Featured Events ({featuredEvents.length})
        </h3>

        {featuredEvents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No manually curated events.</p>
            <p className="text-sm mt-2">
              The homepage will automatically display the closest upcoming events.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {featuredEvents.map((item: any, index: number) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-4 border rounded-lg bg-card"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="h-6 w-6 p-0"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === featuredEvents.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    ↓
                  </Button>
                </div>

                <GripVertical className="w-5 h-5 text-muted-foreground" />

                <div className="flex-1">
                  <div className="font-medium">{item.event.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(item.event.startDate), "MMM d, yyyy")} •{" "}
                    {item.event.municipality}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveEvent(item.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
