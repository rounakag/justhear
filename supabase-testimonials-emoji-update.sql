-- Update testimonials table to use emoji instead of avatar_url

-- First, add the emoji column
ALTER TABLE cms_testimonials ADD COLUMN IF NOT EXISTS emoji VARCHAR(10) DEFAULT '😊';

-- Update existing records to have default emoji if they don't have one
UPDATE cms_testimonials SET emoji = '😊' WHERE emoji IS NULL;

-- Make emoji column NOT NULL
ALTER TABLE cms_testimonials ALTER COLUMN emoji SET NOT NULL;

-- Drop the avatar_url column (optional - you can keep it if you want backward compatibility)
-- ALTER TABLE cms_testimonials DROP COLUMN IF EXISTS avatar_url;

-- Update existing testimonials with appropriate emojis
UPDATE cms_testimonials SET emoji = '😌' WHERE name = 'Sarah M.';
UPDATE cms_testimonials SET emoji = '🥺' WHERE name = 'Alex K.';
UPDATE cms_testimonials SET emoji = '😊' WHERE name = 'Maria L.';

-- Add some new testimonials with emojis
INSERT INTO cms_testimonials (name, text, rating, emoji, sort_order) VALUES
('David R.', 'I was going through a really tough time and this service helped me feel less alone. The listener was incredibly supportive.', 5, '😔', 4),
('Emma T.', 'Sometimes you just need someone to validate your feelings without trying to fix you. This service does exactly that.', 5, '💙', 5),
('James W.', 'The anonymity made it easier to open up. I felt heard and understood without any pressure.', 5, '🙂', 6)
ON CONFLICT DO NOTHING;
