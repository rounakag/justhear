const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoints - serve JSON files
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

app.get('/api/users', (req, res) => {
  res.json({
    users: [
      {
        id: 1,
        username: 'admin',
        email: 'admin@justhear.com',
        role: 'admin',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'listener1',
        email: 'listener1@justhear.com',
        role: 'listener',
        status: 'active',
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        username: 'user1',
        email: 'user1@justhear.com',
        role: 'user',
        status: 'active',
        created_at: new Date().toISOString()
      }
    ],
    total: 3
  });
});

app.get('/api/slots', (req, res) => {
  res.json({
    slots: [
      {
        id: 1,
        listener_id: 2,
        date: '2024-01-15',
        start_time: '10:00:00',
        end_time: '11:00:00',
        status: 'available',
        price: 25.00,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        listener_id: 2,
        date: '2024-01-15',
        start_time: '14:00:00',
        end_time: '15:00:00',
        status: 'booked',
        price: 25.00,
        created_at: new Date().toISOString()
      },
      {
        id: 3,
        listener_id: 2,
        date: '2024-01-16',
        start_time: '09:00:00',
        end_time: '10:00:00',
        status: 'available',
        price: 25.00,
        created_at: new Date().toISOString()
      }
    ],
    total: 3
  });
});

app.get('/api/bookings', (req, res) => {
  res.json({
    bookings: [
      {
        id: 1,
        user_id: 3,
        listener_id: 2,
        time_slot_id: 2,
        status: 'confirmed',
        payment_status: 'paid',
        payment_amount: 25.00,
        transaction_id: 'txn_123456789',
        meeting_link: 'https://meet.google.com/abc-defg-hij',
        created_at: new Date().toISOString(),
        session_date: '2024-01-15',
        session_time: '14:00:00'
      },
      {
        id: 2,
        user_id: 3,
        listener_id: 2,
        time_slot_id: 3,
        status: 'upcoming',
        payment_status: 'paid',
        payment_amount: 25.00,
        transaction_id: 'txn_987654321',
        meeting_link: 'https://meet.google.com/xyz-uvw-rst',
        created_at: new Date().toISOString(),
        session_date: '2024-01-16',
        session_time: '09:00:00'
      }
    ],
    total: 2
  });
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@justhear.com' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@justhear.com',
        role: 'admin'
      },
      token: 'mock-jwt-token-admin'
    });
  } else if (email === 'user1@justhear.com' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      user: {
        id: 3,
        username: 'user1',
        email: 'user1@justhear.com',
        role: 'user'
      },
      token: 'mock-jwt-token-user'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  
  res.status(201).json({
    message: 'User created successfully',
    user: {
      id: Math.floor(Math.random() * 1000) + 4,
      username,
      email,
      role
    },
    token: 'mock-jwt-token-new-user'
  });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'test.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
