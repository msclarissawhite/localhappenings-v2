import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { Calendar, Heart, MapPin, Search, Shield, Users } from "lucide-react";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 md:py-24">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              What's happening near you today?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              The first event platform built for families with accessibility needs.
            </p>
            <p className="text-base md:text-lg text-muted-foreground mb-8">
              Every event includes detailed accessibility information—wheelchair access, sensory-friendly options, transit details, and more—so you can plan with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/browse">
                <Button size="lg" className="text-lg px-8">
                  <Search className="w-5 h-5 mr-2" />
                  Browse Events
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Calendar className="w-5 h-5 mr-2" />
                  Submit an Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-20">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Local Happenings?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Accessibility First</h3>
              <p className="text-muted-foreground">
                Filter by wheelchair access, sensory-friendly environments, parking, transit options, and 20+ accessibility features. No more guessing or calling ahead.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Honest Information</h3>
              <p className="text-muted-foreground">
                Organizers provide transparent details about accessibility, pricing, and age suitability. "Unknown" means unconfirmed—not hidden.
              </p>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Community-Powered</h3>
              <p className="text-muted-foreground">
                Built by and for families who need better event information. Starting in Nova Scotia, expanding across Canada.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/5 py-16">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Help Build Our Community
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Hosting an event? Share it with families who are actively looking for accessible, inclusive activities. Free event listings, always.
            </p>
            <Link href="/submit">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Submit Your Event
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
