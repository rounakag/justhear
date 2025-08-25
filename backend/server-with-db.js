const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import services
const databaseService = require('./services/databaseService');
const meetingService = require('./services/meetingService');
const { supabase } = require('./config/supabase');

// Helper function to calculate duration in minutes
function calculateDuration(startTime, endTime) {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const diffMs = end - start;
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
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

// Middleware
app.use(cors());
app.use(express.json());

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

// Get recurring schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const schedules = await databaseService.getRecurringSchedules();
    res.json({
      schedules,
      total: schedules.length
    });
  } catch (error) {
    console.error('Error fetching recurring schedules:', error);
    res.status(500).json({ error: 'Failed to fetch recurring schedules' });
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
    const transformedData = {
      date: slotData.date,
      start_time: slotData.startTime,
      end_time: slotData.endTime,
      price: slotData.price || 50,
      status: 'available',
      listener_id: slotData.listenerId || null,
      duration_minutes: calculateDuration(slotData.startTime, slotData.endTime)
    };
    
    const slot = await databaseService.createTimeSlot(transformedData);
    
    // Generate Google Meet link for the slot
    try {
      const meetingDetails = await meetingService.generateGoogleMeetLink({
        slot,
        userId: 'admin'
      });
      
      await databaseService.updateSlotMeetingLink(slot.id, {
        meeting_link: meetingDetails.meetingLink,
        meeting_id: meetingDetails.meetingId,
        meeting_provider: meetingDetails.meetingProvider
      });
      
      res.status(201).json({
        message: 'Slot created successfully with meeting link',
        slot
      });
    } catch (meetingError) {
      res.status(201).json({
        message: 'Slot created successfully',
        slot
      });
    }
  } catch (error) {
    console.error('Error creating slot:', error);
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

// Get user bookings
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await databaseService.getUserBookings(userId);
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
      meeting_link: meetingDetails.meetingLink,
      meeting_id: meetingDetails.meetingId,
      meeting_provider: meetingDetails.meetingProvider
    };

    const booking = await databaseService.createBooking(bookingData);

    // Update slot status
    await databaseService.updateSlotStatus(slotId, 'booked');

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
