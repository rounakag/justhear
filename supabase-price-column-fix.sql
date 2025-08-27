-- Fix for price column NOT NULL constraint error
-- This script makes the price column nullable since we removed it from the frontend

-- 1. Make price column nullable (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'time_slots' AND column_name = 'price') THEN
        ALTER TABLE time_slots ALTER COLUMN price DROP NOT NULL;
        ALTER TABLE time_slots ALTER COLUMN price SET DEFAULT NULL;
    END IF;
END $$;

-- 2. Update existing records to have NULL price
UPDATE time_slots SET price = NULL WHERE price IS NOT NULL;

-- 3. Verify the change
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'time_slots' AND column_name = 'price';

-- 4. Show a sample of current data
SELECT 
    id,
    date,
    start_time,
    end_time,
    price,
    listener_id,
    status
FROM time_slots 
ORDER BY created_at DESC 
LIMIT 5;
