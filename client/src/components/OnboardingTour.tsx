import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Settings, Type, ArrowRight } from "lucide-react";

const ONBOARDING_STORAGE_KEY = "local-happenings-onboarding-complete";

export function OnboardingTour() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if user has already seen the onboarding
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay to let the page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleComplete();
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Local Happenings!</DialogTitle>
          <DialogDescription className="text-base">
            We're glad you're here. Let us show you a quick feature that makes browsing easier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Accessibility Settings Highlight */}
          <div className="bg-accent/30 rounded-lg p-6 border-2 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <Settings className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Accessibility Settings</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Look for the <strong>Settings</strong> button (gear icon) in the top navigation bar.
                </p>
                <div className="bg-background rounded-md p-3 border">
                  <div className="flex items-center gap-2 mb-2">
                    <Type className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Adjust Text Size</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Choose from Comfortable, Large, or Extra Large text sizes for better readability. Your preference is saved automatically!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Other helpful features:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Filter events by accessibility needs, age groups, and location</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Save events to your account for easy access later</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>Submit your own events to share with the community</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleComplete} className="w-full sm:w-auto">
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
