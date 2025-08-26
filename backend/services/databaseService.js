const { supabase } = require('../config/supabase');

class DatabaseService {
  // User Management
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUser(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .maybeSingle();
      
      if (error) {
        console.error('Database error in getUserByUsername:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Exception in getUserByUsername:', error);
      return null;
    }
  }

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Time Slots Management
  async createTimeSlot(slotData) {
    console.log('Database service creating slot with data:', slotData);
    
    const { data, error } = await supabase
      .from('time_slots')
      .insert([slotData])
      .select()
      .single();
    
    if (error) {
      console.error('Supabase error creating slot:', error);
      throw new Error(`Database error: ${error.message} (${error.code})`);
    }
    
    console.log('Slot created successfully:', data);
    return data;
  }

  async getAvailableSlots() {
    const { data, error } = await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(username)
      `)
      .eq('status', 'available')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async getAdminCreatedSlots() {
    const { data, error } = await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(username)
      `)
      .eq('status', 'available')
      .gte('date', new Date().toISOString().split('T')[0])
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async getRecurringSchedules() {
    const { data, error } = await supabase
      .from('recurring_schedules')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async getSlotsByListener(listenerId) {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('listener_id', listenerId)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  async updateSlotStatus(slotId, status) {
    const { data, error } = await supabase
      .from('time_slots')
      .update({ status })
      .eq('id', slotId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateSlotMeetingLink(slotId, meetingData) {
    const { data, error } = await supabase
      .from('time_slots')
      .update({
        meeting_link: meetingData.meeting_link,
        meeting_id: meetingData.meeting_id,
        meeting_provider: meetingData.meeting_provider
      })
      .eq('id', slotId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteTimeSlot(id) {
    const { data, error } = await supabase
      .from('time_slots')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteAllTimeSlots() {
    try {
      console.log('🔍 DEBUG - Database: Deleting all time slots');
      
      // First, get all slots to return count
      const { data: allSlots, error: fetchError } = await supabase
        .from('time_slots')
        .select('id');
      
      if (fetchError) {
        console.error('Error fetching slots for deletion:', fetchError);
        throw fetchError;
      }
      
      console.log('🔍 DEBUG - Database: Found', allSlots?.length || 0, 'slots to delete');
      
      if (!allSlots || allSlots.length === 0) {
        return [];
      }
      
      // Delete all slots
      const { data, error } = await supabase
        .from('time_slots')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all slots
      
      if (error) {
        console.error('Error deleting all slots:', error);
        throw error;
      }
      
      console.log('🔍 DEBUG - Database: Successfully deleted all slots');
      return allSlots; // Return the deleted slots for count
    } catch (error) {
      console.error('Exception in deleteAllTimeSlots:', error);
      throw error;
    }
  }

  // Bookings Management
  async createBooking(bookingData) {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        *,
        slot:time_slots(*),
        user:users!bookings_user_id_fkey(username)
      `)
      .single();
    
    if (error) throw error;
    return data;
  }



  async updateBooking(bookingId, updateData) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserBookings(userId) {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          slot:time_slots!bookings_slot_id_fkey(
            *,
            listener:users!time_slots_listener_id_fkey(username)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Exception in getUserBookings:', error);
      return [];
    }
  }

  // Reviews Management
  async createReview(reviewData) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([reviewData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserReviews(userId) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          booking:bookings!reviews_booking_id_fkey(
            slot:time_slots(*)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Exception in getUserReviews:', error);
      return [];
    }
  }

  async updateReview(reviewId, updateData) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updateData)
      .eq('id', reviewId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteReview(reviewId) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
    
    if (error) throw error;
    return true;
  }

  // Bulk Operations
  async createBulkSlots(slotsData) {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(slotsData)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Statistics
  async getUserStats(userId) {
    try {
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          status,
          slot:time_slots!bookings_slot_id_fkey(price)
        `)
        .eq('user_id', userId);
      
      if (bookingsError) {
        console.error('Error fetching bookings for stats:', bookingsError);
        throw bookingsError;
      }

      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', userId);
      
      if (reviewsError) {
        console.error('Error fetching reviews for stats:', reviewsError);
        throw reviewsError;
      }

      const totalBookings = bookings?.length || 0;
      const completedSessions = bookings?.filter(b => b.status === 'completed').length || 0;
      const upcomingSessions = bookings?.filter(b => b.status === 'confirmed').length || 0;
      const totalSpent = bookings?.reduce((sum, b) => sum + (b.slot?.price || 0), 0) || 0;
      const totalReviews = reviews?.length || 0;
      const averageRating = reviews && reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      return {
        totalBookings,
        completedSessions,
        upcomingSessions,
        totalSpent,
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10 // Round to 1 decimal place
      };
    } catch (error) {
      console.error('Error in getUserStats:', error);
      // Return default values if there's an error
      return {
        totalBookings: 0,
        completedSessions: 0,
        upcomingSessions: 0,
        totalSpent: 0,
        totalReviews: 0,
        averageRating: 0
      };
    }
  }
}

module.exports = new DatabaseService();
