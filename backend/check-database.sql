-- Database diagnostic script
-- Run this in Supabase SQL Editor to check current state

-- 1. Check if tables exist
SELECT 'Tables in database:' as info;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('time_slots', 'users', 'bookings', 'recurring_schedules')
ORDER BY table_name;

-- 2. Check time_slots table structure
SELECT 'time_slots table structure:' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'time_slots' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check if time_slots has data
SELECT 'time_slots data count:' as info;
SELECT COUNT(*) as total_slots FROM time_slots;

-- 4. Show sample time_slots data
SELECT 'Sample time_slots data:' as info;
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
LIMIT 5;

-- 5. Check RLS policies on time_slots
SELECT 'RLS policies on time_slots:' as info;
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
WHERE tablename = 'time_slots'
ORDER BY policyname;

-- 6. Check if RLS is enabled on time_slots
SELECT 'RLS status on time_slots:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'time_slots';

-- 7. Check foreign key constraints
SELECT 'Foreign key constraints:' as info;
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'time_slots';

-- 8. Check if users table exists and has data
SELECT 'Users table check:' as info;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') as users_table_exists,
    (SELECT COUNT(*) FROM users) as users_count;

-- 9. Check if bookings table exists and has data
SELECT 'Bookings table check:' as info;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'bookings' AND table_schema = 'public') as bookings_table_exists,
    (SELECT COUNT(*) FROM bookings) as bookings_count;

-- 10. Check if recurring_schedules table exists
SELECT 'Recurring schedules table check:' as info;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'recurring_schedules' AND table_schema = 'public') as recurring_schedules_table_exists;
