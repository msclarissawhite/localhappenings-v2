/**
 * Google Places Autocomplete Component
 * 
 * Provides real-time venue and address suggestions using Google Places API.
 * Auto-fills location details when a place is selected.
 */

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const API_KEY = import.meta.env.VITE_FRONTEND_FORGE_API_KEY;
const FORGE_BASE_URL =
  import.meta.env.VITE_FRONTEND_FORGE_API_URL ||
  "https://forge.butterfly-effect.dev";
const MAPS_PROXY_URL = `${FORGE_BASE_URL}/v1/maps/proxy`;

function loadPlacesScript() {
  return new Promise((resolve) => {
    // Check if already loaded
    if (window.google?.maps?.places) {
      resolve(null);
      return;
    }

    const script = document.createElement("script");
    script.src = `${MAPS_PROXY_URL}/maps/api/js?key=${API_KEY}&v=weekly&libraries=places`;
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      resolve(null);
    };
    script.onerror = () => {
      console.error("Failed to load Google Places script");
    };
    document.head.appendChild(script);
  });
}

export interface PlaceDetails {
  venue: string;
  address: string;
  province: string;
  municipality: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
}

interface PlacesAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (details: PlaceDetails) => void;
  className?: string;
  required?: boolean;
  // Restrict to specific countries (default: Canada)
  countries?: string[];
  // Bias results to specific location (default: Nova Scotia)
  locationBias?: google.maps.LatLngLiteral;
}

export function PlacesAutocomplete({
  label = "Venue or Address",
  placeholder = "Start typing to search...",
  value,
  onChange,
  onPlaceSelected,
  className,
  required = false,
  countries = ["ca"],
  locationBias = { lat: 44.6488, lng: -63.5752 }, // Halifax, NS
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadPlacesScript().then(() => {
      setIsLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google?.maps?.places) {
      return;
    }

    // Initialize autocomplete
    const autocomplete = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        componentRestrictions: { country: countries },
        fields: [
          "name",
          "formatted_address",
          "address_components",
          "geometry",
          "place_id",
        ],
        types: ["establishment", "geocode"], // Include both venues and addresses
      }
    );
    
    autocompleteRef.current = autocomplete;

    // Bias results to location
    if (locationBias) {
      const circle = new window.google.maps.Circle({
        center: locationBias,
        radius: 50000, // 50km radius
      });
      autocomplete.setBounds(circle.getBounds()!);
    }

    // Listen for place selection
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      
      if (!place || !place.address_components) {
        return;
      }

      // Extract location details from place
      const details: PlaceDetails = {
        venue: place.name || "",
        address: place.formatted_address || "",
        province: "",
        municipality: "",
      };

      // Parse address components
      for (const component of place.address_components) {
        const types = component.types;

        if (types.includes("locality")) {
          details.municipality = component.long_name;
        } else if (types.includes("administrative_area_level_1")) {
          details.province = component.long_name;
        } else if (types.includes("postal_code")) {
          details.postalCode = component.long_name;
        }
      }

      // Add coordinates if available
      if (place.geometry?.location) {
        details.lat = place.geometry.location.lat();
        details.lng = place.geometry.location.lng();
      }

      // Update input value with venue name
      onChange(place.name || place.formatted_address || "");

      // Notify parent component
      if (onPlaceSelected) {
        onPlaceSelected(details);
      }
    });

    return () => {
      if (listener) {
        window.google?.maps?.event?.removeListener(listener);
      }
    };
  }, [isLoaded, countries, locationBias]);

  return (
    <div className={className}>
      {label && (
        <Label htmlFor="places-autocomplete">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <Input
        ref={inputRef}
        id="places-autocomplete"
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        autoComplete="off"
      />
      {!isLoaded && (
        <p className="text-sm text-muted-foreground mt-1">
          Loading location suggestions...
        </p>
      )}
    </div>
  );
}
