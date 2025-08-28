-- Create missing tables that the backend expects

-- 1. Create recurring_schedules table
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

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_listener_id ON recurring_schedules(listener_id);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_day_of_week ON recurring_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_recurring_schedules_is_active ON recurring_schedules(is_active);

-- 3. Enable RLS on recurring_schedules
ALTER TABLE recurring_schedules ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for recurring_schedules
DROP POLICY IF EXISTS "Enable read access for all users" ON recurring_schedules;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON recurring_schedules;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON recurring_schedules;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can see all recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can insert recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can update recurring schedules" ON recurring_schedules;
DROP POLICY IF EXISTS "Admin can delete recurring schedules" ON recurring_schedules;

-- Admin policies for recurring_schedules
CREATE POLICY "Admin can see all recurring schedules" ON recurring_schedules
    FOR SELECT USING (true);

CREATE POLICY "Admin can insert recurring schedules" ON recurring_schedules
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can update recurring schedules" ON recurring_schedules
    FOR UPDATE USING (true);

CREATE POLICY "Admin can delete recurring schedules" ON recurring_schedules
    FOR DELETE USING (true);

-- 5. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_recurring_schedules_updated_at ON recurring_schedules;
CREATE TRIGGER update_recurring_schedules_updated_at
    BEFORE UPDATE ON recurring_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verify the table was created
SELECT 'recurring_schedules table created successfully' as status;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'recurring_schedules' 
AND table_schema = 'public';

-- 7. Show table structure
SELECT 'recurring_schedules table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'recurring_schedules' 
AND table_schema = 'public'
ORDER BY ordinal_position;
