import { Badge } from '@/components/ui/badge';

interface EventType {
  id: number;
  name: string;
  category: string;
}

interface EventTypeTagsProps {
  eventTypes: EventType[];
  maxDisplay?: number;
  size?: 'sm' | 'default';
}

const CATEGORY_COLORS: Record<string, string> = {
  'family-kids': 'bg-pink-100 text-pink-800 border-pink-200',
  'arts-culture': 'bg-purple-100 text-purple-800 border-purple-200',
  'community-social': 'bg-blue-100 text-blue-800 border-blue-200',
  'recreation-sports': 'bg-green-100 text-green-800 border-green-200',
  'markets-festivals': 'bg-orange-100 text-orange-800 border-orange-200',
  'seasonal': 'bg-red-100 text-red-800 border-red-200',
};

export function EventTypeTags({ eventTypes, maxDisplay = 3, size = 'default' }: EventTypeTagsProps) {
  if (!eventTypes || eventTypes.length === 0) return null;

  const displayTags = eventTypes.slice(0, maxDisplay);
  const remaining = eventTypes.length - maxDisplay;

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayTags.map((type) => {
        const colorClass = CATEGORY_COLORS[type.category] || 'bg-gray-100 text-gray-800 border-gray-200';
        return (
          <Badge
            key={type.id}
            variant="outline"
            className={`${colorClass} ${size === 'sm' ? 'text-xs px-2 py-0' : ''}`}
          >
            {type.name}
          </Badge>
        );
      })}
      {remaining > 0 && (
        <Badge variant="outline" className={`bg-gray-50 text-gray-600 border-gray-200 ${size === 'sm' ? 'text-xs px-2 py-0' : ''}`}>
          +{remaining} more
        </Badge>
      )}
    </div>
  );
}
