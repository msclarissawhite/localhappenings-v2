import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function BrowseSeries() {
  const { data: allSeries, isLoading } = trpc.series.listAll.useQuery();

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Loading event series...</p>
        </div>
      </div>
    );
  }

  const activeSeries = allSeries?.filter((s: any) => s.isActive === 1) || [];
  const archivedSeries = allSeries?.filter((s: any) => s.isActive === 0) || [];

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Event Series</h1>
        <p className="text-lg text-muted-foreground">
          Discover recurring events and ongoing series in your community. Follow your favorites to never miss an event!
        </p>
      </div>

      {/* Active Series */}
      {activeSeries.length > 0 ? (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Active Series ({activeSeries.length})</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {activeSeries.map((series: any) => (
              <Link key={series.id} href={`/series/${series.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {series.imageUrl && (
                    <div className="h-48 bg-muted overflow-hidden">
                      <img
                        src={series.imageUrl}
                        alt={series.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="line-clamp-2">{series.name}</CardTitle>
                      <Badge variant="default" className="bg-purple-600 shrink-0">
                        <Calendar className="w-3 h-3 mr-1" />
                        Series
                      </Badge>
                    </div>
                    {series.description && (
                      <CardDescription className="line-clamp-3">
                        {series.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {series.eventCount || 0} event{series.eventCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {series.upcomingCount > 0 && (
                      <div className="mt-2">
                        <Badge variant="secondary">
                          {series.upcomingCount} upcoming
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card className="mb-12">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Series Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Event organizers can create series to group recurring events together. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Archived Series */}
      {archivedSeries.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Archived Series ({archivedSeries.length})</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {archivedSeries.map((series: any) => (
              <Link key={series.id} href={`/series/${series.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer opacity-75">
                  {series.imageUrl && (
                    <div className="h-48 bg-muted overflow-hidden">
                      <img
                        src={series.imageUrl}
                        alt={series.name}
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="line-clamp-2">{series.name}</CardTitle>
                      <Badge variant="secondary" className="shrink-0">
                        Archived
                      </Badge>
                    </div>
                    {series.description && (
                      <CardDescription className="line-clamp-3">
                        {series.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {series.eventCount || 0} event{series.eventCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
