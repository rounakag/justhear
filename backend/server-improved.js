const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

// Import utilities and config
const config = require('./config');
const logger = require('./utils/logger');
const asyncHandler = require('./utils/asyncHandler');
const { cacheMiddleware } = require('./utils/cache');
const { validateSlotCreation, validateBooking, validateUUID } = require('./middleware/validation');

// Import services
const databaseService = require('./services/databaseService');
const meetingService = require('./services/meetingService');
const { supabase } = require('./config/supabase');

// Helper function to calculate duration in minutes
function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) {
    throw new Error('Start time and end time are required');
  }
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
    throw new Error('Invalid time format. Expected HH:MM');
  }
  
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid time values');
  }
  
  const diffMs = end - start;
  if (diffMs <= 0) {
    throw new Error('End time must be after start time');
  }
  
  return Math.round(diffMs / (1000 * 60));
}

// Standardized error response utility
class APIError extends Error {
  constructor(message, statusCode = 500, type = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
  }
}

const handleAPIError = (error, req, res) => {
  logger.error(`API Error [${req.method} ${req.path}]:`, { 
    error: error.message, 
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  
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

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    error: config.rateLimit.message,
    type: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString()
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: config.allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', { stream: logger.stream }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health checks
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

app.get('/health/deep', asyncHandler(async (req, res) => {
  const checks = {
    database: false,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  };
  
  try {
    // Test database connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      checks.database = false;
      checks.databaseError = error.message;
    } else {
      checks.database = true;
    }
  } catch (error) {
    checks.database = false;
    checks.databaseError = error.message;
  }
  
  const status = checks.database ? 200 : 503;
  res.status(status).json(checks);
}));

// API Routes

// Get available slots with caching
app.get('/api/slots/available', cacheMiddleware(300), asyncHandler(async (req, res) => {
  logger.info('Fetching available slots', { ip: req.ip });
  
  const { page = 1, limit = 50 } = req.query;
  const result = await databaseService.getAvailableSlots(parseInt(page), parseInt(limit));
  
  res.json({
    success: true,
    data: result.slots,
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      hasMore: result.hasMore
    },
    timestamp: new Date().toISOString()
  });
}));

// Create slot with validation
app.post('/api/slots', validateSlotCreation, asyncHandler(async (req, res) => {
  const slotData = req.body;
  logger.info('Creating new slot', { slotData, ip: req.ip });
  
  // Check for overlapping slots
  const existingSlots = await databaseService.getSlotsByDateAndListener(
    slotData.date,
    slotData.listenerId || 'system'
  );
  
  const hasOverlap = existingSlots.some(slot => {
    return (slotData.startTime < slot.end_time && slotData.endTime > slot.start_time);
  });
  
  if (hasOverlap) {
    throw new APIError('Slot overlaps with existing slot', 409, 'SLOT_OVERLAP');
  }
  
  const transformedData = {
    date: slotData.date,
    start_time: slotData.startTime,
    end_time: slotData.endTime,
    status: 'created',
    listener_id: slotData.listenerId || '55f0d229-16eb-48db-8bfe-e817a7dee807',
    duration_minutes: calculateDuration(slotData.startTime, slotData.endTime),
    price: slotData.price || 50
  };
  
  const slot = await databaseService.createTimeSlot(transformedData);
  
  // Try to generate meeting link (non-blocking)
  try {
    const meetingDetails = await meetingService.generateGoogleMeetLink({
      slot,
      userId: 'admin'
    });
    
    const updatedSlot = await databaseService.updateSlotMeetingLink(slot.id, {
      meeting_link: meetingDetails.meetingLink,
      meeting_id: meetingDetails.meetingId,
      meeting_provider: meetingDetails.meetingProvider
    });
    
    res.status(201).json({
      success: true,
      message: 'Slot created successfully with meeting link',
      data: updatedSlot,
      timestamp: new Date().toISOString()
    });
  } catch (meetingError) {
    logger.warn('Meeting link generation failed', { error: meetingError.message, slotId: slot.id });
    res.status(201).json({
      success: true,
      message: 'Slot created successfully (meeting link will be added later)',
      data: slot,
      timestamp: new Date().toISOString()
    });
  }
}));

// Get slot by ID
app.get('/api/slots/:id', validateUUID, asyncHandler(async (req, res) => {
  const { id } = req.params;
  logger.info('Fetching slot by ID', { slotId: id, ip: req.ip });
  
  const slot = await databaseService.getTimeSlot(id);
  
  if (!slot) {
    throw new APIError('Slot not found', 404, 'SLOT_NOT_FOUND');
  }
  
  res.json({
    success: true,
    data: slot,
    timestamp: new Date().toISOString()
  });
}));

// Create booking with validation
app.post('/api/bookings', validateBooking, asyncHandler(async (req, res) => {
  const { userId, slotId } = req.body;
  logger.info('Creating booking', { userId, slotId, ip: req.ip });
  
  // Get slot details directly (avoid N+1 query)
  const slot = await databaseService.getTimeSlot(slotId);
  
  if (!slot) {
    throw new APIError('Slot not found or not available', 404, 'SLOT_NOT_FOUND');
  }
  
  if (slot.status !== 'created') {
    throw new APIError('Slot is not available for booking', 409, 'SLOT_NOT_AVAILABLE');
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
    meeting_link: slot.meeting_link,
    meeting_id: slot.meeting_id,
    meeting_provider: slot.meeting_provider
  };
  
  const booking = await databaseService.createBooking(bookingData);
  
  // Update slot status to booked and assign a listener
  const listeners = await databaseService.getListeners();
  const availableListener = listeners.find(l => l.role === 'listener');
  
  if (availableListener) {
    await databaseService.updateSlotAssignment(slotId, {
      status: 'booked',
      listener_id: availableListener.id
    });
  } else {
    await databaseService.updateSlotStatus(slotId, 'booked');
  }
  
  // Send meeting details (in production, this would be email/SMS)
  await meetingService.sendMeetingDetails(booking, meetingDetails);
  
  res.status(201).json({
    success: true,
    message: 'Booking created successfully',
    data: {
      booking,
      meetingDetails
    },
    timestamp: new Date().toISOString()
  });
}));

// Get user bookings
app.get('/api/bookings/user/:userId', validateUUID, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  logger.info('Fetching user bookings', { userId, ip: req.ip });
  
  const rawBookings = await databaseService.getUserBookings(userId);
  
  const bookings = rawBookings.map(booking => ({
    id: booking.id,
    slotId: booking.slot_id,
    userId: booking.user_id,
    listenerId: booking.slot?.listener_id || '',
    listenerName: booking.slot?.listener?.username || 'Anonymous Listener',
    date: booking.slot?.date || '',
    startTime: booking.slot?.start_time || '',
    endTime: booking.slot?.end_time || '',
    status: booking.status,
    price: booking.slot?.price || 0,
    meetingLink: booking.meeting_link,
    createdAt: booking.created_at,
    updatedAt: booking.updated_at
  }));
  
  res.json({
    success: true,
    data: bookings,
    total: bookings.length,
    timestamp: new Date().toISOString()
  });
}));

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
const server = app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    environment: config.nodeEnv,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
  process.exit(1);
});

module.exports = app;
