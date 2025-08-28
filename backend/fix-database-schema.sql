-- Fix database schema issues for JustHear backend

-- 1. Fix the status constraint to allow all valid statuses
ALTER TABLE time_slots 
DROP CONSTRAINT IF EXISTS time_slots_status_check;

ALTER TABLE time_slots 
ADD CONSTRAINT time_slots_status_check 
CHECK (status IN ('created', 'available', 'booked', 'completed', 'cancelled'));

-- 2. Add unique constraint to prevent overlapping slots
CREATE UNIQUE INDEX IF NOT EXISTS idx_time_slots_no_overlap 
ON time_slots (listener_id, date, start_time, end_time) 
WHERE status != 'cancelled';

-- 3. Add proper cascading for bookings
ALTER TABLE bookings 
DROP CONSTRAINT IF EXISTS bookings_slot_id_fkey;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_slot_id_fkey 
FOREIGN KEY (slot_id) REFERENCES time_slots(id) ON DELETE CASCADE;

-- 4. Ensure system user exists for unassigned slots
INSERT INTO users (username, email, password_hash, role) 
VALUES ('system', 'system@justhear.com', 'system', 'listener')
ON CONFLICT (username) DO NOTHING;

-- 5. Add price column if it doesn't exist
ALTER TABLE time_slots 
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 50.00;

-- 6. Verify the changes
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'time_slots' 
ORDER BY ordinal_position;
