import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GripVertical, X, Plus, Star, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableItemProps {
  id: number;
  item: any;
  onRemove: (id: number) => void;
  onUpdateSubtitle: (id: number, subtitle: string) => void;
  isCurated: boolean;
}

function SortableItem({ id, item, onRemove, onUpdateSubtitle, isCurated }: SortableItemProps) {
  const [subtitle, setSubtitle] = useState(item.subtitle || "");
  const [isEditing, setIsEditing] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveSubtitle = () => {
    onUpdateSubtitle(id, subtitle);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-3 p-4 border rounded-lg bg-card"
    >
      {isCurated && (
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-2"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-medium">{item.event.name}</div>
          {isCurated ? (
            <Badge variant="default" className="text-xs">Curated</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Auto Fallback</Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(item.event.startDate), "MMM d, yyyy")} •{" "}
          {item.event.municipality}
        </div>
        
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Label htmlFor={`subtitle-${id}`} className="text-xs">
              Subtitle (optional context for carousel)
            </Label>
            <Textarea
              id={`subtitle-${id}`}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="e.g., 'Perfect for families with young children'"
              className="text-sm"
              rows={2}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveSubtitle}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSubtitle(item.subtitle || "");
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-2">
            {subtitle ? (
              <div className="text-sm italic text-muted-foreground">
                "{subtitle}"
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No subtitle</div>
            )}
            <Button
              size="sm"
              variant="link"
              className="p-0 h-auto mt-1"
              onClick={() => setIsEditing(true)}
            >
              {subtitle ? "Edit subtitle" : "Add subtitle"}
            </Button>
          </div>
        )}
      </div>

      {isCurated && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onRemove(id)}
          className="text-destructive hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export function FeaturedEventsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: carouselPreview = [], refetch: refetchPreview } =
    trpc.homepageFeatured.getCarouselPreview.useQuery();

  const { data: featuredEvents = [], refetch: refetchFeatured } =
    trpc.homepageFeatured.listAll.useQuery();
  
  const { data: eventsData } = trpc.events.list.useQuery({});
  
  const searchResults = searchQuery.length > 2 && eventsData?.events
    ? eventsData.events.filter((event: Event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        event.status === "published"
      )
    : [];

  // Pagination logic
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const paginatedResults = searchResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const addMutation = trpc.homepageFeatured.add.useMutation({
    onSuccess: () => {
      toast.success("Event added to featured carousel");
      refetchFeatured();
      refetchPreview();
      setSearchQuery("");
      setCurrentPage(1);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const removeMutation = trpc.homepageFeatured.remove.useMutation({
    onSuccess: () => {
      toast.success("Event removed from featured carousel");
      refetchFeatured();
      refetchPreview();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const reorderMutation = trpc.homepageFeatured.reorder.useMutation({
    onSuccess: () => {
      toast.success("Featured events reordered");
      refetchFeatured();
      refetchPreview();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateSubtitleMutation = trpc.homepageFeatured.updateSubtitle.useMutation({
    onSuccess: () => {
      toast.success("Subtitle updated");
      refetchFeatured();
      refetchPreview();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = featuredEvents.findIndex((item: any) => item.id === active.id);
      const newIndex = featuredEvents.findIndex((item: any) => item.id === over.id);

      const newOrder = arrayMove(featuredEvents, oldIndex, newIndex);
      
      const items = newOrder.map((item: any, idx: number) => ({
        id: item.id,
        sortOrder: idx,
      }));

      reorderMutation.mutate({ items });
    }
  };

  const handleAddEvent = (eventId: number) => {
    addMutation.mutate({ eventId });
  };

  const handleRemoveEvent = (id: number) => {
    removeMutation.mutate({ id });
  };

  const handleUpdateSubtitle = (id: number, subtitle: string) => {
    updateSubtitleMutation.mutate({ id, subtitle });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Featured Events Carousel</h2>
        <p className="text-muted-foreground">
          Curate events to highlight on the homepage. Drag to reorder. If no events are curated, 
          the carousel automatically shows the 5 closest upcoming events.
        </p>
      </div>

      {/* Carousel Preview Section */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Current Carousel Preview</h3>
          <Badge variant="outline" className="ml-auto">
            {carouselPreview.length} {carouselPreview.length === 1 ? 'event' : 'events'}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          This is what visitors currently see on the homepage carousel. 
          {carouselPreview.some((e: any) => e.isFallback) && 
            " Auto-fallback events are shown because you haven't curated any events yet."}
        </p>
        
        {carouselPreview.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events to display. Add some published events to see them here.
          </div>
        ) : (
          <div className="space-y-3">
            {carouselPreview.map((item: any, index: number) => (
              <SortableItem
                key={item.id}
                id={item.featuredId || item.id}
                item={{ event: item, subtitle: item.subtitle }}
                onRemove={handleRemoveEvent}
                onUpdateSubtitle={(id, subtitle) => {
                  if (item.featuredId) {
                    handleUpdateSubtitle(item.featuredId, subtitle);
                  } else {
                    // For fallback events, add them to curated first
                    addMutation.mutate({ eventId: item.id });
                  }
                }}
                isCurated={item.isCurated}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Current Featured Events (Curated) */}
      {featuredEvents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Manage Curated Events</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag events to reorder them. The order here determines the carousel display order.
          </p>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={featuredEvents.map((item: any) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {featuredEvents.map((item: any) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    onRemove={handleRemoveEvent}
                    onUpdateSubtitle={handleUpdateSubtitle}
                    isCurated={true}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      )}

      {/* Search and Add Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Add Events to Carousel</h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search Events</Label>
            <Input
              id="search"
              placeholder="Type at least 3 characters to search..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {paginatedResults.map((event: Event) => {
                const isAlreadyFeatured = featuredEvents.some(
                  (f: any) => f.eventId === event.id
                );

                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{event.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(event.startDate), "MMM d, yyyy")} •{" "}
                        {event.municipality}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddEvent(event.id)}
                      disabled={isAlreadyFeatured || addMutation.isPending}
                    >
                      {isAlreadyFeatured ? (
                        <>
                          <Star className="w-4 h-4 mr-2 fill-current" />
                          Featured
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {searchQuery.length > 0 && searchQuery.length <= 2 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              Type at least 3 characters to search
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
