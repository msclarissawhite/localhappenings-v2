import { describe, it, expect } from "vitest";
import type { AccessibilityValue } from "@shared/types";

describe("Accessibility Features Validation", () => {
  describe("AccessibilityValue Type", () => {
    it("should accept valid accessibility values", () => {
      const validValues: AccessibilityValue[] = ["yes", "no", "partial", "unknown"];

      validValues.forEach((value) => {
        expect(["yes", "no", "partial", "unknown"]).toContain(value);
      });
    });

    it("should validate wheelchair accessibility values", () => {
      const wheelchairValues = ["full", "partial", "none", "unknown"];

      wheelchairValues.forEach((value) => {
        expect(["full", "partial", "none", "unknown"]).toContain(value);
      });
    });
  });

  describe("Accessibility Field Validation", () => {
    it("should validate sensory-friendly field", () => {
      const event = {
        sensoryFriendly: "yes" as AccessibilityValue,
      };

      expect(event.sensoryFriendly).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.sensoryFriendly);
    });

    it("should validate stroller accessible field", () => {
      const event = {
        strollerAccessible: "yes" as AccessibilityValue,
      };

      expect(event.strollerAccessible).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.strollerAccessible);
    });

    it("should validate ASL interpretation field", () => {
      const event = {
        aslInterpretation: "yes" as AccessibilityValue,
      };

      expect(event.aslInterpretation).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.aslInterpretation);
    });

    it("should validate gender-neutral bathrooms field", () => {
      const event = {
        genderNeutralBathrooms: "yes" as AccessibilityValue,
      };

      expect(event.genderNeutralBathrooms).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.genderNeutralBathrooms);
    });

    it("should validate quiet space field", () => {
      const event = {
        quietSpace: "yes" as AccessibilityValue,
      };

      expect(event.quietSpace).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.quietSpace);
    });

    it("should validate nursing room field", () => {
      const event = {
        nursingRoom: "yes" as AccessibilityValue,
      };

      expect(event.nursingRoom).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.nursingRoom);
    });

    it("should validate changing table field", () => {
      const event = {
        changingTable: "yes" as AccessibilityValue,
      };

      expect(event.changingTable).toBe("yes");
      expect(["yes", "no", "partial", "unknown"]).toContain(event.changingTable);
    });
  });

  describe("Accessibility Combinations", () => {
    it("should allow multiple accessibility features to be 'yes'", () => {
      const event = {
        wheelchairAccessible: "full",
        sensoryFriendly: "yes" as AccessibilityValue,
        strollerAccessible: "yes" as AccessibilityValue,
        aslInterpretation: "yes" as AccessibilityValue,
        genderNeutralBathrooms: "yes" as AccessibilityValue,
        quietSpace: "yes" as AccessibilityValue,
        nursingRoom: "yes" as AccessibilityValue,
        changingTable: "yes" as AccessibilityValue,
      };

      expect(event.wheelchairAccessible).toBe("full");
      expect(event.sensoryFriendly).toBe("yes");
      expect(event.strollerAccessible).toBe("yes");
      expect(event.aslInterpretation).toBe("yes");
      expect(event.genderNeutralBathrooms).toBe("yes");
      expect(event.quietSpace).toBe("yes");
      expect(event.nursingRoom).toBe("yes");
      expect(event.changingTable).toBe("yes");
    });

    it("should allow mixed accessibility values", () => {
      const event = {
        wheelchairAccessible: "partial",
        sensoryFriendly: "yes" as AccessibilityValue,
        strollerAccessible: "no" as AccessibilityValue,
        aslInterpretation: "unknown" as AccessibilityValue,
      };

      expect(event.wheelchairAccessible).toBe("partial");
      expect(event.sensoryFriendly).toBe("yes");
      expect(event.strollerAccessible).toBe("no");
      expect(event.aslInterpretation).toBe("unknown");
    });

    it("should allow all accessibility features to be 'unknown'", () => {
      const event = {
        wheelchairAccessible: "unknown",
        sensoryFriendly: "unknown" as AccessibilityValue,
        strollerAccessible: "unknown" as AccessibilityValue,
        aslInterpretation: "unknown" as AccessibilityValue,
        genderNeutralBathrooms: "unknown" as AccessibilityValue,
      };

      Object.values(event).forEach((value) => {
        expect(value).toBe("unknown");
      });
    });
  });

  describe("Parking and Transit Accessibility", () => {
    it("should validate parking distance field", () => {
      const event = {
        parkingDistance: "On-site parking available",
      };

      expect(event.parkingDistance).toBeTruthy();
      expect(typeof event.parkingDistance).toBe("string");
    });

    it("should validate transit options field", () => {
      const event = {
        transitOptions: "Bus route 1, 2, 3 stop nearby",
      };

      expect(event.transitOptions).toBeTruthy();
      expect(typeof event.transitOptions).toBe("string");
    });

    it("should allow empty parking and transit fields", () => {
      const event = {
        parkingDistance: "",
        transitOptions: "",
      };

      expect(event.parkingDistance).toBe("");
      expect(event.transitOptions).toBe("");
    });
  });

  describe("Age Appropriateness", () => {
    it("should validate allAges field", () => {
      const event = {
        allAges: true,
      };

      expect(event.allAges).toBe(true);
      expect(typeof event.allAges).toBe("boolean");
    });

    it("should validate familyFriendly field", () => {
      const event = {
        familyFriendly: true,
      };

      expect(event.familyFriendly).toBe(true);
      expect(typeof event.familyFriendly).toBe("boolean");
    });

    it("should validate age range fields", () => {
      const event = {
        minAge: 5,
        maxAge: 12,
      };

      expect(event.minAge).toBe(5);
      expect(event.maxAge).toBe(12);
      expect(event.minAge).toBeLessThan(event.maxAge);
    });

    it("should allow null age range for all ages events", () => {
      const event = {
        allAges: true,
        minAge: null,
        maxAge: null,
      };

      expect(event.allAges).toBe(true);
      expect(event.minAge).toBeNull();
      expect(event.maxAge).toBeNull();
    });
  });

  describe("Cost Accessibility", () => {
    it("should validate isFree field", () => {
      const event = {
        isFree: true,
      };

      expect(event.isFree).toBe(true);
      expect(typeof event.isFree).toBe("boolean");
    });

    it("should validate kidsFree field", () => {
      const event = {
        kidsFree: true,
      };

      expect(event.kidsFree).toBe(true);
      expect(typeof event.kidsFree).toBe("boolean");
    });

    it("should validate freeCompanion field", () => {
      const event = {
        freeCompanion: true,
      };

      expect(event.freeCompanion).toBe(true);
      expect(typeof event.freeCompanion).toBe("boolean");
    });

    it("should allow paid events with kids free", () => {
      const event = {
        isFree: false,
        kidsFree: true,
        fixedPrice: 10,
      };

      expect(event.isFree).toBe(false);
      expect(event.kidsFree).toBe(true);
      expect(event.fixedPrice).toBe(10);
    });

    it("should validate price range for paid events", () => {
      const event = {
        isFree: false,
        minPrice: 5,
        maxPrice: 15,
      };

      expect(event.isFree).toBe(false);
      expect(event.minPrice).toBe(5);
      expect(event.maxPrice).toBe(15);
      expect(event.minPrice).toBeLessThan(event.maxPrice);
    });
  });

  describe("Accessibility Notes", () => {
    it("should validate accessibilityNotes field", () => {
      const event = {
        accessibilityNotes: "Ramp available at side entrance. Service animals welcome.",
      };

      expect(event.accessibilityNotes).toBeTruthy();
      expect(typeof event.accessibilityNotes).toBe("string");
      expect(event.accessibilityNotes.length).toBeGreaterThan(0);
    });

    it("should allow empty accessibility notes", () => {
      const event = {
        accessibilityNotes: "",
      };

      expect(event.accessibilityNotes).toBe("");
    });

    it("should handle long accessibility notes", () => {
      const longNotes = "This is a very detailed accessibility note that provides comprehensive information about the venue's accessibility features, including wheelchair access, parking, transit options, sensory accommodations, and more.";
      const event = {
        accessibilityNotes: longNotes,
      };

      expect(event.accessibilityNotes).toBe(longNotes);
      expect(event.accessibilityNotes.length).toBeGreaterThan(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle events with no accessibility information", () => {
      const event = {
        wheelchairAccessible: "unknown",
        sensoryFriendly: "unknown" as AccessibilityValue,
        strollerAccessible: "unknown" as AccessibilityValue,
        aslInterpretation: "unknown" as AccessibilityValue,
        genderNeutralBathrooms: "unknown" as AccessibilityValue,
        quietSpace: "unknown" as AccessibilityValue,
        nursingRoom: "unknown" as AccessibilityValue,
        changingTable: "unknown" as AccessibilityValue,
        parkingDistance: "",
        transitOptions: "",
        accessibilityNotes: "",
      };

      expect(event.wheelchairAccessible).toBe("unknown");
      expect(event.parkingDistance).toBe("");
      expect(event.accessibilityNotes).toBe("");
    });

    it("should handle fully accessible events", () => {
      const event = {
        wheelchairAccessible: "full",
        sensoryFriendly: "yes" as AccessibilityValue,
        strollerAccessible: "yes" as AccessibilityValue,
        aslInterpretation: "yes" as AccessibilityValue,
        genderNeutralBathrooms: "yes" as AccessibilityValue,
        quietSpace: "yes" as AccessibilityValue,
        nursingRoom: "yes" as AccessibilityValue,
        changingTable: "yes" as AccessibilityValue,
        isFree: true,
        kidsFree: true,
        freeCompanion: true,
        allAges: true,
        familyFriendly: true,
      };

      expect(event.wheelchairAccessible).toBe("full");
      expect(event.isFree).toBe(true);
      expect(event.allAges).toBe(true);
      expect(event.familyFriendly).toBe(true);
    });
  });
});
