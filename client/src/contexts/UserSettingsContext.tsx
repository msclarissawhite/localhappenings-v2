import React, { createContext, useContext, useState, useEffect } from "react";

export type FontSize = "comfortable" | "large" | "extra-large";

interface UserSettings {
  fontSize: FontSize;
}

interface UserSettingsContextType {
  settings: UserSettings;
  updateFontSize: (size: FontSize) => void;
}

const defaultSettings: UserSettings = {
  fontSize: "comfortable",
};

const UserSettingsContext = createContext<UserSettingsContextType | undefined>(
  undefined
);

export function UserSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("userSettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings(parsed);
        applyFontSize(parsed.fontSize);
      } catch (error) {
        console.error("Failed to parse user settings:", error);
      }
    }
  }, []);

  // Apply font size to html element
  const applyFontSize = (size: FontSize) => {
    const htmlElement = document.documentElement;
    
    // Remove existing font size classes
    htmlElement.classList.remove("font-size-comfortable", "font-size-large", "font-size-extra-large");
    
    // Add new font size class
    htmlElement.classList.add(`font-size-${size}`);
  };

  const updateFontSize = (size: FontSize) => {
    const newSettings = { ...settings, fontSize: size };
    setSettings(newSettings);
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    applyFontSize(size);
  };

  return (
    <UserSettingsContext.Provider value={{ settings, updateFontSize }}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useUserSettings() {
  const context = useContext(UserSettingsContext);
  if (context === undefined) {
    throw new Error("useUserSettings must be used within a UserSettingsProvider");
  }
  return context;
}
