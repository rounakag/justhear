const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING');
  console.log('SUPABASE_ANON_KEY:', supabaseKey ? 'SET' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log('🔍 Testing database connectivity and tables...\n');

  try {
    // Test 1: Check if time_slots table exists
    console.log('1️⃣ Testing time_slots table...');
    const { data: slots, error: slotsError } = await supabase
      .from('time_slots')
      .select('*')
      .limit(1);
    
    if (slotsError) {
      console.error('❌ time_slots table error:', slotsError.message);
    } else {
      console.log('✅ time_slots table accessible');
      console.log('   Sample data:', slots);
    }

    // Test 2: Check if users table exists
    console.log('\n2️⃣ Testing users table...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.error('❌ users table error:', usersError.message);
    } else {
      console.log('✅ users table accessible');
      console.log('   Sample data:', users);
    }

    // Test 3: Check if bookings table exists
    console.log('\n3️⃣ Testing bookings table...');
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .limit(1);
    
    if (bookingsError) {
      console.error('❌ bookings table error:', bookingsError.message);
    } else {
      console.log('✅ bookings table accessible');
      console.log('   Sample data:', bookings);
    }

    // Test 4: Check RLS policies
    console.log('\n4️⃣ Testing RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .rpc('get_policies', { table_name: 'time_slots' });
    
    if (policiesError) {
      console.log('⚠️  Could not check RLS policies (this is normal):', policiesError.message);
    } else {
      console.log('✅ RLS policies check:', policies);
    }

    // Test 5: Try to get admin slots
    console.log('\n5️⃣ Testing admin slots query...');
    const { data: adminSlots, error: adminError } = await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(
          id,
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (adminError) {
      console.error('❌ Admin slots query error:', adminError.message);
    } else {
      console.log('✅ Admin slots query successful');
      console.log('   Found slots:', adminSlots.length);
      console.log('   Sample data:', adminSlots);
    }

    // Test 6: Check table structure
    console.log('\n6️⃣ Checking table structure...');
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'time_slots' });
    
    if (columnsError) {
      console.log('⚠️  Could not check table structure (this is normal):', columnsError.message);
    } else {
      console.log('✅ time_slots table structure:', columns);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testDatabase().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
