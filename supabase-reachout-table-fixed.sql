-- Create cms_reachout table for managing reach out content (with error handling)
CREATE TABLE IF NOT EXISTS cms_reachout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    emoji VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes (ignore if they exist)
CREATE INDEX IF NOT EXISTS idx_cms_reachout_active ON cms_reachout(is_active);
CREATE INDEX IF NOT EXISTS idx_cms_reachout_sort ON cms_reachout(sort_order);

-- Create or replace the function (this will work whether it exists or not)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS update_cms_reachout_updated_at ON cms_reachout;
CREATE TRIGGER update_cms_reachout_updated_at 
    BEFORE UPDATE ON cms_reachout 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
