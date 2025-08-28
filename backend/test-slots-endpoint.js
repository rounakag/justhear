// Test script to check slot visibility
const { supabase } = require('./config/supabase');

async function testSlots() {
  console.log('🔍 Testing slot visibility...');
  
  try {
    // Test 1: Get all slots without any filters
    console.log('\n1. Testing: Get all slots from time_slots table');
    const { data: allSlots, error: allError } = await supabase
      .from('time_slots')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (allError) {
      console.error('❌ Error getting all slots:', allError);
    } else {
      console.log('✅ All slots found:', allSlots?.length || 0);
      console.log('Sample slots:', allSlots?.slice(0, 3).map(s => ({ 
        id: s.id, 
        date: s.date, 
        status: s.status, 
        listener_id: s.listener_id,
        created_at: s.created_at 
      })));
    }
    
    // Test 2: Get slots with listener info
    console.log('\n2. Testing: Get slots with listener information');
    const { data: slotsWithListener, error: listenerError } = await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(
          id,
          username,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (listenerError) {
      console.error('❌ Error getting slots with listener:', listenerError);
    } else {
      console.log('✅ Slots with listener found:', slotsWithListener?.length || 0);
      console.log('Sample slots with listener:', slotsWithListener?.slice(0, 3).map(s => ({ 
        id: s.id, 
        date: s.date, 
        status: s.status, 
        listener_id: s.listener_id,
        listener_name: s.listener?.name || s.listener?.username || 'Unknown',
        created_at: s.created_at 
      })));
    }
    
    // Test 3: Check RLS policies
    console.log('\n3. Testing: Check RLS policies');
    const { data: rlsInfo, error: rlsError } = await supabase
      .rpc('get_rls_policies', { table_name: 'time_slots' })
      .catch(() => ({ data: null, error: 'RPC function not available' }));
    
    if (rlsError) {
      console.log('ℹ️ RLS info not available:', rlsError);
    } else {
      console.log('✅ RLS policies:', rlsInfo);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSlots().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
