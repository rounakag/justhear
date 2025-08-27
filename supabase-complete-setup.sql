-- Complete Supabase setup for JustHear CMS
-- This script handles all tables and content setup with proper error handling

-- ========================================
-- 1. CREATE REACHOUT TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS cms_reachout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    emoji VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cms_reachout_active ON cms_reachout(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_reachout_sort ON cms_reachout(sort_order);

-- ========================================
-- 2. CREATE FAQ TABLE (if not exists)
-- ========================================
CREATE TABLE IF NOT EXISTS cms_faq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for FAQ
CREATE INDEX IF NOT EXISTS idx_cms_faq_active ON cms_faq(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_faq_sort ON cms_faq(sort_order);

-- ========================================
-- 3. CREATE TRIGGER FUNCTION
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ========================================
-- 4. CREATE TRIGGERS
-- ========================================
-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_cms_reachout_updated_at ON cms_reachout;
DROP TRIGGER IF EXISTS update_cms_faq_updated_at ON cms_faq;

-- Create new triggers
CREATE TRIGGER update_cms_reachout_updated_at 
    BEFORE UPDATE ON cms_reachout 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_faq_updated_at 
    BEFORE UPDATE ON cms_faq 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. POPULATE REACHOUT CONTENT
-- ========================================
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

-- ========================================
-- 6. POPULATE FAQ CONTENT
-- ========================================
-- Clear existing FAQ content
DELETE FROM cms_faq;

-- Insert FAQ items
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

-- ========================================
-- 7. UPDATE CMS CONTENT
-- ========================================
-- Update section titles
UPDATE cms_content 
SET value = 'When You Need Someone to Listen'
WHERE section = 'examples' AND field = 'title';

UPDATE cms_content 
SET value = 'Frequently Asked Questions'
WHERE section = 'faq' AND field = 'title';

-- ========================================
-- 8. ENABLE RLS (Row Level Security)
-- ========================================
ALTER TABLE cms_reachout ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all access for now)
DROP POLICY IF EXISTS "Allow admin access to reachout" ON cms_reachout;
DROP POLICY IF EXISTS "Allow admin access to faq" ON cms_faq;

CREATE POLICY "Allow admin access to reachout" ON cms_reachout FOR ALL USING (true);
CREATE POLICY "Allow admin access to faq" ON cms_faq FOR ALL USING (true);

-- Success message
SELECT 'JustHear CMS setup completed successfully!' as status;
