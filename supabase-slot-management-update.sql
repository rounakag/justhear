-- Update time_slots table structure for new slot management system
-- Remove listener and price fields, add status field, ensure meeting link fields

-- First, let's check if the table exists and see its current structure
-- Then we'll make the necessary changes

-- 1. Add status column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'status') THEN
        ALTER TABLE time_slots ADD COLUMN status VARCHAR(20) DEFAULT 'created';
    END IF;
END $$;

-- 2. Add meeting link columns if they don't exist
DO $$ 
BEGIN
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
END $$;

-- 3. Update existing slots to have proper status
UPDATE time_slots 
SET status = CASE 
    WHEN EXISTS (SELECT 1 FROM bookings WHERE bookings.slot_id = time_slots.id) THEN 'booked'
    ELSE 'created'
END
WHERE status IS NULL;

-- 4. Remove listener_id column (if it exists and we want to remove it)
-- Note: This will fail if there are foreign key constraints
-- We'll need to handle this carefully

-- First, check if there are any foreign key constraints on listener_id
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'time_slots'::regclass 
    AND contype = 'f' 
    AND array_position(conkey, (SELECT attnum FROM pg_attribute WHERE attrelid = 'time_slots'::regclass AND attname = 'listener_id')) IS NOT NULL;
    
    IF constraint_name IS NOT NULL THEN
        -- Drop the foreign key constraint
        EXECUTE 'ALTER TABLE time_slots DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- Now remove the listener_id column
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'time_slots' AND column_name = 'listener_id') THEN
        ALTER TABLE time_slots DROP COLUMN listener_id;
    END IF;
END $$;

-- 5. Remove price column (if it exists and we want to remove it)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'time_slots' AND column_name = 'price') THEN
        ALTER TABLE time_slots DROP COLUMN price;
    END IF;
END $$;

-- 6. Add constraints for status field
ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_status_check 
CHECK (status IN ('created', 'booked', 'completed'));

-- 7. Create index on status for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots(status);

-- 8. Create index on date and status for filtering
CREATE INDEX IF NOT EXISTS idx_time_slots_date_status ON time_slots(date, status);

-- 9. Update RLS policies if needed
-- Drop existing policies that might reference removed columns
DROP POLICY IF EXISTS "Enable read access for all users" ON time_slots;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON time_slots;

-- Create new policies
CREATE POLICY "Enable read access for all users" ON time_slots
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON time_slots
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON time_slots
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON time_slots
    FOR DELETE USING (auth.role() = 'authenticated');

-- 10. Add trigger to auto-update status when booking is created
CREATE OR REPLACE FUNCTION update_slot_status_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    -- Update slot status to 'booked' when a booking is created
    UPDATE time_slots 
    SET status = 'booked' 
    WHERE id = NEW.slot_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_slot_status_on_booking ON bookings;

-- Create the trigger
CREATE TRIGGER trigger_update_slot_status_on_booking
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_slot_status_on_booking();

-- 11. Add trigger to auto-update status when booking is deleted
CREATE OR REPLACE FUNCTION update_slot_status_on_booking_delete()
RETURNS TRIGGER AS $$
BEGIN
    -- Update slot status back to 'created' when a booking is deleted
    UPDATE time_slots 
    SET status = 'created' 
    WHERE id = OLD.slot_id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_slot_status_on_booking_delete ON bookings;

-- Create the trigger
CREATE TRIGGER trigger_update_slot_status_on_booking_delete
    AFTER DELETE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_slot_status_on_booking_delete();

-- 12. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_slots' 
ORDER BY ordinal_position;

-- 13. Show current data sample
SELECT 
    id,
    date,
    start_time,
    end_time,
    status,
    meeting_link,
    created_at
FROM time_slots 
ORDER BY created_at DESC 
LIMIT 5;
