-- Update time_slots table structure for scalable slot management system
-- Keep listener_id as mandatory field, add status field, ensure meeting link fields
-- Add constraints to prevent slot overlaps for individual listeners
-- FIXED VERSION - Handles existing constraints

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

-- 3. Ensure listener_id column exists and is NOT NULL
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_slots' AND column_name = 'listener_id') THEN
        ALTER TABLE time_slots ADD COLUMN listener_id UUID NOT NULL;
    ELSE
        -- Make existing listener_id NOT NULL if it's nullable
        ALTER TABLE time_slots ALTER COLUMN listener_id SET NOT NULL;
    END IF;
END $$;

-- 4. Update existing slots to have proper status
UPDATE time_slots 
SET status = CASE 
    WHEN EXISTS (SELECT 1 FROM bookings WHERE bookings.slot_id = time_slots.id) THEN 'booked'
    ELSE 'created'
END
WHERE status IS NULL;

-- 5. Add constraints for status field (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'time_slots_status_check' 
        AND table_name = 'time_slots'
    ) THEN
        ALTER TABLE time_slots 
        ADD CONSTRAINT time_slots_status_check 
        CHECK (status IN ('created', 'booked', 'completed'));
    END IF;
END $$;

-- 6. Create index on status for better performance
CREATE INDEX IF NOT EXISTS idx_time_slots_status ON time_slots(status);

-- 7. Create index on date and status for filtering
CREATE INDEX IF NOT EXISTS idx_time_slots_date_status ON time_slots(date, status);

-- 8. Create index on listener_id for filtering
CREATE INDEX IF NOT EXISTS idx_time_slots_listener_id ON time_slots(listener_id);

-- 9. Create index on date, listener_id, and time for overlap prevention
CREATE INDEX IF NOT EXISTS idx_time_slots_listener_date_time ON time_slots(listener_id, date, start_time, end_time);

-- 10. Add foreign key constraint for listener_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'time_slots_listener_id_fkey' 
        AND table_name = 'time_slots'
    ) THEN
        ALTER TABLE time_slots 
        ADD CONSTRAINT time_slots_listener_id_fkey 
        FOREIGN KEY (listener_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 11. Create function to check for slot overlaps
CREATE OR REPLACE FUNCTION check_slot_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there are any overlapping slots for the same listener on the same date
    IF EXISTS (
        SELECT 1 FROM time_slots 
        WHERE listener_id = NEW.listener_id 
        AND date = NEW.date 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
        AND (
            (start_time < NEW.end_time AND end_time > NEW.start_time)
            OR (NEW.start_time < end_time AND NEW.end_time > start_time)
        )
    ) THEN
        RAISE EXCEPTION 'Slot overlaps with existing slot for this listener on the same date';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger to prevent slot overlaps
DROP TRIGGER IF EXISTS trigger_check_slot_overlap ON time_slots;
CREATE TRIGGER trigger_check_slot_overlap
    BEFORE INSERT OR UPDATE ON time_slots
    FOR EACH ROW
    EXECUTE FUNCTION check_slot_overlap();

-- 13. Update RLS policies for listener-based access
-- Drop existing policies (ignore errors if they don't exist)
DROP POLICY IF EXISTS "Enable read access for all users" ON time_slots;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON time_slots;
DROP POLICY IF EXISTS "Enable insert for admin users only" ON time_slots;
DROP POLICY IF EXISTS "Enable update for admin users only" ON time_slots;
DROP POLICY IF EXISTS "Enable delete for admin users only" ON time_slots;

-- Create new policies with listener-based access
-- Admins can see all slots, listeners can only see their own slots
CREATE POLICY "Enable read access for all users" ON time_slots
    FOR SELECT USING (
        auth.role() = 'authenticated' AND (
            -- Admin can see all slots (you'll need to set up admin role)
            EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
            OR 
            -- Listener can see their own slots
            listener_id = auth.uid()
        )
    );

-- Only admins can create slots
CREATE POLICY "Enable insert for admin users only" ON time_slots
    FOR INSERT WITH CHECK (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can update slots
CREATE POLICY "Enable update for admin users only" ON time_slots
    FOR UPDATE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Only admins can delete slots
CREATE POLICY "Enable delete for admin users only" ON time_slots
    FOR DELETE USING (
        auth.role() = 'authenticated' AND 
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- 14. Add trigger to auto-update status when booking is created
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

-- 15. Add trigger to auto-update status when booking is deleted
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

-- 16. Create a view for admin to see all slots with listener information
CREATE OR REPLACE VIEW admin_slots_view AS
SELECT 
    ts.id,
    ts.date,
    ts.start_time,
    ts.end_time,
    ts.status,
    ts.meeting_link,
    ts.meeting_id,
    ts.meeting_provider,
    ts.created_at,
    ts.updated_at,
    u.username as listener_name,
    u.email as listener_email,
    u.role as listener_role
FROM time_slots ts
JOIN users u ON ts.listener_id = u.id
ORDER BY ts.date DESC, ts.start_time ASC;

-- 17. Create a view for listeners to see only their slots
CREATE OR REPLACE VIEW listener_slots_view AS
SELECT 
    ts.id,
    ts.date,
    ts.start_time,
    ts.end_time,
    ts.status,
    ts.meeting_link,
    ts.meeting_id,
    ts.meeting_provider,
    ts.created_at,
    ts.updated_at
FROM time_slots ts
WHERE ts.listener_id = auth.uid()
ORDER BY ts.date DESC, ts.start_time ASC;

-- 18. Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_slots' 
ORDER BY ordinal_position;

-- 19. Show current data sample with listener information
SELECT 
    ts.id,
    ts.date,
    ts.start_time,
    ts.end_time,
    ts.status,
    ts.meeting_link,
    u.username as listener_name,
    ts.created_at
FROM time_slots ts
LEFT JOIN users u ON ts.listener_id = u.id
ORDER BY ts.created_at DESC 
LIMIT 5;
