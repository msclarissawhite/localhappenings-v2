import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { TrendingUp, Users, Star, AlertTriangle, Calendar } from "lucide-react";

export function FeedbackAnalytics() {
  const { data: analytics, isLoading } = trpc.feedback.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Feedback Analytics</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const { overall, topEvents, recent } = analytics;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedback Analytics</h2>
          <p className="text-muted-foreground mt-1">
            Overview of event feedback and accuracy ratings
          </p>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Feedback</p>
              <p className="text-2xl font-bold">{overall.totalFeedback}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance Rate</p>
              <p className="text-2xl font-bold">{overall.attendanceRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {overall.totalAttended} attended
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Accuracy</p>
              <p className="text-2xl font-bold">
                {overall.avgRating ? `${overall.avgRating}/5` : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Spam Flagged</p>
              <p className="text-2xl font-bold">{overall.spamCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity (Last 30 Days) */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Last 30 Days</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Feedback Submissions</p>
            <p className="text-3xl font-bold">{recent.count}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Attended Events</p>
            <p className="text-3xl font-bold">{recent.attended}</p>
          </div>
        </div>
      </Card>

      {/* Top Rated Events */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Top Rated Events (by Accuracy)
        </h3>
        {topEvents.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No events with sufficient feedback yet (minimum 3 submissions required)
          </p>
        ) : (
          <div className="space-y-3">
            {topEvents.map((event, index) => (
              <div
                key={event.eventId}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{event.eventName}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.feedbackCount} feedback ({event.attendedCount} attended)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-lg font-bold">
                    {event.avgRating ? event.avgRating.toFixed(1) : "N/A"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
