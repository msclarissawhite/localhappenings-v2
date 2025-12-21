import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUserSettings, FontSize } from "@/contexts/UserSettingsContext";
import { Type, Contrast, Gauge, Eye } from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsPanel({ open, onOpenChange }: SettingsPanelProps) {
  const { settings, updateFontSize } = useUserSettings();

  const fontSizeOptions: { value: FontSize; label: string; description: string; pixels: string }[] = [
    {
      value: "comfortable",
      label: "Comfortable",
      description: "Recommended for most users",
      pixels: "17px",
    },
    {
      value: "large",
      label: "Large",
      description: "Easier to read for extended periods",
      pixels: "19px",
    },
    {
      value: "extra-large",
      label: "Extra Large",
      description: "Maximum readability",
      pixels: "21px",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Gauge className="h-6 w-6" />
            Accessibility Settings
          </DialogTitle>
          <DialogDescription>
            Customize your viewing experience to match your preferences and needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Font Size Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Text Size</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose a text size that's comfortable for you. Changes apply immediately across the entire site.
            </p>
            
            <RadioGroup
              value={settings.fontSize}
              onValueChange={(value) => updateFontSize(value as FontSize)}
              className="space-y-3"
            >
              {fontSizeOptions.map((option) => (
                <div
                  key={option.value}
                  className="flex items-start space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="flex-1">
                    <Label
                      htmlFor={option.value}
                      className="text-base font-medium cursor-pointer flex items-center justify-between"
                    >
                      <span>{option.label}</span>
                      <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                        {option.pixels}
                      </span>
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Future: Contrast Theme Section */}
          <div className="space-y-4 opacity-50">
            <div className="flex items-center gap-2">
              <Contrast className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Contrast Theme</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose between standard, high contrast, or dark mode themes.
            </p>
          </div>

          {/* Future: Motion Preferences Section */}
          <div className="space-y-4 opacity-50">
            <div className="flex items-center gap-2">
              <Gauge className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Motion & Animations</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Reduce or disable animations for a calmer browsing experience.
            </p>
          </div>

          {/* Future: Screen Reader Optimizations */}
          <div className="space-y-4 opacity-50">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Screen Reader Optimizations</h3>
              <span className="text-xs bg-muted px-2 py-1 rounded">Coming Soon</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Enhanced descriptions and navigation for screen reader users.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
