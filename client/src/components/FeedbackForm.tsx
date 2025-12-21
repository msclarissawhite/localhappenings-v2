import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { MessageSquare, Star, CheckCircle } from "lucide-react";

interface FeedbackFormProps {
  eventId: number;
  eventName: string;
}

const DETAIL_CATEGORIES = [
  "Accessibility information",
  "Parking/transit details",
  "Cost information",
  "Age appropriateness",
  "Venue/location details",
  "Time/schedule",
];

const INACCURACY_CATEGORIES = [
  "Accessibility features",
  "Parking/transit info",
  "Cost details",
  "Age appropriateness",
  "Venue/location",
  "Time/schedule",
  "Event was cancelled/rescheduled",
  "Other",
];

export function FeedbackForm({ eventId, eventName }: FeedbackFormProps) {
  const [attended, setAttended] = useState<boolean | null>(null);
  const [accuracyRating, setAccuracyRating] = useState<number | null>(null);
  const [helpfulDetails, setHelpfulDetails] = useState<string[]>([]);
  const [inaccurateDetails, setInaccurateDetails] = useState<string[]>([]);
  const [comments, setComments] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Thank you for your feedback!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit feedback");
    },
  });

  const handleSubmit = () => {
    if (attended === null) {
      toast.error("Please indicate if you attended this event");
      return;
    }

    if (attended && !accuracyRating) {
      toast.error("Please rate the accuracy of the listing");
      return;
    }

    submitMutation.mutate({
      eventId,
      attended,
      accuracyRating: attended ? accuracyRating! : undefined,
      helpfulDetails: helpfulDetails.length > 0 ? helpfulDetails : undefined,
      inaccurateDetails: inaccurateDetails.length > 0 ? inaccurateDetails : undefined,
      comments: comments.trim() || undefined,
    });
  };

  const toggleHelpfulDetail = (detail: string) => {
    setHelpfulDetails((prev) =>
      prev.includes(detail) ? prev.filter((d) => d !== detail) : [...prev, detail]
    );
  };

  const toggleInaccurateDetail = (detail: string) => {
    setInaccurateDetails((prev) =>
      prev.includes(detail) ? prev.filter((d) => d !== detail) : [...prev, detail]
    );
  };

  if (submitted) {
    return (
      <Card className="p-6 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Thank you for your feedback!
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              Your input helps us improve event listings and identify reliable organizers.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-3 mb-4">
        <MessageSquare className="w-5 h-5 text-primary mt-0.5" />
        <div>
          <h3 className="font-semibold text-lg">Attended this event?</h3>
          <p className="text-sm text-muted-foreground">
            Help us improve! Share quick feedback about the accuracy of this listing.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Question 1: Did you attend? */}
        <div>
          <Label className="text-base font-medium mb-3 block">Did you attend this event?</Label>
          <div className="flex gap-3">
            <Button
              variant={attended === true ? "default" : "outline"}
              onClick={() => setAttended(true)}
              className="flex-1"
            >
              Yes
            </Button>
            <Button
              variant={attended === false ? "default" : "outline"}
              onClick={() => setAttended(false)}
              className="flex-1"
            >
              No
            </Button>
          </div>
        </div>

        {attended === true && (
          <>
            {/* Question 2: Accuracy Rating */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                How accurate was the event listing?
              </Label>
              <div className="space-y-2">
                {[
                  { value: 5, label: "Very Accurate", desc: "Everything matched perfectly" },
                  { value: 4, label: "Mostly Accurate", desc: "Minor differences" },
                  { value: 3, label: "Somewhat Accurate", desc: "Some important details were wrong" },
                  { value: 2, label: "Not Accurate", desc: "Many things didn't match" },
                  { value: 1, label: "Very Inaccurate", desc: "Almost nothing was correct" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setAccuracyRating(option.value)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      accuracyRating === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < option.value
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">({option.value}/5)</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{option.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Helpful Details */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Which details were most helpful? (Select all that apply)
              </Label>
              <div className="space-y-2">
                {DETAIL_CATEGORIES.map((detail) => (
                  <div key={detail} className="flex items-center gap-2">
                    <Checkbox
                      id={`helpful-${detail}`}
                      checked={helpfulDetails.includes(detail)}
                      onCheckedChange={() => toggleHelpfulDetail(detail)}
                    />
                    <Label htmlFor={`helpful-${detail}`} className="cursor-pointer font-normal">
                      {detail}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 4: Inaccurate Details */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                What was inaccurate or missing? (Optional, select all that apply)
              </Label>
              <div className="space-y-2">
                {INACCURACY_CATEGORIES.map((detail) => (
                  <div key={detail} className="flex items-center gap-2">
                    <Checkbox
                      id={`inaccurate-${detail}`}
                      checked={inaccurateDetails.includes(detail)}
                      onCheckedChange={() => toggleInaccurateDetail(detail)}
                    />
                    <Label htmlFor={`inaccurate-${detail}`} className="cursor-pointer font-normal">
                      {detail}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Question 5: Comments */}
            <div>
              <Label htmlFor="comments" className="text-base font-medium mb-3 block">
                Additional comments (Optional)
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Any other feedback to help us improve this listing?"
                maxLength={500}
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">{comments.length}/500 characters</p>
            </div>
          </>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitMutation.isPending || attended === null}
          className="w-full"
          size="lg"
        >
          {submitMutation.isPending ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </Card>
  );
}
