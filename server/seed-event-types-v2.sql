-- Seed event types with audience-based categories
-- Categories: family-kids, arts-culture, community-social, recreation-sports, markets-festivals, seasonal

-- Clear existing data (optional - comment out if you want to preserve existing types)
-- DELETE FROM eventTypes;

-- Family & Kids
INSERT INTO eventTypes (name, category) VALUES
('Seeing Santa', 'family-kids'),
('Storytime / Library Events', 'family-kids'),
('Skating', 'family-kids'),
('Swimming', 'family-kids'),
('Petting Zoos / Farms', 'family-kids'),
('Kids Crafts', 'family-kids'),
('Puppet Shows', 'family-kids'),
('Face Painting', 'family-kids')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Arts & Culture
INSERT INTO eventTypes (name, category) VALUES
('Live Music', 'arts-culture'),
('Theatre & Performances', 'arts-culture'),
('Opera', 'arts-culture'),
('Concert', 'arts-culture'),
('Art Exhibition', 'arts-culture'),
('Indigenous Events', 'arts-culture'),
('Multicultural Festivals', 'arts-culture')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Community & Social
INSERT INTO eventTypes (name, category) VALUES
('Community Meetings', 'community-social'),
('Fundraisers & Charity Events', 'community-social'),
('Language Meetups', 'community-social'),
('Religious / Faith-Based Events', 'community-social'),
('Pride Events', 'community-social'),
('Workshops & Classes', 'community-social')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Recreation & Sports
INSERT INTO eventTypes (name, category) VALUES
('Sports & Recreation', 'recreation-sports'),
('Outdoor Adventure', 'recreation-sports')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Markets & Festivals
INSERT INTO eventTypes (name, category) VALUES
('Festivals & Fairs', 'markets-festivals'),
('Craft Shows & Markets', 'markets-festivals'),
('Food & Drink', 'markets-festivals')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Seasonal
INSERT INTO eventTypes (name, category) VALUES
('Christmas Events', 'seasonal'),
('Halloween Events', 'seasonal'),
('Canada Day Events', 'seasonal'),
('Easter Events', 'seasonal'),
('Summer Activities', 'seasonal'),
('Winter Activities', 'seasonal')
ON DUPLICATE KEY UPDATE category = VALUES(category);
