import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle2, Home, Users } from "lucide-react";
import { toast } from "sonner";

export default function DonateThankYou() {
  const [, setLocation] = useLocation();

  // Check if session_id is in URL (from Stripe redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    
    if (!sessionId) {
      // If no session_id, redirect to donate page
      setLocation("/donate");
    } else {
      // Show success toast on successful donation
      toast.success("Thank you for your support!", {
        description: "Your donation helps keep Local Happenings accessible for everyone.",
        duration: 5000,
      });
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="relative inline-block mb-6">
            <Heart className="w-24 h-24 text-primary fill-primary" />
            <CheckCircle2 className="w-10 h-10 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
          </div>

          {/* Thank You Message */}
          <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Your generous support helps keep Local Happenings accessible and free for all families.
            You'll receive a confirmation email shortly with your receipt.
          </p>

          {/* What Happens Next */}
          <div className="bg-muted rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-lg mb-4">What happens next?</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Check your email for a receipt and confirmation</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Your support will be used for hosting, development, and accessibility improvements</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span>If you chose to be recognized, you'll appear on our donor wall</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="default" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/donor-wall">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                <Users className="w-4 h-4 mr-2" />
                View Donor Wall
              </Button>
            </Link>
          </div>

          {/* Additional Message */}
          <p className="text-sm text-muted-foreground mt-8">
            Have questions? Contact us at{" "}
            <a href="mailto:support@localhappenings.ca" className="text-primary hover:underline">
              support@localhappenings.ca
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
