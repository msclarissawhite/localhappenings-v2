import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function FeatureRequests() {
  const { user, isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");

  const { data: requests, isLoading, refetch } = trpc.featureRequests.list.useQuery();
  const submitMutation = trpc.featureRequests.submit.useMutation();
  const upvoteMutation = trpc.featureRequests.upvote.useMutation();
  const removeUpvoteMutation = trpc.featureRequests.removeUpvote.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated && (!submitterName || !submitterEmail)) {
      toast.error("Please provide your name and email");
      return;
    }

    try {
      await submitMutation.mutateAsync({
        title,
        description,
        submitterName: !isAuthenticated ? submitterName : undefined,
        submitterEmail: !isAuthenticated ? submitterEmail : undefined,
      });

      toast.success("Feature request submitted! Thank you for your feedback.");
      setTitle("");
      setDescription("");
      setSubmitterName("");
      setSubmitterEmail("");
      setShowForm(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit feature request");
    }
  };

  const handleUpvote = async (featureRequestId: number, hasUpvoted: boolean) => {
    if (!isAuthenticated) {
      toast.error("Please log in to upvote", {
        action: {
          label: "Log In",
          onClick: () => window.location.href = getLoginUrl(),
        },
      });
      return;
    }

    try {
      if (hasUpvoted) {
        await removeUpvoteMutation.mutateAsync({ featureRequestId });
        toast.success("Upvote removed");
      } else {
        await upvoteMutation.mutateAsync({ featureRequestId });
        toast.success("Upvoted!");
      }
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update upvote");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      pending: { variant: "outline", label: "Pending" },
      under_review: { variant: "secondary", label: "Under Review" },
      planned: { variant: "default", label: "Planned" },
      in_progress: { variant: "default", label: "In Progress" },
      completed: { variant: "default", label: "Completed" },
      declined: { variant: "destructive", label: "Declined" },
    };

    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Feature Requests</h1>
          <p className="text-muted-foreground">
            Help shape the future of Local Happenings! Submit your ideas and vote on features you'd like to see.
          </p>
        </div>

        {!showForm ? (
          <Button onClick={() => setShowForm(true)} size="lg" className="mb-8">
            Submit a Feature Request
          </Button>
        ) : (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Submit a Feature Request</CardTitle>
              <CardDescription>
                Share your ideas for improving Local Happenings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief description of your feature idea"
                    required
                    minLength={5}
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain your feature request in detail. What problem does it solve? How would it work?"
                    required
                    minLength={20}
                    rows={5}
                  />
                </div>

                {!isAuthenticated && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name *</label>
                      <Input
                        value={submitterName}
                        onChange={(e) => setSubmitterName(e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Your Email *</label>
                      <Input
                        type="email"
                        value={submitterEmail}
                        onChange={(e) => setSubmitterEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        We'll use this to notify you about updates to your request
                      </p>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitMutation.isPending}>
                    {submitMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">All Requests</h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests && requests.length > 0 ? (
            requests.map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{request.title}</CardTitle>
                        {getStatusBadge(request.status)}
                      </div>
                      <CardDescription className="whitespace-pre-wrap">
                        {request.description}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                      <Button
                        variant={request.hasUpvoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpvote(request.id, request.hasUpvoted)}
                        disabled={upvoteMutation.isPending || removeUpvoteMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span className="font-bold">{request.upvoteCount}</span>
                      </Button>
                      {request.clickupTaskUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={request.clickupTaskUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No feature requests yet. Be the first to submit one!
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
