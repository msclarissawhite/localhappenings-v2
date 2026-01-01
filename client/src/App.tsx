import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import Home from "./pages/Home";
import BrowseEvents from "./pages/BrowseEvents";
import SubmitEvent from "./pages/SubmitEvent";
import Analytics from "./pages/Analytics";
import Archive from "./pages/Archive";
import EventDetail from "./pages/EventDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFeedback from "./pages/AdminFeedback";
import { AdminClaimAssignment } from "./pages/AdminClaimAssignment";
import BannerManagement from "./pages/admin/BannerManagement";
import AdminEditEvent from "./pages/AdminEditEvent";
import ClaimEvents from "./pages/ClaimEvents";
import Contact from "./pages/Contact";
import OrganizerLogin from "./pages/OrganizerLogin";
import OrganizerVerify from "./pages/OrganizerVerify";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EditEvent from "./pages/EditEvent";
import NewSavedLocation from "./pages/NewSavedLocation";
import EditSavedLocation from "./pages/EditSavedLocation";
import { ContactTemplates } from "./pages/ContactTemplates";
import MySavedEvents from "./pages/MySavedEvents";
import FeatureRequests from "./pages/FeatureRequests";
import UserLogin from "./pages/UserLogin";
import UserVerify from "./pages/UserVerify";
import UserProfile from "./pages/UserProfile";
import VerifyEmailChange from "./pages/VerifyEmailChange";
import Donate from "./pages/Donate";
import DonorWall from "./pages/DonorWall";
import DonateThankYou from "./pages/DonateThankYou";
import CollectionPage from "./pages/CollectionPage";
import SeriesDetail from "./pages/SeriesDetail";
import Header from "./components/Header";
import Footer from "./components/Footer";

function Router() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/browse"} component={BrowseEvents} />
          <Route path="/submit" component={SubmitEvent} />
          <Route path="/event/:id" component={EventDetail} />
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/feedback/:id" component={AdminFeedback} />
          <Route path="/admin/claim-assignment" component={AdminClaimAssignment} />
          <Route path="/admin/edit-event/:id" component={AdminEditEvent} />
          <Route path="/admin/banners" component={BannerManagement} />
          <Route path="/claim/:token" component={ClaimEvents} />
          <Route path={"/analytics"} component={Analytics} />
      <Route path={"/archive"} component={Archive} />
      <Route path={"/contact"} component={Contact} />
      <Route path="/organizer/login" component={OrganizerLogin} />
      <Route path="/organizer/verify" component={OrganizerVerify} />
      <Route path="/organizer/dashboard" component={OrganizerDashboard} />
      <Route path="/organizer/edit/:id" component={EditEvent} />
      <Route path="/organizer/locations/new" component={NewSavedLocation} />
      <Route path="/organizer/locations/edit/:id" component={EditSavedLocation} />
      <Route path="/organizer/contact-templates" component={ContactTemplates} />
      <Route path="/my-saved-events" component={MySavedEvents} />
      <Route path="/feature-requests" component={FeatureRequests} />
      <Route path="/user/login" component={UserLogin} />
      <Route path="/user/verify" component={UserVerify} />
      <Route path="/user/verify-email" component={VerifyEmailChange} />
      <Route path="/user/profile" component={UserProfile} />
      <Route path="/donate" component={Donate} />
      <Route path="/donor-wall" component={DonorWall} />
      <Route path="/donate/thank-you" component={DonateThankYou} />
      <Route path="/collections/:slug" component={CollectionPage} />
      <Route path="/series/:slug" component={SeriesDetail} />
      <Route path={"/404"} component={NotFound} />          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <UserSettingsProvider>
        <ThemeProvider
          defaultTheme="light"
          // switchable
        >
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </UserSettingsProvider>
    </ErrorBoundary>
  );
}

export default App;
