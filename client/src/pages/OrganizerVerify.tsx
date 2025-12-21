import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useOrganizer } from "@/contexts/OrganizerContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function OrganizerVerify() {
  const [, navigate] = useLocation();
  const { login } = useOrganizer();
  const [token, setToken] = useState<string>("");
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string>("");

  const verifyMutation = trpc.organizer.verifyMagicLink.useMutation({
    onSuccess: (data) => {
      setVerifying(false);
      // Store organizer data using context
      login(data.organizer);
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/organizer/dashboard");
      }, 1500);
    },
    onError: (error) => {
      setVerifying(false);
      setError(error.message || "Invalid or expired magic link");
    },
  });

  useEffect(() => {
    // Get token from URL query params
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get("token");

    if (!tokenParam) {
      setVerifying(false);
      setError("No verification token provided");
      return;
    }

    setToken(tokenParam);
    verifyMutation.mutate({ token: tokenParam });
  }, []);

  if (verifying) {
    return (
      <div className="container max-w-2xl py-12">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Verifying Your Link</h1>
              <p className="text-muted-foreground">
                Please wait while we verify your magic link...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl py-12">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Magic links expire after 15 minutes for security reasons.
              </p>
              <Button onClick={() => navigate("/organizer/login")}>
                Request a New Link
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold mb-2">Success!</h1>
            <p className="text-muted-foreground">
              You've been logged in. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
