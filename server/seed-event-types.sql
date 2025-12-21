-- Seed event types based on design brief
-- Categories: core, family, cultural, seasonal

-- A. Core Event Types
INSERT INTO eventTypes (name, category) VALUES
('Festivals & Fairs', 'core'),
('Craft Shows & Markets', 'core'),
('Fundraisers & Charity Events', 'core'),
('Live Music', 'core'),
('Theatre & Performances', 'core'),
('Workshops & Classes', 'core'),
('Community Meetings', 'core'),
('Sports & Recreation', 'core')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- B. Family-Focused Event Types
INSERT INTO eventTypes (name, category) VALUES
('Seeing Santa', 'family'),
('Storytime / Library Events', 'family'),
('Skating', 'family'),
('Swimming', 'family'),
('Petting Zoos / Farms', 'family'),
('Kids Crafts', 'family'),
('Puppet Shows', 'family'),
('Face Painting', 'family')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- C. Cultural & Community Events
INSERT INTO eventTypes (name, category) VALUES
('Indigenous Events', 'cultural'),
('Multicultural Festivals', 'cultural'),
('Language Meetups', 'cultural'),
('Religious / Faith-Based Events', 'cultural'),
('Pride Events', 'cultural')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- D. Seasonal Events
INSERT INTO eventTypes (name, category) VALUES
('Christmas Events', 'seasonal'),
('Halloween Events', 'seasonal'),
('Canada Day Events', 'seasonal'),
('Easter Events', 'seasonal'),
('Summer Activities', 'seasonal'),
('Winter Activities', 'seasonal')
ON DUPLICATE KEY UPDATE category = VALUES(category);

-- Legacy event types (keep existing ones, categorize as core)
INSERT INTO eventTypes (name, category) VALUES
('Opera', 'core'),
('Concert', 'core'),
('Art Exhibition', 'core'),
('Food & Drink', 'core'),
('Outdoor Adventure', 'core')
ON DUPLICATE KEY UPDATE category = VALUES(category);
