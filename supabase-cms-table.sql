-- CMS Content Management Table
CREATE TABLE IF NOT EXISTS cms_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section VARCHAR(100) NOT NULL,
    field VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(section, field)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_cms_content_section ON cms_content(section);
CREATE INDEX IF NOT EXISTS idx_cms_content_section_field ON cms_content(section, field);

-- Enable Row Level Security (RLS)
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access (you can modify this based on your auth setup)
CREATE POLICY "Allow admin access to cms_content" ON cms_content
    FOR ALL USING (true); -- For now, allow all access. You can restrict this later

-- Insert default content
INSERT INTO cms_content (section, field, value) VALUES
-- Hero Section
('hero', 'title1', 'Feeling upset?'),
('hero', 'title2', 'We''re here to listen.'),
('hero', 'subtitle1', 'Talk anonymously with trained listeners who understand.'),
('hero', 'subtitle2', 'Not therapy — just you, truly heard.'),
('hero', 'ctaText', 'Book Session'),
('hero', 'secondaryCtaText', 'See How It Works'),
('hero', 'secondaryCtaHref', '#how'),

-- Testimonials Section
('testimonials', 'title', 'Real stories, real validation'),
('testimonials', 'subtitle', 'See how a simple conversation changed everything'),

-- Examples Section
('examples', 'title', 'Reach out to us, when u feel'),
('examples', 'central_card_text', 'You Need Validation'),

-- Features Section
('features', 'title', 'How it works'),

-- Comparison Section
('comparison', 'title', 'We''re not therapy — we''re something different'),
('comparison', 'subtitle', 'Sometimes you don''t need to be fixed or analyzed. You just need someone to say: Your feelings make complete sense.'),

-- Science Section
('science', 'title', 'Why validation works'),

-- Pricing Section
('pricing', 'title', 'Choose your plan'),

-- FAQ Section
('faq', 'title', 'Frequently Asked Questions')
ON CONFLICT (section, field) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();
