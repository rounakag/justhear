const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Backend API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API endpoints
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
      { id: 1, username: 'admin', email: 'admin@justhear.com', role: 'admin' },
      { id: 2, username: 'listener1', email: 'listener1@justhear.com', role: 'listener' },
      { id: 3, username: 'user1', email: 'user1@justhear.com', role: 'user' }
    ],
    total: 3
  });
});

app.get('/api/slots', (req, res) => {
  res.json({
    slots: [
      { id: 1, listener_id: 2, date: '2024-01-15', start_time: '10:00:00', end_time: '11:00:00', status: 'available', price: 25.00 },
      { id: 2, listener_id: 2, date: '2024-01-15', start_time: '14:00:00', end_time: '15:00:00', status: 'booked', price: 25.00 },
      { id: 3, listener_id: 2, date: '2024-01-16', start_time: '09:00:00', end_time: '10:00:00', status: 'available', price: 25.00 }
    ],
    total: 3
  });
});

app.get('/api/bookings', (req, res) => {
  res.json({
    bookings: [
      { id: 1, user_id: 3, slot_id: 2, status: 'confirmed', created_at: new Date().toISOString() },
      { id: 2, user_id: 3, slot_id: 3, status: 'pending', created_at: new Date().toISOString() }
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
      user: { id: 1, username: 'admin', email: 'admin@justhear.com', role: 'admin' },
      token: 'mock-jwt-token-admin'
    });
  } else if (email === 'user1@justhear.com' && password === 'admin123') {
    res.json({
      message: 'Login successful',
      user: { id: 3, username: 'user1', email: 'user1@justhear.com', role: 'user' },
      token: 'mock-jwt-token-user'
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/signup', (req, res) => {
  const { username, email, password, role } = req.body;
  
  res.json({
    message: 'User created successfully',
    user: { id: Math.floor(Math.random() * 1000) + 4, username, email, role: role || 'user' },
    token: 'mock-jwt-token-new-user'
  });
});

// Serve test.html
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>JustHear Backend Test</title></head>
    <body>
      <h1>JustHear Backend API</h1>
      <p>Server is running on port ${PORT}</p>
      <p><a href="/health">Health Check</a></p>
      <p><a href="/api/health">API Health</a></p>
    </body>
    </html>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
