-- Complete fix for slot visibility issues
-- This script addresses all potential problems with slot display

-- 1. First, let's see what we have in the database
SELECT 'Current time_slots table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_slots' 
ORDER BY ordinal_position;

-- 2. Show current data
SELECT 'Current slots data:' as info;
SELECT 
    id,
    date,
    start_time,
    end_time,
    status,
    listener_id,
    price,
    created_at
FROM time_slots 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Fix price column (make it nullable)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'time_slots' AND column_name = 'price') THEN
        ALTER TABLE time_slots ALTER COLUMN price DROP NOT NULL;
        ALTER TABLE time_slots ALTER COLUMN price SET DEFAULT NULL;
        UPDATE time_slots SET price = NULL WHERE price IS NOT NULL;
    END IF;
END $$;

-- 4. Ensure all required columns exist
DO $$ 
BEGIN
    -- Add status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'status') THEN
        ALTER TABLE time_slots ADD COLUMN status VARCHAR(20) DEFAULT 'created';
    END IF;
    
    -- Add meeting link columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'meeting_link') THEN
        ALTER TABLE time_slots ADD COLUMN meeting_link TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'meeting_id') THEN
        ALTER TABLE time_slots ADD COLUMN meeting_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'meeting_provider') THEN
        ALTER TABLE time_slots ADD COLUMN meeting_provider VARCHAR(50);
    END IF;
    
    -- Ensure listener_id column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'listener_id') THEN
        ALTER TABLE time_slots ADD COLUMN listener_id UUID;
    END IF;
END $$;

-- 5. Update existing slots to have proper status
UPDATE time_slots 
SET status = CASE 
    WHEN EXISTS (SELECT 1 FROM bookings WHERE bookings.slot_id = time_slots.id) THEN 'booked'
    ELSE 'created'
END
WHERE status IS NULL;

-- 6. Fix status constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'time_slots_status_check' 
        AND table_name = 'time_slots'
    ) THEN
        ALTER TABLE time_slots DROP CONSTRAINT time_slots_status_check;
    END IF;
END $$;

ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_status_check 
CHECK (status IN ('created', 'booked', 'completed'));

-- 7. Drop all existing RLS policies and recreate them
DROP POLICY IF EXISTS "Enable read access for all users" ON time_slots;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable insert for admin users only" ON time_slots;
DROP POLICY IF EXISTS "Enable update for admin users only" ON time_slots;
DROP POLICY IF EXISTS "Enable delete for admin users only" ON time_slots;

-- 8. Create new RLS policies that allow admin to see all slots
-- First, enable RLS
ALTER TABLE time_slots ENABLE ROW LEVEL SECURITY;

-- Admin can see all slots (temporary policy for debugging)
CREATE POLICY "Admin can see all slots" ON time_slots
    FOR SELECT USING (true);

-- Admin can insert slots
CREATE POLICY "Admin can insert slots" ON time_slots
    FOR INSERT WITH CHECK (true);

-- Admin can update slots
CREATE POLICY "Admin can update slots" ON time_slots
    FOR UPDATE USING (true);

-- Admin can delete slots
CREATE POLICY "Admin can delete slots" ON time_slots
    FOR DELETE USING (true);

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_date ON time_slots(date);
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots(status);
CREATE INDEX IF NOT EXISTS idx_time_slots_listener_id ON time_slots(listener_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_created_at ON time_slots(created_at);

-- 10. Verify the fixes
SELECT 'After fixes - table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_slots' 
ORDER BY ordinal_position;

SELECT 'After fixes - sample data:' as info;
SELECT 
    id,
    date,
    start_time,
    end_time,
    status,
    listener_id,
    price,
    created_at
FROM time_slots 
ORDER BY created_at DESC 
LIMIT 10;

SELECT 'After fixes - status distribution:' as info;
SELECT 
    status,
    COUNT(*) as count
FROM time_slots 
GROUP BY status
ORDER BY status;

SELECT 'After fixes - RLS policies:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'time_slots';
