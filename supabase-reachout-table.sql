-- Create cms_reachout table for managing reach out content
CREATE TABLE IF NOT EXISTS cms_reachout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle VARCHAR(255),
    description TEXT,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    response_time VARCHAR(100),
    availability TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_cms_reachout_active ON cms_reachout(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_reachout_sort ON cms_reachout(sort_order);

-- Insert default reach out content
INSERT INTO cms_reachout (
    title,
    subtitle,
    description,
    contact_email,
    contact_phone,
    response_time,
    availability,
    sort_order,
    is_active
) VALUES (
    'Reach Out to Us',
    'When you feel like talking',
    'We''re here to listen. Whether you need someone to talk to, have questions about our service, or want to share your experience, we''d love to hear from you. Our team is committed to providing compassionate support and timely responses.',
    'support@justhear.me',
    '+1 (555) 123-4567',
    'Within 24 hours',
    'Monday - Friday: 9 AM - 6 PM EST\nWeekends: 10 AM - 4 PM EST\nEmergency support available 24/7',
    1,
    true
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_reachout_updated_at 
    BEFORE UPDATE ON cms_reachout 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
