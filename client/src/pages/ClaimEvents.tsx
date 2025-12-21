import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Calendar, MapPin, Check, AlertCircle } from "lucide-react";

export default function ClaimEvents() {
  const [, params] = useRoute("/claim/:token");
  const [, setLocation] = useLocation();
  const token = params?.token || "";
  
  const [email, setEmail] = useState("");
  const [claimed, setClaimed] = useState(false);

  // Get claim token details
  const { data: claimData, isLoading, error } = trpc.claim.getClaimToken.useQuery(
    { token },
    { enabled: !!token }
  );

  const claimMutation = trpc.claim.claimEvents.useMutation({
    onSuccess: () => {
      setClaimed(true);
      toast.success("Events claimed successfully! Redirecting to organizer dashboard...");
      setTimeout(() => {
        setLocation("/organizer/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast.error(`Error claiming events: ${error.message}`);
    },
  });

  useEffect(() => {
    if (claimData) {
      setEmail(claimData.organizerEmail);
    }
  }, [claimData]);

  const handleClaim = () => {
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    claimMutation.mutate({
      token,
      organizerEmail: email,
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-16">
        <p className="text-center text-muted-foreground">Loading claim details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="p-8 border-destructive">
          <div className="flex items-start gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-destructive mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-destructive mb-2">Invalid Claim Link</h2>
              <p className="text-muted-foreground">{error.message}</p>
            </div>
          </div>
          <Button onClick={() => setLocation("/")} className="mt-4">
            Go to Homepage
          </Button>
        </Card>
      </div>
    );
  }

  if (claimed) {
    return (
      <div className="container max-w-2xl py-16">
        <Card className="p-8 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3 mb-4">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">
                Events Claimed Successfully!
              </h2>
              <p className="text-green-700 dark:text-green-300">
                You now own {claimData?.events.length} events. Redirecting to your organizer dashboard...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-16">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-3">Claim Your Event Listings</h1>
        <p className="text-lg text-muted-foreground">
          We've added your events to Local Happenings. Claim them to manage your listings and reach more families.
        </p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Events to Claim ({claimData?.events.length})</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {claimData?.events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg hover:bg-muted/50">
              <h3 className="font-semibold mb-2">{event.name}</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.municipality}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Confirm Your Email</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Enter your email to claim these events. You'll be able to update details, add future events, and get verified status for instant publishing.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={claimMutation.isPending}
            />
          </div>

          <Button
            onClick={handleClaim}
            disabled={!email || claimMutation.isPending}
            className="w-full"
            size="lg"
          >
            {claimMutation.isPending ? "Claiming..." : `Claim ${claimData?.events.length} Events`}
          </Button>
        </div>
      </Card>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ You'll get access to your organizer dashboard</li>
          <li>✓ Update event details and add future events instantly</li>
          <li>✓ Save locations to reuse across multiple events</li>
          <li>✓ Get verified status for automatic publishing (no approval wait)</li>
        </ul>
      </div>
    </div>
  );
}
