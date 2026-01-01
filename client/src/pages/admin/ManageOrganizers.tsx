import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, ShieldCheck, Mail, Phone, Globe, Calendar, TrendingUp, 
  Flag, FileText, Copy, Check, Plus, Trash2, Edit, BarChart3,
  Users, AlertTriangle, CheckCircle2, XCircle
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export function ManageOrganizers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activityFilter, setActivityFilter] = useState<number | undefined>(undefined);
  const [selectedOrganizers, setSelectedOrganizers] = useState<Set<number>>(new Set());
  const [selectedOrganizerId, setSelectedOrganizerId] = useState<number | null>(null);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isFlagged, setIsFlagged] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [copiedTemplateId, setCopiedTemplateId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "analytics" | "templates">("list");

  // Template form state
  const [templateName, setTemplateName] = useState("");
  const [templateSubject, setTemplateSubject] = useState("");
  const [templateBody, setTemplateBody] = useState("");
  const [templateCategory, setTemplateCategory] = useState<"welcome" | "clarification" | "rejection" | "general" | "reminder" | "announcement">("general");
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);

  // Queries
  const { data: organizers, isLoading, refetch } = trpc.organizerManagement.getAllOrganizers.useQuery({
    verificationFilter,
    typeFilter: typeFilter === "all" ? undefined : typeFilter,
    activityDays: activityFilter,
    searchQuery: searchQuery.trim() || undefined,
  });

  const { data: organizerDetails } = trpc.organizerManagement.getOrganizerDetails.useQuery(
    { organizerId: selectedOrganizerId! },
    { enabled: selectedOrganizerId !== null }
  );

  const { data: analytics } = trpc.organizerManagement.getOrganizerAnalytics.useQuery();

  const { data: emailTemplates, refetch: refetchTemplates } = trpc.organizerManagement.getAllEmailTemplates.useQuery();

  // Mutations
  const bulkVerifyMutation = trpc.organizerManagement.bulkUpdateVerification.useMutation({
    onSuccess: () => {
      toast.success("Organizer verification updated");
      refetch();
      setSelectedOrganizers(new Set());
    },
  });

  const addNoteMutation = trpc.organizerManagement.addOrganizerNote.useMutation({
    onSuccess: () => {
      toast.success("Note added successfully");
      setShowNoteDialog(false);
      setNoteText("");
      setIsFlagged(false);
      setFlagReason("");
      refetch();
    },
  });

  const createTemplateMutation = trpc.organizerManagement.createEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template created successfully");
      refetchTemplates();
      resetTemplateForm();
    },
  });

  const updateTemplateMutation = trpc.organizerManagement.updateEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template updated successfully");
      refetchTemplates();
      resetTemplateForm();
    },
  });

  const deleteTemplateMutation = trpc.organizerManagement.deleteEmailTemplate.useMutation({
    onSuccess: () => {
      toast.success("Template deleted successfully");
      refetchTemplates();
    },
  });

  const resetTemplateForm = () => {
    setTemplateName("");
    setTemplateSubject("");
    setTemplateBody("");
    setTemplateCategory("general");
    setEditingTemplateId(null);
    setShowTemplateDialog(false);
  };

  const handleBulkVerify = (isVerified: boolean) => {
    if (selectedOrganizers.size === 0) {
      toast.error("Please select organizers first");
      return;
    }

    bulkVerifyMutation.mutate({
      organizerIds: Array.from(selectedOrganizers),
      isVerified,
    });
  };

  const handleAddNote = () => {
    if (!selectedOrganizerId || !noteText.trim()) {
      toast.error("Please enter a note");
      return;
    }

    addNoteMutation.mutate({
      organizerId: selectedOrganizerId,
      note: noteText.trim(),
      isFlagged,
      flagReason: isFlagged ? flagReason : undefined,
    });
  };

  const handleCopyTemplate = (template: any) => {
    const content = `Subject: ${template.subject}\n\n${template.body}`;
    navigator.clipboard.writeText(content);
    setCopiedTemplateId(template.id);
    toast.success("Template copied to clipboard");
    setTimeout(() => setCopiedTemplateId(null), 2000);
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || !templateSubject.trim() || !templateBody.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (editingTemplateId) {
      updateTemplateMutation.mutate({
        id: editingTemplateId,
        name: templateName,
        subject: templateSubject,
        body: templateBody,
        category: templateCategory,
      });
    } else {
      createTemplateMutation.mutate({
        name: templateName,
        subject: templateSubject,
        body: templateBody,
        category: templateCategory,
      });
    }
  };

  const handleEditTemplate = (template: any) => {
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setTemplateCategory(template.category);
    setEditingTemplateId(template.id);
    setShowTemplateDialog(true);
  };

  const toggleOrganizerSelection = (organizerId: number) => {
    const newSelection = new Set(selectedOrganizers);
    if (newSelection.has(organizerId)) {
      newSelection.delete(organizerId);
    } else {
      newSelection.add(organizerId);
    }
    setSelectedOrganizers(newSelection);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="list">
            <Users className="w-4 h-4 mr-2" />
            Organizers
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="w-4 h-4 mr-2" />
            Email Templates
          </TabsTrigger>
        </TabsList>

        {/* Organizers List Tab */}
        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={verificationFilter} onValueChange={(v: any) => setVerificationFilter(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Verification Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Organizers</SelectItem>
                  <SelectItem value="verified">Verified Only</SelectItem>
                  <SelectItem value="unverified">Unverified Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Organizer Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="nonprofit">Nonprofit</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="municipality">Municipality</SelectItem>
                  <SelectItem value="school-library">School/Library</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select value={activityFilter?.toString() || "all"} onValueChange={(v) => setActivityFilter(v === "all" ? undefined : parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30">Active (30 days)</SelectItem>
                  <SelectItem value="60">Active (60 days)</SelectItem>
                  <SelectItem value="90">Active (90 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Bulk Actions */}
          {selectedOrganizers.size > 0 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {selectedOrganizers.size} organizer{selectedOrganizers.size > 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkVerify(true)}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Verify Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkVerify(false)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Unverify Selected
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedOrganizers(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Organizers List */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading organizers...</p>
            </div>
          ) : organizers && organizers.length > 0 ? (
            <div className="space-y-3">
              {organizers.map((org) => (
                <Card key={org.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedOrganizers.has(org.id)}
                      onChange={() => toggleOrganizerSelection(org.id)}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{org.name}</h3>
                            {org.isVerified === 1 && (
                              <Badge variant="default" className="gap-1 bg-emerald-600">
                                <ShieldCheck className="w-3 h-3" />
                                Verified
                              </Badge>
                            )}
                            {org.organizerType && (
                              <Badge variant="outline">{org.organizerType}</Badge>
                            )}
                            {org.flagCount > 0 && (
                              <Badge variant="destructive" className="gap-1">
                                <Flag className="w-3 h-3" />
                                {org.flagCount} flag{org.flagCount > 1 ? "s" : ""}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {org.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {org.email}
                              </div>
                            )}
                            {org.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {org.phone}
                              </div>
                            )}
                            {org.website && (
                              <div className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                <a href={org.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                  Website
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedOrganizerId(org.id);
                            setShowNoteDialog(true);
                          }}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Add Note
                        </Button>
                      </div>

                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-3 pt-3 border-t">
                        <div>
                          <div className="text-lg font-bold">{org.totalEvents}</div>
                          <div className="text-xs text-muted-foreground">Total Events</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-green-600">{org.approvedEvents}</div>
                          <div className="text-xs text-muted-foreground">Approved</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-yellow-600">{org.pendingEvents}</div>
                          <div className="text-xs text-muted-foreground">Pending</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-red-600">{org.rejectedEvents}</div>
                          <div className="text-xs text-muted-foreground">Rejected</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold">{org.approvalRate}%</div>
                          <div className="text-xs text-muted-foreground">Approval Rate</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Last Submission</div>
                          <div className="text-xs font-medium">
                            {org.lastSubmission ? format(new Date(org.lastSubmission), "MMM d, yyyy") : "Never"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizers found</h3>
              <p className="text-muted-foreground">Try adjusting your filters</p>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Organizers */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Top Organizers by Event Count
                  </h3>
                  <div className="space-y-3">
                    {analytics.topOrganizers.slice(0, 10).map((org, index) => (
                      <div key={org.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{org.name}</div>
                            <div className="text-xs text-muted-foreground">{org.email}</div>
                          </div>
                        </div>
                        <Badge variant="secondary">{org.eventCount} events</Badge>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Stats Cards */}
                <div className="space-y-4">
                  <Card className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">New Organizers (30 days)</p>
                        <p className="text-3xl font-bold">{analytics.newOrganizersThisMonth}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-3">Organizers by Type</h3>
                    <div className="space-y-2">
                      {analytics.organizersByType.map((item) => (
                        <div key={item.type} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{item.type || "Unknown"}</span>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card className="p-6">
                    <h3 className="font-semibold mb-3">Organizers by Province</h3>
                    <div className="space-y-2">
                      {analytics.organizersByProvince.map((item) => (
                        <div key={item.province} className="flex items-center justify-between">
                          <span className="text-sm">{item.province}</span>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>

        {/* Email Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Email Template Library</h3>
              <p className="text-sm text-muted-foreground">Save and copy email templates for use in your email platform</p>
            </div>
            <Button onClick={() => setShowTemplateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>

          {emailTemplates && emailTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {emailTemplates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge variant="outline" className="mt-1">{template.category}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm("Delete this template?")) {
                              deleteTemplateMutation.mutate({ id: template.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm">
                      <p className="font-medium text-muted-foreground mb-1">Subject:</p>
                      <p className="mb-2">{template.subject}</p>
                      <p className="font-medium text-muted-foreground mb-1">Body:</p>
                      <p className="text-xs line-clamp-3">{template.body}</p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleCopyTemplate(template)}
                    >
                      {copiedTemplateId === template.id ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy to Clipboard
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No templates yet</h3>
              <p className="text-muted-foreground mb-4">Create your first email template to get started</p>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Note Dialog */}
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin Note</DialogTitle>
            <DialogDescription>
              Add an internal note about this organizer. This will only be visible to admins.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Textarea
              placeholder="Enter your note..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="flagged"
                checked={isFlagged}
                onChange={(e) => setIsFlagged(e.target.checked)}
              />
              <label htmlFor="flagged" className="text-sm font-medium">
                Flag for review
              </label>
            </div>

            {isFlagged && (
              <Input
                placeholder="Reason for flagging (spam, quality issues, etc.)"
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNote}>
              Add Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={(open) => {
        if (!open) resetTemplateForm();
        setShowTemplateDialog(open);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingTemplateId ? "Edit" : "Create"} Email Template</DialogTitle>
            <DialogDescription>
              Save email templates for quick access. Copy and paste them into your email platform.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Template Name</label>
              <Input
                placeholder="e.g., Welcome New Organizer"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={templateCategory} onValueChange={(v: any) => setTemplateCategory(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome</SelectItem>
                  <SelectItem value="clarification">Clarification Request</SelectItem>
                  <SelectItem value="rejection">Rejection</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="announcement">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Subject Line</label>
              <Input
                placeholder="Email subject"
                value={templateSubject}
                onChange={(e) => setTemplateSubject(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Email Body</label>
              <Textarea
                placeholder="Email content..."
                value={templateBody}
                onChange={(e) => setTemplateBody(e.target.value)}
                rows={8}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetTemplateForm}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              {editingTemplateId ? "Update" : "Create"} Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
