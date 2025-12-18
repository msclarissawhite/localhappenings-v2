import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold text-lg mb-3">About Local Happenings</h3>
            <p className="text-muted-foreground text-sm">
              A community-first events platform helping families discover accessible, inclusive activities in Nova Scotia.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/browse">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Browse Events
                  </a>
                </Link>
              </li>
              <li>
                <Link href="/submit">
                  <a className="text-muted-foreground hover:text-primary transition-colors">
                    Submit an Event
                  </a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-3">Connect</h3>
            <p className="text-muted-foreground text-sm">
              Questions or feedback? We'd love to hear from you.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Local Happenings. Built with care for our community.</p>
        </div>
      </div>
    </footer>
  );
}
