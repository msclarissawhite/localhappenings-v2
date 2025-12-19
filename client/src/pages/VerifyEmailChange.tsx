import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmailChange() {
  const [, params] = useRoute("/user/verify-email");
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  const verifyMutation = trpc.userAuth.verifyEmailChange.useMutation();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    // Verify the token
    verifyMutation.mutate(
      { token },
      {
        onSuccess: (data) => {
          setStatus("success");
          setMessage(data.message);
        },
        onError: (error) => {
          setStatus("error");
          setMessage(error.message || "Verification failed");
        },
      }
    );
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "verifying" && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
              </div>
              <CardTitle>Verifying Email Change</CardTitle>
              <CardDescription>Please wait while we verify your new email address...</CardDescription>
            </>
          )}
          {status === "success" && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle2 className="h-12 w-12 text-green-600" />
              </div>
              <CardTitle>Email Updated Successfully!</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
          {status === "error" && (
            <>
              <div className="mx-auto mb-4">
                <XCircle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle>Verification Failed</CardTitle>
              <CardDescription>{message}</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {status === "success" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                Your email address has been updated. You can now use your new email to sign in.
              </p>
              <Button className="w-full" onClick={() => setLocation("/user/profile")}>
                Go to Profile
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-sm text-muted-foreground text-center">
                The verification link may have expired or is invalid. Please try requesting a new email change from your profile.
              </p>
              <Button className="w-full" onClick={() => setLocation("/user/profile")}>
                Back to Profile
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
