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
    const { data, error } = await supabase
      .from('time_slots')
      .insert([slotData])
      .select()
      .single();
    
    if (error) throw error;
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
    
    if (error) throw error;
    return data;
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
    
    if (error) throw error;
    return data;
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
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        status,
        slot:time_slots(price)
      `)
      .eq('user_id', userId);
    
    if (bookingsError) throw bookingsError;

    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('user_id', userId);
    
    if (reviewsError) throw reviewsError;

    const totalBookings = bookings.length;
    const completedSessions = bookings.filter(b => b.status === 'completed').length;
    const upcomingSessions = bookings.filter(b => b.status === 'confirmed').length;
    const totalSpent = bookings.reduce((sum, b) => sum + (b.slot?.price || 0), 0);
    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 
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
  }
}

module.exports = new DatabaseService();
