import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Heart, Loader2 } from "lucide-react";
import { formatPrice } from "../../../shared/products";

const PRESET_AMOUNTS = [500, 1000, 2500]; // $5, $10, $25 in cents

export default function Donate() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000); // Default $10
  const [customAmount, setCustomAmount] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showAmount, setShowAmount] = useState(true);

  const createCheckout = trpc.donations.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Redirecting to secure checkout...");
        window.open(data.url, "_blank");
      }
    },
    onError: (error) => {
      toast.error(`Payment error: ${error.message}`);
    },
  });

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = (): number | null => {
    if (selectedAmount) return selectedAmount;
    if (customAmount) {
      const dollars = parseFloat(customAmount);
      if (isNaN(dollars) || dollars < 1) return null;
      return Math.round(dollars * 100); // Convert to cents
    }
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = getFinalAmount();
    if (!amount) {
      toast.error("Please select or enter a valid donation amount ($1 minimum)");
      return;
    }

    if (!donorEmail) {
      toast.error("Please enter your email address");
      return;
    }

    createCheckout.mutate({
      amount,
      isRecurring,
      donorName: donorName || undefined,
      donorEmail,
      message: message || undefined,
      isAnonymous,
      showAmount,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Support Local Happenings</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us maintain and improve the platform for families across Canada. Your support keeps event listings free and accessible for everyone.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card className="p-8">
            {/* Donation Type */}
            <div className="mb-8">
              <Label className="text-lg font-semibold mb-4 block">Donation Type</Label>
              <RadioGroup
                value={isRecurring ? "recurring" : "one-time"}
                onValueChange={(value) => setIsRecurring(value === "recurring")}
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="one-time" id="one-time" />
                  <Label htmlFor="one-time" className="cursor-pointer flex-1">
                    <div className="font-semibold">One-time</div>
                    <div className="text-sm text-muted-foreground">Make a single donation</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="recurring" id="recurring" />
                  <Label htmlFor="recurring" className="cursor-pointer flex-1">
                    <div className="font-semibold">Monthly</div>
                    <div className="text-sm text-muted-foreground">Become a monthly supporter</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Amount Selection */}
            <div className="mb-8">
              <Label className="text-lg font-semibold mb-4 block">Select Amount</Label>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {PRESET_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={selectedAmount === amount ? "default" : "outline"}
                    onClick={() => handleAmountSelect(amount)}
                    className="h-16 text-lg font-semibold"
                  >
                    {formatPrice(amount)}
                  </Button>
                ))}
              </div>
              <div>
                <Label htmlFor="custom-amount" className="mb-2 block">Or enter custom amount ($)</Label>
                <Input
                  id="custom-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount in dollars"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Donor Information */}
            <div className="mb-8 space-y-4">
              <div>
                <Label htmlFor="donor-email" className="mb-2 block">Email Address *</Label>
                <Input
                  id="donor-email"
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">For receipt and confirmation only</p>
              </div>

              <div>
                <Label htmlFor="donor-name" className="mb-2 block">Name (optional)</Label>
                <Input
                  id="donor-name"
                  type="text"
                  placeholder="Your name"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                />
              </div>

              <div>
                <Label htmlFor="message" className="mb-2 block">Message (optional, max 200 characters)</Label>
                <Textarea
                  id="message"
                  placeholder="Leave a message of support..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 200))}
                  maxLength={200}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">{message.length}/200 characters</p>
              </div>
            </div>

            {/* Privacy Options */}
            <div className="mb-8 space-y-4 p-4 bg-muted rounded-lg">
              <Label className="text-base font-semibold">Privacy Preferences</Label>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="anonymous" className="cursor-pointer font-medium">
                    Donate anonymously
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your name will appear as "Anonymous Supporter" on the donor wall
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="show-amount"
                  checked={showAmount}
                  onCheckedChange={(checked) => setShowAmount(checked as boolean)}
                />
                <div className="flex-1">
                  <Label htmlFor="show-amount" className="cursor-pointer font-medium">
                    Show donation amount publicly
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Display your donation amount on the donor wall
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              size="lg"
              className="w-full text-lg"
              disabled={createCheckout.isPending || !getFinalAmount()}
            >
              {createCheckout.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Donate {getFinalAmount() ? formatPrice(getFinalAmount()!) : ""}
                  {isRecurring && "/month"}
                </>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground mt-4">
              Secure payment powered by Stripe. You'll be redirected to complete your donation.
            </p>
          </Card>
        </form>

        {/* Transparency & How Funds Are Used */}
        <Card className="mt-8 p-8 bg-muted/50">
          <h2 className="text-xl font-semibold mb-6">Why Local Happenings Exists</h2>
          
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Local Happenings started as a dream from a mom who struggled to find change tables where she expected them to be, where change tables only existed in women's washrooms, and where stroller access was often limited. If I was struggling with these basic logistics, I knew many others were too—especially families navigating more complex accessibility needs.
          </p>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            After years of wishing this platform existed, I finally built it. This is a community-first project, and <strong>event listings are free and always will be.</strong>
          </p>

          <h3 className="text-lg font-semibold mb-4 mt-8">Our Commitment to Transparency</h3>
          
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Your voluntary support goes directly toward the development and maintenance of this platform. There are no middlemen and no investors.
          </p>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            This is currently a passion project and will remain that way for as long as possible. If Local Happenings grows to serve thousands of families, I hope to dedicate more time to it—potentially making it my full-time work. That would mean compensating myself fairly for the hours spent building features, moderating events, and supporting the community. Every dollar you contribute helps make that sustainable growth possible.
          </p>

          <h3 className="text-lg font-semibold mb-4 mt-8">How Your Support Helps</h3>
          
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start leading-relaxed">
              <span className="mr-2 mt-1">•</span>
              <span><strong>Hosting and infrastructure:</strong> Server costs, database hosting, and platform reliability to keep Local Happenings running 24/7</span>
            </li>
            <li className="flex items-start leading-relaxed">
              <span className="mr-2 mt-1">•</span>
              <span><strong>Feature development:</strong> Building new accessibility filters, improving search, and adding community-requested features</span>
            </li>
            <li className="flex items-start leading-relaxed">
              <span className="mr-2 mt-1">•</span>
              <span><strong>Accessibility audits:</strong> Professional reviews to ensure the platform itself meets WCAG standards and serves all users</span>
            </li>
            <li className="flex items-start leading-relaxed">
              <span className="mr-2 mt-1">•</span>
              <span><strong>Community outreach:</strong> Helping more families and event organizers discover and use the platform</span>
            </li>
            <li className="flex items-start leading-relaxed">
              <span className="mr-2 mt-1">•</span>
              <span><strong>Sustainable development:</strong> Supporting the time and effort needed to maintain and grow this platform long-term</span>
            </li>
          </ul>

          <p className="text-sm text-muted-foreground mt-8 italic leading-relaxed">
            Questions about how funds are used? <a href="/contact" className="text-primary hover:underline">Contact us</a>—we're happy to share details.
          </p>
        </Card>
      </div>
    </div>
  );
}
