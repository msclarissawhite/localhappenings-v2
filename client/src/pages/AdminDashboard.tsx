import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Calendar, MapPin, CheckCircle, XCircle, AlertCircle, ShieldCheck, Users, DollarSign, TrendingUp, Repeat, MessageSquare } from "lucide-react";
import type { Event } from "@shared/types";
import { EventEditDialog } from "@/components/EventEditDialog";
import { DuplicateWarning } from "@/components/DuplicateWarning";
import { BulkUpload } from "@/components/BulkUpload";
import { BatchEditModal } from "@/components/BatchEditModal";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<"published" | "rejected" | "needs-clarification">("published");
  const [selectedEvents, setSelectedEvents] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<"events" | "pending-edits" | "closed-events" | "organizers" | "feature-requests" | "donations">("events");
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [showBatchEdit, setShowBatchEdit] = useState(false);

  const { data: pendingEvents, isLoading, refetch } = trpc.events.getPending.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: eventsWithPendingEdits, isLoading: pendingEditsLoading, refetch: refetchPendingEdits } = trpc.events.list.useQuery(
    { hasUnreviewedEdit: true, limit: 100, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" && activeTab === "pending-edits" }
  );

  const { data: closedEvents, isLoading: closedEventsLoading, refetch: refetchClosedEvents } = trpc.events.list.useQuery(
    { status: "closed", limit: 100, offset: 0 },
    { enabled: isAuthenticated && user?.role === "admin" && activeTab === "closed-events" }
  );

  const { data: organizerStats, isLoading: organizerStatsLoading } = trpc.organizerAnalytics.getFeedbackStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "organizers",
  });
  
  const [expandedOrganizer, setExpandedOrganizer] = useState<string | null>(null);
  const { data: organizerEvents } = trpc.organizerAnalytics.getEventFeedback.useQuery(
    { organizerName: expandedOrganizer! },
    { enabled: !!expandedOrganizer }
  );

  const { data: featureRequests, isLoading: featureRequestsLoading, refetch: refetchFeatureRequests } = trpc.featureRequests.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "feature-requests",
  });

  const { data: donationStats, isLoading: donationStatsLoading } = trpc.donations.getStats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin" && activeTab === "donations",
  });

  const toggleVerificationMutation = trpc.organizer.toggleVerification.useMutation({
    onSuccess: () => {
      toast.success("Organizer verification status updated");
      refetchOrganizers();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update verification status");
    },
  });

  const updateFeatureRequestStatusMutation = trpc.featureRequests.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Feature request status updated");
      refetchFeatureRequests();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const approvePendingEditMutation = trpc.events.approvePendingEdit.useMutation({
    onSuccess: () => {
      toast.success("Edit approved and published");
      refetchPendingEdits();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve edit");
    },
  });

  const rejectPendingEditMutation = trpc.events.rejectPendingEdit.useMutation({
    onSuccess: () => {
      toast.success("Edit rejected");
      refetchPendingEdits();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject edit");
    },
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

  const handleExportAll = async () => {
    try {
      const result = await trpc.events.exportAll.query();
      
      // Create blob and download
      const blob = new Blob([result.csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `local-happenings-events-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`Exported ${result.count} events to CSV`);
    } catch (error) {
      toast.error("Failed to export events");
    }
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

  const handleBulkDelete = async () => {
    if (selectedEvents.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selectedEvents.size} event(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      for (const eventId of Array.from(selectedEvents)) {
        await trpc.events.delete.mutate({ id: eventId });
      }
      setSelectedEvents(new Set());
      toast.success(`Deleted ${selectedEvents.size} event(s)`);
      refetch();
    } catch (error) {
      toast.error("Failed to delete events");
    }
  };

  return (
    <div className="py-8">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and moderate event submissions</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b">
          <Button
            variant={activeTab === "events" ? "default" : "ghost"}
            onClick={() => setActiveTab("events")}
            className="rounded-b-none"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Pending Events
          </Button>
          <Button
            variant={activeTab === "pending-edits" ? "default" : "ghost"}
            onClick={() => setActiveTab("pending-edits")}
            className="rounded-b-none"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Pending Edits
            {eventsWithPendingEdits && eventsWithPendingEdits.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {eventsWithPendingEdits.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeTab === "closed-events" ? "default" : "ghost"}
            onClick={() => setActiveTab("closed-events")}
            className="rounded-b-none"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Closed Events
          </Button>
          <Button
            variant={activeTab === "organizers" ? "default" : "ghost"}
            onClick={() => setActiveTab("organizers")}
            className="rounded-b-none"
          >
            <Users className="w-4 h-4 mr-2" />
            Manage Organizers
          </Button>
          <Button
            variant={activeTab === "feature-requests" ? "default" : "ghost"}
            onClick={() => setActiveTab("feature-requests")}
            className="rounded-b-none"
          >
            <AlertCircle className="w-4 h-4 mr-2" />
            Feature Requests
          </Button>
          <Button
            variant={activeTab === "donations" ? "default" : "ghost"}
            onClick={() => setActiveTab("donations")}
            className="rounded-b-none"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Donations
          </Button>
        </div>

        {activeTab === "events" && (
          <>
            {showBulkUpload ? (
              <BulkUpload
                onComplete={() => {
                  setShowBulkUpload(false);
                  refetch();
                  toast.success("Events imported successfully!");
                }}
              />
            ) : (
              <>
                {/* Import/Export Toolbar - Always Visible */}
                <div className="flex items-center gap-4 mb-4 p-4 bg-muted/30 rounded-lg">
                    <Button
                    variant="outline"
                    onClick={() => setShowBulkUpload(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Bulk Upload CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleExportAll}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Download All Events
                  </Button>
                  {selectedEvents.size > 0 && (
                    <Button
                      variant="default"
                      onClick={() => setShowBatchEdit(true)}
                    >
                      Batch Edit ({selectedEvents.size})
                    </Button>
                  )}
                </div>

                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Loading pending events...</p>
                  </div>
                ) : pendingEvents && pendingEvents.length > 0 ? (
                  <>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBulkDelete}
                    disabled={updateStatusMutation.isPending}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Delete ({selectedEvents.size})
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
              </>
            )}
          </>
        )}

        {activeTab === "pending-edits" && (
          <>
            {pendingEditsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading events with pending edits...</p>
              </div>
            ) : eventsWithPendingEdits && eventsWithPendingEdits.length > 0 ? (
              <div className="space-y-6">
                {eventsWithPendingEdits.map((event) => {
                  const pendingEdit = event.pendingEditData ? JSON.parse(event.pendingEditData) : null;
                  
                  return (
                    <Card key={event.id} className="p-6">
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{event.name}</h3>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                            Edit Pending Review
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Submitted by: {event.organizerName || "Unknown"} • Event ID: {event.id}
                        </p>
                      </div>

                      {pendingEdit && (
                        <div className="space-y-3 mb-6">
                          <h4 className="font-semibold text-sm uppercase text-muted-foreground mb-3">Changes Summary</h4>
                          
                          {/* Name */}
                          {pendingEdit.name && pendingEdit.name !== event.name && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r">
                              <div className="font-medium text-sm mb-2">Event Name</div>
                              <div className="text-sm space-y-1">
                                <div className="text-red-600 dark:text-red-400 line-through">{event.name}</div>
                                <div className="text-green-600 dark:text-green-400 font-semibold">{pendingEdit.name}</div>
                              </div>
                            </div>
                          )}

                          {/* Description */}
                          {pendingEdit.description && pendingEdit.description !== event.description && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r">
                              <div className="font-medium text-sm mb-2">Description</div>
                              <div className="text-sm space-y-2">
                                <div className="text-red-600 dark:text-red-400 line-through max-h-20 overflow-hidden">{event.description}</div>
                                <div className="text-green-600 dark:text-green-400 font-semibold">{pendingEdit.description}</div>
                              </div>
                            </div>
                          )}

                          {/* Venue */}
                          {pendingEdit.venue && pendingEdit.venue !== event.venue && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r">
                              <div className="font-medium text-sm mb-2">Venue</div>
                              <div className="text-sm space-y-1">
                                <div className="text-red-600 dark:text-red-400 line-through">{event.venue || "Not specified"}</div>
                                <div className="text-green-600 dark:text-green-400 font-semibold">{pendingEdit.venue || "Not specified"}</div>
                              </div>
                            </div>
                          )}

                          {/* Address */}
                          {pendingEdit.address && pendingEdit.address !== event.address && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r">
                              <div className="font-medium text-sm mb-2">Address</div>
                              <div className="text-sm space-y-1">
                                <div className="text-red-600 dark:text-red-400 line-through">{event.address || "Not specified"}</div>
                                <div className="text-green-600 dark:text-green-400 font-semibold">{pendingEdit.address || "Not specified"}</div>
                              </div>
                            </div>
                          )}

                          {/* Start Date */}
                          {pendingEdit.startDate && pendingEdit.startDate !== event.startDate && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r">
                              <div className="font-medium text-sm mb-2">Start Date</div>
                              <div className="text-sm space-y-1">
                                <div className="text-red-600 dark:text-red-400 line-through">{format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}</div>
                                <div className="text-green-600 dark:text-green-400 font-semibold">{format(new Date(pendingEdit.startDate), "MMM d, yyyy 'at' h:mm a")}</div>
                              </div>
                            </div>
                          )}

                          {/* Notes */}
                          {pendingEdit.notes && pendingEdit.notes !== event.notes && (
                            <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20 p-4 rounded-r">
                              <div className="font-medium text-sm mb-2">Additional Notes</div>
                              <div className="text-sm space-y-2">
                                <div className="text-red-600 dark:text-red-400 line-through max-h-20 overflow-hidden">{event.notes || "None"}</div>
                                <div className="text-green-600 dark:text-green-400 font-semibold">{pendingEdit.notes}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          size="sm"
                          onClick={() => approvePendingEditMutation.mutate({ eventId: event.id })}
                          disabled={approvePendingEditMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            const reason = prompt("Reason for rejection (optional):");
                            if (reason !== null) {
                              rejectPendingEditMutation.mutate({ eventId: event.id, reason: reason || undefined });
                            }
                          }}
                          disabled={rejectPendingEditMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/event/${event.id}`, "_blank")}
                        >
                          View Published Event
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-12">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
                  <h3 className="text-xl font-semibold">No Pending Edits</h3>
                  <p className="text-muted-foreground">
                    All event edits have been reviewed!
                  </p>
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === "organizers" && (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Organizer Feedback Analytics</h2>
              <p className="text-muted-foreground">Track organizer performance based on attendee feedback across all their events.</p>
            </div>

            {organizerStatsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading organizer analytics...</p>
              </div>
            ) : organizerStats && organizerStats.length > 0 ? (
              <div className="space-y-4">
                {organizerStats.map((organizer) => (
                  <Card key={organizer.organizerName} className="p-6">
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{organizer.organizerName}</h3>
                            {organizer.organizerIsVerified === 1 && (
                              <Badge variant="default" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          {organizer.organizerEmail && (
                            <p className="text-sm text-muted-foreground">{organizer.organizerEmail}</p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedOrganizer(
                            expandedOrganizer === organizer.organizerName ? null : organizer.organizerName
                          )}
                        >
                          {expandedOrganizer === organizer.organizerName ? "Hide" : "View"} Events
                        </Button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-2xl font-bold">{organizer.totalEvents}</div>
                          <div className="text-xs text-muted-foreground">Total Events</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{organizer.eventsWithFeedback}</div>
                          <div className="text-xs text-muted-foreground">With Feedback</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{organizer.totalFeedback}</div>
                          <div className="text-xs text-muted-foreground">Total Responses</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{organizer.totalAttended}</div>
                          <div className="text-xs text-muted-foreground">Attended</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {organizer.avgAccuracy ? organizer.avgAccuracy.toFixed(1) : "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Accuracy</div>
                        </div>
                      </div>

                      {/* Expanded Event List */}
                      {expandedOrganizer === organizer.organizerName && organizerEvents && (
                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-medium mb-3">Event Breakdown</h4>
                          <div className="space-y-2">
                            {organizerEvents.map((event) => (
                              <div key={event.eventId} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                                <div className="flex-1">
                                  <div className="font-medium">{event.eventName}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {format(new Date(event.eventDate), "MMM d, yyyy")}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="text-center">
                                    <div className="font-medium">{event.feedbackCount}</div>
                                    <div className="text-xs text-muted-foreground">Responses</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-medium">{event.attendedCount}</div>
                                    <div className="text-xs text-muted-foreground">Attended</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="font-medium">
                                      {event.avgAccuracy ? event.avgAccuracy.toFixed(1) : "N/A"}
                                    </div>
                                    <div className="text-xs text-muted-foreground">Accuracy</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No feedback data yet</h3>
                <p className="text-muted-foreground">Organizer analytics will appear here once events receive feedback.</p>
              </Card>
            )}
          </>
        )}

        {activeTab === "feature-requests" && (
          <>
            {featureRequestsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading feature requests...</p>
              </div>
            ) : featureRequests && featureRequests.length > 0 ? (
              <div className="space-y-4">
                {featureRequests.map((request) => (
                  <Card key={request.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">{request.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4 whitespace-pre-wrap">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {request.upvoteCount} upvotes
                          </span>
                          {request.clickupTaskUrl && (
                            <a
                              href={request.clickupTaskUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              View in ClickUp
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <select
                          value={request.status}
                          onChange={(e) => {
                            updateFeatureRequestStatusMutation.mutate({
                              featureRequestId: request.id,
                              status: e.target.value as any,
                            });
                          }}
                          className="px-3 py-2 border rounded-md text-sm"
                          disabled={updateFeatureRequestStatusMutation.isPending}
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="planned">Planned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="declined">Declined</option>
                        </select>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No feature requests yet</h3>
                <p className="text-muted-foreground">Feature requests will appear here when users submit them.</p>
              </Card>
            )}
          </>
        )}

        {activeTab === "donations" && (
          <>
            {donationStatsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading donation statistics...</p>
              </div>
            ) : donationStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Total Donations */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Donations</h3>
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">${(donationStats.totalAmount / 100).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {donationStats.totalDonations} donation{donationStats.totalDonations !== 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>

                {/* Average Donation */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Average Donation</h3>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">
                      ${donationStats.totalDonations > 0 ? (donationStats.averageDonation / 100).toFixed(2) : '0.00'}
                    </p>
                    <p className="text-sm text-muted-foreground">Per donation</p>
                  </div>
                </Card>

                {/* Recurring Supporters */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Recurring Supporters</h3>
                    <Repeat className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-3xl font-bold">{donationStats.recurringDonations}</p>
                    <p className="text-sm text-muted-foreground">
                      {donationStats.oneTimeDonations} one-time
                    </p>
                  </div>
                </Card>

                {/* Breakdown Card */}
                <Card className="p-6 md:col-span-2 lg:col-span-3">
                  <h3 className="text-lg font-semibold mb-4">Donation Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">One-time donations</span>
                        <span className="font-medium">{donationStats.oneTimeDonations}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${donationStats.totalDonations > 0 ? (donationStats.oneTimeDonations / donationStats.totalDonations) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Recurring donations</span>
                        <span className="font-medium">{donationStats.recurringDonations}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${donationStats.totalDonations > 0 ? (donationStats.recurringDonations / donationStats.totalDonations) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
                <p className="text-muted-foreground">Donation statistics will appear here when supporters contribute.</p>
              </Card>
            )}
          </>
        )}

        {activeTab === "closed-events" && (
          <>
            {closedEventsLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading closed events...</p>
              </div>
            ) : closedEvents && closedEvents.length > 0 ? (
              <div className="space-y-4">
                {closedEvents.map((event) => (
                  <Card key={event.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{event.name}</h3>
                          <Badge variant="secondary">Closed</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{format(new Date(event.startDate), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{event.municipality}, {event.province}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Organizer: {event.organizerName || "Unknown"} • Closed on: {event.updatedAt ? format(new Date(event.updatedAt), "MMM d, yyyy") : "Unknown"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/event/${event.id}`, "_blank")}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.location.href = `/admin/feedback/${event.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Feedback
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            if (confirm("Reopen this event and make it visible to the public again?")) {
                              updateStatusMutation.mutate({
                                eventId: event.id,
                                status: "published",
                                reviewNotes: "Event reopened by admin",
                              });
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Reopen Event
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No closed events</h3>
                <p className="text-muted-foreground">Events that organizers have closed will appear here.</p>
              </Card>
            )}
          </>
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

        <BatchEditModal
          open={showBatchEdit}
          onOpenChange={setShowBatchEdit}
          selectedEventIds={Array.from(selectedEvents)}
          onSuccess={() => {
            setSelectedEvents(new Set());
            refetch();
          }}
        />
      </div>
    </div>
  );
}
