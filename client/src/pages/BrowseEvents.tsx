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
import { 
  Calendar, MapPin, DollarSign, Users, Filter, X, Search,
  Baby, Volume2, Eye, Heart, Accessibility
} from "lucide-react";
import { format } from "date-fns";
import type { EventFilters } from "@shared/types";
import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function BrowseEvents() {
  const [filters, setFilters] = useState<EventFilters>({
    limit: 20,
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: events, isLoading } = trpc.events.list.useQuery(filters);
  
  // Use shared location constants for consistent data across the site
  const provinces = CANADIAN_PROVINCES.map(p => p.name);
  const getAvailableMunicipalities = (provinceName: string | undefined) => {
    if (!provinceName) return [];
    const provinceCode = CANADIAN_PROVINCES.find(p => p.name === provinceName)?.code;
    return provinceCode ? CANADIAN_CITIES[provinceCode] || [] : [];
  };
  const availableMunicipalities = getAvailableMunicipalities(filters.province);

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
      (key) => key !== "limit" && key !== "offset" && key !== "sortBy" && filters[key as keyof EventFilters]
    ).length;
  }, [filters]);

  // Helper to check if event has any accessibility features
  const hasAccessibilityInfo = (event: any) => {
    try {
      const accessibility = typeof event.accessibility === 'string' 
        ? JSON.parse(event.accessibility) 
        : event.accessibility;
      
      // Check if any accessibility category has "yes" values
      return Object.values(accessibility || {}).some((category: any) =>
        Object.values(category || {}).some((value) => value === "yes")
      );
    } catch {
      return false;
    }
  };

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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events by name, description, venue, or organizer..."
              value={filters.search || ""}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-10 pr-10"
            />
            {filters.search && (
              <button
                onClick={() => updateFilter("search", "")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Filters - Location & Time */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Province/Territory */}
          <div>
            <Label htmlFor="province-filter" className="text-sm font-medium mb-2 block">
              Province/Territory
            </Label>
            <Select
              value={filters.province || "all"}
              onValueChange={(value) => updateFilter("province", value === "all" ? undefined : value)}
            >
              <SelectTrigger id="province-filter">
                <SelectValue placeholder="All provinces" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All provinces</SelectItem>
                {provinces.map((province) => (
                  <SelectItem key={province} value={province}>
                    {province}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Municipality */}
          <div>
            <Label htmlFor="municipality-filter" className="text-sm font-medium mb-2 block">
              Municipality
            </Label>
            <Select
              value={filters.municipality || "all"}
              onValueChange={(value) => updateFilter("municipality", value === "all" ? undefined : value)}
              disabled={!filters.province}
            >
              <SelectTrigger id="municipality-filter">
                <SelectValue placeholder={filters.province ? "All municipalities" : "Select province first"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All municipalities</SelectItem>
                {availableMunicipalities.map((municipality) => (
                  <SelectItem key={municipality} value={municipality}>
                    {municipality}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time of Day */}
          <div>
            <Label htmlFor="time-filter" className="text-sm font-medium mb-2 block">
              Time of Day
            </Label>
            <Select
              value={filters.timeOfDay || "any"}
              onValueChange={(value) => updateFilter("timeOfDay", value === "any" ? undefined : value)}
            >
              <SelectTrigger id="time-filter">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any time</SelectItem>
                <SelectItem value="morning">Morning</SelectItem>
                <SelectItem value="afternoon">Afternoon</SelectItem>
                <SelectItem value="evening">Evening</SelectItem>
                <SelectItem value="all-day">All Day</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
          <Button
            variant={filters.showArchived ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("showArchived")}
          >
            Show Archived
          </Button>
        </div>

        {/* Accessibility Filter Presets */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Accessibility className="w-4 h-4" />
            Accessibility Presets
          </h3>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={(filters.wheelchairEntrance && filters.stepFreeEntry && filters.accessibleWashrooms) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const isActive = filters.wheelchairEntrance && filters.stepFreeEntry && filters.accessibleWashrooms;
                setFilters((prev) => ({
                  ...prev,
                  wheelchairEntrance: !isActive,
                  stepFreeEntry: !isActive,
                  accessibleWashrooms: !isActive,
                  accessibleParking: !isActive,
                  offset: 0,
                }));
              }}
            >
              ♿ Wheelchair Accessible
            </Button>
            <Button
              variant={(filters.quietEnvironment && filters.sensoryFriendly && filters.crowdLevel) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const isActive = filters.quietEnvironment && filters.sensoryFriendly && filters.crowdLevel;
                setFilters((prev) => ({
                  ...prev,
                  quietEnvironment: !isActive,
                  sensoryFriendly: !isActive,
                  crowdLevel: !isActive,
                  quietRoom: !isActive,
                  offset: 0,
                }));
              }}
            >
              🔇 Sensory-Friendly
            </Button>
            <Button
              variant={(filters.busStopDistance && filters.accessibleSidewalks) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const isActive = filters.busStopDistance && filters.accessibleSidewalks;
                setFilters((prev) => ({
                  ...prev,
                  busStopDistance: !isActive,
                  accessibleSidewalks: !isActive,
                  offset: 0,
                }));
              }}
            >
              🚌 Transit Accessible
            </Button>
            <Button
              variant={(filters.strollerAccessible && filters.changeTablesPresent && filters.nursingFriendly) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const isActive = filters.strollerAccessible && filters.changeTablesPresent && filters.nursingFriendly;
                setFilters((prev) => ({
                  ...prev,
                  strollerAccessible: !isActive,
                  changeTablesPresent: !isActive,
                  nursingFriendly: !isActive,
                  strollerSpace: !isActive,
                  offset: 0,
                }));
              }}
            >
              👶 Family-Friendly
            </Button>
          </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
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
                          {locations?.provinces?.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Municipality</Label>
                      <Select
                        value={filters.municipality || "__all__"}
                        onValueChange={(value) => updateFilter("municipality", value === "__all__" ? undefined : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All cities" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All cities</SelectItem>
                          {locations?.municipalities?.map((municipality) => (
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
                        id="allAges"
                        checked={filters.allAges || false}
                        onCheckedChange={() => toggleFilter("allAges")}
                      />
                      <Label htmlFor="allAges" className="cursor-pointer">
                        All Ages
                      </Label>
                    </div>
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
                        id="adultsOnly"
                        checked={filters.adultsOnly || false}
                        onCheckedChange={() => toggleFilter("adultsOnly")}
                      />
                      <Label htmlFor="adultsOnly" className="cursor-pointer">
                        Adults Only
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

              {/* Right Column - Accessibility Filters */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-primary" />
                  Accessibility Features
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Filter by specific accessibility needs
                </p>
                
                <Accordion type="multiple" className="w-full">
                  {/* Caregiver & Infant */}
                  <AccordionItem value="caregiver">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4" />
                        Caregiver & Infant
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="changeTablesPresent"
                            checked={filters.changeTablesPresent || false}
                            onCheckedChange={() => toggleFilter("changeTablesPresent")}
                          />
                          <Label htmlFor="changeTablesPresent" className="cursor-pointer text-sm">
                            Change tables
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="nursingFriendly"
                            checked={filters.nursingFriendly || false}
                            onCheckedChange={() => toggleFilter("nursingFriendly")}
                          />
                          <Label htmlFor="nursingFriendly" className="cursor-pointer text-sm">
                            Nursing friendly
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="strollerSpace"
                            checked={filters.strollerSpace || false}
                            onCheckedChange={() => toggleFilter("strollerSpace")}
                          />
                          <Label htmlFor="strollerSpace" className="cursor-pointer text-sm">
                            Stroller space
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Mobility & Physical Access */}
                  <AccordionItem value="mobility">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Accessibility className="w-4 h-4" />
                        Mobility & Physical Access
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="wheelchairEntrance"
                            checked={filters.wheelchairEntrance || false}
                            onCheckedChange={() => toggleFilter("wheelchairEntrance")}
                          />
                          <Label htmlFor="wheelchairEntrance" className="cursor-pointer text-sm">
                            Wheelchair accessible
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="stepFreeEntry"
                            checked={filters.stepFreeEntry || false}
                            onCheckedChange={() => toggleFilter("stepFreeEntry")}
                          />
                          <Label htmlFor="stepFreeEntry" className="cursor-pointer text-sm">
                            Step-free entry
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="accessibleWashrooms"
                            checked={filters.accessibleWashrooms || false}
                            onCheckedChange={() => toggleFilter("accessibleWashrooms")}
                          />
                          <Label htmlFor="accessibleWashrooms" className="cursor-pointer text-sm">
                            Accessible washrooms
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="busStopDistance"
                            checked={filters.busStopDistance || false}
                            onCheckedChange={() => toggleFilter("busStopDistance")}
                          />
                          <Label htmlFor="busStopDistance" className="cursor-pointer text-sm">
                            Near bus stop
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="accessibleSidewalks"
                            checked={filters.accessibleSidewalks || false}
                            onCheckedChange={() => toggleFilter("accessibleSidewalks")}
                          />
                          <Label htmlFor="accessibleSidewalks" className="cursor-pointer text-sm">
                            Accessible sidewalks
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="bikeRacks"
                            checked={filters.bikeRacks || false}
                            onCheckedChange={() => toggleFilter("bikeRacks")}
                          />
                          <Label htmlFor="bikeRacks" className="cursor-pointer text-sm">
                            Bike racks available
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="coveredBikeParking"
                            checked={filters.coveredBikeParking || false}
                            onCheckedChange={() => toggleFilter("coveredBikeParking")}
                          />
                          <Label htmlFor="coveredBikeParking" className="cursor-pointer text-sm">
                            Covered bike parking
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Sensory & Neurodivergent */}
                  <AccordionItem value="sensory">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4" />
                        Sensory & Neurodivergent
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="sensoryFriendly"
                            checked={filters.sensoryFriendly || false}
                            onCheckedChange={() => toggleFilter("sensoryFriendly")}
                          />
                          <Label htmlFor="sensoryFriendly" className="cursor-pointer text-sm">
                            Sensory-friendly
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="quietRoom"
                            checked={filters.quietRoom || false}
                            onCheckedChange={() => toggleFilter("quietRoom")}
                          />
                          <Label htmlFor="quietRoom" className="cursor-pointer text-sm">
                            Quiet room available
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="quietEnvironment"
                            checked={filters.quietEnvironment || false}
                            onCheckedChange={() => toggleFilter("quietEnvironment")}
                          />
                          <Label htmlFor="quietEnvironment" className="cursor-pointer text-sm">
                            Quiet environment
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="crowdLevel"
                            checked={filters.crowdLevel || false}
                            onCheckedChange={() => toggleFilter("crowdLevel")}
                          />
                          <Label htmlFor="crowdLevel" className="cursor-pointer text-sm">
                            Spacious (low crowd)
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Social & Emotional */}
                  <AccordionItem value="social">
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Social & Emotional
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="serviceAnimalsWelcome"
                            checked={filters.serviceAnimalsWelcome || false}
                            onCheckedChange={() => toggleFilter("serviceAnimalsWelcome")}
                          />
                          <Label htmlFor="serviceAnimalsWelcome" className="cursor-pointer text-sm">
                            Service animals welcome
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="flexibleParticipation"
                            checked={filters.flexibleParticipation || false}
                            onCheckedChange={() => toggleFilter("flexibleParticipation")}
                          />
                          <Label htmlFor="flexibleParticipation" className="cursor-pointer text-sm">
                            Flexible participation
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="genderNeutralWashrooms"
                            checked={filters.genderNeutralWashrooms || false}
                            onCheckedChange={() => toggleFilter("genderNeutralWashrooms")}
                          />
                          <Label htmlFor="genderNeutralWashrooms" className="cursor-pointer text-sm">
                            Gender-neutral washrooms
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="lgbtqiaFriendly"
                            checked={filters.lgbtqiaFriendly || false}
                            onCheckedChange={() => toggleFilter("lgbtqiaFriendly")}
                          />
                          <Label htmlFor="lgbtqiaFriendly" className="cursor-pointer text-sm">
                            LGBTQIA+ friendly
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="scentFree"
                            checked={filters.scentFree || false}
                            onCheckedChange={() => toggleFilter("scentFree")}
                          />
                          <Label htmlFor="scentFree" className="cursor-pointer text-sm">
                            Scent-free
                          </Label>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </Card>
        )}

        {/* Events List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : !events || events.length === 0 ? (
          // Check if this is truly empty (no filters applied) vs filtered empty
          Object.keys(filters).length === 2 && filters.limit === 20 && filters.offset === 0 ? (
            // Empty state - no events in database at all
            <div className="text-center py-16 px-4">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">We're Collecting Our First Events!</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Local Happenings is brand new and we're actively gathering events to list. 
                Help us build this community by submitting an event you know about!
              </p>
              <Link href="/submit">
                <Button size="lg">
                  Submit an Event
                </Button>
              </Link>
            </div>
          ) : (
            // Filtered empty state
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No events found matching your filters.</p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          )
        ) : (
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
                        <span>
                          {event.endDate && event.endDate !== event.startDate
                            ? `${format(new Date(event.startDate), "MMM d")} - ${format(new Date(event.endDate), "MMM d, yyyy")}`
                            : format(new Date(event.startDate), "MMM d, yyyy")}
                          {event.timeOfDay && ` • ${event.timeOfDay.charAt(0).toUpperCase() + event.timeOfDay.slice(1).replace("-", " ")}`}
                          {event.endDate && event.endDate !== event.startDate && (() => {
                            const days = Math.ceil((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                            return ` • ${days}-day event`;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.municipality}, {event.province}</span>
                      </div>
                      {!!event.isFree && (
                        <div className="flex items-center gap-2 text-accent">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">FREE</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {!!event.familyFriendly && (
                        <Badge variant="secondary">
                          <Users className="w-3 h-3 mr-1" />
                          Family-Friendly
                        </Badge>
                      )}
                      {!!event.youngChildren && (
                        <Badge variant="outline">Ages 0-5</Badge>
                      )}
                      {!!event.isIndoor && <Badge variant="outline">Indoor</Badge>}
                      {!!event.isOutdoor && <Badge variant="outline">Outdoor</Badge>}
                    </div>

                    {/* Accessibility Icons */}
                    {hasAccessibilityInfo(event) && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <Accessibility className="w-4 h-4 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Accessibility info available
                        </span>
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
