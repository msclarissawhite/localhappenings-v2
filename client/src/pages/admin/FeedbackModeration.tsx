import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, Trash2, Download, Filter, X } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackModeration() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [eventIdFilter, setEventIdFilter] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minRating, setMinRating] = useState<string>("");
  const [maxRating, setMaxRating] = useState<string>("");
  const [showSpamOnly, setShowSpamOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const utils = trpc.useUtils();

  // Build filter object
  const filters = {
    eventId: eventIdFilter ? parseInt(eventIdFilter) : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
      minRating: minRating ? parseInt(minRating) : undefined,
      maxRating: maxRating ? parseInt(maxRating) : undefined,
      showSpamOnly: showSpamOnly,
  };

  const { data: feedbackList, isLoading } = trpc.feedback.listAll.useQuery(filters);
  const { data: stats } = trpc.feedback.overallStats.useQuery();

  const deleteMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      utils.feedback.listAll.invalidate();
      utils.feedback.overallStats.invalidate();
      toast.success("Feedback deleted");
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const bulkDeleteMutation = trpc.feedback.bulkDelete.useMutation({
    onSuccess: (data) => {
      utils.feedback.listAll.invalidate();
      utils.feedback.overallStats.invalidate();
      setSelectedIds([]);
      toast.success(`Deleted ${data.count} feedback entries`);
    },
    onError: (error) => {
      toast.error(`Bulk delete failed: ${error.message}`);
    },
  });

  const exportMutation = trpc.feedback.exportCSV.useQuery(
    {
      eventId: eventIdFilter ? parseInt(eventIdFilter) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
    { enabled: false }
  );

  const handleSelectAll = () => {
    if (selectedIds.length === feedbackList?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(feedbackList?.map((f: any) => f.id) || []);
    }
  };

  const handleSelectOne = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("No feedback selected");
      return;
    }

    if (confirm(`Delete ${selectedIds.length} feedback entries? This cannot be undone.`)) {
      bulkDeleteMutation.mutate({ ids: selectedIds });
    }
  };

  const handleExport = async () => {
    const result = await exportMutation.refetch();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `feedback-export-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Feedback exported");
    }
  };

  const clearFilters = () => {
    setEventIdFilter("");
    setStartDate("");
    setEndDate("");
    setMinRating("");
    setMaxRating("");
  };

  const hasActiveFilters = eventIdFilter || startDate || endDate || minRating || maxRating;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div>
        <h2 className="text-3xl font-bold mb-2">Feedback Moderation</h2>
        <p className="text-muted-foreground">
          Review and moderate event feedback submissions
        </p>
        {stats && (
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="font-semibold">{stats.total}</span> total feedback
            </div>
            <div>
              <span className="font-semibold">{stats.attended}</span> attended
            </div>
            <div>
              <span className="font-semibold">
                {stats.avgRating !== null && stats.avgRating !== undefined ? Number(stats.avgRating).toFixed(1) : "N/A"}
              </span>{" "}
              avg rating
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        )}

        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>

        {selectedIds.length > 0 && (
          <Button
            onClick={handleBulkDelete}
            variant="destructive"
            className="gap-2"
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="eventId">Event ID</Label>
              <Input
                id="eventId"
                type="number"
                placeholder="Filter by event ID"
                value={eventIdFilter}
                onChange={(e) => setEventIdFilter(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="minRating">Min Rating</Label>
              <Select value={minRating || "any"} onValueChange={(val) => setMinRating(val === "any" ? "" : val)}>
                <SelectTrigger id="minRating">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showSpamOnly"
                checked={showSpamOnly}
                onChange={(e) => setShowSpamOnly(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="showSpamOnly">Show Spam Only</Label>
            </div>

            <Label htmlFor="maxRating">Max Rating</Label>
              <Select value={maxRating || "any"} onValueChange={(val) => setMaxRating(val === "any" ? "" : val)}>
                <SelectTrigger id="maxRating">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1 star</SelectItem>
                  <SelectItem value="2">2 stars</SelectItem>
                  <SelectItem value="3">3 stars</SelectItem>
                  <SelectItem value="4">4 stars</SelectItem>
                  <SelectItem value="5">5 stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      )}

      {/* Feedback list */}
      <Card className="p-6">
        {feedbackList && feedbackList.length > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
              <Checkbox
                checked={selectedIds.length === feedbackList.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                Select all ({feedbackList.length} items)
              </span>
            </div>

            <div className="space-y-4">
            {feedbackList?.map((fb) => {
            const isSpam = fb.isSpam === 1;
            return (
                 <Card key={fb.id} className={`p-4 ${isSpam ? 'border-2 border-red-500 bg-red-50' : ''}`}>
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={selectedIds.includes(fb.id)}
                      onCheckedChange={() => handleSelectOne(fb.id)}
                    />

                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                {isSpam && (
                  <div className="mb-2 flex items-center gap-2 text-red-600">
                    <span className="text-sm font-semibold">⚠️ FLAGGED AS SPAM</span>
                    {fb.spamReason && (
                      <span className="text-xs">({fb.spamReason.replace(/_/g, ' ')})</span>
                    )}
                  </div>
                )}
                        <div>
                          <h4 className="font-semibold">
                            {fb.eventName || `Event #${fb.eventId}`}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Organizer: {fb.organizerName || "Unknown"} •{" "}
                            Event Date:{" "}
                            {fb.eventDate
                              ? new Date(fb.eventDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (
                              confirm(
                                "Delete this feedback? This cannot be undone."
                              )
                            ) {
                              deleteMutation.mutate({ feedbackId: fb.id });
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Attended:</span>{" "}
                          <span className="font-medium">
                            {fb.attended === 1 ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Rating:</span>{" "}
                          <span className="font-medium">
                            {fb.accuracyRating
                              ? `${fb.accuracyRating}/5 ⭐`
                              : "N/A"}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Submitted:</span>{" "}
                          <span className="font-medium">
                            {new Date(fb.submittedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {fb.comments && (
                        <div className="bg-muted p-3 rounded-md">
                          <div className="flex items-start gap-2">
                            <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <p className="text-sm">{fb.comments}</p>
                          </div>
                        </div>
                      )}

                      {(fb.helpfulDetails || fb.inaccurateDetails) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {fb.helpfulDetails && (
                            <div>
                              <span className="font-medium text-green-600">
                                Helpful:
                              </span>{" "}
                              {typeof fb.helpfulDetails === "string"
                                ? fb.helpfulDetails
                                : JSON.stringify(fb.helpfulDetails)}
                            </div>
                          )}
                          {fb.inaccurateDetails && (
                            <div>
                              <span className="font-medium text-red-600">
                                Inaccurate:
                              </span>{" "}
                              {typeof fb.inaccurateDetails === "string"
                                ? fb.inaccurateDetails
                                : JSON.stringify(fb.inaccurateDetails)}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
            </Card>
          );
          })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No feedback found</h3>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters"
                : "No feedback has been submitted yet"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
