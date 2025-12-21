/**
 * Geocode existing events to populate latitude/longitude coordinates
 * Uses Google Maps Geocoding API through the Manus proxy
 */

import { getDb } from "../server/db.ts";
import { events } from "../drizzle/schema.ts";
import { isNull, or, eq } from "drizzle-orm";
import { makeRequest } from "../server/_core/map.ts";

async function geocodeAddress(address) {
  try {
    const response = await makeRequest(
      "/maps/api/geocode/json",
      { address }
    );

    if (response.results && response.results.length > 0) {
      const location = response.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error geocoding address "${address}":`, error.message);
    return null;
  }
}

async function geocodeEvents() {
  const database = await getDb();
  if (!database) {
    console.error("Database not available");
    return;
  }

  // Find events without coordinates
  const eventsToGeocode = await database
    .select()
    .from(events)
    .where(or(isNull(events.latitude), isNull(events.longitude)))
    .limit(100); // Process 100 at a time to avoid rate limits

  console.log(`Found ${eventsToGeocode.length} events to geocode`);

  let successCount = 0;
  let failCount = 0;

  for (const event of eventsToGeocode) {
    // Build full address string
    const addressParts = [
      event.venue,
      event.address,
      event.municipality,
      event.province,
      "Canada"
    ].filter(Boolean);
    
    const fullAddress = addressParts.join(", ");
    
    console.log(`\nGeocoding event #${event.id}: ${event.name}`);
    console.log(`Address: ${fullAddress}`);

    const coords = await geocodeAddress(fullAddress);

    if (coords) {
      await database
        .update(events)
        .set({
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
        })
        .where(eq(events.id, event.id));

      console.log(`✓ Success: ${coords.latitude}, ${coords.longitude}`);
      successCount++;
    } else {
      console.log(`✗ Failed to geocode`);
      failCount++;
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n=== Geocoding Complete ===`);
  console.log(`Success: ${successCount}`);
  console.log(`Failed: ${failCount}`);
  console.log(`Total: ${eventsToGeocode.length}`);
}

// Run the script
geocodeEvents()
  .then(() => {
    console.log("\nScript finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
