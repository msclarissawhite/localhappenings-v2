import { useState } from "react";
import { useUserAuth } from "../hooks/useUserAuth";
import { trpc } from "../lib/trpc";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { toast } from "sonner";
import { Loader2, Mail, User, Bookmark, Bell } from "lucide-react";
import { Link } from "wouter";

export default function UserProfile() {
  const { user, isLoading: authLoading } = useUserAuth();

  const utils = trpc.useUtils();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Update profile mutation
  const updateProfileMutation = trpc.userAuth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      utils.userAuth.me.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  // Get saved events count
  const { data: savedEvents } = trpc.savedEvents.list.useQuery(undefined, {
    enabled: !!user,
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ name, email });
  };

  if (authLoading) {
    return (
      <div className="container py-12">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to view your profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/user/login">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const savedEventsCount = savedEvents?.length || 0;
  const eventsWithReminders = savedEvents?.filter(
    (se: any) => se.reminderPreference !== "none"
  ).length || 0;

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>
              Update your name and email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  This name will be used in email notifications
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-2" />
                  <div className="flex-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll send a verification link if you change your email
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saved Events Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              Saved Events
            </CardTitle>
            <CardDescription>
              Your bookmarked events and reminder preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {savedEventsCount}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Total saved events
                </div>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="text-3xl font-bold text-primary">
                  {eventsWithReminders}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  With reminders enabled
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Email Reminder Preferences
              </h4>
              <p className="text-sm text-muted-foreground">
                You can customize reminder preferences for each saved event individually.
                Reminders are sent based on your settings:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                <li><strong>24 hours before</strong> - Day-before reminder</li>
                <li><strong>48 hours before</strong> - Two-day advance notice</li>
                <li><strong>Both</strong> - Receive both reminders</li>
                <li><strong>None</strong> - No email reminders</li>
              </ul>
            </div>

            <Link href="/user/saved-events">
              <Button variant="outline" className="w-full">
                View My Saved Events
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>
              Information about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Account Type</span>
              <span className="text-sm font-medium">
                {user.role === "admin" ? "Administrator" : "User"}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Login Method</span>
              <span className="text-sm font-medium">Magic Link</span>
            </div>
            <Separator />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">User ID</span>
              <span className="text-sm font-mono">{user.id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>
              How we protect your information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>Email Privacy:</strong> Your email address is only used for authentication
              and sending event reminders you've opted into. We never share your email with
              third parties or event organizers.
            </p>
            <p>
              <strong>Data Security:</strong> Your account is secured with magic link authentication.
              Each login link expires after 1 hour and can only be used once.
            </p>
            <p>
              <strong>Saved Events:</strong> Your bookmarked events and reminder preferences are
              private and only visible to you.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
