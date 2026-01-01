import { useState, useMemo, useEffect } from "react";
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
  Baby, Volume2, Eye, Heart, Accessibility, Star, Navigation, Loader2
} from "lucide-react";
import { format } from "date-fns";

import type { EventFilters } from "@shared/types";
import { BackToTop } from "@/components/BackToTop";
import { EventTypeTags } from "@/components/EventTypeTags";
import { EventTypeSelector } from "@/components/EventTypeSelector";

import { CANADIAN_PROVINCES, CANADIAN_CITIES } from "@shared/canadian-locations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const EVENTS_PER_PAGE = 20;

type GeolocationState = 
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; latitude: number; longitude: number }
  | { status: "error"; message: string };

export default function BrowseEvents() {
  const [displayedCount, setDisplayedCount] = useState(EVENTS_PER_PAGE);
  const [geoState, setGeoState] = useState<GeolocationState>({ status: "idle" });
  const [filters, setFilters] = useState<EventFilters>({
    limit: 1000, // Fetch all events, paginate client-side
    offset: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Handle URL parameters for tag filtering
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tagId = params.get('tagId');
    if (tagId) {
      const tagIdNum = parseInt(tagId, 10);
      if (!isNaN(tagIdNum)) {
        setFilters(prev => ({ ...prev, eventTypeIds: [tagIdNum] }));
        setShowFilters(true); // Open advanced filters to show the selection
      }
    }
  }, []);
  
  // Record tag clicks mutation
  const recordTagClick = trpc.events.recordTagClick.useMutation();

  const { data: eventsData, isLoading } = trpc.events.list.useQuery(filters);
  const allEvents = (eventsData && 'events' in eventsData) ? eventsData.events : [];
  const totalCount = (eventsData && 'total' in eventsData) ? eventsData.total : 0;
  
  // Load all event types for filtering
  const { data: eventTypes = [] } = trpc.events.getEventTypes.useQuery();
  
  // Show only the first displayedCount events
  const events = allEvents.slice(0, displayedCount);
  const hasMore = displayedCount < allEvents.length;
  
  // Get feedback stats for all events
  const eventIds = events?.map((e: any) => e.id) || [];
  const { data: feedbackStats } = trpc.events.getFeedbackStats.useQuery(
    { eventIds },
    { enabled: eventIds.length > 0 }
  );
  
  // Use shared location constants for consistent data across the site
  const provinces = CANADIAN_PROVINCES.map(p => p.name);
  const getAvailableMunicipalities = (provinceName: string | undefined) => {
    if (!provinceName) return [];
    const provinceCode = CANADIAN_PROVINCES.find(p => p.name === provinceName)?.code;
    return provinceCode ? CANADIAN_CITIES[provinceCode] || [] : [];
  };
  const availableMunicipalities = getAvailableMunicipalities(filters.province);

  const updateFilter = (key: keyof EventFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setDisplayedCount(EVENTS_PER_PAGE); // Reset to initial count
    
    // Record tag clicks for analytics when eventTypeIds filter changes
    if (key === 'eventTypeIds' && Array.isArray(value)) {
      value.forEach((tagId: number) => {
        recordTagClick.mutate({ eventTypeId: tagId });
      });
    }
  };

  const toggleFilter = (key: keyof EventFilters) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    setDisplayedCount(EVENTS_PER_PAGE); // Reset to initial count
  };

  const clearFilters = () => {
    setFilters({ limit: 1000, offset: 0 });
    setGeoState({ status: "idle" });
    setDisplayedCount(EVENTS_PER_PAGE);
  };

  const handleNearMeToggle = () => {
    if (filters.nearMe) {
      // Turn off Near Me
      setFilters(prev => ({
        ...prev,
        nearMe: false,
        userLatitude: undefined,
        userLongitude: undefined,
        radiusKm: undefined,
        sortBy: undefined,
      }));
      setGeoState({ status: "idle" });
      setDisplayedCount(EVENTS_PER_PAGE);
    } else {
      // Turn on Near Me - request location
      if (!navigator.geolocation) {
        setGeoState({
          status: "error",
          message: "Geolocation is not supported by your browser",
        });
        return;
      }

      setGeoState({ status: "loading" });

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setGeoState({
            status: "success",
            latitude: lat,
            longitude: lon,
          });
          setFilters(prev => ({
            ...prev,
            nearMe: true,
            userLatitude: lat,
            userLongitude: lon,
            radiusKm: 50,
            sortBy: "distance",
          }));
          setDisplayedCount(EVENTS_PER_PAGE);
        },
        (error) => {
          let message = "Unable to retrieve your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Location information is unavailable.";
              break;
            case error.TIMEOUT:
              message = "Location request timed out.";
              break;
          }
          setGeoState({ status: "error", message });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // Cache for 5 minutes
        }
      );
    }
  };

  const loadMore = () => {
    setDisplayedCount((prev) => prev + EVENTS_PER_PAGE);
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
    <>
    <div className="py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Events</h1>
          <p className="text-muted-foreground">
            Discover accessible, family-friendly events in your community
          </p>
        </div>

        {/* Claim Event Blurb */}
        <div className="mb-6 p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>See your event listed here?</strong> If we've added your event on your behalf, you can <Link href="/contact" className="text-accent hover:underline font-medium">contact us</Link> to claim it and manage future updates.
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

        {/* Geolocation Error Message */}
        {geoState.status === "error" && (
          <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{geoState.message}</p>
          </div>
        )}

        {/* Quick Toggles */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button
            variant={filters.nearMe ? "default" : "outline"}
            size="sm"
            onClick={handleNearMeToggle}
            disabled={geoState.status === "loading"}
          >
            {geoState.status === "loading" ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            Near Me
          </Button>
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
            variant={filters.isMixed ? "default" : "outline"}
            size="sm"
            onClick={() => toggleFilter("isMixed")}
          >
            Mixed Indoor/Outdoor
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
                          {provinces.map((province) => (
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
                          {availableMunicipalities.map((municipality) => (
                            <SelectItem key={municipality} value={municipality}>
                              {municipality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Event Types Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Event Types</h3>
                  <EventTypeSelector
                    eventTypes={eventTypes}
                    selectedIds={filters.eventTypeIds || []}
                    onChange={(ids) => updateFilter('eventTypeIds', ids.length > 0 ? ids : undefined)}
                  />
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
                        id="adults"
                        checked={filters.adults || false}
                        onCheckedChange={() => toggleFilter("adults")}
                      />
                      <Label htmlFor="adults" className="cursor-pointer">
                        Adults
                      </Label>
                    </div>
                    {filters.adults && (
                      <div className="flex items-center gap-2 pl-6">
                        <Checkbox
                          id="excludeAdultsOnly"
                          checked={filters.excludeAdultsOnly || false}
                          onCheckedChange={() => toggleFilter("excludeAdultsOnly")}
                        />
                        <Label htmlFor="excludeAdultsOnly" className="cursor-pointer text-sm text-muted-foreground">
                          Exclude adults-only events
                        </Label>
                      </div>
                    )}
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
              {events.map((event: any) => (
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
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 flex-1">{event.name}</h3>
                      {event.distance !== undefined && (
                        <Badge variant="secondary" className="shrink-0">
                          <Navigation className="w-3 h-3 mr-1" />
                          {event.distance < 1 
                            ? `${(event.distance * 1000).toFixed(0)}m`
                            : `${event.distance.toFixed(1)}km`
                          }
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                  {(() => {
                    const start = new Date(event.startDate);
                    const end = event.endDate ? new Date(event.endDate) : null;
                    const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
                    const endDay = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()) : null;
                    const isSameDay = endDay && startDay.getTime() === endDay.getTime();
                    const daysDiff = endDay ? Math.round((endDay.getTime() - startDay.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    const hoursDiff = end ? (end.getTime() - start.getTime()) / (1000 * 60 * 60) : 0;
                    const isUnder24Hours = hoursDiff < 24;
                            
                            let dateStr = '';
                            if (!isSameDay && end && daysDiff > 0 && !isUnder24Hours) {
                              dateStr = `${format(start, "MMM d")} - ${format(end, "MMM d, yyyy")}`;
                            } else {
                              dateStr = format(start, "MMM d, yyyy");
                            }
                            
                            // Add time range for events under 24 hours
                            if (end && isUnder24Hours) {
                              dateStr += ` • ${format(start, "h:mm a")} - ${format(end, "h:mm a")}`;
                            } else if (!end && start.getHours() !== 0) {
                              // Show start time if no end time and start time is not midnight
                              dateStr += ` • Start time: ${format(start, "h:mm a")}`;
                            } else if (event.timeOfDay) {
                              dateStr += ` • ${event.timeOfDay.charAt(0).toUpperCase() + event.timeOfDay.slice(1).replace("-", " ")}`;
                            }
                            
                            // Add multi-day indicator only for events 24+ hours
                            if (!isSameDay && daysDiff > 0 && !isUnder24Hours) {
                              dateStr += ` • ${daysDiff + 1}-day event`;
                            }
                            
                            return dateStr;
                          })()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {event.venue ? (
                            <>
                              <span className="font-medium">{event.venue}</span>
                              <span className="text-muted-foreground"> • {event.municipality}, {event.province}</span>
                            </>
                          ) : event.neighborhood ? (
                            <>
                              <span className="font-medium">{event.neighborhood}</span>
                              <span className="text-muted-foreground"> • {event.municipality}, {event.province}</span>
                            </>
                          ) : (
                            `${event.municipality}, ${event.province}`
                          )}
                        </span>
                      </div>
                      {!!event.isFree && (
                        <div className="flex items-center gap-2 text-accent">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-medium">FREE</span>
                        </div>
                      )}
                    </div>

                    {/* Series Badge */}
                    {event.seriesName && event.seriesSlug && (
                      <div className="mb-3">
                        <Badge variant="default" className="bg-purple-600 hover:bg-purple-700">
                          <Calendar className="w-3 h-3 mr-1" />
                          Part of: {event.seriesName}
                        </Badge>
                      </div>
                    )}

                    {/* Event Type Tags */}
                    {event.eventTypes && event.eventTypes.length > 0 && (
                      <div className="mb-3">
                        <EventTypeTags eventTypes={event.eventTypes} maxDisplay={2} size="sm" />
                      </div>
                    )}

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
                      {!!event.isMixed && <Badge variant="outline">Mixed Indoor/Outdoor</Badge>}
                    </div>

                    {/* Trust Signals & Accessibility */}
                    <div className="space-y-2">
                      {feedbackStats?.[event.id]?.avgAccuracy && feedbackStats[event.id].attendedCount >= 3 && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium">
                            {feedbackStats[event.id]?.avgAccuracy?.toFixed(1) || '0'}/5
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({feedbackStats[event.id].attendedCount} attendee{feedbackStats[event.id].attendedCount !== 1 ? 's' : ''})
                          </span>
                        </div>
                      )}
                      {hasAccessibilityInfo(event) && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          <Accessibility className="w-4 h-4 text-primary" />
                          <span className="text-xs text-muted-foreground">
                            Accessibility info available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {!isLoading && hasMore && (
          <div className="mt-8 text-center">
            <Button onClick={loadMore} variant="outline" size="lg">
              Load More Events
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Showing {events.length} of {allEvents.length} events
            </p>
          </div>
        )}
      </div>
    </div>
    <BackToTop />
    </>
  );
}
