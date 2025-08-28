const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSlotCreation() {
  try {
    console.log('🔍 Starting comprehensive slot creation debug...');
    
    // Step 1: Check environment variables
    console.log('\n📋 Environment Variables:');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
    
    // Step 2: Test database connection
    console.log('\n🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count(*)', { head: true, count: 'exact' });
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful');
    
    // Step 3: Check if system user exists
    console.log('\n👤 Checking system user...');
    const { data: systemUser, error: systemError } = await supabase
      .from('users')
      .select('id, username, role')
      .eq('username', 'system')
      .single();
    
    if (systemError) {
      console.error('❌ System user not found:', systemError);
      
      // Try to find any user
      const { data: anyUser, error: anyUserError } = await supabase
        .from('users')
        .select('id, username, role')
        .limit(1)
        .single();
      
      if (anyUserError) {
        console.error('❌ No users found in database:', anyUserError);
        return;
      }
      
      console.log('⚠️ Using fallback user:', anyUser);
      var userId = anyUser.id;
    } else {
      console.log('✅ System user found:', systemUser);
      var userId = systemUser.id;
    }
    
    // Step 4: Test slot creation with minimal data
    console.log('\n📅 Testing slot creation...');
    const testSlotData = {
      date: '2025-12-31',
      start_time: '09:00:00',
      end_time: '10:00:00',
      duration_minutes: 60,
      price: 50,
      status: 'created',
      listener_id: userId
    };
    
    console.log('📝 Test slot data:', testSlotData);
    
    const { data: slot, error: slotError } = await supabase
      .from('time_slots')
      .insert([testSlotData])
      .select()
      .single();
    
    if (slotError) {
      console.error('❌ Slot creation failed:', slotError);
      return;
    }
    
    console.log('✅ Slot created successfully:', slot.id);
    
    // Step 5: Test meeting link update
    console.log('\n🔗 Testing meeting link update...');
    const meetingData = {
      meeting_link: 'https://test.com',
      meeting_id: 'test-id',
      meeting_provider: 'google_meet'
    };
    
    const { data: updatedSlot, error: updateError } = await supabase
      .from('time_slots')
      .update(meetingData)
      .eq('id', slot.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Meeting link update failed:', updateError);
    } else {
      console.log('✅ Meeting link updated successfully');
    }
    
    // Step 6: Clean up
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', slot.id);
    
    if (deleteError) {
      console.error('⚠️ Could not clean up test slot:', deleteError);
    } else {
      console.log('✅ Test slot cleaned up');
    }
    
    console.log('\n🎉 All tests passed! The issue might be in the server code or environment.');
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugSlotCreation();
