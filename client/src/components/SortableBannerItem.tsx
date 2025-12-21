import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

interface SortableBannerItemProps {
  banner: any;
  onEdit: (banner: any) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number, currentStatus: number) => void;
}

export function SortableBannerItem({ banner, onEdit, onDelete, onToggleActive }: SortableBannerItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6">
      <div className="flex items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1"
        >
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold">{banner.title}</h3>
            {banner.isActive === 1 ? (
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Active</span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">Inactive</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-3">{banner.description}</p>
          
          {/* Preview */}
          <div className={`bg-gradient-to-r ${banner.bgGradient} p-4 rounded-lg mb-3`}>
            <div className={`${banner.textColor} font-medium`}>
              {banner.title}
            </div>
            <div className={`${banner.textColor} text-sm opacity-90`}>
              {banner.description}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {banner.eventTypeIds && banner.eventTypeIds.length > 0 && (
              <span>Filters: {banner.eventTypeIds.length} event type(s)</span>
            )}
            {banner.startDate && banner.endDate && (
              <span>
                Dates: {new Date(banner.startDate).toLocaleDateString()} - {new Date(banner.endDate).toLocaleDateString()}
              </span>
            )}
            {banner.activeMonths && banner.activeMonths.length > 0 && (
              <span>
                Months: {banner.activeMonths.map((m: number) => MONTH_NAMES[m]).join(", ")}
              </span>
            )}
            <span>Sort Order: {banner.sortOrder}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(banner.id, banner.isActive)}
          >
            {banner.isActive === 1 ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(banner)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(banner.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
