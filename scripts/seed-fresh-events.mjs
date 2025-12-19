import { getDb } from "../server/db.ts";
import { events } from "../drizzle/schema.ts";

const testEvents = [
  {
    name: "Family Story Time at Halifax Library",
    description: "Join us for an interactive story time session perfect for young children and their caregivers. We'll read engaging books, sing songs, and enjoy simple crafts together.",
    startDate: new Date("2025-01-15T10:00:00"),
    endDate: new Date("2025-01-15T11:00:00"),
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "Downtown",
    venue: "Halifax Central Library",
    address: "5440 Spring Garden Road",
    isFree: true,
    costType: null,
    costMin: null,
    costMax: null,
    kidsFree: false,
    freeCompanion: false,
    allAges: false,
    familyFriendly: true,
    youngChildren: true,
    kids: true,
    teens: false,
    adultsOnly: false,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    organizerName: "Halifax Public Libraries",
    organizerEmail: "programs@halifaxpubliclibraries.ca",
    organizerPhone: "902-490-5700",
    organizerWebsite: "https://www.halifaxpubliclibraries.ca",
    showOrganizerInfo: true,
    additionalNotes: "Drop-in program, no registration required. Geared toward ages 0-5.",
    status: "published",
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        changeTablesAllWashrooms: "yes",
        nursingFriendly: "yes",
        privateFeedingArea: "yes",
        bottleWarming: "no",
        highChairs: "not-relevant",
        strollerSpace: "yes",
        coatStrollerStorage: "yes"
      },
      mobility: {
        strollerAccessible: "yes",
        wheelchairAccessibleEntrance: "yes",
        stepFreeEntry: "yes",
        elevatorAccess: "yes",
        wideDoorways: "yes",
        accessibleSeating: "yes",
        accessibleWashrooms: "yes",
        reservedAccessibleParking: "yes",
        terrainType: "Paved",
        parkingDistance: "Short walk"
      },
      sensory: {
        sensoryFriendly: "yes",
        quietLowStimulus: "no",
        loudNoises: "no",
        flashingLights: "no",
        crowdLevel: "moderate",
        quietRoom: "yes",
        sensoryFriendlyTimeSlot: "not-relevant",
        predictableSchedule: "yes"
      },
      cognitive: {
        clearSignage: "yes",
        simpleInstructions: "yes",
        writtenMaterials: "yes",
        aslInterpretation: "no",
        liveCaptions: "no",
        multilingualSupport: "no"
      },
      social: {
        genderNeutralWashrooms: "yes",
        lgbtqiaFriendly: "yes",
        maskFriendly: "yes",
        scentFree: "no",
        alcoholFree: "yes",
        substanceFree: "yes",
        traumaInformed: "yes"
      }
    })
  },
  {
    name: "Winter Farmers Market",
    description: "Browse fresh local produce, baked goods, crafts, and artisan products from Nova Scotia vendors. Live music and hot beverages available.",
    startDate: new Date("2025-01-18T09:00:00"),
    endDate: new Date("2025-01-18T13:00:00"),
    province: "Nova Scotia",
    city: "Dartmouth",
    neighborhood: "Downtown Dartmouth",
    venue: "Alderney Landing",
    address: "2 Ochterloney Street",
    isFree: true,
    costType: null,
    costMin: null,
    costMax: null,
    kidsFree: false,
    freeCompanion: false,
    allAges: true,
    familyFriendly: true,
    youngChildren: true,
    kids: true,
    teens: true,
    adultsOnly: false,
    seniors: true,
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    organizerName: "Dartmouth Farmers Market",
    organizerEmail: "info@dartmouthfarmersmarket.com",
    organizerPhone: "902-461-4083",
    organizerWebsite: "https://www.dartmouthfarmersmarket.com",
    showOrganizerInfo: true,
    additionalNotes: "Free admission. Cash and card accepted at most vendors.",
    status: "published",
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        changeTablesAllWashrooms: "no",
        nursingFriendly: "yes",
        privateFeedingArea: "no",
        bottleWarming: "no",
        highChairs: "not-relevant",
        strollerSpace: "yes",
        coatStrollerStorage: "no"
      },
      mobility: {
        strollerAccessible: "yes",
        wheelchairAccessibleEntrance: "yes",
        stepFreeEntry: "yes",
        elevatorAccess: "yes",
        wideDoorways: "yes",
        accessibleSeating: "yes",
        accessibleWashrooms: "yes",
        reservedAccessibleParking: "yes",
        terrainType: "Paved",
        parkingDistance: "Moderate walk"
      },
      sensory: {
        sensoryFriendly: "no",
        quietLowStimulus: "no",
        loudNoises: "yes",
        flashingLights: "no",
        crowdLevel: "crowded",
        quietRoom: "no",
        sensoryFriendlyTimeSlot: "not-relevant",
        predictableSchedule: "yes"
      },
      cognitive: {
        clearSignage: "yes",
        simpleInstructions: "yes",
        writtenMaterials: "no",
        aslInterpretation: "no",
        liveCaptions: "no",
        multilingualSupport: "no"
      },
      social: {
        genderNeutralWashrooms: "no",
        lgbtqiaFriendly: "yes",
        maskFriendly: "yes",
        scentFree: "no",
        alcoholFree: "yes",
        substanceFree: "yes",
        traumaInformed: "unknown"
      }
    })
  },
  {
    name: "Gentle Yoga for Seniors",
    description: "A gentle yoga class designed specifically for seniors and those with limited mobility. Focus on breathing, stretching, and balance in a supportive environment.",
    startDate: new Date("2025-01-20T14:00:00"),
    endDate: new Date("2025-01-20T15:00:00"),
    province: "Nova Scotia",
    city: "Bedford",
    neighborhood: null,
    venue: "Bedford Recreation Centre",
    address: "45 Gary Martin Drive",
    isFree: false,
    costType: "fixed",
    costMin: 10,
    costMax: 10,
    kidsFree: false,
    freeCompanion: false,
    allAges: false,
    familyFriendly: false,
    youngChildren: false,
    kids: false,
    teens: false,
    adultsOnly: true,
    seniors: true,
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    organizerName: "Bedford Parks & Recreation",
    organizerEmail: "recreation@bedford.ca",
    organizerPhone: "902-490-4000",
    organizerWebsite: null,
    showOrganizerInfo: true,
    additionalNotes: "Please bring your own yoga mat. Chairs available for seated modifications.",
    status: "published",
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        changeTablesAllWashrooms: "not-relevant",
        nursingFriendly: "not-relevant",
        privateFeedingArea: "not-relevant",
        bottleWarming: "not-relevant",
        highChairs: "not-relevant",
        strollerSpace: "not-relevant",
        coatStrollerStorage: "yes"
      },
      mobility: {
        strollerAccessible: "yes",
        wheelchairAccessibleEntrance: "yes",
        stepFreeEntry: "yes",
        elevatorAccess: "yes",
        wideDoorways: "yes",
        accessibleSeating: "yes",
        accessibleWashrooms: "yes",
        reservedAccessibleParking: "yes",
        terrainType: "Paved",
        parkingDistance: "Short walk"
      },
      sensory: {
        sensoryFriendly: "yes",
        quietLowStimulus: "yes",
        loudNoises: "no",
        flashingLights: "no",
        crowdLevel: "spacious",
        quietRoom: "not-relevant",
        sensoryFriendlyTimeSlot: "not-relevant",
        predictableSchedule: "yes"
      },
      cognitive: {
        clearSignage: "yes",
        simpleInstructions: "yes",
        writtenMaterials: "no",
        aslInterpretation: "no",
        liveCaptions: "no",
        multilingualSupport: "no"
      },
      social: {
        genderNeutralWashrooms: "yes",
        lgbtqiaFriendly: "yes",
        maskFriendly: "yes",
        scentFree: "yes",
        alcoholFree: "yes",
        substanceFree: "yes",
        traumaInformed: "yes"
      }
    })
  },
  {
    name: "Kids Science Workshop: Build a Volcano",
    description: "Hands-on science fun! Kids will learn about chemical reactions while building and erupting their own mini volcano. All materials provided.",
    startDate: new Date("2025-01-22T13:00:00"),
    endDate: new Date("2025-01-22T14:30:00"),
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "North End",
    venue: "Discovery Centre",
    address: "1593 Barrington Street",
    isFree: false,
    costType: "fixed",
    costMin: 15,
    costMax: 15,
    kidsFree: false,
    freeCompanion: true,
    allAges: false,
    familyFriendly: true,
    youngChildren: false,
    kids: true,
    teens: false,
    adultsOnly: false,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    organizerName: "Discovery Centre",
    organizerEmail: "info@thediscoverycentre.ca",
    organizerPhone: "902-492-4422",
    organizerWebsite: "https://www.thediscoverycentre.ca",
    showOrganizerInfo: true,
    additionalNotes: "Recommended for ages 6-12. Pre-registration required. Limited spots available.",
    status: "published",
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        changeTablesAllWashrooms: "yes",
        nursingFriendly: "yes",
        privateFeedingArea: "yes",
        bottleWarming: "no",
        highChairs: "not-relevant",
        strollerSpace: "yes",
        coatStrollerStorage: "yes"
      },
      mobility: {
        strollerAccessible: "yes",
        wheelchairAccessibleEntrance: "yes",
        stepFreeEntry: "yes",
        elevatorAccess: "yes",
        wideDoorways: "yes",
        accessibleSeating: "yes",
        accessibleWashrooms: "yes",
        reservedAccessibleParking: "yes",
        terrainType: "Paved",
        parkingDistance: "Short walk"
      },
      sensory: {
        sensoryFriendly: "no",
        quietLowStimulus: "no",
        loudNoises: "yes",
        flashingLights: "no",
        crowdLevel: "moderate",
        quietRoom: "yes",
        sensoryFriendlyTimeSlot: "not-relevant",
        predictableSchedule: "yes"
      },
      cognitive: {
        clearSignage: "yes",
        simpleInstructions: "yes",
        writtenMaterials: "yes",
        aslInterpretation: "no",
        liveCaptions: "no",
        multilingualSupport: "no"
      },
      social: {
        genderNeutralWashrooms: "yes",
        lgbtqiaFriendly: "yes",
        maskFriendly: "yes",
        scentFree: "no",
        alcoholFree: "yes",
        substanceFree: "yes",
        traumaInformed: "yes"
      }
    })
  },
  {
    name: "Outdoor Winter Hike: Point Pleasant Park",
    description: "Join us for a guided winter hike through Point Pleasant Park. We'll explore snowy trails and learn about winter ecology. Dress warmly!",
    startDate: new Date("2025-01-25T10:00:00"),
    endDate: new Date("2025-01-25T12:00:00"),
    province: "Nova Scotia",
    city: "Halifax",
    neighborhood: "South End",
    venue: "Point Pleasant Park",
    address: "Point Pleasant Drive",
    isFree: true,
    costType: null,
    costMin: null,
    costMax: null,
    kidsFree: false,
    freeCompanion: false,
    allAges: false,
    familyFriendly: true,
    youngChildren: false,
    kids: true,
    teens: true,
    adultsOnly: false,
    seniors: false,
    isIndoor: false,
    isOutdoor: true,
    imageUrl: null,
    organizerName: "Halifax Trails Association",
    organizerEmail: "trails@halifaxtrails.ca",
    organizerPhone: null,
    organizerWebsite: "https://www.halifaxtrails.ca",
    showOrganizerInfo: true,
    additionalNotes: "Meet at the main parking lot. Moderate difficulty. Not suitable for strollers or wheelchairs due to terrain.",
    status: "published",
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "no",
        changeTablesAllWashrooms: "not-relevant",
        nursingFriendly: "no",
        privateFeedingArea: "no",
        bottleWarming: "not-relevant",
        highChairs: "not-relevant",
        strollerSpace: "no",
        coatStrollerStorage: "no"
      },
      mobility: {
        strollerAccessible: "no",
        wheelchairAccessibleEntrance: "no",
        stepFreeEntry: "no",
        elevatorAccess: "not-relevant",
        wideDoorways: "not-relevant",
        accessibleSeating: "no",
        accessibleWashrooms: "no",
        reservedAccessibleParking: "yes",
        terrainType: "Hills",
        parkingDistance: "Short walk"
      },
      sensory: {
        sensoryFriendly: "yes",
        quietLowStimulus: "yes",
        loudNoises: "no",
        flashingLights: "no",
        crowdLevel: "spacious",
        quietRoom: "not-relevant",
        sensoryFriendlyTimeSlot: "not-relevant",
        predictableSchedule: "yes"
      },
      cognitive: {
        clearSignage: "no",
        simpleInstructions: "yes",
        writtenMaterials: "no",
        aslInterpretation: "no",
        liveCaptions: "no",
        multilingualSupport: "no"
      },
      social: {
        genderNeutralWashrooms: "no",
        lgbtqiaFriendly: "yes",
        maskFriendly: "yes",
        scentFree: "yes",
        alcoholFree: "yes",
        substanceFree: "yes",
        traumaInformed: "unknown"
      }
    })
  },
  {
    name: "Teen Game Night",
    description: "Board games, video games, snacks, and fun! A safe space for teens to hang out and make friends. Pizza provided.",
    startDate: new Date("2025-01-26T18:00:00"),
    endDate: new Date("2025-01-26T21:00:00"),
    province: "Nova Scotia",
    city: "Lower Sackville",
    neighborhood: null,
    venue: "Sackville Heights Community Centre",
    address: "45 Connolly Road",
    isFree: false,
    costType: "donation",
    costMin: 0,
    costMax: 10,
    kidsFree: false,
    freeCompanion: false,
    allAges: false,
    familyFriendly: false,
    youngChildren: false,
    kids: false,
    teens: true,
    adultsOnly: false,
    seniors: false,
    isIndoor: true,
    isOutdoor: false,
    imageUrl: null,
    organizerName: "Sackville Youth Programs",
    organizerEmail: "youth@sackville.ca",
    organizerPhone: "902-865-2467",
    organizerWebsite: null,
    showOrganizerInfo: true,
    additionalNotes: "Ages 13-17 welcome. Suggested donation $5. No one turned away for lack of funds.",
    status: "published",
    accessibility: JSON.stringify({
      caregiver: {
        changeTablesPresent: "yes",
        changeTablesAllWashrooms: "not-relevant",
        nursingFriendly: "not-relevant",
        privateFeedingArea: "not-relevant",
        bottleWarming: "not-relevant",
        highChairs: "not-relevant",
        strollerSpace: "not-relevant",
        coatStrollerStorage: "yes"
      },
      mobility: {
        strollerAccessible: "yes",
        wheelchairAccessibleEntrance: "yes",
        stepFreeEntry: "yes",
        elevatorAccess: "not-relevant",
        wideDoorways: "yes",
        accessibleSeating: "yes",
        accessibleWashrooms: "yes",
        reservedAccessibleParking: "yes",
        terrainType: "Paved",
        parkingDistance: "Short walk"
      },
      sensory: {
        sensoryFriendly: "no",
        quietLowStimulus: "no",
        loudNoises: "yes",
        flashingLights: "yes",
        crowdLevel: "moderate",
        quietRoom: "yes",
        sensoryFriendlyTimeSlot: "not-relevant",
        predictableSchedule: "yes"
      },
      cognitive: {
        clearSignage: "yes",
        simpleInstructions: "yes",
        writtenMaterials: "no",
        aslInterpretation: "no",
        liveCaptions: "no",
        multilingualSupport: "no"
      },
      social: {
        genderNeutralWashrooms: "yes",
        lgbtqiaFriendly: "yes",
        maskFriendly: "yes",
        scentFree: "no",
        alcoholFree: "yes",
        substanceFree: "yes",
        traumaInformed: "yes"
      }
    })
  }
];

async function seed() {
  console.log("🌱 Seeding fresh test events...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }
  
  for (const event of testEvents) {
    await db.insert(events).values(event);
    console.log(`✅ Created: ${event.name}`);
  }
  
  console.log(`\n🎉 Successfully seeded ${testEvents.length} events!`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
