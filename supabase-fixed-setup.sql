-- Fixed Supabase setup for JustHear CMS
-- This script fixes all the issues with reachout and FAQ

-- ========================================
-- 1. DROP EXISTING TABLES (if they exist)
-- ========================================
DROP TABLE IF EXISTS cms_reachout CASCADE;
DROP TABLE IF EXISTS cms_faq CASCADE;

-- ========================================
-- 2. CREATE REACHOUT TABLE
-- ========================================
CREATE TABLE cms_reachout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    emoji VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_cms_reachout_active ON cms_reachout(is_active);
CREATE INDEX idx_cms_reachout_sort ON cms_reachout(sort_order);

-- ========================================
-- 3. CREATE FAQ TABLE (without category field)
-- ========================================
CREATE TABLE cms_faq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for FAQ
CREATE INDEX idx_cms_faq_active ON cms_faq(is_active);
CREATE INDEX idx_cms_faq_sort ON cms_faq(sort_order);

-- ========================================
-- 4. CREATE TRIGGER FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 5. CREATE TRIGGERS
-- ========================================
CREATE TRIGGER update_cms_reachout_updated_at 
    BEFORE UPDATE ON cms_reachout 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_faq_updated_at 
    BEFORE UPDATE ON cms_faq 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 6. POPULATE REACHOUT CONTENT
-- ========================================
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

-- ========================================
-- 7. POPULATE FAQ CONTENT (without category)
-- ========================================
INSERT INTO cms_faq (
    question,
    answer,
    sort_order,
    is_active
) VALUES 
    ('Is this therapy?', 'No. This is an anonymous listening & validation service. We provide emotional support and validation, not clinical treatment. Our listeners are here to make you feel heard and understood, not to diagnose or treat mental health conditions.', 1, true),
    ('How is it anonymous?', 'We never ask for real names or personal details. All calls are encrypted and confidential. You''re just a voice to us, and we''re just a listening ear to you. No registration, no forms, no tracking.', 2, true),
    ('What if I''m in crisis?', 'If you''re having thoughts of self-harm or are in immediate danger, please contact emergency services or a crisis helpline immediately. We''re here for emotional support and validation, not crisis intervention.', 3, true),
    ('Who are your listeners?', 'Our listeners are trained volunteers who understand the power of validation. They''re not therapists, but they are compassionate humans skilled in active listening and providing the emotional support you need.', 4, true),
    ('How much does it cost?', 'It''s ₹299 per 60-minute session (reduced from ₹499). No hidden fees, no contracts.', 5, true),
    ('How does scheduling work?', 'Simply click "Book Session" to see available time slots. Choose your preferred date and time, and we''ll call you at the scheduled moment. Sessions are available based on slot availability.', 6, true);

-- ========================================
-- 8. UPDATE CMS CONTENT
-- ========================================
-- Update section titles
UPDATE cms_content 
SET value = 'When You Need Someone to Listen'
WHERE section = 'examples' AND field = 'title';

UPDATE cms_content 
SET value = 'Frequently Asked Questions'
WHERE section = 'faq' AND field = 'title';

-- ========================================
-- 9. ENABLE RLS (Row Level Security)
-- ========================================
ALTER TABLE cms_reachout ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all access for now)
CREATE POLICY "Allow admin access to reachout" ON cms_reachout FOR ALL USING (true);
CREATE POLICY "Allow admin access to faq" ON cms_faq FOR ALL USING (true);

-- Success message
SELECT 'JustHear CMS setup completed successfully! All issues fixed!' as status;
