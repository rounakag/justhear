const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import services
const databaseService = require('./services/databaseService');
const meetingService = require('./services/meetingService');
const { supabase } = require('./config/supabase');

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
    const slots = await databaseService.getAvailableSlots();
    res.json({
      slots,
      total: slots.length
    });
  } catch (error) {
    console.error('Error fetching slots:', error);
    res.status(500).json({ error: 'Failed to fetch slots' });
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
    const slot = await databaseService.createTimeSlot(slotData);
    res.status(201).json({
      message: 'Slot created successfully',
      slot
    });
  } catch (error) {
    console.error('Error creating slot:', error);
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

// Bulk create slots (admin only)
app.post('/api/slots/bulk', async (req, res) => {
  try {
    const { slots } = req.body;
    const createdSlots = await databaseService.createBulkSlots(slots);
    res.status(201).json({
      message: 'Slots created successfully',
      slots: createdSlots,
      total: createdSlots.length
    });
  } catch (error) {
    console.error('Error creating bulk slots:', error);
    res.status(500).json({ error: 'Failed to create slots' });
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
    
    res.json({ available });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
});

// Auth endpoints
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For now, keep admin login as mock (you can add admin to database later)
    if (email === 'admin@justhear.com' && password === 'admin123') {
      res.json({
        message: 'Login successful',
        user: { id: 'admin', username: 'admin', email: 'admin@justhear.com', role: 'admin' },
        token: 'mock-jwt-token-admin'
      });
      return;
    }

    // Try to find user by email or username
    let users;
    if (email.includes('@')) {
      users = await databaseService.getUserByUsername(email.split('@')[0]);
    } else {
      users = await databaseService.getUserByUsername(email);
    }
    
    if (!users) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password hash
    const isValidPassword = await bcrypt.compare(password, users.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: users.id, username: users.username, role: users.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      user: { 
        id: users.id, 
        username: users.username, 
        email: users.email, 
        role: users.role 
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
