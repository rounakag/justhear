const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSlotCreation() {
  try {
    console.log('🔍 Testing slot creation directly...');
    
    // Test data similar to what the frontend sends
    const testSlotData = {
      date: '2025-08-28',
      startTime: '21:00',
      endTime: '22:00',
      isAvailable: true,
      meeting_link: 'https://meet.google.com/kra-wmf-zdrp',
      meeting_id: 'kra-wmf-zdrp',
      meeting_provider: 'google_meet'
    };
    
    console.log('📝 Test slot data:', testSlotData);
    
    // Step 1: Create the basic slot
    const transformedData = {
      date: testSlotData.date,
      start_time: testSlotData.startTime,
      end_time: testSlotData.endTime,
      status: 'created',
      listener_id: '55f0d229-16eb-48db-8bfe-e817a7dee807', // system user
      duration_minutes: 60,
      price: 50
    };
    
    console.log('🔧 Transformed data:', transformedData);
    
    // Step 2: Insert the slot
    const { data: slot, error: slotError } = await supabase
      .from('time_slots')
      .insert([transformedData])
      .select()
      .single();
    
    if (slotError) {
      console.error('❌ Error creating slot:', slotError);
      return;
    }
    
    console.log('✅ Slot created successfully:', slot.id);
    
    // Step 3: Update with meeting link
    const meetingLinkData = {
      meeting_link: testSlotData.meeting_link,
      meeting_id: testSlotData.meeting_id,
      meeting_provider: testSlotData.meeting_provider
    };
    
    console.log('🔗 Meeting link data:', meetingLinkData);
    
    const { data: updatedSlot, error: updateError } = await supabase
      .from('time_slots')
      .update(meetingLinkData)
      .eq('id', slot.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ Error updating slot with meeting link:', updateError);
      return;
    }
    
    console.log('✅ Slot updated with meeting link successfully:', updatedSlot);
    
    // Clean up
    const { error: deleteError } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', slot.id);
    
    if (deleteError) {
      console.log('⚠️ Warning: Could not clean up test slot:', deleteError.message);
    } else {
      console.log('🧹 Test slot cleaned up');
    }
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSlotCreation();
