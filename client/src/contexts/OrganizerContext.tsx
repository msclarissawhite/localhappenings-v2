import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Organizer {
  id: number;
  email: string;
  name?: string | null;
}

interface OrganizerContextType {
  organizer: Organizer | null;
  isLoggedIn: boolean;
  login: (organizer: Organizer) => void;
  logout: () => void;
}

const OrganizerContext = createContext<OrganizerContextType | undefined>(undefined);

export function OrganizerProvider({ children }: { children: ReactNode }) {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

  useEffect(() => {
    // Load organizer from localStorage on mount
    const stored = localStorage.getItem("organizer");
    if (stored) {
      try {
        setOrganizer(JSON.parse(stored));
      } catch (e) {
        localStorage.removeItem("organizer");
      }
    }
  }, []);

  const login = (org: Organizer) => {
    setOrganizer(org);
    localStorage.setItem("organizer", JSON.stringify(org));
  };

  const logout = () => {
    setOrganizer(null);
    localStorage.removeItem("organizer");
  };

  return (
    <OrganizerContext.Provider
      value={{
        organizer,
        isLoggedIn: !!organizer,
        login,
        logout,
      }}
    >
      {children}
    </OrganizerContext.Provider>
  );
}

export function useOrganizer() {
  const context = useContext(OrganizerContext);
  if (context === undefined) {
    throw new Error("useOrganizer must be used within an OrganizerProvider");
  }
  return context;
}
