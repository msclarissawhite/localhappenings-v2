import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { toast } from "sonner";

export function CollectionsManagement() {
  const utils = trpc.useUtils();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCollection, setEditingCollection] = useState<any>(null);

  const { data: collections, isLoading } = trpc.collections.listAll.useQuery();

  const createMutation = trpc.collections.create.useMutation({
    onSuccess: () => {
      toast.success("Collection created successfully");
      utils.collections.listAll.invalidate();
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });

  const updateMutation = trpc.collections.update.useMutation({
    onSuccess: () => {
      toast.success("Collection updated successfully");
      utils.collections.listAll.invalidate();
      setEditingCollection(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });

  const deleteMutation = trpc.collections.delete.useMutation({
    onSuccess: () => {
      toast.success("Collection deleted successfully");
      utils.collections.listAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });

  const toggleActiveMutation = trpc.collections.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(data.isActive ? "Collection activated" : "Collection deactivated");
      utils.collections.listAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create collection");
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingCollection.id,
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      imageUrl: formData.get("imageUrl") as string,
      sortOrder: parseInt(formData.get("sortOrder") as string) || 0,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Collections Management</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Collections Management</h2>
          <p className="text-muted-foreground mt-1">
            Create curated event collections like "Christmas Events in Nova Scotia" or "Free Summer Activities"
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label htmlFor="name">Collection Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Christmas Events in Nova Scotia"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  name="slug"
                  placeholder="e.g., christmas-events-nova-scotia"
                  pattern="[a-z0-9-]+"
                  required
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Lowercase letters, numbers, and hyphens only. Will be used in URL: /collections/your-slug
                </p>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="SEO-friendly description of this collection"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  name="sortOrder"
                  type="number"
                  defaultValue="0"
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Collection"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!collections || collections.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">No collections created yet</p>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Collection
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {collections.map((collection) => (
            <Card key={collection.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{collection.name}</h3>
                    {collection.isActive === 1 ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium rounded">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium rounded">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>URL:</strong> /collections/{collection.slug}
                  </p>
                  {collection.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {collection.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Sort Order: {collection.sortOrder}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleActiveMutation.mutate({ id: collection.id })}
                    disabled={toggleActiveMutation.isPending}
                  >
                    {collection.isActive === 1 ? (
                      <><EyeOff className="w-4 h-4 mr-1" /> Deactivate</>
                    ) : (
                      <><Eye className="w-4 h-4 mr-1" /> Activate</>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingCollection(collection)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      if (confirm(`Delete collection "${collection.name}"?`)) {
                        deleteMutation.mutate({ id: collection.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingCollection && (
        <Dialog open={!!editingCollection} onOpenChange={() => setEditingCollection(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Collection Name *</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={editingCollection.name}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">URL Slug *</Label>
                <Input
                  id="edit-slug"
                  name="slug"
                  defaultValue={editingCollection.slug}
                  pattern="[a-z0-9-]+"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  defaultValue={editingCollection.description || ""}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
                <Input
                  id="edit-imageUrl"
                  name="imageUrl"
                  type="url"
                  defaultValue={editingCollection.imageUrl || ""}
                />
              </div>
              <div>
                <Label htmlFor="edit-sortOrder">Sort Order</Label>
                <Input
                  id="edit-sortOrder"
                  name="sortOrder"
                  type="number"
                  defaultValue={editingCollection.sortOrder}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditingCollection(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
