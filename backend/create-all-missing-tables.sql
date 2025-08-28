-- Create all missing tables that the backend expects
-- This script creates tables that might be missing and causing 500 errors

-- 1. Create recurring_schedules table (causes /api/schedules 500 error)
CREATE TABLE IF NOT EXISTS recurring_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listener_id UUID REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create reviews table (if missing)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create CMS tables (if missing)
CREATE TABLE IF NOT EXISTS cms_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_name VARCHAR(100) UNIQUE NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255),
    company VARCHAR(255),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_faq (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_pricing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_period VARCHAR(20) DEFAULT 'monthly',
    description TEXT,
    features JSONB,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cms_reachout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    description TEXT,
    contact_info JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_listener_id ON recurring_schedules(listener_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_day_of_week ON recurring_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_is_active ON recurring_schedules(is_active);

CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);

CREATE INDEX IF NOT EXISTS idx_cms_testimonials_is_active ON cms_testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_testimonials_sort_order ON cms_testimonials(sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_features_is_active ON cms_features(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_features_sort_order ON cms_features(sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_faq_is_active ON cms_faq(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_faq_sort_order ON cms_faq(sort_order);

CREATE INDEX IF NOT EXISTS idx_cms_pricing_plans_is_active ON cms_pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_pricing_plans_sort_order ON cms_pricing_plans(sort_order);

-- 5. Enable RLS on all tables
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE cms_reachout ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies for all tables (admin access)
-- Recurring schedules policies
DROP POLICY IF EXISTS "Admin can see all recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can insert recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can update recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can delete recurring schedules" ON recurring_schedules;

CREATE POLICY "Admin can see all recurring schedules" ON recurring_schedules FOR SELECT USING (true);
CREATE POLICY "Admin can insert recurring schedules" ON recurring_schedules FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update recurring schedules" ON recurring_schedules FOR UPDATE USING (true);
CREATE POLICY "Admin can delete recurring schedules" ON recurring_schedules FOR DELETE USING (true);

-- Reviews policies
DROP POLICY IF EXISTS "Admin can see all reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can update reviews" ON reviews;
DROP POLICY IF EXISTS "Admin can delete reviews" ON reviews;

CREATE POLICY "Admin can see all reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Admin can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can update reviews" ON reviews FOR UPDATE USING (true);
CREATE POLICY "Admin can delete reviews" ON reviews FOR DELETE USING (true);

-- CMS policies (public read, admin write)
DROP POLICY IF EXISTS "Public can read cms content" ON cms_content;
DROP POLICY IF EXISTS "Admin can manage cms content" ON cms_content;

CREATE POLICY "Public can read cms content" ON cms_content FOR SELECT USING (true);
CREATE POLICY "Admin can manage cms content" ON cms_content FOR ALL USING (true);

-- Similar policies for other CMS tables
-- Testimonials
DROP POLICY IF EXISTS "Public can read testimonials" ON cms_testimonials;
DROP POLICY IF EXISTS "Admin can manage testimonials" ON cms_testimonials;
CREATE POLICY "Public can read testimonials" ON cms_testimonials FOR SELECT USING (true);
CREATE POLICY "Admin can manage testimonials" ON cms_testimonials FOR ALL USING (true);

-- Features
DROP POLICY IF EXISTS "Public can read features" ON cms_features;
DROP POLICY IF EXISTS "Admin can manage features" ON cms_features;
CREATE POLICY "Public can read features" ON cms_features FOR SELECT USING (true);
CREATE POLICY "Admin can manage features" ON cms_features FOR ALL USING (true);

-- FAQ
DROP POLICY IF EXISTS "Public can read faq" ON cms_faq;
DROP POLICY IF EXISTS "Admin can manage faq" ON cms_faq;
CREATE POLICY "Public can read faq" ON cms_faq FOR SELECT USING (true);
CREATE POLICY "Admin can manage faq" ON cms_faq FOR ALL USING (true);

-- Pricing plans
DROP POLICY IF EXISTS "Public can read pricing plans" ON cms_pricing_plans;
DROP POLICY IF EXISTS "Admin can manage pricing plans" ON cms_pricing_plans;
CREATE POLICY "Public can read pricing plans" ON cms_pricing_plans FOR SELECT USING (true);
CREATE POLICY "Admin can manage pricing plans" ON cms_pricing_plans FOR ALL USING (true);

-- Reachout
DROP POLICY IF EXISTS "Public can read reachout" ON cms_reachout;
DROP POLICY IF EXISTS "Admin can manage reachout" ON cms_reachout;
CREATE POLICY "Public can read reachout" ON cms_reachout FOR SELECT USING (true);
CREATE POLICY "Admin can manage reachout" ON cms_reachout FOR ALL USING (true);

-- 7. Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Create triggers for updated_at on all tables
DROP TRIGGER IF EXISTS update_recurring_schedules_updated_at ON recurring_schedules;
CREATE TRIGGER update_recurring_schedules_updated_at
    BEFORE UPDATE ON recurring_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_content_updated_at ON cms_content;
CREATE TRIGGER update_cms_content_updated_at
    BEFORE UPDATE ON cms_content
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_testimonials_updated_at ON cms_testimonials;
CREATE TRIGGER update_cms_testimonials_updated_at
    BEFORE UPDATE ON cms_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_features_updated_at ON cms_features;
CREATE TRIGGER update_cms_features_updated_at
    BEFORE UPDATE ON cms_features
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_faq_updated_at ON cms_faq;
CREATE TRIGGER update_cms_faq_updated_at
    BEFORE UPDATE ON cms_faq
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_pricing_plans_updated_at ON cms_pricing_plans;
CREATE TRIGGER update_cms_pricing_plans_updated_at
    BEFORE UPDATE ON cms_pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cms_reachout_updated_at ON cms_reachout;
CREATE TRIGGER update_cms_reachout_updated_at
    BEFORE UPDATE ON cms_reachout
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Verify all tables were created
SELECT 'All tables created successfully' as status;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'recurring_schedules',
    'reviews',
    'cms_content',
    'cms_testimonials',
    'cms_features',
    'cms_faq',
    'cms_pricing_plans',
    'cms_reachout'
)
ORDER BY table_name;
