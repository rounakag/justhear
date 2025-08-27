-- Migrate FAQ content to CMS
-- Clear existing FAQ content
DELETE FROM cms_faq;

-- Insert FAQ items from the hardcoded data
INSERT INTO cms_faq (
    question,
    answer,
    category,
    sort_order,
    is_active
) VALUES 
    ('Is this therapy?', 'No. This is an anonymous listening & validation service. We provide emotional support and validation, not clinical treatment. Our listeners are here to make you feel heard and understood, not to diagnose or treat mental health conditions.', 'service', 1, true),
    ('How is it anonymous?', 'We never ask for real names or personal details. All calls are encrypted and confidential. You''re just a voice to us, and we''re just a listening ear to you. No registration, no forms, no tracking.', 'privacy', 2, true),
    ('What if I''m in crisis?', 'If you''re having thoughts of self-harm or are in immediate danger, please contact emergency services or a crisis helpline immediately. We''re here for emotional support and validation, not crisis intervention.', 'safety', 3, true),
    ('Who are your listeners?', 'Our listeners are trained volunteers who understand the power of validation. They''re not therapists, but they are compassionate humans skilled in active listening and providing the emotional support you need.', 'service', 4, true),
    ('How much does it cost?', 'It''s ₹299 per 60-minute session (reduced from ₹499). No hidden fees, no contracts.', 'pricing', 5, true),
    ('How does scheduling work?', 'Simply click "Book Session" to see available time slots. Choose your preferred date and time, and we''ll call you at the scheduled moment. Sessions are available based on slot availability.', 'booking', 6, true);

-- Update the FAQ section title in cms_content
UPDATE cms_content 
SET value = 'Frequently Asked Questions'
WHERE section = 'faq' AND field = 'title';
