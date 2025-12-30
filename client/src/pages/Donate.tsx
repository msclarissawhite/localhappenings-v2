import { Card } from "@/components/ui/card";
import { Heart } from "lucide-react";

export default function Donate() {
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

        {/* Buy Me a Coffee Button */}
        <Card className="p-12 text-center mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-3">Make a Donation</h2>
            <p className="text-muted-foreground mb-6">
              Click the button below to support Local Happenings through Buy Me a Coffee. You'll receive an automatic receipt and thank you email.
            </p>
          </div>
          <div className="flex justify-center">
            <a href="https://www.buymeacoffee.com/localhappenings" target="_blank" rel="noopener noreferrer">
              <img 
                src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=localhappenings&button_colour=0c4f33&font_colour=ffffff&font_family=Inter&outline_colour=ffffff&coffee_colour=FFDD00" 
                alt="Buy me a coffee"
              />
            </a>
          </div>
        </Card>

        {/* Transparency & How Funds Are Used */}
        <Card className="p-8 bg-muted/50">
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
