import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableBannerItem } from "@/components/SortableBannerItem";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const GRADIENT_PRESETS = [
  { name: "Festive (Red to Green)", value: "from-red-500 to-green-600", textColor: "text-white" },
  { name: "New Year (Purple to Blue)", value: "from-purple-600 to-blue-500", textColor: "text-white" },
  { name: "Halloween (Orange to Purple)", value: "from-orange-500 to-purple-600", textColor: "text-white" },
  { name: "Easter (Pink to Purple)", value: "from-pink-400 to-purple-500", textColor: "text-white" },
  { name: "Summer (Yellow to Orange)", value: "from-yellow-400 to-orange-500", textColor: "text-gray-900" },
  { name: "Winter (Blue to Cyan)", value: "from-blue-400 to-cyan-500", textColor: "text-white" },
  { name: "Fall (Amber to Red)", value: "from-amber-500 to-red-600", textColor: "text-white" },
  { name: "Canada Day (Red to White)", value: "from-red-600 via-red-500 to-red-50", textColor: "text-white" },
  { name: "Spring (Green to Teal)", value: "from-green-500 to-teal-500", textColor: "text-white" },
  { name: "Sunset (Rose to Orange)", value: "from-rose-500 to-orange-400", textColor: "text-white" },
  { name: "Ocean (Indigo to Cyan)", value: "from-indigo-600 to-cyan-400", textColor: "text-white" },
  { name: "Forest (Emerald to Lime)", value: "from-emerald-600 to-lime-500", textColor: "text-white" },
];

const ICON_OPTIONS = [
  "Snowflake", "Sparkles", "Sun", "Leaf", "Heart", "Star", "Gift", "Music", "Camera", "Calendar"
];

export default function BannerManagement() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  
  const { data: banners = [], refetch } = trpc.banner.getAll.useQuery();
  const { data: eventTypes = [] } = trpc.events.getEventTypes.useQuery();
  
  const createMutation = trpc.banner.create.useMutation({
    onSuccess: () => {
      toast("Banner created successfully");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {      toast.error(error.message);    },
  });
  
  const updateMutation = trpc.banner.update.useMutation({
    onSuccess: () => {
      toast("Banner updated successfully");
      refetch();
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.banner.delete.useMutation({
    onSuccess: () => {
      toast("Banner deleted successfully");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
  
  const toggleActiveMutation = trpc.banner.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });
  
  const reorderMutation = trpc.banner.reorder.useMutation({
    onSuccess: () => {
      toast("Banner order updated");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }
    
    const oldIndex = banners.findIndex((b: any) => b.id === active.id);
    const newIndex = banners.findIndex((b: any) => b.id === over.id);
    
    const reorderedBanners = arrayMove(banners, oldIndex, newIndex);
    
    // Update sort order for all banners
    const updates = reorderedBanners.map((banner: any, index: number) => ({
      id: banner.id,
      sortOrder: index,
    }));
    
    reorderMutation.mutate(updates);
  };
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bgGradient: "from-red-500 to-green-600",
    textColor: "text-white",
    icon: "Snowflake",
    eventTypeIds: [] as number[],
    startDate: "",
    endDate: "",
    activeMonths: [] as number[],
    isActive: 1,
    sortOrder: 0,
  });
  
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      bgGradient: "from-red-500 to-green-600",
      textColor: "text-white",
      icon: "Snowflake",
      eventTypeIds: [],
      startDate: "",
      endDate: "",
      activeMonths: [],
      isActive: 1,
      sortOrder: 0,
    });
    setEditingBanner(null);
  };
  
  const handleEdit = (banner: any) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      bgGradient: banner.bgGradient,
      textColor: banner.textColor,
      icon: banner.icon || "Snowflake",
      eventTypeIds: banner.eventTypeIds || [],
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : "",
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : "",
      activeMonths: banner.activeMonths || [],
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
    });
    setIsDialogOpen(true);
  };
  
  const handleSubmit = () => {
    if (editingBanner) {
      updateMutation.mutate({
        id: editingBanner.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const handleToggleActive = (id: number, currentStatus: number) => {
    toggleActiveMutation.mutate({ id, isActive: currentStatus === 1 ? 0 : 1 });
  };
  
  const handleMonthToggle = (monthIndex: number) => {
    setFormData(prev => ({
      ...prev,
      activeMonths: prev.activeMonths.includes(monthIndex)
        ? prev.activeMonths.filter(m => m !== monthIndex)
        : [...prev.activeMonths, monthIndex]
    }));
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Homepage Banner Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage seasonal banners that appear on the homepage
          </p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Create Banner
        </Button>
      </div>
      
      <div className="space-y-4">
        {banners.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No banners created yet. Click "Create Banner" to get started.</p>
          </Card>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={banners.map((b: any) => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {banners.map((banner: any) => (
                  <SortableBannerItem
                    key={banner.id}
                    banner={banner}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingBanner ? "Edit Banner" : "Create New Banner"}</DialogTitle>
            <DialogDescription>
              Configure the banner that will appear on the homepage
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Festive Holidays"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Celebrate the season with festive events happening now!"
              />
            </div>
            
            <div>
              <Label htmlFor="gradient">Background Gradient</Label>
              <Select
                value={formData.bgGradient}
                onValueChange={(value) => {
                  const preset = GRADIENT_PRESETS.find(p => p.value === value);
                  setFormData({
                    ...formData,
                    bgGradient: value,
                    textColor: preset?.textColor || "text-white"
                  });
                }}
              >
                <SelectTrigger id="gradient">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADIENT_PRESETS.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="icon">Icon (optional)</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger id="icon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Event Types to Filter (when clicked)</Label>
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                {eventTypes.map((type) => (
                  <div key={type.id} className="flex items-center gap-2 py-1">
                    <Checkbox
                      checked={formData.eventTypeIds.includes(type.id)}
                      onCheckedChange={(checked) => {
                        setFormData({
                          ...formData,
                          eventTypeIds: checked
                            ? [...formData.eventTypeIds, type.id]
                            : formData.eventTypeIds.filter(id => id !== type.id)
                        });
                      }}
                    />
                    <label className="text-sm">{type.name}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date (optional)</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label>Active Months (optional - auto-activate during these months)</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {MONTH_NAMES.map((month, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Checkbox
                      checked={formData.activeMonths.includes(index)}
                      onCheckedChange={() => handleMonthToggle(index)}
                    />
                    <label className="text-sm">{month}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label htmlFor="sortOrder">Sort Order (lower numbers appear first)</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.isActive === 1}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
              />
              <Label>Active (show on homepage)</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBanner ? "Update Banner" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
