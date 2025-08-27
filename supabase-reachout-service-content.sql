-- Update reachout content with better, more natural scenarios
-- Clear value propositions that directly connect to the listening service

-- Clear existing content
DELETE FROM cms_reachout;

-- Insert new service-focused content
INSERT INTO cms_reachout (
    emoji,
    title,
    sort_order,
    is_active
) VALUES 
    ('😔', 'You need someone to truly listen', 1, true),
    ('😤', 'You want to be heard, not fixed', 2, true),
    ('😢', 'You\'re feeling overwhelmed', 3, true),
    ('😞', 'You need emotional validation', 4, true),
    ('🤗', 'You want anonymous support', 5, true),
    ('🤔', 'You need a safe space to talk', 6, true);

-- Update the section title in cms_content to be more natural
UPDATE cms_content 
SET value = 'When You Need Someone to Listen'
WHERE section = 'examples' AND field = 'title';
