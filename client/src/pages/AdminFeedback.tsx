import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { AdminFeedbackPanel } from "@/components/AdminFeedbackPanel";

export default function AdminFeedback() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const eventId = parseInt(id || "0");

  const { data: event, isLoading } = trpc.events.getById.useQuery(
    { id: eventId },
    { enabled: !!eventId }
  );

  // Redirect if not admin
  if (!isAuthenticated || user?.role !== "admin") {
    navigate("/admin");
    return null;
  }

  if (isLoading) {
    return (
      <div className="container max-w-6xl py-8">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container max-w-6xl py-8">
        <Card className="p-12 text-center">
          <h2 className="text-2xl font-semibold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">The event you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/admin")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Admin Dashboard
        </Button>
        <h1 className="text-3xl font-bold mb-2">Event Feedback</h1>
        <h2 className="text-xl text-muted-foreground">{event.name}</h2>
      </div>

      {/* Feedback Panel */}
      <AdminFeedbackPanel eventId={eventId} eventName={event.name} />
    </div>
  );
}
