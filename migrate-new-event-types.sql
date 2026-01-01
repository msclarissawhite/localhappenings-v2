-- Migration: Add 90 new event types and mark 7 legacy types as deprecated
-- Date: January 1, 2026
-- Version: 2.0

-- ============================================================================
-- PART 1: Mark legacy/deprecated event types
-- ============================================================================

-- Add isDeprecated column if it doesn't exist
ALTER TABLE eventTypes ADD COLUMN IF NOT EXISTS isDeprecated TINYINT(1) DEFAULT 0;

-- Mark 7 overly-generic types as deprecated (keep in DB but hide from primary UI)
UPDATE eventTypes SET isDeprecated = 1 WHERE id IN (
  30022, -- Sports & Recreation
  30023, -- Outdoor Adventure
  90006, -- Fitness
  90008, -- Wellness Workshops
  30025, -- Craft Shows & Markets
  30024, -- Festivals & Fairs
  90024  -- Food & Drink
);

-- ============================================================================
-- PART 2: Insert new event types
-- ============================================================================

-- Family & Kids (14 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200001, 'Toddler & Preschool Activities', 'family-kids'),
(200002, 'STEM for Kids', 'family-kids'),
(200003, 'Kids Workshops', 'family-kids'),
(200004, 'Kids Camps', 'family-kids'),
(200005, 'Homeschool Events', 'family-kids'),
(200006, 'Kids Shows & Performances', 'family-kids'),
(200007, 'Character Meet & Greets', 'family-kids'),
(200008, 'Magicians & Clowns', 'family-kids'),
(200009, 'Kids Movie Screenings', 'family-kids'),
(200010, 'Playgroups', 'family-kids'),
(200011, 'Birthday Parties', 'family-kids'),
(200012, 'Indoor Playgrounds', 'family-kids'),
(200013, 'Bounce Houses', 'family-kids'),
(200014, 'Family Game Nights', 'family-kids');

-- Arts & Culture (9 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200015, 'Art Workshops', 'arts-culture'),
(200016, 'Pottery & Ceramics', 'arts-culture'),
(200017, 'Photography Exhibits & Walks', 'arts-culture'),
(200018, 'Maker Fairs', 'arts-culture'),
(200019, 'Comedy Shows', 'arts-culture'),
(200020, 'Dance Performances', 'arts-culture'),
(200021, 'Spoken Word & Poetry', 'arts-culture'),
(200022, 'Film Screenings', 'arts-culture'),
(200023, 'Documentary Screenings', 'arts-culture');

-- Community & Social (7 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200024, 'Happy Hours', 'community-social'),
(200025, 'Singles Mixers', 'community-social'),
(200026, 'Social Walks', 'community-social'),
(200027, 'Lecture Series', 'community-social'),
(200028, 'Skill Shares', 'community-social'),
(200029, 'Study Groups', 'community-social'),
(200030, 'Newcomer & Immigrant Meetups', 'community-social');

-- Recreation & Sports (20 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200031, 'Team Sports (Soccer/Hockey/Baseball)', 'recreation-sports'),
(200032, 'Individual Sports (Tennis/Golf/Track)', 'recreation-sports'),
(200033, 'Tournaments & Leagues', 'recreation-sports'),
(200034, 'Youth Sports', 'recreation-sports'),
(200035, 'Adult Recreational Leagues', 'recreation-sports'),
(200036, 'Walking Clubs', 'recreation-sports'),
(200037, 'Running Clubs & Fun Runs', 'recreation-sports'),
(200038, 'Cycling Rides & Tours', 'recreation-sports'),
(200039, 'Skating Meetups', 'recreation-sports'),
(200040, 'Swimming Clubs', 'recreation-sports'),
(200041, 'Pickleball', 'recreation-sports'),
(200042, 'Disc Golf', 'recreation-sports'),
(200043, 'Skateboarding & BMX', 'recreation-sports'),
(200044, 'Hiking & Trail Meetups', 'recreation-sports'),
(200045, 'Camping & Backcountry Trips', 'recreation-sports'),
(200046, 'Kayaking/Canoeing/Paddleboarding', 'recreation-sports'),
(200047, 'Climbing & Bouldering', 'recreation-sports'),
(200048, 'Snow Sports (Ski/Snowboard/Snowshoe)', 'recreation-sports'),
(200049, 'Mountain Biking', 'recreation-sports'),
(200050, 'Trail Running', 'recreation-sports');

-- Health & Wellness (16 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200051, 'Pilates & Barre', 'health-wellness'),
(200052, 'Dance Fitness (Zumba/etc)', 'health-wellness'),
(200053, 'Walking for Wellness', 'health-wellness'),
(200054, 'Stretching & Mobility', 'health-wellness'),
(200055, 'Seniors Fitness', 'health-wellness'),
(200056, 'Mindfulness Sessions', 'health-wellness'),
(200057, 'Breathwork', 'health-wellness'),
(200058, 'Stress & Burnout Support', 'health-wellness'),
(200059, 'Support Groups', 'health-wellness'),
(200060, 'Grief & Healing Circles', 'health-wellness'),
(200061, 'Sound Baths', 'health-wellness'),
(200062, 'Reiki & Energy Healing', 'health-wellness'),
(200063, 'Herbalism & Natural Health', 'health-wellness'),
(200064, 'Holistic Wellness Fairs', 'health-wellness'),
(200065, 'Acupuncture & Traditional Medicine', 'health-wellness'),
(200066, 'Nutrition Workshops', 'health-wellness');

-- Markets & Festivals (21 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200067, 'Farmers\' Markets', 'markets-festivals'),
(200068, 'Artisan Markets', 'markets-festivals'),
(200069, 'Night Markets', 'markets-festivals'),
(200070, 'Holiday Markets', 'markets-festivals'),
(200071, 'Vintage & Thrift Markets', 'markets-festivals'),
(200072, 'Pop-Up Markets', 'markets-festivals'),
(200073, 'Makers Markets', 'markets-festivals'),
(200074, 'Food Festivals', 'markets-festivals'),
(200075, 'Beer/Wine/Cider Festivals', 'markets-festivals'),
(200076, 'Music Festivals', 'markets-festivals'),
(200077, 'Cultural Festivals', 'markets-festivals'),
(200078, 'Street Festivals & Block Parties', 'markets-festivals'),
(200079, 'Seasonal Festivals', 'markets-festivals'),
(200080, 'Literary Festivals', 'markets-festivals'),
(200081, 'Kids & Family Festivals', 'markets-festivals'),
(200082, 'Art Festivals', 'markets-festivals'),
(200083, 'Heritage Festivals', 'markets-festivals'),
(200084, 'Community Festivals', 'markets-festivals'),
(200085, 'Food Truck Rallies', 'markets-festivals'),
(200086, 'Tasting Events', 'markets-festivals'),
(200087, 'Vendor Fairs', 'markets-festivals');

-- Seasonal (3 new types)
INSERT INTO eventTypes (id, name, category) VALUES
(200088, 'Holiday Light Displays', 'seasonal'),
(200089, 'Holiday Shows & Performances', 'seasonal'),
(200090, 'Remembrance Day Events', 'seasonal');

-- ============================================================================
-- PART 3: Verification
-- ============================================================================

-- Count event types by category (including deprecated)
SELECT 
  category,
  COUNT(*) as total,
  SUM(CASE WHEN isDeprecated = 1 THEN 1 ELSE 0 END) as deprecated,
  COUNT(*) - SUM(CASE WHEN isDeprecated = 1 THEN 1 ELSE 0 END) as active
FROM eventTypes
GROUP BY category
ORDER BY category;

-- Show deprecated types
SELECT id, name, category 
FROM eventTypes 
WHERE isDeprecated = 1
ORDER BY category, name;

-- Show newly added types
SELECT id, name, category 
FROM eventTypes 
WHERE id >= 200001
ORDER BY category, id;
