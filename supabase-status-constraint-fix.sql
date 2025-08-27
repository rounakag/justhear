-- Fix for status check constraint violation
-- This script checks and fixes the status constraint to allow 'created' status

-- 1. First, let's see what the current constraint allows
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'time_slots'::regclass 
AND contype = 'c';

-- 2. Drop the existing status check constraint
ALTER TABLE time_slots DROP CONSTRAINT IF EXISTS time_slots_status_check;

-- 3. Create a new status check constraint that allows all our status values
ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_status_check 
CHECK (status IN ('created', 'booked', 'completed'));

-- 4. Update any existing slots with invalid status to 'created'
UPDATE time_slots 
SET status = 'created' 
WHERE status IS NULL OR status NOT IN ('created', 'booked', 'completed');

-- 5. Verify the constraint is working
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'time_slots'::regclass 
AND contype = 'c';

-- 6. Show current status distribution
SELECT 
    status,
    COUNT(*) as count
FROM time_slots 
GROUP BY status
ORDER BY status;

-- 7. Show a sample of current data
SELECT 
    id,
    date,
    start_time,
    end_time,
    status,
    listener_id,
    created_at
FROM time_slots 
ORDER BY created_at DESC 
LIMIT 5;
