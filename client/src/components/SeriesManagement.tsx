import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { toast } from "sonner";

export function SeriesManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  const utils = trpc.useUtils();
  const { data: seriesList, isLoading } = trpc.series.list.useQuery();

  const createMutation = trpc.series.create.useMutation({
    onSuccess: () => {
      toast.success("Series created successfully!");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "", imageUrl: "" });
      utils.series.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create series");
    },
  });

  const updateMutation = trpc.series.update.useMutation({
    onSuccess: () => {
      toast.success("Series updated successfully!");
      setIsEditOpen(false);
      setEditingSeries(null);
      utils.series.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update series");
    },
  });

  const deleteMutation = trpc.series.delete.useMutation({
    onSuccess: () => {
      toast.success("Series deleted successfully");
      utils.series.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete series");
    },
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Series name is required");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingSeries) return;
    if (!formData.name.trim()) {
      toast.error("Series name is required");
      return;
    }
    updateMutation.mutate({
      id: editingSeries.id,
      ...formData,
    });
  };

  const handleEdit = (series: any) => {
    setEditingSeries(series);
    setFormData({
      name: series.name,
      description: series.description || "",
      imageUrl: series.imageUrl || "",
    });
    setIsEditOpen(true);
  };

  const handleDelete = (seriesId: number, seriesName: string) => {
    if (confirm(`Are you sure you want to delete "${seriesName}"? All events will be unlinked from this series.`)) {
      deleteMutation.mutate({ id: seriesId });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Series</CardTitle>
          <CardDescription>Loading your series...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Event Series</h2>
          <p className="text-muted-foreground">
            Group recurring events together for better discovery
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Series
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Event Series</DialogTitle>
              <DialogDescription>
                Create a series to group related events (e.g., "Weekly Trivia at The Pub")
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Series Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Weekly Trivia at The Pub"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional description of the series"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Series"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {!seriesList || seriesList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No series yet</p>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create a series to group recurring events together. This makes it easier for users to find all dates for events like weekly trivia or monthly meetups.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Series
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {seriesList.map((series: any) => (
            <Card key={series.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="truncate">{series.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {series.isActive ? "Active" : "Archived"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(series)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(series.id, series.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {series.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {series.description}
                  </p>
                )}
                <div className="text-sm">
                  <span className="font-medium">Slug:</span>{" "}
                  <code className="text-xs bg-muted px-1 py-0.5 rounded">
                    {series.slug}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Series</DialogTitle>
            <DialogDescription>
              Update the series information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Series Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Weekly Trivia at The Pub"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Optional description of the series"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL</Label>
              <Input
                id="edit-imageUrl"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
