import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Calendar, MapPin, DollarSign, Users, Filter, X } from "lucide-react";
import { format } from "date-fns";
import type { EventFilters } from "@shared/types";

export default function BrowseEvents() {
  const [filters, setFilters] = useState<EventFilters>({
    limit: 20,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: events, isLoading } = trpc.events.list.useQuery(filters);
  const { data: locations } = trpc.events.getLocations.useQuery();

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const toggleFilter = (key: keyof EventFilters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key], offset: 0 }));
  };

  const clearFilters = () => {
    setFilters({ limit: 20, offset: 0 });
  };

  const activeFilterCount = useMemo(() => {
    return Object.keys(filters).filter(
      (key) => key !== "limit" && key !== "offset" && filters[key as keyof EventFilters]
    ).length;
  }, [filters]);

  return (
    <div className="py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Events</h1>
          <p className="text-muted-foreground">
            Discover accessible, family-friendly events in your community
          </p>
        </div>

        {/* Quick Toggles */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            variant={filters.today ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("today")}
          >
            Today
          </Button>
          <Button
            variant={filters.isFree ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("isFree")}
          >
            Free
          </Button>
          <Button
            variant={filters.familyFriendly ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("familyFriendly")}
          >
            Family-Friendly
          </Button>
          <Button
            variant={filters.youngChildren ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("youngChildren")}
          >
            Young Children (0-5)
          </Button>
          <Button
            variant={filters.isIndoor ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("isIndoor")}
          >
            Indoor
          </Button>
          <Button
            variant={filters.isOutdoor ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("isOutdoor")}
          >
            Outdoor
          </Button>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-2">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Location Filters */}
              <div>
                <h3 className="font-semibold mb-3">Location</h3>
                <div className="space-y-3">
                  <div>
                    <Label>Province</Label>
                    <Select
                      value={filters.province || "__all__"}
                      onValueChange={(value) => updateFilter("province", value === "__all__" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All provinces" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All provinces</SelectItem>
                        {locations?.provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City</Label>
                    <Select
                      value={filters.municipality || "__all__"}
                      onValueChange={(value) => updateFilter("municipality", value === "__all__" ? undefined : value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All cities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__all__">All cities</SelectItem>
                        {locations?.cities.map((municipality) => (
                          <SelectItem key={municipality} value={municipality}>
                            {municipality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Age Filters */}
              <div>
                <h3 className="font-semibold mb-3">Age Groups</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="kids"
                      checked={filters.kids || false}
                      onCheckedChange={() => toggleFilter("kids")}
                    />
                    <Label htmlFor="kids" className="cursor-pointer">
                      Kids (6-12)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="teens"
                      checked={filters.teens || false}
                      onCheckedChange={() => toggleFilter("teens")}
                    />
                    <Label htmlFor="teens" className="cursor-pointer">
                      Teens
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="seniors"
                      checked={filters.seniors || false}
                      onCheckedChange={() => toggleFilter("seniors")}
                    />
                    <Label htmlFor="seniors" className="cursor-pointer">
                      Seniors
                    </Label>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold mb-3">Sort By</h3>
                <Select
                  value={filters.sortBy || "soonest"}
                  onValueChange={(value: any) => updateFilter("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soonest">Soonest</SelectItem>
                    <SelectItem value="latest">Latest</SelectItem>
                    <SelectItem value="name-az">Name (A-Z)</SelectItem>
                    <SelectItem value="name-za">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Link key={event.id} href={`/event/${event.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                  {event.imageUrl && (
                    <div className="h-48 bg-muted overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.name}</h3>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(event.startDate), "MMM d, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.municipality}, {event.province}</span>
                      </div>
                      {event.isFree ? (
                        <div className="flex items-center gap-2 text-accent">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">FREE</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {event.familyFriendly ? (
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          Family-Friendly
                        </Badge>
                      ) : null}
                      {event.youngChildren ? (
                        <Badge variant="outline">Ages 0-5</Badge>
                      ) : null}
                      {event.isIndoor ? <Badge variant="outline">Indoor</Badge> : null}
                      {event.isOutdoor ? <Badge variant="outline">Outdoor</Badge> : null}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No events found matching your filters.</p>
            <Button onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
