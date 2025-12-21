import { Link } from "wouter";
import { Button } from "./ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useOrganizer } from "@/contexts/OrganizerContext";
import { useUserAuth } from "@/hooks/useUserAuth";
import { Calendar, Menu, X, User, Bookmark, LogIn, Settings } from "lucide-react";
import { useState } from "react";
import { SettingsPanel } from "./SettingsPanel";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const { user: regularUser, isAuthenticated: isUserAuthenticated, logout: userLogout, getLoginUrl } = useUserAuth();
  const { isLoggedIn: isOrganizerLoggedIn } = useOrganizer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary hover:text-primary/80 transition-colors">
            <Calendar className="w-6 h-6" />
            <span>Local Happenings</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/browse" className="text-foreground hover:text-primary font-medium transition-colors flex items-center">
              Browse Events
            </Link>
            <Link href="/submit" className="text-foreground hover:text-primary font-medium transition-colors flex items-center">
              Submit Event
            </Link>
            <Link href="/archive" className="text-foreground hover:text-primary font-medium transition-colors flex items-center">
              Archive
            </Link>
            {isUserAuthenticated && (
              <>
                <Link href="/my-saved-events" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1">
                  <Bookmark className="w-4 h-4" />
                  My Saved Events
                </Link>
                <Link href="/user/profile" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
              </>
            )}
            {isOrganizerLoggedIn && (
              <Link href="/organizer/dashboard" className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1">
                <User className="w-4 h-4" />
                My Events
              </Link>
            )}
            {isAuthenticated && user?.role === "admin" && (
              <>
                <Link href="/admin" className="text-foreground hover:text-primary font-medium transition-colors flex items-center">
                  Admin
                </Link>
                <Link href="/analytics" className="text-foreground hover:text-primary font-medium transition-colors flex items-center">
                  Analytics
                </Link>
              </>
            )}
            {!isUserAuthenticated && (
              <a href={getLoginUrl()} className="text-foreground hover:text-primary font-medium transition-colors flex items-center gap-1">
                <LogIn className="w-4 h-4" />
                Sign In
              </a>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsPanelOpen(true)}
              className="flex items-center gap-1"
              aria-label="Accessibility Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden lg:inline">Settings</span>
            </Button>
          </nav>

          <SettingsPanel open={settingsPanelOpen} onOpenChange={setSettingsPanelOpen} />

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-3">
              <Link href="/browse" className="text-foreground hover:text-primary font-medium transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Browse Events
              </Link>
              <Link href="/submit" className="text-foreground hover:text-primary font-medium transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Submit Event
              </Link>
              <Link href="/archive" className="text-foreground hover:text-primary font-medium transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                Archive
              </Link>
              {isUserAuthenticated && (
                <>
                  <Link href="/my-saved-events" className="text-foreground hover:text-primary font-medium transition-colors py-2 flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
                    <Bookmark className="w-4 h-4" />
                    My Saved Events
                  </Link>
                  <Link href="/user/profile" className="text-foreground hover:text-primary font-medium transition-colors py-2 flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </>
              )}
              {isOrganizerLoggedIn && (
                <Link href="/organizer/dashboard" className="text-foreground hover:text-primary font-medium transition-colors py-2 flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
                  <User className="w-4 h-4" />
                  My Events
                </Link>
              )}
              {isAuthenticated && user?.role === "admin" && (
                <>
                  <Link href="/admin" className="text-foreground hover:text-primary font-medium transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Admin
                  </Link>
                  <Link href="/analytics" className="text-foreground hover:text-primary font-medium transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>
                    Analytics
                  </Link>
                </>
              )}
              {!isUserAuthenticated && (
                <a href={getLoginUrl()} className="text-foreground hover:text-primary font-medium transition-colors py-2 flex items-center gap-1" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </a>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSettingsPanelOpen(true);
                }}
                className="text-foreground hover:text-primary font-medium transition-colors py-2 flex items-center gap-1"
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
