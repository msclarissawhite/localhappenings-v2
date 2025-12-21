import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Check } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function OrganizerLogin() {
  const [linkSent, setLinkSent] = useState(false);
  const [magicLink, setMagicLink] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const requestLinkMutation = trpc.organizer.requestMagicLink.useMutation({
    onSuccess: (data) => {
      setLinkSent(true);
      if (data.magicLink) {
        setMagicLink(data.magicLink);
      }
      toast.success("Magic link sent! Check your email.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send magic link");
    },
  });

  const onSubmit = (data: LoginFormData) => {
    requestLinkMutation.mutate(data);
  };

  if (linkSent) {
    return (
      <div className="container max-w-2xl py-12">
        <Card className="p-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-bold mb-2">Check Your Email</h1>
              <p className="text-muted-foreground">
                We've sent a magic link to your email address. Click the link to log in to your organizer dashboard.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg text-sm">
              <p className="font-medium mb-2">The link will expire in 15 minutes.</p>
              <p className="text-muted-foreground">
                If you don't see the email, check your spam folder or request a new link.
              </p>
            </div>

            {magicLink && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm">
                <p className="font-medium text-yellow-900 mb-2">Development Mode</p>
                <p className="text-yellow-800 mb-2">
                  In production, this link would be sent to your email. For now, you can use it directly:
                </p>
                <a
                  href={magicLink}
                  className="text-primary hover:underline break-all"
                >
                  {magicLink}
                </a>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setLinkSent(false)}
            >
              Request Another Link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12">
      <Card className="p-8">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Organizer Login</h1>
            <p className="text-muted-foreground">
              Enter your email to receive a magic link. No password required.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                {...register("name")}
              />
              <p className="text-sm text-muted-foreground mt-1">
                This helps us personalize your experience
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={requestLinkMutation.isPending}
            >
              {requestLinkMutation.isPending ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>

          <div className="border-t pt-6">
            <p className="text-sm text-muted-foreground text-center">
              First time here? Don't worry! If you're a new organizer, we'll create an account for you automatically when you request a magic link.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
