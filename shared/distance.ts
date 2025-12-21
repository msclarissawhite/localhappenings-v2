/**
 * Distance calculation utilities for geolocation features
 * Uses the Haversine formula to calculate great-circle distances between two points on Earth
 */

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula
 * @param lat1 - Latitude of first point in degrees
 * @param lon1 - Longitude of first point in degrees
 * @param lat2 - Latitude of second point in degrees
 * @param lon2 - Longitude of second point in degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  
  // Convert degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const radLat1 = toRadians(lat1);
  const radLat2 = toRadians(lat2);
  
  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in kilometers
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Format distance for display
 * @param distanceKm - Distance in kilometers
 * @returns Formatted string (e.g., "2.5 km", "850 m")
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Sort events by distance from a given location
 * @param events - Array of events with latitude and longitude
 * @param userLat - User's latitude
 * @param userLon - User's longitude
 * @returns Array of events with distance property, sorted by distance
 */
export function sortEventsByDistance<T extends { latitude: string | null; longitude: string | null }>(
  events: T[],
  userLat: number,
  userLon: number
): (T & { distance: number })[] {
  return events
    .filter(event => event.latitude && event.longitude)
    .map(event => ({
      ...event,
      distance: calculateDistance(
        userLat,
        userLon,
        parseFloat(event.latitude!),
        parseFloat(event.longitude!)
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}
