-- Update all Spitfire Arms Alehouse live music events to 7:30 PM - 10:30 PM
-- This script updates the time portion while preserving the date

UPDATE events 
SET 
  startDate = DATE_ADD(DATE(startDate), INTERVAL 19 HOUR) + INTERVAL 30 MINUTE,
  endDate = DATE_ADD(DATE(endDate), INTERVAL 22 HOUR) + INTERVAL 30 MINUTE,
  updatedAt = NOW()
WHERE venue LIKE '%Spitfire%' OR organizerName LIKE '%Spitfire%';

-- Verify the updates
SELECT id, name, venue, 
  DATE_FORMAT(startDate, '%Y-%m-%d %H:%i') as start_time, 
  DATE_FORMAT(endDate, '%Y-%m-%d %H:%i') as end_time 
FROM events 
WHERE venue LIKE '%Spitfire%' OR organizerName LIKE '%Spitfire%' 
ORDER BY startDate;
