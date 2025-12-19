import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { SavedLocationForm } from "@/components/SavedLocationForm";

interface Organizer {
  id: number;
  email: string;
  name: string | null;
}

export default function EditSavedLocation() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/organizer/locations/edit/:id");
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

  const locationId = params?.id ? parseInt(params.id) : undefined;

  useEffect(() => {
    const storedOrganizer = localStorage.getItem("organizer");
    if (!storedOrganizer) {
      navigate("/organizer/login");
      return;
    }

    try {
      const parsed = JSON.parse(storedOrganizer);
      setOrganizer(parsed);
    } catch (error) {
      navigate("/organizer/login");
    }
  }, [navigate]);

  if (!organizer || !locationId) {
    return null;
  }

  return <SavedLocationForm organizerId={organizer.id} locationId={locationId} />;
}
