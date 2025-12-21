import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Mail, Loader2 } from "lucide-react";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [magicLink, setMagicLink] = useState<string | null>(null);

  const requestMagicLinkMutation = trpc.userAuth.requestMagicLink.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      if (data.magicLink) {
        setMagicLink(data.magicLink);
      }
      toast.success("Magic link sent! Check your email.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send magic link");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    requestMagicLinkMutation.mutate({ email });
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="p-8">
        <div className="text-center mb-6">
          <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign In</h1>
          <p className="text-muted-foreground">
            Enter your email to receive a magic link
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={requestMagicLinkMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={requestMagicLinkMutation.isPending}
            >
              {requestMagicLinkMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Magic Link"
              )}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center">
              <p className="font-medium text-primary mb-2">Check your email!</p>
              <p className="text-sm text-muted-foreground">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Click the link in the email to sign in.
              </p>
            </div>

            {magicLink && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800 mb-2">
                  Development Mode - Magic Link:
                </p>
                <a
                  href={magicLink}
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {magicLink}
                </a>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSubmitted(false);
                setEmail("");
                setMagicLink(null);
              }}
            >
              Use a different email
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
