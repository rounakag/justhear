-- Create cms_reachout table for managing reach out content
CREATE TABLE IF NOT EXISTS cms_reachout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    emoji VARCHAR(10) NOT NULL,
    title VARCHAR(255) NOT NULL,
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
    emoji,
    title,
    sort_order,
    is_active
) VALUES 
    ('😔', 'I no longer want to prove I''m right.', 1, true),
    ('😤', 'Nobody apologized; they blamed me for reacting.', 2, true),
    ('😢', 'Life took something that stole my smile.', 3, true),
    ('😞', 'Nobody is mine... it''s my fault.', 4, true),
    ('🤗', 'I wish someone could hug me until my soul melts.', 5, true),
    ('🤔', 'Am I really that wrong about everything?', 6, true);

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
