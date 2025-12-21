import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface EventType {
  id: number;
  name: string;
  category: 'family-kids' | 'arts-culture' | 'community-social' | 'recreation-sports' | 'markets-festivals' | 'seasonal';
  createdAt: Date;
}

interface EventTypeSelectorProps {
  eventTypes: EventType[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  'family-kids': 'Family & Kids',
  'arts-culture': 'Arts & Culture',
  'community-social': 'Community & Social',
  'recreation-sports': 'Recreation & Sports',
  'markets-festivals': 'Markets & Festivals',
  'seasonal': 'Seasonal',
};

export function EventTypeSelector({ eventTypes, selectedIds, onChange }: EventTypeSelectorProps) {
  const [groupedTypes, setGroupedTypes] = useState<Record<string, EventType[]>>({});

  useEffect(() => {
    // Group event types by category
    const grouped = eventTypes.reduce((acc, type) => {
      const category = type.category || 'community-social';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(type);
      return acc;
    }, {} as Record<string, EventType[]>);

    setGroupedTypes(grouped);
  }, [eventTypes]);

  const handleToggle = (typeId: number) => {
    const newSelected = selectedIds.includes(typeId)
      ? selectedIds.filter(id => id !== typeId)
      : [...selectedIds, typeId];
    onChange(newSelected);
  };

  const categoryOrder = ['family-kids', 'arts-culture', 'community-social', 'recreation-sports', 'markets-festivals', 'seasonal'];

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Select all event types that apply to help attendees find your event. You can select multiple types.
      </div>
      
      <div className="grid gap-4 md:grid-cols-2">
        {categoryOrder.map(category => {
          const types = groupedTypes[category] || [];
          if (types.length === 0) return null;

          return (
            <Card key={category} className="p-4">
              <h4 className="font-medium mb-3 text-sm">{CATEGORY_LABELS[category]}</h4>
              <div className="space-y-2">
                {types.map(type => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type.id}`}
                      checked={selectedIds.includes(type.id)}
                      onCheckedChange={() => handleToggle(type.id)}
                    />
                    <Label
                      htmlFor={`type-${type.id}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {type.name}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {selectedIds.length} {selectedIds.length === 1 ? 'type' : 'types'} selected
        </div>
      )}
    </div>
  );
}
