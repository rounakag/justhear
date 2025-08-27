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
    // Get today's date in YYYY-MM-DD format without timezone issues
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    console.log('🔍 DEBUG - Getting available slots from date:', todayString);
    
    const { data, error } = await supabase
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
      .eq('status', 'created')
      .not('listener_id', 'is', null) // Only show slots with assigned listeners
      .gte('date', todayString)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('❌ ERROR getting available slots:', error);
      throw error;
    }
    
    console.log('🔍 DEBUG - Found available slots:', data?.length || 0);
    return data || [];
  }

  async getAdminCreatedSlots() {
    // Get today's date in YYYY-MM-DD format without timezone issues
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    
    console.log('🔍 DEBUG - Getting admin slots from date:', todayString);
    
    const { data, error } = await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(
          id,
          username,
          name,
          email
        ),
        booking:bookings!bookings_slot_id_fkey(
          user_id,
          status,
          created_at
        )
      `)
      .gte('date', todayString)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true });
    
    if (error) {
      console.error('❌ ERROR getting admin slots:', error);
      throw error;
    }
    
    console.log('🔍 DEBUG - Found admin slots:', data?.length || 0);
    return data || [];
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

  async markSlotAsDone(slotId) {
    const { data, error } = await supabase
      .from('time_slots')
      .update({ status: 'completed' })
      .eq('id', slotId)
      .select()
      .single();
    
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

  // CMS Content Management
  async getCMSContent() {
    try {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .order('section', { ascending: true });
      
      if (error) {
        console.error('Error fetching CMS content:', error);
        throw error;
      }
      
      // Transform to section-based object
      const contentBySection = {};
      (data || []).forEach(item => {
        if (!contentBySection[item.section]) {
          contentBySection[item.section] = {};
        }
        contentBySection[item.section][item.field] = item.value;
      });
      
      return contentBySection;
    } catch (error) {
      console.error('Exception in getCMSContent:', error);
      return {};
    }
  }

  async updateCMSContent(section, field, value) {
    try {
      // Check if content exists
      const { data: existing, error: checkError } = await supabase
        .from('cms_content')
        .select('id')
        .eq('section', section)
        .eq('field', field)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw checkError;
      }
      
      if (existing) {
        // Update existing content
        const { data, error } = await supabase
          .from('cms_content')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('cms_content')
          .insert([{
            section,
            field,
            value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    } catch (error) {
      console.error('Exception in updateCMSContent:', error);
      throw error;
    }
  }

  async initializeDefaultCMSContent() {
    const defaultContent = [
      // Hero Section
      { section: 'hero', field: 'title1', value: 'Feeling upset?' },
      { section: 'hero', field: 'title2', value: 'We\'re here to listen.' },
      { section: 'hero', field: 'subtitle1', value: 'Talk anonymously with trained listeners who understand.' },
      { section: 'hero', field: 'subtitle2', value: 'Not therapy — just you, truly heard.' },
      { section: 'hero', field: 'ctaText', value: 'Book Session' },
      { section: 'hero', field: 'secondaryCtaText', value: 'See How It Works' },
      { section: 'hero', field: 'secondaryCtaHref', value: '#how' },
      
      // Testimonials Section
      { section: 'testimonials', field: 'title', value: 'Real stories, real validation' },
      { section: 'testimonials', field: 'subtitle', value: 'See how a simple conversation changed everything' },
      
      // Examples Section
      { section: 'examples', field: 'title', value: 'Reach out to us, when u feel' },
      
      // Features Section
      { section: 'features', field: 'title', value: 'How it works' },
      
      // Comparison Section
      { section: 'comparison', field: 'title', value: 'We\'re not therapy — we\'re something different' },
      { section: 'comparison', field: 'subtitle', value: 'Sometimes you don\'t need to be fixed or analyzed. You just need someone to say: Your feelings make complete sense.' },
      
      // Science Section
      { section: 'science', field: 'title', value: 'Why validation works' },
      
      // Pricing Section
      { section: 'pricing', field: 'title', value: 'Choose your plan' },
      
      // FAQ Section
      { section: 'faq', field: 'title', value: 'Frequently Asked Questions' }
    ];

    try {
      for (const content of defaultContent) {
        await this.updateCMSContent(content.section, content.field, content.value);
      }
      console.log('✅ Default CMS content initialized');
    } catch (error) {
      console.error('❌ Error initializing default CMS content:', error);
    }
  }

  // Multi-Entry CMS Methods
  // Testimonials
  async getTestimonials() {
    try {
      const { data, error } = await supabase
        .from('cms_testimonials')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      return [];
    }
  }

  async createTestimonial(testimonialData) {
    try {
      const { data, error } = await supabase
        .from('cms_testimonials')
        .insert([{
          name: testimonialData.name,
          text: testimonialData.text,
          rating: testimonialData.rating,
          avatar_url: testimonialData.avatar_url,
          is_active: true,
          sort_order: testimonialData.sort_order || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  }

  async updateTestimonial(id, testimonialData) {
    try {
      const { data, error } = await supabase
        .from('cms_testimonials')
        .update({
          name: testimonialData.name,
          text: testimonialData.text,
          rating: testimonialData.rating,
          avatar_url: testimonialData.avatar_url,
          sort_order: testimonialData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  }

  async deleteTestimonial(id) {
    try {
      const { error } = await supabase
        .from('cms_testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  }

  // Features
  async getFeatures() {
    try {
      const { data, error } = await supabase
        .from('cms_features')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching features:', error);
      return [];
    }
  }

  async createFeature(featureData) {
    try {
      const { data, error } = await supabase
        .from('cms_features')
        .insert([{
          title: featureData.title,
          description: featureData.description,
          icon: featureData.icon,
          is_active: true,
          sort_order: featureData.sort_order || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating feature:', error);
      throw error;
    }
  }

  async updateFeature(id, featureData) {
    try {
      const { data, error } = await supabase
        .from('cms_features')
        .update({
          title: featureData.title,
          description: featureData.description,
          icon: featureData.icon,
          sort_order: featureData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating feature:', error);
      throw error;
    }
  }

  async deleteFeature(id) {
    try {
      const { error } = await supabase
        .from('cms_features')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting feature:', error);
      throw error;
    }
  }

  // FAQ
  async getFAQs() {
    try {
      const { data, error } = await supabase
        .from('cms_faq')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      return [];
    }
  }

  async createFAQ(faqData) {
    try {
      const { data, error } = await supabase
        .from('cms_faq')
        .insert([{
          question: faqData.question,
          answer: faqData.answer,
          is_active: true,
          sort_order: faqData.sort_order || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating FAQ:', error);
      throw error;
    }
  }

  async updateFAQ(id, faqData) {
    try {
      console.log('🔍 DEBUG - updateFAQ called with:', { id, faqData });
      
      const updateData = {
        question: faqData.question,
        answer: faqData.answer,
        sort_order: faqData.sort_order,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔍 DEBUG - updateFAQ update data:', updateData);
      
      const { data, error } = await supabase
        .from('cms_faq')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      console.log('🔍 DEBUG - updateFAQ supabase response:', { data, error });
      
      if (error) {
        console.error('🔍 DEBUG - updateFAQ supabase error:', error);
        throw error;
      }
      
      console.log('🔍 DEBUG - updateFAQ returning data:', data);
      return data;
    } catch (error) {
      console.error('Error updating FAQ:', error);
      throw error;
    }
  }

  async deleteFAQ(id) {
    try {
      const { error } = await supabase
        .from('cms_faq')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      throw error;
    }
  }

  // Pricing Plans
  async getPricingPlans() {
    try {
      const { data, error } = await supabase
        .from('cms_pricing_plans')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      return [];
    }
  }

  async createPricingPlan(pricingData) {
    try {
      const { data, error } = await supabase
        .from('cms_pricing_plans')
        .insert([{
          name: pricingData.name,
          price: pricingData.price,
          currency: pricingData.currency || 'USD',
          billing_period: pricingData.billing_period || 'month',
          description: pricingData.description,
          features: pricingData.features || [],
          is_popular: pricingData.is_popular || false,
          is_active: true,
          sort_order: pricingData.sort_order || 0
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating pricing plan:', error);
      throw error;
    }
  }

  async updatePricingPlan(id, pricingData) {
    try {
      const { data, error } = await supabase
        .from('cms_pricing_plans')
        .update({
          name: pricingData.name,
          price: pricingData.price,
          currency: pricingData.currency,
          billing_period: pricingData.billing_period,
          description: pricingData.description,
          features: pricingData.features,
          is_popular: pricingData.is_popular,
          sort_order: pricingData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating pricing plan:', error);
      throw error;
    }
  }

  async deletePricingPlan(id) {
    try {
      const { error } = await supabase
        .from('cms_pricing_plans')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
      throw error;
    }
  }

  // Reach Out
  async getReachOut() {
    try {
      const { data, error } = await supabase
        .from('cms_reachout')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      
      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.message && error.message.includes('relation "cms_reachout" does not exist')) {
          console.log('cms_reachout table does not exist yet, returning empty array');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching reach out content:', error);
      return [];
    }
  }

  async createReachOut(reachoutData) {
    try {
      const { data, error } = await supabase
        .from('cms_reachout')
        .insert([{
          emoji: reachoutData.emoji,
          title: reachoutData.title,
          is_active: true,
          sort_order: reachoutData.sort_order || 0
        }])
        .select()
        .single();
      
      if (error) {
        if (error.message && error.message.includes('relation "cms_reachout" does not exist')) {
          throw new Error('cms_reachout table does not exist. Please run the SQL migration first.');
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error creating reach out content:', error);
      throw error;
    }
  }

  async updateReachOut(id, reachoutData) {
    try {
      const { data, error } = await supabase
        .from('cms_reachout')
        .update({
          emoji: reachoutData.emoji,
          title: reachoutData.title,
          sort_order: reachoutData.sort_order,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reach out content:', error);
      throw error;
    }
  }

  async deleteReachOut(id) {
    try {
      const { error } = await supabase
        .from('cms_reachout')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting reach out content:', error);
      throw error;
    }
  }
}

module.exports = new DatabaseService();
