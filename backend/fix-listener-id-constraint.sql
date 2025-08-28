-- Fix listener_id constraint to allow NULL values for unassigned slots
-- This allows admin to create slots without assigning a listener initially

-- 1. Drop the NOT NULL constraint on listener_id
ALTER TABLE time_slots ALTER COLUMN listener_id DROP NOT NULL;

-- 2. Update the check constraint to allow NULL values
ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS time_slots_status_check;
ALTER TABLE time_slots ADD CONSTRAINT time_slots_status_check 
CHECK (status IN ('created', 'booked', 'completed'));

-- 3. Add a comment explaining the business logic
COMMENT ON COLUMN time_slots.listener_id IS 'NULL for unassigned slots, UUID for assigned listeners';

-- 4. Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'time_slots' AND column_name = 'listener_id';
