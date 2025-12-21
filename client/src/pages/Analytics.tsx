import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Users, CheckCircle, Clock, XCircle, MapPin } from "lucide-react";

export default function Analytics() {
  const { user, isAuthenticated } = useAuth();
  const { data: analytics, isLoading } = trpc.events.analytics.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });
  
  const { data: tagAnalytics = [] } = trpc.events.getTagAnalytics.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
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

  if (isLoading) {
    return (
      <div className="py-16">
        <div className="container text-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-16">
        <div className="container text-center">
          <p className="text-muted-foreground">No analytics data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="container">
        <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Total Events</h3>
              <Users className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{analytics.totalEvents}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Published</h3>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{analytics.publishedEvents}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Pending Review</h3>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-3xl font-bold">{analytics.pendingEvents}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground">Approval Rate</h3>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{analytics.approvalRate}%</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Cities */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Cities by Events
            </h3>
            {analytics.topCities.length > 0 ? (
              <div className="space-y-3">
                {analytics.topCities.map((municipality, index) => (
                  <div key={municipality.municipality} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                      <span className="font-medium">{municipality.municipality}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{municipality.count} events</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </Card>

          {/* Top Provinces */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Top Provinces by Events
            </h3>
            {analytics.topProvinces.length > 0 ? (
              <div className="space-y-3">
                {analytics.topProvinces.map((province, index) => (
                  <div key={province.province} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                      <span className="font-medium">{province.province}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{province.count} events</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </Card>
        </div>

        {/* Events by Month Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Events by Month (Last 6 Months)</h3>
          {analytics.eventsByMonth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.eventsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0ea5e9" name="Events" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">No data available</p>
          )}
        </Card>

        {/* Tag Analytics */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Tag Click Analytics
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Track which event type tags users are most interested in based on filter usage
          </p>
          {tagAnalytics.length > 0 ? (
            <div className="space-y-3">
              {tagAnalytics.map((tag, index) => (
                <div key={tag.eventTypeId} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-muted-foreground w-8">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{tag.eventTypeName}</span>
                      <span className="text-sm text-muted-foreground">{tag.clickCount} clicks</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min((Number(tag.clickCount) / Number(tagAnalytics[0]?.clickCount || 1)) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground capitalize">
                    {tag.category?.replace('-', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No tag click data yet. Tags will appear here once users start filtering events.</p>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6 mt-6">
          <h3 className="text-lg font-semibold mb-2">Recent Activity</h3>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{analytics.recentSubmissions}</span> events submitted in
            the last 7 days
          </p>
        </Card>
      </div>
    </div>
  );
}
