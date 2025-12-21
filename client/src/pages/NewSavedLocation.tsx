import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SavedLocationForm } from "@/components/SavedLocationForm";

interface Organizer {
  id: number;
  email: string;
  name: string | null;
}

export default function NewSavedLocation() {
  const [, navigate] = useLocation();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

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

  if (!organizer) {
    return null;
  }

  return <SavedLocationForm organizerId={organizer.id} />;
}
