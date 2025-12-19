import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function UserVerify() {
  const navigate = (path: string) => { window.location.href = path; };
  const [location] = useLocation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMessage, setErrorMessage] = useState("");

  const verifyMutation = trpc.userAuth.verifyMagicLink.useMutation({
    onSuccess: (data) => {
      // Store session token in cookie
      document.cookie = `user_session=${data.token}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days

      setStatus("success");
      
      // Redirect to home page after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    },
    onError: (error) => {
      setStatus("error");
      setErrorMessage(error.message || "Invalid or expired magic link");
    },
  });

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(location.split("?")[1]);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setErrorMessage("No verification token found");
      return;
    }

    // Verify the token
    verifyMutation.mutate({ token });
  }, [location]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="p-8">
        {status === "verifying" && (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold mb-2">Verifying...</h1>
            <p className="text-muted-foreground">
              Please wait while we sign you in
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Success!</h1>
            <p className="text-muted-foreground mb-4">
              You've been signed in successfully
            </p>
            <p className="text-sm text-muted-foreground">
              Redirecting you to the home page...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <Button onClick={() => navigate("/user/login")} className="w-full">
              Request a New Link
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
