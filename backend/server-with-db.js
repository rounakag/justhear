const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import services
const databaseService = require('./services/databaseService');
const meetingService = require('./services/meetingService');
const { supabase } = require('./config/supabase');

// Helper function to calculate duration in minutes with validation
function calculateDuration(startTime, endTime) {
  // Input validation
  if (!startTime || !endTime) {
    throw new Error('Start time and end time are required');
  }
  
  // Validate time format (HH:MM or HH:MM:SS)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error('Invalid time format. Expected HH:MM or HH:MM:SS');
  }
  
  try {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error('Invalid time values');
    }
    
    const diffMs = end - start;
    
    if (diffMs <= 0) {
      throw new Error('End time must be after start time');
    }
    
    return Math.round(diffMs / (1000 * 60)); // Convert to minutes
  } catch (error) {
    throw new Error(`Duration calculation failed: ${error.message}`);
  }
}

// Helper function to generate slots from bulk data
function generateSlotsFromBulkData(bulkData) {
  const slots = [];
  const startDate = new Date(bulkData.startDate);
  const endDate = new Date(bulkData.endDate);
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay();
    
    if (bulkData.daysOfWeek.includes(dayOfWeek)) {
      const slotDate = date.toISOString().split('T')[0];
      
      const slot = {
        date: slotDate,
        start_time: bulkData.startTime,
        end_time: bulkData.endTime,
        price: bulkData.price || 50,
        status: 'available',
        listener_id: bulkData.listenerId || null,
        duration_minutes: calculateDuration(bulkData.startTime, bulkData.endTime)
      };
      slots.push(slot);
    }
  }
  
  return slots;
}

const app = express();
const PORT = process.env.PORT || 5001;

// Security middleware
app.use((req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Rate limiting (relaxed for development)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 1 * 60 * 1000; // 1 minute
const MAX_REQUESTS = 1000; // 1000 requests per minute (much higher)

app.use((req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(clientIP)) {
    requestCounts.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  } else {
    const clientData = requestCounts.get(clientIP);
    if (now > clientData.resetTime) {
      clientData.count = 1;
      clientData.resetTime = now + RATE_LIMIT_WINDOW;
    } else {
      clientData.count++;
    }
    
    if (clientData.count > MAX_REQUESTS) {
      console.log(`⚠️ Rate limit exceeded for IP: ${clientIP}, count: ${clientData.count}`);
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }
  }
  
  next();
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'https://justhear.onrender.com', 'https://justhear-frontend.onrender.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  console.log(`🔍 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API is running with Supabase!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running with Supabase!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '2.0.0'
  });
});

// Get available slots
app.get('/api/slots', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching available slots');
    
    const slots = await databaseService.getAvailableSlots();
    
    console.log('🔍 DEBUG - Retrieved', slots.length, 'available slots');
    
    res.json({
      slots,
      total: slots.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ ERROR fetching slots:', error);
    
    // Enhanced error response
    const errorResponse = {
      error: 'Failed to fetch slots',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path
    };
    
    res.status(500).json(errorResponse);
  }
});

// Get admin-created slots (for users)
app.get('/api/slots/admin-created', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching admin-created slots for users');
    
    // Add rate limiting check (basic implementation)
    const clientIP = req.ip || req.connection.remoteAddress;
    console.log('🔍 DEBUG - Request from IP:', clientIP);
    
    const slots = await databaseService.getAdminCreatedSlots();
    
    console.log('🔍 DEBUG - Retrieved', slots.length, 'admin-created slots');
    console.log('🔍 DEBUG - Sample slots:', slots?.slice(0, 3).map(s => ({ 
      id: s.id, 
      date: s.date, 
      status: s.status, 
      listener_id: s.listener_id 
    })));
    
    res.json({
      slots,
      total: slots.length,
      timestamp: new Date().toISOString(),
      cached: false // For future caching implementation
    });
  } catch (error) {
    console.error('❌ ERROR fetching admin-created slots:', error);
    
    // Enhanced error response
    const errorResponse = {
      error: 'Failed to fetch admin-created slots',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path
    };
    
    res.status(500).json(errorResponse);
  }
});

// Get all available slots for users (including unassigned ones)
app.get('/api/slots/available', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching all available slots for users');
    
    const slots = await databaseService.getAvailableSlots();
    
    console.log('🔍 DEBUG - Retrieved', slots.length, 'available slots');
    
    res.json({
      slots,
      total: slots.length,
      timestamp: new Date().toISOString(),
      cached: false
    });
  } catch (error) {
    console.error('❌ ERROR fetching available slots:', error);
    
    const errorResponse = {
      error: 'Failed to fetch available slots',
      message: error.message,
      timestamp: new Date().toISOString(),
      path: req.path
    };
    
    res.status(500).json(errorResponse);
  }
});

// Get recurring schedules
app.get('/api/schedules', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching recurring schedules');
    const schedules = await databaseService.getRecurringSchedules();
    console.log('🔍 DEBUG - Found schedules:', schedules?.length || 0);
    res.json({
      schedules: schedules || [],
      total: schedules?.length || 0
    });
  } catch (error) {
    console.error('❌ ERROR fetching recurring schedules:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recurring schedules',
      message: error.message 
    });
  }
});

// Get admin stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching admin stats');
    
    // Get basic stats
    const totalSlots = await databaseService.getTotalSlots();
    const bookedSlots = await databaseService.getBookedSlots();
    const completedSlots = await databaseService.getCompletedSlots();
    const totalUsers = await databaseService.getTotalUsers();
    
    const stats = {
      totalSlots: totalSlots || 0,
      bookedSlots: bookedSlots || 0,
      completedSlots: completedSlots || 0,
      availableSlots: (totalSlots || 0) - (bookedSlots || 0),
      totalUsers: totalUsers || 0,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 DEBUG - Admin stats:', stats);
    
    res.json(stats);
  } catch (error) {
    console.error('❌ ERROR fetching admin stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch admin stats',
      message: error.message 
    });
  }
});

// Get slots by listener (admin only)
app.get('/api/slots/listener/:listenerId', async (req, res) => {
  try {
    const { listenerId } = req.params;
    const slots = await databaseService.getSlotsByListener(listenerId);
    res.json({
      slots,
      total: slots.length
    });
  } catch (error) {
    console.error('Error fetching listener slots:', error);
    res.status(500).json({ error: 'Failed to fetch listener slots' });
  }
});

// Create time slot (admin/listener only)
app.post('/api/slots', async (req, res) => {
  try {
    const slotData = req.body;
    console.log('Received slot data:', slotData);
    
    // Validate required fields
    if (!slotData.date || !slotData.startTime || !slotData.endTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: date, startTime, endTime' 
      });
    }
    
    // Transform data to match database schema
    // Admin creates unassigned slots - listener_id is null until booked
    const transformedData = {
      date: slotData.date,
      start_time: slotData.startTime,
      end_time: slotData.endTime,
      status: 'created',
      listener_id: null, // Start as unassigned - will be assigned when booked
      duration_minutes: calculateDuration(slotData.startTime, slotData.endTime)
    };
    
    console.log('🔍 DEBUG - Creating slot with data:', transformedData);
    
    const slot = await databaseService.createTimeSlot(transformedData);
    
    // Generate Google Meet link for the slot
    try {
      console.log('🔍 DEBUG - Generating Google Meet link for slot:', slot.id);
      
      const meetingDetails = await meetingService.generateGoogleMeetLink({
        slot,
        userId: 'admin'
      });
      
      console.log('🔍 DEBUG - Generated meeting details:', meetingDetails);
      
      const updatedSlot = await databaseService.updateSlotMeetingLink(slot.id, {
        meeting_link: meetingDetails.meetingLink,
        meeting_id: meetingDetails.meetingId,
        meeting_provider: meetingDetails.meetingProvider
      });
      
      console.log('🔍 DEBUG - Updated slot with meeting link:', updatedSlot);
      
      res.status(201).json({
        message: 'Slot created successfully with meeting link',
        slot: updatedSlot
      });
    } catch (meetingError) {
      console.error('🔍 DEBUG - Error generating meeting link:', meetingError);
      res.status(201).json({
        message: 'Slot created successfully (without meeting link)',
        slot
      });
    }
  } catch (error) {
    console.error('Error creating slot:', error);
    
    // Handle specific overlap error with user-friendly message
    if (error.message && error.message.includes('Slot overlaps with existing slot')) {
      return res.status(400).json({ 
        error: 'Slot overlaps with existing slot for this listener on the same date. Please choose a different time or date.',
        type: 'overlap_error',
        details: 'The selected time conflicts with an existing slot for the same listener. Each listener can only have one slot at a time.'
      });
    }
    
    // Handle other database constraint errors
    if (error.code === 'P0001' || error.message.includes('violates check constraint')) {
      return res.status(400).json({ 
        error: 'Invalid slot data. Please check the time and date values.',
        type: 'validation_error',
        details: error.message
      });
    }
    
    res.status(500).json({ 
      error: `Failed to create slot: ${error.message}`,
      details: error.details || error.hint || error.code
    });
  }
});

// Bulk create slots (admin only)
// Create bulk slots (DISABLED FOR NOW)
app.post('/api/slots/bulk', async (req, res) => {
  res.status(403).json({ error: 'Bulk slot creation is temporarily disabled' });
});

// Delete slot
app.delete('/api/slots/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate slot ID
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'Invalid slot ID' });
    }
    
    console.log('🔍 DEBUG - Deleting slot with ID:', id);
    
    const deletedSlot = await databaseService.deleteTimeSlot(id);
    
    if (!deletedSlot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    
    res.json({ message: 'Slot deleted successfully', deletedSlot });
  } catch (error) {
    console.error('Error deleting slot:', error);
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

// Mark slot as completed
app.put('/api/slots/:id/completed', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || id === 'undefined' || id === 'null') {
      return res.status(400).json({ error: 'Invalid slot ID' });
    }
    
    console.log('🔍 DEBUG - Marking slot as completed:', id);
    
    const updatedSlot = await databaseService.markSlotAsDone(id);
    
    res.json({ 
      message: 'Slot marked as completed successfully', 
      slot: updatedSlot 
    });
  } catch (error) {
    console.error('Error marking slot as completed:', error);
    res.status(500).json({ error: 'Failed to mark slot as completed' });
  }
});

// Auto-complete past slots (cron job endpoint)
app.post('/api/slots/auto-complete', async (req, res) => {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    
    // Get all booked slots that are in the past
    const { data: pastSlots, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('status', 'booked')
      .or(`date.lt.${currentDate},and(date.eq.${currentDate},end_time.lt.${currentTime})`)
      .order('date', { ascending: true })
      .order('end_time', { ascending: true });
    
    if (error) {
      console.error('Error fetching past slots:', error);
      return res.status(500).json({ error: 'Failed to fetch past slots' });
    }
    
    if (!pastSlots || pastSlots.length === 0) {
      return res.json({
        message: 'No past slots to complete',
        completedCount: 0
      });
    }
    
    // Update all past slots to completed status
    const { data: updatedSlots, error: updateError } = await supabase
      .from('time_slots')
      .update({ status: 'completed' })
      .in('id', pastSlots.map(slot => slot.id))
      .select();
    
    if (updateError) {
      console.error('Error updating past slots:', updateError);
      return res.status(500).json({ error: 'Failed to update past slots' });
    }
    
    console.log(`Auto-completed ${updatedSlots.length} past slots`);
    
    res.json({
      message: 'Past slots auto-completed successfully',
      completedCount: updatedSlots.length,
      slots: updatedSlots
    });
  } catch (error) {
    console.error('Error in auto-complete slots:', error);
    res.status(500).json({ error: 'Failed to auto-complete slots' });
  }
});

// Delete all slots (cleanup)
app.delete('/api/slots', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Deleting all slots');
    
    const deletedSlots = await databaseService.deleteAllTimeSlots();
    
    console.log('🔍 DEBUG - Deleted slots count:', deletedSlots.length);
    
    res.json({ message: 'All slots deleted successfully', count: deletedSlots.length });
  } catch (error) {
    console.error('Error deleting all slots:', error);
    res.status(500).json({ error: 'Failed to delete all slots' });
  }
});

// Check username availability
app.post('/api/users/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const existingUser = await databaseService.getUserByUsername(username);
    const available = !existingUser;
    
    res.json({ available });
  } catch (error) {
    console.error('Error checking username availability:', error);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
});

// Get user bookings
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const rawBookings = await databaseService.getUserBookings(userId);
    
    // Transform the data to match frontend expectations
    const bookings = rawBookings.map(booking => ({
      id: booking.id,
      slotId: booking.slot_id,
      userId: booking.user_id,
      listenerId: booking.slot?.listener_id || '',
      listenerName: booking.slot?.listener?.username || 'Anonymous Listener',
      listenerAvatar: booking.slot?.listener?.avatar,
      date: booking.slot?.date || '',
      startTime: booking.slot?.start_time || '',
      endTime: booking.slot?.end_time || '',
      status: booking.status,
      price: booking.slot?.price || 0,
      currency: 'USD',
      timezone: 'UTC',
      createdAt: booking.created_at,
      updatedAt: booking.updated_at,
      notes: booking.notes,
      transactionId: booking.transaction_id || '',
      meetingLink: booking.meeting_link,
      meetingId: booking.meeting_id,
      meetingProvider: booking.meeting_provider
    }));
    
    console.log('🔍 DEBUG - Transformed bookings:', bookings);
    
    res.json({
      bookings,
      total: bookings.length
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create booking with meeting link
app.post('/api/bookings', async (req, res) => {
  try {
    const { userId, slotId } = req.body;
    
    // Get slot details
    const slots = await databaseService.getAvailableSlots();
    const slot = slots.find(s => s.id === slotId);
    
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found or not available' });
    }

    // Generate meeting link
    const meetingDetails = await meetingService.generateGoogleMeetLink({
      slot,
      userId
    });

    // Create booking
    const bookingData = {
      user_id: userId,
      slot_id: slotId,
      status: 'confirmed',
      meeting_link: slot.meeting_link, // Use existing meeting link from slot
      meeting_id: slot.meeting_id,
      meeting_provider: slot.meeting_provider
    };

    const booking = await databaseService.createBooking(bookingData);

    // Update slot status to booked and assign a listener
    // For now, assign the first available listener (in production, this would be more sophisticated)
    const listeners = await databaseService.getListeners();
    const availableListener = listeners.find(l => l.role === 'listener');
    
    if (availableListener) {
      await databaseService.updateSlotAssignment(slotId, {
        status: 'booked',
        listener_id: availableListener.id
      });
    } else {
      // If no listeners available, just update status
      await databaseService.updateSlotStatus(slotId, 'booked');
    }

    // Send meeting details (in production, this would be email/SMS)
    await meetingService.sendMeetingDetails(booking, meetingDetails);

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
      meetingDetails
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status
app.put('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const updateData = req.body;
    
    const booking = await databaseService.updateBooking(bookingId, updateData);
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Get user reviews
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await databaseService.getUserReviews(userId);
    res.json({
      reviews,
      total: reviews.length
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review
app.post('/api/reviews', async (req, res) => {
  try {
    const reviewData = req.body;
    const review = await databaseService.createReview(reviewData);
    res.status(201).json({
      message: 'Review created successfully',
      review
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review
app.put('/api/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    const updateData = req.body;
    
    const review = await databaseService.updateReview(reviewId, updateData);
    res.json({
      message: 'Review updated successfully',
      review
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
app.delete('/api/reviews/:reviewId', async (req, res) => {
  try {
    const { reviewId } = req.params;
    await databaseService.deleteReview(reviewId);
    res.json({
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Get all users (admin only)
app.get('/api/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get user stats
app.get('/api/users/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const stats = await databaseService.getUserStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// Get user bookings
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await databaseService.getUserBookings(userId);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// Get user reviews
app.get('/api/reviews/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await databaseService.getUserReviews(userId);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ error: 'Failed to fetch user reviews' });
  }
});

// Check username availability
app.post('/api/auth/check-username', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const existingUser = await databaseService.getUserByUsername(username);
    const available = !existingUser;
    
    console.log(`Username check for "${username}": ${available ? 'available' : 'taken'}`);
    res.json({ available });
  } catch (error) {
    console.error('Error checking username:', error);
    // Return available=true as fallback to avoid blocking signup
    res.json({ available: true });
  }
});

// Setup endpoint to create admin user (run once)
app.post('/api/setup/admin', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Check if admin already exists
    const existingAdmin = await databaseService.getUserByUsername('admin');
    if (existingAdmin) {
      // Update existing admin password
      await databaseService.updateUser(existingAdmin.id, { password_hash: hashedPassword });
      res.json({ message: 'Admin password updated successfully' });
    } else {
      // Create new admin user
      const adminData = {
        username: 'admin',
        email: 'admin2@justhear.com',
        password_hash: hashedPassword,
        role: 'admin'
      };
      await databaseService.createUser(adminData);
      res.json({ message: 'Admin user created successfully' });
    }
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// Admin setup endpoint
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const existingAdmin = await databaseService.getUserByUsername('admin');
    if (existingAdmin) {
      return res.json({ message: 'Admin user already exists' });
    }
    
    const adminData = {
      username: 'admin',
      email: 'admin2@justhear.com',
      password_hash: await bcrypt.hash('admin123', 10),
      role: 'admin',
      is_active: true
    };
    
    const adminUser = await databaseService.createUser(adminData);
    res.json({ message: 'Admin user created successfully' });
  } catch (error) {
    console.error('Error setting up admin:', error);
    res.status(500).json({ error: 'Failed to setup admin' });
  }
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email or username
    let user = null;
    
    if (email === 'admin@justhear.com' || email === 'admin2@justhear.com') {
      user = await databaseService.getUserByUsername('admin');
    } else {
      user = await databaseService.getUserByUsername(email);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Check if username already exists
    try {
      const existingUser = await databaseService.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }
    } catch (error) {
      // User doesn't exist, continue
    }
    
    // Generate anonymous email if not provided
    const userEmail = email || `${username}@anonymous.com`;
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user
    const userData = {
      username,
      email: userEmail,
      password_hash: passwordHash,
      role: role || 'user'
    };

    const user = await databaseService.createUser(userData);
    
    // Generate token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      },
      token
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed' });
  }
});

// CMS Content Management API
app.get('/api/cms/content', async (req, res) => {
  try {
    const content = await databaseService.getCMSContent();
    res.json({
      content,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching CMS content:', error);
    res.status(500).json({ error: 'Failed to fetch CMS content' });
  }
});

app.put('/api/cms/content/:section/:field', async (req, res) => {
  try {
    const { section, field } = req.params;
    const { value } = req.body;
    
    if (!value) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    const updatedContent = await databaseService.updateCMSContent(section, field, value);
    
    res.json({
      message: 'Content updated successfully',
      content: updatedContent,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating CMS content:', error);
    res.status(500).json({ error: 'Failed to update CMS content' });
  }
});

app.post('/api/cms/initialize', async (req, res) => {
  try {
    await databaseService.initializeDefaultCMSContent();
    res.json({
      message: 'Default CMS content initialized successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error initializing CMS content:', error);
    res.status(500).json({ error: 'Failed to initialize CMS content' });
  }
});

// Multi-Entry CMS API Endpoints
// Testimonials
app.get('/api/cms/testimonials', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching testimonials from database');
    const testimonials = await databaseService.getTestimonials();
    console.log('🔍 DEBUG - Retrieved testimonials:', testimonials);
    res.json({
      testimonials,
      total: testimonials.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
});

app.post('/api/cms/testimonials', async (req, res) => {
  try {
    const testimonialData = req.body;
    const testimonial = await databaseService.createTestimonial(testimonialData);
    res.status(201).json({
      message: 'Testimonial created successfully',
      testimonial,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
});

app.put('/api/cms/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const testimonialData = req.body;
    const testimonial = await databaseService.updateTestimonial(id, testimonialData);
    res.json({
      message: 'Testimonial updated successfully',
      testimonial,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
});

app.delete('/api/cms/testimonials/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deleteTestimonial(id);
    res.json({
      message: 'Testimonial deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
});

// Features
app.get('/api/cms/features', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching features from database');
    const features = await databaseService.getFeatures();
    console.log('🔍 DEBUG - Retrieved features:', features);
    res.json({
      features,
      total: features.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
});

app.post('/api/cms/features', async (req, res) => {
  try {
    const featureData = req.body;
    const feature = await databaseService.createFeature(featureData);
    res.status(201).json({
      message: 'Feature created successfully',
      feature,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
});

app.put('/api/cms/features/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const featureData = req.body;
    const feature = await databaseService.updateFeature(id, featureData);
    res.json({
      message: 'Feature updated successfully',
      feature,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
});

app.delete('/api/cms/features/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deleteFeature(id);
    res.json({
      message: 'Feature deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
});

// FAQ
app.get('/api/cms/faq', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching FAQs from database');
    const faqs = await databaseService.getFAQs();
    console.log('🔍 DEBUG - Retrieved FAQs:', faqs);
    res.json({
      faqs,
      total: faqs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ error: 'Failed to fetch FAQs' });
  }
});

app.post('/api/cms/faq', async (req, res) => {
  try {
    const faqData = req.body;
    const faq = await databaseService.createFAQ(faqData);
    res.status(201).json({
      message: 'FAQ created successfully',
      faq,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating FAQ:', error);
    res.status(500).json({ error: 'Failed to create FAQ' });
  }
});

app.put('/api/cms/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const faqData = req.body;
    
    console.log('🔍 DEBUG - FAQ update endpoint called:', { id, faqData });
    
    const faq = await databaseService.updateFAQ(id, faqData);
    
    console.log('🔍 DEBUG - FAQ update result:', faq);
    
    const response = {
      message: 'FAQ updated successfully',
      faq,
      timestamp: new Date().toISOString()
    };
    
    console.log('🔍 DEBUG - FAQ update response:', response);
    
    res.json(response);
  } catch (error) {
    console.error('Error updating FAQ:', error);
    res.status(500).json({ error: 'Failed to update FAQ' });
  }
});

app.delete('/api/cms/faq/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deleteFAQ(id);
    res.json({
      message: 'FAQ deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    res.status(500).json({ error: 'Failed to delete FAQ' });
  }
});

// Reach Out
app.get('/api/cms/reachout', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching reach out content from database');
    const reachout = await databaseService.getReachOut();
    console.log('🔍 DEBUG - Retrieved reach out content:', reachout);
    res.json({
      reachout,
      total: reachout.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching reach out content:', error);
    res.status(500).json({ error: 'Failed to fetch reach out content' });
  }
});

app.post('/api/cms/reachout', async (req, res) => {
  try {
    const reachoutData = req.body;
    const reachout = await databaseService.createReachOut(reachoutData);
    res.status(201).json({
      message: 'Reach out content created successfully',
      reachout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating reach out content:', error);
    res.status(500).json({ error: 'Failed to create reach out content' });
  }
});

app.put('/api/cms/reachout/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reachoutData = req.body;
    const reachout = await databaseService.updateReachOut(id, reachoutData);
    res.json({
      message: 'Reach out content updated successfully',
      reachout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating reach out content:', error);
    res.status(500).json({ error: 'Failed to update reach out content' });
  }
});

app.delete('/api/cms/reachout/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deleteReachOut(id);
    res.json({
      message: 'Reach out content deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting reach out content:', error);
    res.status(500).json({ error: 'Failed to delete reach out content' });
  }
});

// Pricing Plans
app.get('/api/cms/pricing', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching pricing plans from database');
    const pricingPlans = await databaseService.getPricingPlans();
    console.log('🔍 DEBUG - Retrieved pricing plans:', pricingPlans);
    res.json({
      pricingPlans,
      total: pricingPlans.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ error: 'Failed to fetch pricing plans' });
  }
});

app.post('/api/cms/pricing', async (req, res) => {
  try {
    const pricingData = req.body;
    const pricingPlan = await databaseService.createPricingPlan(pricingData);
    res.status(201).json({
      message: 'Pricing plan created successfully',
      pricingPlan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating pricing plan:', error);
    res.status(500).json({ error: 'Failed to create pricing plan' });
  }
});

app.put('/api/cms/pricing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const pricingData = req.body;
    const pricingPlan = await databaseService.updatePricingPlan(id, pricingData);
    res.json({
      message: 'Pricing plan updated successfully',
      pricingPlan,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    res.status(500).json({ error: 'Failed to update pricing plan' });
  }
});

app.delete('/api/cms/pricing/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await databaseService.deletePricingPlan(id);
    res.json({
      message: 'Pricing plan deleted successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error deleting pricing plan:', error);
    res.status(500).json({ error: 'Failed to delete pricing plan' });
  }
});

// Serve test.html
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>JustHear Backend Test</title></head>
    <body>
      <h1>JustHear Backend API with Supabase</h1>
      <p>Server is running on port ${PORT}</p>
      <p><a href="/health">Health Check</a></p>
      <p><a href="/api/health">API Health</a></p>
      <p><strong>Database:</strong> Supabase PostgreSQL</p>
      <p><strong>Features:</strong> Real database, Meeting links, User management</p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: Supabase PostgreSQL`);
});
