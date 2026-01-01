/**
 * EventTypeSelector Component
 * 
 * Collapsible, searchable event type selector with subcategories
 * Based on EVENT_TYPE_UI_DESIGN.md v2.0
 */

import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Search, X } from "lucide-react";
import { EVENT_TYPE_SUBCATEGORIES, getCategoryIcon } from "../../../shared/event-type-subcategories";

interface EventTypeSelectorProps {
  selectedTypeIds: number[];
  onChange: (typeIds: number[]) => void;
  maxSelections?: number;
  showSearch?: boolean;
  mode?: "single" | "multiple";
}

interface EventType {
  id: number;
  name: string;
  category: string;
  isDeprecated: boolean;
}

export function EventTypeSelector({
  selectedTypeIds,
  onChange,
  maxSelections,
  showSearch = true,
  mode = "multiple",
}: EventTypeSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Fetch all event types
  const { data: allTypes, isLoading } = trpc.eventTypes.getAll.useQuery();
  
  // Fetch popular event types
  const { data: popularTypes } = trpc.popularEventTypes.getPopular.useQuery({ limit: 10 });

  // Filter out deprecated types
  const activeTypes = useMemo(() => {
    return (allTypes || []).filter(t => !t.isDeprecated);
  }, [allTypes]);

  // Group types by category and subcategory
  const groupedTypes = useMemo(() => {
    const result: Map<string, {
      categoryInfo: typeof EVENT_TYPE_SUBCATEGORIES[0];
      subcategories: Map<string, EventType[]>;
      flatTypes: EventType[];
    }> = new Map();

    EVENT_TYPE_SUBCATEGORIES.forEach(catStructure => {
      const subcatMap = new Map<string, EventType[]>();
      const flatTypesList: EventType[] = [];

      // Initialize subcategories
      catStructure.subcategories.forEach(subcat => {
        subcatMap.set(subcat.name, []);
      });

      // Assign types to subcategories or flat list
      activeTypes.forEach(type => {
        if (type.category !== catStructure.category) return;

        let assigned = false;

        // Try to assign to subcategory
        for (const subcat of catStructure.subcategories) {
          if (subcat.typeNames.includes(type.name)) {
            const list = subcatMap.get(subcat.name) || [];
            list.push(type);
            subcatMap.set(subcat.name, list);
            assigned = true;
            break;
          }
        }

        // If not in subcategory, add to flat list
        if (!assigned) {
          flatTypesList.push(type);
        }
      });

      result.set(catStructure.category, {
        categoryInfo: catStructure,
        subcategories: subcatMap,
        flatTypes: flatTypesList,
      });
    });

    return result;
  }, [activeTypes]);

  // Filter types based on search
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;

    const query = searchQuery.toLowerCase();
    const matches: Array<{
      type: EventType;
      category: string;
      subcategory: string | null;
    }> = [];

    groupedTypes.forEach((group, category) => {
      // Search in subcategories
      group.subcategories.forEach((types, subcatName) => {
        types.forEach(type => {
          if (type.name.toLowerCase().includes(query)) {
            matches.push({ type, category, subcategory: subcatName });
          }
        });
      });

      // Search in flat types
      group.flatTypes.forEach(type => {
        if (type.name.toLowerCase().includes(query)) {
          matches.push({ type, category, subcategory: null });
        }
      });
    });

    return matches;
  }, [searchQuery, groupedTypes]);

  // Auto-expand categories containing selected types on load
  useEffect(() => {
    if (selectedTypeIds.length === 0) return;

    const categoriesToExpand = new Set<string>();
    const subcategoriesToExpand = new Set<string>();

    selectedTypeIds.forEach(id => {
      const type = activeTypes.find(t => t.id === id);
      if (!type) return;

      categoriesToExpand.add(type.category);

      // Find subcategory
      const group = groupedTypes.get(type.category);
      if (!group) return;

      group.subcategories.forEach((types, subcatName) => {
        if (types.some(t => t.id === id)) {
          subcategoriesToExpand.add(`${type.category}-${subcatName}`);
        }
      });
    });

    setExpandedCategories(categoriesToExpand);
    setExpandedSubcategories(subcategoriesToExpand);
  }, [selectedTypeIds, activeTypes, groupedTypes]);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const toggleSubcategory = (key: string) => {
    setExpandedSubcategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleTypeToggle = (typeId: number) => {
    if (mode === "single") {
      onChange([typeId]);
      return;
    }

    const isSelected = selectedTypeIds.includes(typeId);
    
    if (isSelected) {
      onChange(selectedTypeIds.filter(id => id !== typeId));
    } else {
      if (maxSelections && selectedTypeIds.length >= maxSelections) {
        return; // Don't allow more selections
      }
      onChange([...selectedTypeIds, typeId]);
    }
  };

  const removeType = (typeId: number) => {
    onChange(selectedTypeIds.filter(id => id !== typeId));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedTypes = useMemo(() => {
    return activeTypes.filter(t => selectedTypeIds.includes(t.id));
  }, [activeTypes, selectedTypeIds]);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading event types...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      {showSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search event types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Selected Types Display */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-md">
          <span className="text-sm font-medium">Selected:</span>
          {selectedTypes.map(type => (
            <Badge key={type.id} variant="secondary" className="gap-1">
              {type.name}
              <button
                type="button"
                onClick={() => removeType(type.id)}
                className="ml-1 hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTypes.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="h-6 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      )}

      {/* Search Results */}
      {filteredResults && (
        <div className="space-y-2">
          <div className="text-sm font-medium">
            Results ({filteredResults.length})
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto border rounded-md p-2">
            {filteredResults.map(({ type, category, subcategory }) => (
              <label
                key={type.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
              >
                <Checkbox
                  checked={selectedTypeIds.includes(type.id)}
                  onCheckedChange={() => handleTypeToggle(type.id)}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{type.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {getCategoryIcon(category)} {groupedTypes.get(category)?.categoryInfo.displayName}
                    {subcategory && ` → ${subcategory}`}
                  </div>
                </div>
              </label>
            ))}
            {filteredResults.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-4">
                No event types found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Category List (when not searching) */}
      {!filteredResults && (
        <div className="space-y-2 max-h-[600px] overflow-y-auto border rounded-md p-2">
          {Array.from(groupedTypes.entries()).map(([category, group]) => {
            const isExpanded = expandedCategories.has(category);
            const typeCount = 
              Array.from(group.subcategories.values()).reduce((sum, types) => sum + types.length, 0) +
              group.flatTypes.length;

            return (
              <div key={category} className="border rounded-md">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-accent rounded-md transition-colors text-left"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <span className="text-lg">{group.categoryInfo.icon}</span>
                  <span className="font-medium flex-1">
                    {group.categoryInfo.displayName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({typeCount})
                  </span>
                </button>

                {/* Category Content */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {/* Popular Types in this Category */}
                    {popularTypes && popularTypes.filter(p => p.category === category).length > 0 && (
                      <div className="ml-4 mb-3">
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                          <span>⭐</span> Popular
                        </div>
                        <div className="space-y-1">
                          {popularTypes
                            .filter(p => p.category === category)
                            .slice(0, 3)
                            .map(popular => {
                              const type = activeTypes.find(t => t.id === popular.typeId);
                              if (!type) return null;
                              return (
                                <label
                                  key={type.id}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer bg-accent/30"
                                >
                                  <Checkbox
                                    checked={selectedTypeIds.includes(type.id)}
                                    onCheckedChange={() => handleTypeToggle(type.id)}
                                  />
                                  <span className="text-sm font-medium">{type.name}</span>
                                  <Badge variant="secondary" className="ml-auto text-xs">Popular</Badge>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Subcategories */}
                    {Array.from(group.subcategories.entries()).map(([subcatName, types]) => {
                      if (types.length === 0) return null;

                      const subcatKey = `${category}-${subcatName}`;
                      const isSubcatExpanded = expandedSubcategories.has(subcatKey);

                      return (
                        <div key={subcatKey} className="ml-4">
                          {/* Subcategory Header */}
                          <button
                            type="button"
                            onClick={() => toggleSubcategory(subcatKey)}
                            className="w-full flex items-center gap-2 p-2 hover:bg-accent/50 rounded text-left"
                          >
                            {isSubcatExpanded ? (
                              <ChevronDown className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium flex-1">
                              {subcatName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ({types.length})
                            </span>
                          </button>

                          {/* Subcategory Types */}
                          {isSubcatExpanded && (
                            <div className="ml-6 space-y-1 mt-1">
                              {types.map(type => (
                                <label
                                  key={type.id}
                                  className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                                >
                                  <Checkbox
                                    checked={selectedTypeIds.includes(type.id)}
                                    onCheckedChange={() => handleTypeToggle(type.id)}
                                  />
                                  <span className="text-sm">{type.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Flat Types (not in subcategories) */}
                    {group.flatTypes.length > 0 && (
                      <div className="ml-4 space-y-1">
                        {group.flatTypes.map(type => (
                          <label
                            key={type.id}
                            className="flex items-center gap-2 p-2 rounded hover:bg-accent cursor-pointer"
                          >
                            <Checkbox
                              checked={selectedTypeIds.includes(type.id)}
                              onCheckedChange={() => handleTypeToggle(type.id)}
                            />
                            <span className="text-sm">{type.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Max selections warning */}
      {maxSelections && selectedTypeIds.length >= maxSelections && (
        <div className="text-sm text-muted-foreground">
          Maximum {maxSelections} type{maxSelections !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}
