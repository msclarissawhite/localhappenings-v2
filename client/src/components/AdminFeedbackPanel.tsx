import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Star, Trash2, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AdminFeedbackPanelProps {
  eventId: number;
  eventName: string;
}

export function AdminFeedbackPanel({ eventId, eventName }: AdminFeedbackPanelProps) {
  const utils = trpc.useUtils();
  const { data: feedback, isLoading } = trpc.feedback.getForEvent.useQuery({ eventId });
  const { data: stats } = trpc.feedback.getStats.useQuery({ eventId });

  const deleteMutation = trpc.feedback.delete.useMutation({
    onSuccess: () => {
      utils.feedback.getForEvent.invalidate({ eventId });
      utils.feedback.getStats.invalidate({ eventId });
      toast.success("Feedback deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete feedback: ${error.message}`);
    },
  });

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>;
  }

  if (!feedback || feedback.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">
          No feedback received for this event yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      {stats && (
        <Card className="p-4 bg-muted/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalFeedback}</div>
              <div className="text-sm text-muted-foreground">Total Responses</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.attendedCount}</div>
              <div className="text-sm text-muted-foreground">Attended</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {stats.avgAccuracy ? stats.avgAccuracy.toFixed(1) : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">Avg Accuracy</div>
            </div>
          </div>
        </Card>
      )}

      {/* Individual Feedback Items */}
      <div className="space-y-3">
        {feedback.map((item) => {
          const helpfulDetails = item.helpfulDetails ? JSON.parse(item.helpfulDetails as string) : [];
          const inaccurateDetails = item.inaccurateDetails
            ? JSON.parse(item.inaccurateDetails as string)
            : [];

          return (
            <Card key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    {item.attended === 1 ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Attended
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="gap-1">
                        <XCircle className="w-3 h-3" />
                        Did Not Attend
                      </Badge>
                    )}
                    {item.accuracyRating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < item.accuracyRating!
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">
                          {item.accuracyRating}/5
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">
                      {format(new Date(item.submittedAt), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  </div>

                  {/* Helpful Details */}
                  {helpfulDetails.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Helpful Details:</div>
                      <div className="flex flex-wrap gap-2">
                        {helpfulDetails.map((detail: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {detail}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inaccurate Details */}
                  {inaccurateDetails.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Inaccurate/Missing:</div>
                      <div className="flex flex-wrap gap-2">
                        {inaccurateDetails.map((detail: string, idx: number) => (
                          <Badge key={idx} variant="destructive" className="text-xs">
                            {detail}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {item.comments && (
                    <div>
                      <div className="text-sm font-medium mb-1">Comments:</div>
                      <p className="text-sm text-muted-foreground italic">{item.comments}</p>
                    </div>
                  )}

                  {/* Sync Status */}
                  {item.syncedToClickUp === 1 && (
                    <div className="text-xs text-muted-foreground">
                      ✓ Synced to ClickUp
                      {item.clickUpSyncedAt &&
                        ` on ${format(new Date(item.clickUpSyncedAt), "MMM d, yyyy")}`}
                    </div>
                  )}
                </div>

                {/* Delete Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Feedback?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this feedback submission. This action cannot be
                        undone. Use this only for spam or harassment.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => deleteMutation.mutate({ feedbackId: item.id })}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
