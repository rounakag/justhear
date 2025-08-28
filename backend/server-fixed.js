const express = require('express');
const cors = require('cors');
const { supabase } = require('./config/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Helper function to calculate duration in minutes
function calculateDuration(startTime, endTime) {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  return (endHour * 60 + endMin) - (startHour * 60 + startMin);
}

// Error handling class
class APIError extends Error {
  constructor(message, statusCode = 500, type = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
  }
}

// Global error handler
const handleAPIError = (error, req, res) => {
  console.error(`API Error [${req.method} ${req.path}]:`, error);
  
  if (error instanceof APIError) {
    return res.status(error.statusCode).json({
      error: error.message,
      type: error.type,
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Database errors
  if (error.code?.startsWith('P')) {
    return res.status(400).json({
      error: 'Database operation failed',
      type: 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
      path: req.path
    });
  }
  
  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    type: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    path: req.path
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get available slots
app.get('/api/slots/available', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('🔍 DEBUG - Fetching available slots from date:', today);
    
    // Get system user ID
    const { data: systemUser, error: systemError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'system')
      .single();
    
    if (systemError) {
      console.error('System user error:', systemError);
      throw new APIError('System configuration error', 500, 'CONFIG_ERROR');
    }
    
    const { data, error, count } = await supabase
      .from('time_slots')
      .select(`
        *,
        listener:users!time_slots_listener_id_fkey(id, username, email)
      `, { count: 'exact' })
      .eq('status', 'created')
      .eq('listener_id', systemUser.id)
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Database error in getAvailableSlots:', error);
      throw new APIError('Failed to fetch available slots', 500, 'DATABASE_ERROR');
    }
    
    res.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        hasMore: count > (page * limit)
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Create slot endpoint
app.post('/api/slots', async (req, res, next) => {
  try {
    const { date, startTime, endTime, price = 50 } = req.body;
    
    // Validation
    if (!date || !startTime || !endTime) {
      throw new APIError('Missing required fields: date, startTime, endTime', 400, 'VALIDATION_ERROR');
    }
    
    // Get system user ID
    const { data: systemUser, error: systemError } = await supabase
      .from('users')
      .select('id')
      .eq('username', 'system')
      .single();
    
    if (systemError) {
      throw new APIError('System configuration error', 500, 'CONFIG_ERROR');
    }
    
    const slotData = {
      date,
      start_time: startTime,
      end_time: endTime,
      status: 'created',
      listener_id: systemUser.id,
      duration_minutes: calculateDuration(startTime, endTime),
      price
    };
    
    const { data, error } = await supabase
      .from('time_slots')
      .insert([slotData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating slot:', error);
      throw new APIError('Failed to create slot', 500, 'DATABASE_ERROR');
    }
    
    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    next(error);
  }
});

// Global error handler
app.use((error, req, res, next) => {
  handleAPIError(error, req, res);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    type: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
