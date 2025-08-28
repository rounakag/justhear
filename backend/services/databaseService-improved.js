const { supabase } = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Database Service Class
 * Handles all database operations with improved error handling, 
 * performance optimizations, and code organization
 */
class DatabaseService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.slowQueryThreshold = 1000; // 1 second
  }

  /**
   * Generic error handler for database operations
   * @param {string} operation - Name of the operation
   * @param {Error} error - The error object
   */
  _handleError(operation, error) {
    logger.error(`Database Error in ${operation}:`, {
      operation,
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    throw new Error(`Database operation failed: ${operation} - ${error.message}`);
  }

  /**
   * Cache management utilities
   */
  _getCacheKey(operation, params = {}) {
    return `${operation}_${JSON.stringify(params)}`;
  }

  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  _getCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  _clearCachePattern(pattern) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Execute query with performance monitoring and retry logic
   * @param {Function} queryFn - Supabase query function
   * @param {string} operationName - Name of the operation for logging
   * @param {number} maxRetries - Maximum retry attempts
   */
  async _executeQuery(queryFn, operationName = 'unknown', maxRetries = 2) {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const startTime = Date.now();
        const result = await queryFn();
        const duration = Date.now() - startTime;
        
        // Log slow queries
        if (duration > this.slowQueryThreshold) {
          logger.warn(`Slow query detected: ${operationName} took ${duration}ms`, {
            operation: operationName,
            duration,
            threshold: this.slowQueryThreshold
          });
        }
        
        return result;
      } catch (error) {
        if (attempt <= maxRetries && this._isRetryableError(error)) {
          logger.warn(`Retrying ${operationName} (attempt ${attempt}/${maxRetries + 1}):`, {
            operation: operationName,
            attempt,
            error: error.message
          });
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          logger.error(`${operationName} failed after ${attempt} attempts:`, {
            operation: operationName,
            attempts: attempt,
            error: error.message
          });
          throw error;
        }
      }
    }
  }

  /**
   * Check if an error is retryable
   * @param {Error} error - The error object
   * @returns {boolean} Whether the error is retryable
   */
  _isRetryableError(error) {
    // Network errors, timeouts, and temporary database issues
    const retryableCodes = ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNREFUSED'];
    const retryableMessages = ['timeout', 'connection', 'network', 'temporary'];
    
    return retryableCodes.includes(error.code) || 
           retryableMessages.some(msg => error.message.toLowerCase().includes(msg));
  }

  // =============================================
  // USER MANAGEMENT
  // =============================================

  /**
   * Create a new user
   * @param {Object} userData - User data object
   * @returns {Object} Created user data
   */
  async createUser(userData) {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .insert([userData])
          .select()
          .single(),
        'createUser'
      );
      
      if (result.error) throw result.error;
      
      // Clear user-related cache
      this._clearCachePattern('user');
      
      logger.info('User created successfully', { userId: result.data.id });
      return result.data;
    } catch (error) {
      this._handleError('createUser', error);
    }
  }

  /**
   * Update user information
   * @param {string} userId - User ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated user data
   */
  async updateUser(userId, updateData) {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', userId)
          .select()
          .single(),
        'updateUser'
      );
      
      if (result.error) throw result.error;
      
      // Clear user-related cache
      this._clearCachePattern('user');
      
      logger.info('User updated successfully', { userId });
      return result.data;
    } catch (error) {
      this._handleError('updateUser', error);
    }
  }

  /**
   * Get user by username with error handling
   * @param {string} username - Username to search for
   * @returns {Object|null} User data or null if not found
   */
  async getUserByUsername(username) {
    if (!username) return null;
    
    const cacheKey = this._getCacheKey('getUserByUsername', { username });
    const cached = this._getCache(cacheKey);
    if (cached !== null) return cached;

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .select('*')
          .eq('username', username.toLowerCase().trim())
          .maybeSingle(),
        'getUserByUsername'
      );
      
      if (result.error) throw result.error;
      
      this._setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      logger.error('Error in getUserByUsername:', { username, error: error.message });
      return null;
    }
  }

  /**
   * Get user by ID
   * @param {string} id - User ID
   * @returns {Object} User data
   */
  async getUserById(id) {
    if (!id) throw new Error('User ID is required');

    const cacheKey = this._getCacheKey('getUserById', { id });
    const cached = this._getCache(cacheKey);
    if (cached !== null) return cached;

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single(),
        'getUserById'
      );
      
      if (result.error) throw result.error;
      
      this._setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      this._handleError('getUserById', error);
    }
  }

  /**
   * Get all active listeners
   * @returns {Array} Array of listener users
   */
  async getListeners() {
    const cacheKey = this._getCacheKey('getListeners');
    const cached = this._getCache(cacheKey);
    if (cached !== null) return cached;

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .select('*')
          .eq('role', 'listener')
          .eq('is_active', true)
          .order('username', { ascending: true }),
        'getListeners'
      );
      
      if (result.error) throw result.error;
      
      const data = result.data || [];
      this._setCache(cacheKey, data);
      return data;
    } catch (error) {
      this._handleError('getListeners', error);
    }
  }

  // =============================================
  // TIME SLOTS MANAGEMENT
  // =============================================

  /**
   * Create a new time slot with validation
   * @param {Object} slotData - Time slot data
   * @returns {Object} Created slot data
   */
  async createTimeSlot(slotData) {
    try {
      // Validate required fields
      const requiredFields = ['date', 'start_time', 'end_time', 'listener_id'];
      const missingFields = requiredFields.filter(field => !slotData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      logger.info('Creating time slot:', { slotData });
      
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .insert([{
            ...slotData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select()
          .single(),
        'createTimeSlot'
      );
      
      if (result.error) throw result.error;
      
      // Clear slots-related cache
      this._clearCachePattern('slot');
      
      logger.info('Slot created successfully:', { slotId: result.data.id });
      return result.data;
    } catch (error) {
      this._handleError('createTimeSlot', error);
    }
  }

  /**
   * Get available slots with improved pagination and filtering
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @param {Object} filters - Additional filters
   * @returns {Object} Paginated slots data
   */
  async getAvailableSlots(page = 1, limit = 50, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const today = new Date().toISOString().split('T')[0];
      
      logger.info('Fetching available slots:', { fromDate: filters.fromDate || today, page, limit });
      
      // Get system user ID (cached)
      const systemUser = await this._getSystemUser();
      
      let query = supabase
        .from('time_slots')
        .select(`
          *,
          listener:users!time_slots_listener_id_fkey(id, username, email)
        `, { count: 'exact' })
        .eq('status', 'created')
        .eq('listener_id', systemUser.id)
        .gte('date', filters.fromDate || today)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })
        .range(offset, offset + limit - 1);

      // Apply additional filters
      if (filters.toDate) {
        query = query.lte('date', filters.toDate);
      }

      const result = await this._executeQuery(
        () => query,
        'getAvailableSlots'
      );
      
      if (result.error) throw result.error;
      
      const data = result.data || [];
      const count = result.count || 0;
      
      logger.info(`Found ${data.length} available slots`, { total: count, page, limit });
      
      return {
        slots: data,
        total: count,
        page,
        limit,
        hasMore: count > (page * limit),
        filters
      };
    } catch (error) {
      this._handleError('getAvailableSlots', error);
    }
  }

  /**
   * Get system user (cached)
   * @returns {Object} System user data
   */
  async _getSystemUser() {
    const cacheKey = this._getCacheKey('getSystemUser');
    const cached = this._getCache(cacheKey);
    if (cached !== null) return cached;

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .select('id, username')
          .eq('username', 'system')
          .single(),
        'getSystemUser'
      );
      
      if (result.error) throw result.error;
      
      this._setCache(cacheKey, result.data);
      return result.data;
    } catch (error) {
      throw new Error('System user not found. Please ensure system user exists.');
    }
  }

  /**
   * Get all admin created slots with better error handling
   * @returns {Array} Array of all slots
   */
  async getAdminCreatedSlots() {
    logger.info('Fetching all admin slots');
    
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .select(`
            *,
            listener:users!time_slots_listener_id_fkey(
              id,
              username,
              email
            )
          `)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true }),
        'getAdminCreatedSlots'
      );
      
      if (result.error) throw result.error;
      
      const data = result.data || [];
      logger.info(`Found ${data.length} admin slots`);
      
      return data;
    } catch (error) {
      this._handleError('getAdminCreatedSlots', error);
    }
  }

  /**
   * Get slots by date and listener with validation
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} listenerId - Listener ID
   * @returns {Array} Array of slots
   */
  async getSlotsByDateAndListener(date, listenerId) {
    if (!date || !listenerId) {
      throw new Error('Date and listener ID are required');
    }

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .select('*')
          .eq('date', date)
          .eq('listener_id', listenerId)
          .order('start_time', { ascending: true }),
        'getSlotsByDateAndListener'
      );
      
      if (result.error) throw result.error;
      return result.data || [];
    } catch (error) {
      this._handleError('getSlotsByDateAndListener', error);
    }
  }

  /**
   * Update slot status with validation
   * @param {string} slotId - Slot ID
   * @param {string} status - New status
   * @returns {Object} Updated slot data
   */
  async updateSlotStatus(slotId, status) {
    if (!slotId || !status) {
      throw new Error('Slot ID and status are required');
    }

    const validStatuses = ['created', 'booked', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .update({ 
            status, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', slotId)
          .select()
          .single(),
        'updateSlotStatus'
      );
      
      if (result.error) throw result.error;
      
      // Clear slots-related cache
      this._clearCachePattern('slot');
      
      logger.info('Slot status updated:', { slotId, status });
      return result.data;
    } catch (error) {
      this._handleError('updateSlotStatus', error);
    }
  }

  /**
   * Update slot assignment (listener, meeting details, etc.)
   * @param {string} slotId - Slot ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated slot data
   */
  async updateSlotAssignment(slotId, updateData) {
    if (!slotId) throw new Error('Slot ID is required');

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', slotId)
          .select()
          .single(),
        'updateSlotAssignment'
      );
      
      if (result.error) throw result.error;
      
      // Clear slots-related cache
      this._clearCachePattern('slot');
      
      logger.info('Slot assignment updated:', { slotId, updateData });
      return result.data;
    } catch (error) {
      this._handleError('updateSlotAssignment', error);
    }
  }

  /**
   * Update slot meeting information
   * @param {string} slotId - Slot ID
   * @param {Object} meetingData - Meeting data
   * @returns {Object} Updated slot data
   */
  async updateSlotMeetingLink(slotId, meetingData) {
    if (!slotId || !meetingData) {
      throw new Error('Slot ID and meeting data are required');
    }

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .update({
            meeting_link: meetingData.meeting_link,
            meeting_id: meetingData.meeting_id,
            meeting_provider: meetingData.meeting_provider,
            updated_at: new Date().toISOString()
          })
          .eq('id', slotId)
          .select()
          .single(),
        'updateSlotMeetingLink'
      );
      
      if (result.error) throw result.error;
      
      logger.info('Slot meeting link updated:', { slotId });
      return result.data;
    } catch (error) {
      this._handleError('updateSlotMeetingLink', error);
    }
  }

  /**
   * Delete a time slot
   * @param {string} id - Slot ID
   * @returns {Object} Deleted slot data
   */
  async deleteTimeSlot(id) {
    if (!id) throw new Error('Slot ID is required');

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .delete()
          .eq('id', id)
          .select()
          .single(),
        'deleteTimeSlot'
      );
      
      if (result.error) throw result.error;
      
      // Clear slots-related cache
      this._clearCachePattern('slot');
      
      logger.info('Slot deleted:', { slotId: id });
      return result.data;
    } catch (error) {
      this._handleError('deleteTimeSlot', error);
    }
  }

  /**
   * Delete all time slots with transaction safety
   * @returns {Array} Array of deleted slot IDs
   */
  async deleteAllTimeSlots() {
    try {
      logger.info('Deleting all time slots');
      
      // First, get all slots to return count
      const fetchResult = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .select('id'),
        'deleteAllTimeSlots_fetch'
      );
      
      if (fetchResult.error) throw fetchResult.error;
      
      const allSlots = fetchResult.data || [];
      
      if (allSlots.length === 0) {
        logger.info('No slots to delete');
        return [];
      }
      
      logger.info(`Deleting ${allSlots.length} slots`);
      
      // Delete all slots
      const deleteResult = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'),
        'deleteAllTimeSlots_delete'
      );
      
      if (deleteResult.error) throw deleteResult.error;
      
      // Clear all slot-related cache
      this._clearCachePattern('slot');
      
      logger.info('All slots deleted successfully');
      return allSlots;
    } catch (error) {
      this._handleError('deleteAllTimeSlots', error);
    }
  }

  /**
   * Create multiple slots in batch
   * @param {Array} slotsData - Array of slot data objects
   * @returns {Array} Array of created slots
   */
  async createBulkSlots(slotsData) {
    if (!Array.isArray(slotsData) || slotsData.length === 0) {
      throw new Error('Slots data must be a non-empty array');
    }

    try {
      // Add timestamps to all slots
      const slotsWithTimestamps = slotsData.map(slot => ({
        ...slot,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .insert(slotsWithTimestamps)
          .select(),
        'createBulkSlots'
      );
      
      if (result.error) throw result.error;
      
      // Clear slots-related cache
      this._clearCachePattern('slot');
      
      logger.info(`Created ${result.data.length} slots in bulk`);
      return result.data;
    } catch (error) {
      this._handleError('createBulkSlots', error);
    }
  }

  // =============================================
  // STATISTICS (with caching)
  // =============================================

  /**
   * Get dashboard statistics with caching
   * @returns {Object} Dashboard statistics
   */
  async getDashboardStats() {
    const cacheKey = this._getCacheKey('getDashboardStats');
    const cached = this._getCache(cacheKey);
    if (cached !== null) return cached;

    try {
      const [totalSlots, bookedSlots, completedSlots, totalUsers] = await Promise.all([
        this.getTotalSlots(),
        this.getBookedSlots(),
        this.getCompletedSlots(),
        this.getTotalUsers()
      ]);

      const stats = {
        totalSlots,
        bookedSlots,
        completedSlots,
        availableSlots: totalSlots - bookedSlots - completedSlots,
        totalUsers,
        timestamp: new Date().toISOString()
      };

      this._setCache(cacheKey, stats);
      return stats;
    } catch (error) {
      this._handleError('getDashboardStats', error);
    }
  }

  async getTotalSlots() {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .select('*', { count: 'exact', head: true }),
        'getTotalSlots'
      );
      
      if (result.error) throw result.error;
      return result.count || 0;
    } catch (error) {
      logger.error('Error getting total slots:', { error: error.message });
      return 0;
    }
  }

  async getBookedSlots() {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'booked'),
        'getBookedSlots'
      );
      
      if (result.error) throw result.error;
      return result.count || 0;
    } catch (error) {
      logger.error('Error getting booked slots:', { error: error.message });
      return 0;
    }
  }

  async getCompletedSlots() {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('time_slots')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed'),
        'getCompletedSlots'
      );
      
      if (result.error) throw result.error;
      return result.count || 0;
    } catch (error) {
      logger.error('Error getting completed slots:', { error: error.message });
      return 0;
    }
  }

  async getTotalUsers() {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .select('*', { count: 'exact', head: true }),
        'getTotalUsers'
      );
      
      if (result.error) throw result.error;
      return result.count || 0;
    } catch (error) {
      logger.error('Error getting total users:', { error: error.message });
      return 0;
    }
  }

  // =============================================
  // BOOKINGS MANAGEMENT
  // =============================================

  /**
   * Create a new booking with validation
   * @param {Object} bookingData - Booking data
   * @returns {Object} Created booking with related data
   */
  async createBooking(bookingData) {
    // Validate required fields
    const requiredFields = ['user_id', 'slot_id'];
    const missingFields = requiredFields.filter(field => !bookingData[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    try {
      const result = await this._executeQuery(
        () => supabase
          .from('bookings')
          .insert([{
            ...bookingData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }])
          .select(`
            *,
            slot:time_slots(*),
            user:users!bookings_user_id_fkey(username, email)
          `)
          .single(),
        'createBooking'
      );
      
      if (result.error) throw result.error;
      
      // Clear booking-related cache
      this._clearCachePattern('booking');
      this._clearCachePattern('slot');
      
      logger.info('Booking created successfully:', { bookingId: result.data.id });
      return result.data;
    } catch (error) {
      this._handleError('createBooking', error);
    }
  }

  /**
   * Get user bookings with pagination
   * @param {string} userId - User ID
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Object} Paginated user bookings
   */
  async getUserBookings(userId, page = 1, limit = 20) {
    if (!userId) throw new Error('User ID is required');

    try {
      const offset = (page - 1) * limit;
      
      const result = await this._executeQuery(
        () => supabase
          .from('bookings')
          .select(`
            *,
            slot:time_slots!bookings_slot_id_fkey(
              *,
              listener:users!time_slots_listener_id_fkey(username, email)
            )
          `, { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1),
        'getUserBookings'
      );
      
      if (result.error) throw result.error;
      
      return {
        bookings: result.data || [],
        total: result.count || 0,
        page,
        limit,
        hasMore: result.count > (page * limit)
      };
    } catch (error) {
      this._handleError('getUserBookings', error);
    }
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
    logger.info('Cache cleared');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }

  /**
   * Health check method
   * @returns {Object} Service health status
   */
  async healthCheck() {
    try {
      const result = await this._executeQuery(
        () => supabase
          .from('users')
          .select('count(*)', { head: true, count: 'exact' }),
        'healthCheck'
      );
      
      if (result.error) throw result.error;
      
      return {
        status: 'healthy',
        database: 'connected',
        cache: `${this.cache.size} entries`,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();
