-- Extended CMS Tables for Multi-Entry Sections

-- Testimonials Table
CREATE TABLE IF NOT EXISTS cms_testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Features Table
CREATE TABLE IF NOT EXISTS cms_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- FAQ Table
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

-- Pricing Plans Table
CREATE TABLE IF NOT EXISTS cms_pricing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(20) DEFAULT 'month',
    description TEXT,
    features TEXT[], -- Array of features
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pricing_plans ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all access for now)
CREATE POLICY "Allow admin access to testimonials" ON cms_testimonials FOR ALL USING (true);
CREATE POLICY "Allow admin access to features" ON cms_features FOR ALL USING (true);
CREATE POLICY "Allow admin access to faq" ON cms_faq FOR ALL USING (true);
CREATE POLICY "Allow admin access to pricing plans" ON cms_pricing_plans FOR ALL USING (true);

-- Insert default testimonials
INSERT INTO cms_testimonials (name, text, rating, sort_order) VALUES
('Sarah M.', 'I was feeling overwhelmed and just needed someone to listen. The listener was so understanding and helped me feel validated. It made such a difference.', 5, 1),
('Alex K.', 'This service is exactly what I needed. No judgment, no advice - just someone who truly heard me. I feel so much lighter now.', 5, 2),
('Maria L.', 'I was skeptical at first, but the conversation was incredibly helpful. The listener was patient and really understood what I was going through.', 5, 3)
ON CONFLICT DO NOTHING;

-- Insert default features
INSERT INTO cms_features (title, description, icon, sort_order) VALUES
('Anonymous & Safe', 'Your conversations are completely anonymous and secure. No recordings, no transcripts, just pure listening.', '🔒', 1),
('Trained Listeners', 'Our listeners are trained in active listening and emotional validation. They understand what you need.', '👂', 2),
('Available 24/7', 'Whenever you need someone to talk to, we''re here. Book a session that fits your schedule.', '⏰', 3),
('No Judgment', 'This isn''t therapy - it''s simply having someone truly hear and validate your feelings.', '💙', 4)
ON CONFLICT DO NOTHING;

-- Insert default FAQ
INSERT INTO cms_faq (question, answer, category, sort_order) VALUES
('Is this therapy?', 'No, this is not therapy. We provide emotional validation and active listening, but we don''t diagnose or treat mental health conditions.', 'general', 1),
('Are my conversations recorded?', 'No, we never record conversations. Your privacy and anonymity are our top priorities.', 'privacy', 2),
('How do I book a session?', 'Simply click "Book Session" and choose a time that works for you. You''ll receive a meeting link before your session.', 'booking', 3),
('What if I need to cancel?', 'You can cancel your session up to 1 hour before it starts. Just go to your dashboard and click "Cancel Session".', 'booking', 4),
('Are the listeners qualified?', 'Yes, all our listeners are trained in active listening and emotional validation techniques.', 'quality', 5)
ON CONFLICT DO NOTHING;

-- Insert default pricing plans
INSERT INTO cms_pricing_plans (name, price, description, features, sort_order) VALUES
('Single Session', 49.00, 'Perfect for when you need someone to talk to right now', ARRAY['1-hour session', 'Anonymous conversation', 'Trained listener', 'Meeting link provided'], 1),
('Monthly Plan', 149.00, 'Unlimited sessions for consistent support', ARRAY['Unlimited sessions', 'Priority booking', 'Same listener option', '24/7 availability'], 2),
('Weekly Check-in', 99.00, 'Regular support with scheduled sessions', ARRAY['4 sessions per month', 'Weekly scheduling', 'Progress tracking', 'Flexible timing'], 3)
ON CONFLICT DO NOTHING;
