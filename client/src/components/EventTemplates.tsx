import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Trash2, Plus, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export function EventTemplates() {
  const [, setLocation] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<number | null>(null);

  const { data: templates = [], isLoading, refetch } = trpc.eventTemplates.list.useQuery();

  const deleteMutation = trpc.eventTemplates.delete.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      refetch();
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete template");
    },
  });

  const handleDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate({ templateId: templateToDelete });
    }
  };

  const handleUseTemplate = (templateId: number) => {
    // Navigate to submit event page with template ID
    setLocation(`/submit-event?templateId=${templateId}`);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading your templates...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Event Templates</h2>
          <p className="text-muted-foreground mt-1">
            Save recurring event types as templates for faster event creation
          </p>
        </div>
        <Button onClick={() => setLocation("/submit-event?createTemplate=true")}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
            <p className="text-muted-foreground mb-4">
              Create templates for recurring events to save time on future submissions
            </p>
            <Button onClick={() => setLocation("/submit-event?createTemplate=true")}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => {
            const data = template.templateData as any;
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-start justify-between">
                    <span className="flex-1">{template.templateName}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => {
                        setTemplateToDelete(template.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardTitle>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    {data.venue && (
                      <p>
                        <strong>Venue:</strong> {data.venue}
                      </p>
                    )}
                    {data.municipality && (
                      <p>
                        <strong>Location:</strong> {data.municipality}, {data.province}
                      </p>
                    )}
                    {data.isFree !== undefined && (
                      <p>
                        <strong>Cost:</strong> {data.isFree ? "Free" : "Paid"}
                      </p>
                    )}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleUseTemplate(template.id)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteDialog(false);
                setTemplateToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
