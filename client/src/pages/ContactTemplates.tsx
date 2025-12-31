import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ContactTemplates() {
  const [organizer, setOrganizer] = useState<{ id: number; email: string; name: string | null } | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactWebsite: "",
  });

  // Check if organizer is logged in
  useEffect(() => {
    const storedOrganizer = localStorage.getItem("organizer");
    if (storedOrganizer) {
      try {
        setOrganizer(JSON.parse(storedOrganizer));
      } catch (e) {
        console.error("Failed to parse organizer data", e);
      }
    }
  }, []);

  const { data: templates, refetch } = trpc.contactTemplates.list.useQuery(
    { organizerId: organizer?.id || 0 },
    { enabled: !!organizer }
  );

  const createMutation = trpc.contactTemplates.create.useMutation({
    onSuccess: () => {
      toast.success("Contact template created!");
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create template");
    },
  });

  const updateMutation = trpc.contactTemplates.update.useMutation({
    onSuccess: () => {
      toast.success("Contact template updated!");
      setEditingTemplate(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update template");
    },
  });

  const deleteMutation = trpc.contactTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Contact template deleted!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const setDefaultMutation = trpc.contactTemplates.setDefault.useMutation({
    onSuccess: () => {
      toast.success("Default template updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default template");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactWebsite: "",
    });
  };

  const handleCreate = () => {
    if (!organizer || !formData.name) {
      toast.error("Template name is required");
      return;
    }

    createMutation.mutate({
      organizerId: organizer.id,
      name: formData.name,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      contactWebsite: formData.contactWebsite,
      displayPublicly: false,
      isDefault: false,
    });
  };

  const handleUpdate = () => {
    if (!editingTemplate || !formData.name) {
      toast.error("Template name is required");
      return;
    }

    updateMutation.mutate({
      id: editingTemplate.id,
      name: formData.name,
      contactName: formData.contactName,
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      contactWebsite: formData.contactWebsite,
    });
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      contactName: template.contactName || "",
      contactEmail: template.contactEmail || "",
      contactPhone: template.contactPhone || "",
      contactWebsite: template.contactWebsite || "",
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this contact template?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSetDefault = (id: number) => {
    if (!organizer) return;
    setDefaultMutation.mutate({ id, organizerId: organizer.id });
  };

  if (!organizer) {
    return (
      <div className="container py-8">
        <Card className="p-6">
          <p className="text-center text-muted-foreground">
            Please sign in to manage your contact templates.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Contact Templates</h1>
          <p className="text-muted-foreground mt-1">
            Save and reuse contact information for event submissions
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      {!templates || templates.length === 0 ? (
        <Card className="p-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              You haven't created any contact templates yet.
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <Card key={template.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{template.name}</h3>
                    {template.isDefault && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {template.contactName && (
                  <p>
                    <span className="text-muted-foreground">Name:</span>{" "}
                    {template.contactName}
                  </p>
                )}
                {template.contactEmail && (
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    {template.contactEmail}
                  </p>
                )}
                {template.contactPhone && (
                  <p>
                    <span className="text-muted-foreground">Phone:</span>{" "}
                    {template.contactPhone}
                  </p>
                )}
                {template.contactWebsite && (
                  <p>
                    <span className="text-muted-foreground">Website:</span>{" "}
                    {template.contactWebsite}
                  </p>
                )}
              </div>

              {!template.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => handleSetDefault(template.id)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Set as Default
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setEditingTemplate(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Contact Template" : "Create Contact Template"}
            </DialogTitle>
            <DialogDescription>
              Save contact information to reuse when submitting events.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Main Organization, Summer Camp, etc."
              />
            </div>

            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                placeholder="(902) 555-1234"
              />
            </div>

            <div>
              <Label htmlFor="contactWebsite">Website</Label>
              <Input
                id="contactWebsite"
                type="url"
                value={formData.contactWebsite}
                onChange={(e) => setFormData({ ...formData, contactWebsite: e.target.value })}
                placeholder="https://"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingTemplate(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={editingTemplate ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingTemplate ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
