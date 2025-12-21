import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { GripVertical, X, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react";
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
}

function SortableItem({ id, item, onRemove, onUpdateSubtitle }: SortableItemProps) {
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
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing mt-2"
      >
        <GripVertical className="w-5 h-5 text-muted-foreground" />
      </div>

      <div className="flex-1">
        <div className="font-medium">{item.event.name}</div>
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
                variant="ghost"
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
          <div className="mt-1">
            {subtitle ? (
              <div className="text-sm text-muted-foreground italic">
                "{subtitle}"
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                No subtitle
              </div>
            )}
            <Button
              size="sm"
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => setIsEditing(true)}
            >
              {subtitle ? "Edit subtitle" : "Add subtitle"}
            </Button>
          </div>
        )}
      </div>

      <Button
        size="sm"
        variant="ghost"
        onClick={() => onRemove(id)}
        className="text-destructive hover:text-destructive"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}

export function FeaturedEventsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const updateSubtitleMutation = trpc.homepageFeatured.updateSubtitle.useMutation({
    onSuccess: () => {
      toast.success("Subtitle updated");
      refetchFeatured();
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
    updateSubtitleMutation.mutate({ id, subtitle: subtitle || null });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Featured Events Carousel</h2>
        <p className="text-muted-foreground">
          Manually curate events to display on the homepage carousel. If no events are selected,
          the carousel will automatically show the closest upcoming events. Drag to reorder.
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
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {searchQuery.length > 2 && paginatedResults.length > 0 && (
            <>
              <div className="border rounded-lg divide-y max-h-96 overflow-y-auto">
                {paginatedResults.map((event: Event) => (
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

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages} ({searchResults.length} results)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {searchQuery.length > 2 && searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No published events found
            </p>
          )}
        </div>
      </Card>

      {/* Featured Events List with Drag and Drop */}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={featuredEvents.map((item: any) => item.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {featuredEvents.map((item: any) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    item={item}
                    onRemove={handleRemoveEvent}
                    onUpdateSubtitle={handleUpdateSubtitle}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </Card>
    </div>
  );
}
