-- Fix existing meeting links to use demo URLs instead of fake Google Meet links

-- Update existing slots with demo meeting links
UPDATE time_slots 
SET 
  meeting_link = CONCAT('https://demo.justhear.com/meeting/demo-', id),
  meeting_provider = 'justhear_demo'
WHERE 
  meeting_link LIKE 'https://meet.google.com/%' 
  OR meeting_link IS NULL 
  OR meeting_provider = 'google_meet';

-- Verify the changes
SELECT 
  id,
  date,
  start_time,
  end_time,
  meeting_link,
  meeting_provider,
  status
FROM time_slots 
WHERE meeting_link IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

-- Show count of updated slots
SELECT 
  COUNT(*) as updated_slots,
  meeting_provider
FROM time_slots 
WHERE meeting_link IS NOT NULL
GROUP BY meeting_provider;
