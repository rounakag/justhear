const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkMeetingColumns() {
  try {
    console.log('🔍 Checking if meeting columns exist in time_slots table...');
    
    // Try to insert a record with meeting fields to see if they exist
    const testSlot = {
      listener_id: '55f0d229-16eb-48db-8bfe-e817a7dee807', // system user
      date: '2025-12-31',
      start_time: '09:00:00',
      end_time: '10:00:00',
      duration_minutes: 60,
      price: 50,
      status: 'created',
      meeting_link: 'https://test.com',
      meeting_id: 'test-id',
      meeting_provider: 'google_meet'
    };
    
    console.log('📝 Attempting to insert test record with meeting fields...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('time_slots')
      .insert([testSlot])
      .select();
    
    if (insertError) {
      console.error('❌ Error inserting test record:', insertError);
      console.log('');
      console.log('💡 This confirms that the meeting columns do not exist in the time_slots table');
      console.log('🔧 You need to run the following SQL in your Supabase dashboard:');
      console.log('');
      console.log('-- Add meeting link columns to time_slots table');
      console.log('ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS meeting_link TEXT;');
      console.log('ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS meeting_id VARCHAR(255);');
      console.log('ALTER TABLE time_slots ADD COLUMN IF NOT EXISTS meeting_provider VARCHAR(50);');
      console.log('');
      console.log('📋 Steps to fix:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Run the above SQL commands');
      console.log('4. Deploy the changes');
      console.log('');
    } else {
      console.log('✅ Meeting columns exist! Test record inserted:', insertData[0].id);
      
      // Clean up test record
      const { error: deleteError } = await supabase
        .from('time_slots')
        .delete()
        .eq('id', insertData[0].id);
      
      if (deleteError) {
        console.log('⚠️ Warning: Could not clean up test record:', deleteError.message);
      } else {
        console.log('🧹 Test record cleaned up');
      }
      
      console.log('🎉 Meeting columns are already present in the database!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkMeetingColumns();
