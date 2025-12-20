import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const contactMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate({ name, email, subject, message });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Card className="max-w-2xl mx-auto p-8 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Message Sent!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for reaching out. We'll get back to you as soon as possible.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => setSubmitted(false)} variant="outline">
                Send Another Message
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Get in Touch</h1>
            <p className="text-lg text-muted-foreground mb-4">
              Questions, feedback, or suggestions? We'd love to hear from you.
            </p>
            <Card className="p-4 bg-primary/5 border-primary/20">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Interested in business sponsorship?</strong> We're exploring partnerships with organizations that share our commitment to accessibility and community support. Reach out to discuss how your business can help make events more accessible for families.
              </p>
            </Card>
          </div>

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <Label htmlFor="email">Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  placeholder="What's this about?"
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="Tell us what's on your mind..."
                  rows={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={contactMutation.isPending}
              >
                <Mail className="w-4 h-4 mr-2" />
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>

              {contactMutation.error && (
                <p className="text-destructive text-sm">
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              Looking to submit an event?{" "}
              <Link href="/submit" className="text-primary hover:underline">
                Use the event submission form
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
