/**
 * Educational tooltips explaining why each accessibility field matters
 * These help organizers understand the importance of providing detailed accessibility information
 */

export const accessibilityTooltips = {
  wheelchairAccessible: {
    title: "Wheelchair Accessibility",
    content: "Helps families with mobility aids know if they can safely attend. Includes ramps, elevators, and accessible entrances."
  },
  
  changeTables: {
    title: "Change Tables",
    content: "Change tables help caregivers manage diaper changes comfortably, making events accessible for families with babies and toddlers."
  },
  
  nursingAreas: {
    title: "Nursing/Feeding Areas",
    content: "Private or semi-private spaces for breastfeeding or bottle-feeding help parents feel comfortable attending with infants."
  },
  
  genderNeutralWashrooms: {
    title: "Gender-Neutral Washrooms",
    content: "Inclusive washroom options ensure all families feel welcome and comfortable, especially those with non-binary children or caregivers."
  },
  
  sensoryFriendly: {
    title: "Sensory-Friendly Environment",
    content: "Low lighting, reduced noise, and quiet spaces help children with autism, ADHD, or sensory processing differences participate comfortably."
  },
  
  interpreterAvailable: {
    title: "Sign Language Interpreter",
    content: "ASL or other sign language interpretation makes events accessible for Deaf and hard-of-hearing families."
  },
  
  closedCaptioning: {
    title: "Closed Captioning",
    content: "Captions on videos or presentations help families with hearing differences follow along and participate fully."
  },
  
  serviceAnimalsWelcome: {
    title: "Service Animals Welcome",
    content: "Confirming service animals are allowed helps families with disabilities plan their attendance confidently."
  },
  
  accessibleParking: {
    title: "Accessible Parking",
    content: "Designated accessible parking spots close to the entrance reduce barriers for families with mobility challenges."
  },
  
  allergyFriendly: {
    title: "Allergy-Friendly",
    content: "Nut-free, dairy-free, or other allergy accommodations help families with food allergies participate safely."
  },
  
  strollerFriendly: {
    title: "Stroller-Friendly",
    content: "Wide pathways, ramps, and storage areas make it easier for families with young children to navigate the venue."
  },
  
  quietRoom: {
    title: "Quiet/Calm Room",
    content: "A designated quiet space gives overwhelmed children a place to decompress, making events more inclusive for neurodivergent families."
  },
  
  visualSchedule: {
    title: "Visual Schedule",
    content: "Picture-based schedules help children with autism, language delays, or anxiety know what to expect during the event."
  },
  
  flexibleSeating: {
    title: "Flexible Seating",
    content: "Options like floor seating, bean bags, or standing room accommodate different sensory and physical needs."
  },
  
  accessibilityNotes: {
    title: "Additional Accessibility Notes",
    content: "Share any other accommodations or accessibility features that help families make informed decisions about attending."
  }
};

export type AccessibilityField = keyof typeof accessibilityTooltips;
