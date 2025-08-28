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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Get available slots - SIMPLIFIED VERSION
app.get('/api/slots/available', async (req, res) => {
  try {
    console.log('🔍 DEBUG - Fetching available slots...');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Simple query without complex joins
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('status', 'created')
      .gte('date', today)
      .order('date', { ascending: true })
      .order('start_time', { ascending: true })
      .limit(50);
    
    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch slots',
        timestamp: new Date().toISOString()
      });
    }
    
    // Transform slots for frontend compatibility
    const transformedSlots = (data || []).map(slot => ({
      ...slot,
      status: 'available', // Always show as available for frontend
      listener: {
        id: slot.listener_id,
        username: 'listener1',
        email: 'listener1@justhear.com'
      }
    }));
    
    console.log(`✅ Found ${transformedSlots.length} slots`);
    
    res.json({
      success: true,
      slots: transformedSlots,
      pagination: {
        page: 1,
        limit: 50,
        total: transformedSlots.length,
        hasMore: false
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// Create slot endpoint
app.post('/api/slots', async (req, res) => {
  try {
    const { date, startTime, endTime, price = 50 } = req.body;
    
    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        timestamp: new Date().toISOString()
      });
    }
    
    const slotData = {
      date,
      start_time: startTime,
      end_time: endTime,
      status: 'created',
      listener_id: '6e3c13df-4294-4678-a9e6-afc4a350ef0f', // listener1
      duration_minutes: 60,
      price
    };
    
    const { data, error } = await supabase
      .from('time_slots')
      .insert([slotData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating slot:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to create slot',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Slot created successfully',
      data,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
