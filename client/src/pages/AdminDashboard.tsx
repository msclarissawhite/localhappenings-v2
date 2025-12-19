import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Calendar, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Event } from "@shared/types";
import { EventEditDialog } from "@/components/EventEditDialog";
import { DuplicateWarning } from "@/components/DuplicateWarning";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"published" | "rejected" | "needs-clarification">("published");
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());

  const { data: pendingEvents, isLoading, refetch } = trpc.events.getPending.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!e.shiftKey || selectedEvents.size === 0) return;
      
      if (e.key === 'A' || e.key === 'a') {
        e.preventDefault();
        handleBulkApprove();
      } else if (e.key === 'R' || e.key === 'r') {
        e.preventDefault();
        handleBulkReject();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selectedEvents]);

  const updateStatusMutation = trpc.events.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Event status updated successfully");
      setShowReviewDialog(false);
      setSelectedEvent(null);
      setReviewNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update event status");
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="py-16">
        <div className="container text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const handleReview = (event: Event, action: "published" | "rejected" | "needs-clarification") => {
    setSelectedEvent(event);
    setReviewAction(action);
    setShowReviewDialog(true);
  };

  const confirmReview = () => {
    if (!selectedEvent) return;

    updateStatusMutation.mutate({
      eventId: selectedEvent.id,
      status: reviewAction,
      reviewNotes: reviewNotes || undefined,
    });
  };

  const toggleEventSelection = (eventId: number) => {
    const newSelection = new Set(selectedEvents);
    if (newSelection.has(eventId)) {
      newSelection.delete(eventId);
    } else {
      newSelection.add(eventId);
    }
    setSelectedEvents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedEvents.size === pendingEvents?.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(pendingEvents?.map(e => e.id) || []));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedEvents.size === 0) return;
    
    for (const eventId of Array.from(selectedEvents)) {
      await updateStatusMutation.mutateAsync({
        eventId,
        status: 'published',
      });
    }
    setSelectedEvents(new Set());
    toast.success(`Approved ${selectedEvents.size} event(s)`);
    refetch();
  };

  const handleBulkReject = async () => {
    if (selectedEvents.size === 0) return;
    
    for (const eventId of Array.from(selectedEvents)) {
      await updateStatusMutation.mutateAsync({
        eventId,
        status: 'rejected',
      });
    }
    setSelectedEvents(new Set());
    toast.success(`Rejected ${selectedEvents.size} event(s)`);
    refetch();
  };

  return (
    <div className="py-8">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and moderate event submissions</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading pending events...</p>
          </div>
        ) : pendingEvents && pendingEvents.length > 0 ? (
          <>
            {/* Bulk Actions Toolbar */}
            <div className="flex items-center justify-between mb-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={selectedEvents.size === pendingEvents.length}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedEvents.size > 0
                    ? `${selectedEvents.size} event(s) selected`
                    : "Select events"}
                </span>
              </div>
              {selectedEvents.size > 0 && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleBulkApprove}
                    disabled={updateStatusMutation.isPending}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve ({selectedEvents.size})
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkReject}
                    disabled={updateStatusMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject ({selectedEvents.size})
                  </Button>
                  <span className="text-xs text-muted-foreground self-center ml-2">
                    Shift+A to approve, Shift+R to reject
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-6">
            {pendingEvents.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex gap-4">
                  <Checkbox
                    checked={selectedEvents.has(event.id)}
                    onCheckedChange={() => toggleEventSelection(event.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    {/* Duplicate Warning */}
                    <DuplicateWarning
                      eventId={event.id}
                      eventName={event.name}
                      startDate={event.startDate}
                      province={event.province}
                      municipality={event.municipality}
                      venue={event.venue}
                    />

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(event.startDate), "MMM d, yyyy")}
                          </Badge>
                          <Badge variant="outline">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.municipality}, {event.province}
                          </Badge>
                          {event.isFree && <Badge variant="secondary">FREE</Badge>}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{event.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">Venue:</span> {event.venue || "Not specified"}
                      </div>
                      <div>
                        <span className="font-medium">Organizer:</span> {event.organizerName || "Not specified"}
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-muted-foreground">
                      Submitted: {format(new Date(event.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>

                       <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEditDialog(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(event, "published")}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(event, "needs-clarification")}
                        variant="outline"
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Need Info
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReview(event, "rejected")}
                        variant="destructive"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                  </div>
                </div>
                </div>
              </Card>
            ))}
          </div>
          </>
        ) : (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">There are no pending events to review.</p>
          </Card>
        )}

        <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {reviewAction === "published" && "Approve Event"}
                {reviewAction === "rejected" && "Reject Event"}
                {reviewAction === "needs-clarification" && "Request Clarification"}
              </DialogTitle>
              <DialogDescription>
                {reviewAction === "published" &&
                  "This event will be published and visible to all users."}
                {reviewAction === "rejected" && "This event will be rejected and not published."}
                {reviewAction === "needs-clarification" &&
                  "The organizer will be notified that more information is needed."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="reviewNotes">
                  {reviewAction === "published" ? "Notes (optional)" : "Reason/Notes"}
                </Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  placeholder={
                    reviewAction === "published"
                      ? "Add any internal notes..."
                      : "Explain what needs to be clarified or why this is being rejected..."
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={confirmReview} disabled={updateStatusMutation.isPending}>
                {updateStatusMutation.isPending ? "Processing..." : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EventEditDialog
          event={selectedEvent}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSuccess={() => {
            setSelectedEvent(null);
            refetch();
          }}
        />
      </div>
    </div>
  );
}
