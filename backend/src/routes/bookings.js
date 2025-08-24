const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const meetingService = require('../services/meetingService');
const paymentService = require('../services/paymentService');
const notificationService = require('../services/notificationService');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for a user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, listener_id } = req.query;
    const offset = (page - 1) * limit;

    let query = db('bookings')
      .select(
        'bookings.*',
        'listeners.first_name as listener_first_name',
        'listeners.last_name as listener_last_name',
        'listeners.hourly_rate',
        'meeting_links.meeting_url',
        'meeting_links.meeting_id',
        'meeting_links.provider as meeting_provider'
      )
      .leftJoin('listeners', 'bookings.listener_id', 'listeners.id')
      .leftJoin('meeting_links', 'bookings.id', 'meeting_links.booking_id')
      .where('bookings.user_id', req.user.id);

    if (status) {
      query = query.where('bookings.status', status);
    }

    if (listener_id) {
      query = query.where('bookings.listener_id', listener_id);
    }

    const bookings = await query
      .orderBy('bookings.start_time', 'desc')
      .limit(limit)
      .offset(offset);

    const total = await db('bookings')
      .where('user_id', req.user.id)
      .count('* as count')
      .first();

    res.json({
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total.count),
        pages: Math.ceil(total.count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking by ID
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await db('bookings')
      .select(
        'bookings.*',
        'listeners.first_name as listener_first_name',
        'listeners.last_name as listener_last_name',
        'listeners.bio',
        'listeners.specializations',
        'listeners.hourly_rate',
        'meeting_links.meeting_url',
        'meeting_links.meeting_id',
        'meeting_links.meeting_password',
        'meeting_links.provider as meeting_provider',
        'meeting_links.expires_at as meeting_expires_at',
        'payments.transaction_id',
        'payments.status as payment_status',
        'payments.amount as payment_amount'
      )
      .leftJoin('listeners', 'bookings.listener_id', 'listeners.id')
      .leftJoin('meeting_links', 'bookings.id', 'meeting_links.booking_id')
      .leftJoin('payments', 'bookings.id', 'payments.booking_id')
      .where('bookings.id', req.params.id)
      .where('bookings.user_id', req.user.id)
      .first();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    logger.error('Error fetching booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking
 * @access  Private
 */
router.post('/', [
  auth,
  body('listener_id').isUUID().notEmpty(),
  body('slot_id').isUUID().notEmpty(),
  body('date').isISO8601().notEmpty(),
  body('start_time').isISO8601().notEmpty(),
  body('end_time').isISO8601().notEmpty(),
  body('notes').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      listener_id,
      slot_id,
      date,
      start_time,
      end_time,
      notes
    } = req.body;

    // Check if slot is available
    const slot = await db('time_slots')
      .where('id', slot_id)
      .where('listener_id', listener_id)
      .where('is_available', true)
      .first();

    if (!slot) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    // Get listener details for pricing
    const listener = await db('listeners')
      .where('id', listener_id)
      .first();

    if (!listener) {
      return res.status(400).json({ message: 'Listener not found' });
    }

    // Calculate duration and price
    const start = new Date(start_time);
    const end = new Date(end_time);
    const durationMinutes = Math.ceil((end - start) / (1000 * 60));
    const price = (listener.hourly_rate * durationMinutes) / 60;

    // Create booking
    const [booking] = await db('bookings').insert({
      user_id: req.user.id,
      listener_id,
      slot_id,
      date,
      start_time,
      end_time,
      duration_minutes: durationMinutes,
      price,
      notes: notes || null,
      status: 'pending'
    }).returning('*');

    // Mark slot as unavailable
    await db('time_slots')
      .where('id', slot_id)
      .update({ is_available: false });

    // Generate meeting link
    const meetingLink = await meetingService.generateMeetingLink(
      booking.id,
      'zoom', // Default provider
      'video'
    );

    // Create payment intent
    const paymentIntent = await paymentService.createPaymentIntent({
      booking_id: booking.id,
      user_id: req.user.id,
      amount: price,
      currency: 'USD'
    });

    // Send notification to listener
    await notificationService.sendNotification({
      user_id: listener_id,
      type: 'new_booking',
      title: 'New Booking Request',
      message: `You have a new booking request for ${date} at ${new Date(start_time).toLocaleTimeString()}`,
      data: { booking_id: booking.id }
    });

    logger.info(`New booking created: ${booking.id}`, {
      user_id: req.user.id,
      listener_id,
      price
    });

    res.status(201).json({
      booking,
      meeting_link: meetingLink,
      payment_intent: paymentIntent
    });
  } catch (error) {
    logger.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   PUT /api/bookings/:id
 * @desc    Update booking
 * @access  Private
 */
router.put('/:id', [
  auth,
  body('status').optional().isIn(['confirmed', 'cancelled', 'completed']),
  body('notes').optional().isString().trim(),
  body('cancellation_reason').optional().isString().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await db('bookings')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const updates = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.notes !== undefined) updates.notes = req.body.notes;
    if (req.body.cancellation_reason) updates.cancellation_reason = req.body.cancellation_reason;

    const [updatedBooking] = await db('bookings')
      .where('id', req.params.id)
      .update(updates)
      .returning('*');

    // If booking is cancelled, make slot available again
    if (req.body.status === 'cancelled') {
      await db('time_slots')
        .where('id', booking.slot_id)
        .update({ is_available: true });

      // Deactivate meeting link
      const meetingLink = await meetingService.getMeetingLink(booking.id);
      if (meetingLink) {
        await meetingService.deactivateMeetingLink(meetingLink.id);
      }

      // Process refund if payment was made
      if (booking.status === 'confirmed') {
        await paymentService.processRefund(booking.id, req.body.cancellation_reason);
      }
    }

    logger.info(`Booking updated: ${booking.id}`, {
      user_id: req.user.id,
      status: req.body.status
    });

    res.json(updatedBooking);
  } catch (error) {
    logger.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel booking
 * @access  Private
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const booking = await db('bookings')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    // Update booking status to cancelled
    await db('bookings')
      .where('id', req.params.id)
      .update({
        status: 'cancelled',
        cancellation_reason: 'Cancelled by user'
      });

    // Make slot available again
    await db('time_slots')
      .where('id', booking.slot_id)
      .update({ is_available: true });

    // Deactivate meeting link
    const meetingLink = await meetingService.getMeetingLink(booking.id);
    if (meetingLink) {
      await meetingService.deactivateMeetingLink(meetingLink.id);
    }

    // Process refund if payment was made
    if (booking.status === 'confirmed') {
      await paymentService.processRefund(booking.id, 'Cancelled by user');
    }

    logger.info(`Booking cancelled: ${booking.id}`, {
      user_id: req.user.id
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    logger.error('Error cancelling booking:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/bookings/:id/meeting-link
 * @desc    Generate or regenerate meeting link for booking
 * @access  Private
 */
router.post('/:id/meeting-link', [
  auth,
  body('provider').optional().isIn(['zoom', 'google_meet', 'teams', 'custom']),
  body('meeting_type').optional().isIn(['video', 'audio', 'chat']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const booking = await db('bookings')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Meeting link can only be generated for confirmed bookings' });
    }

    // Deactivate existing meeting link if any
    const existingLink = await meetingService.getMeetingLink(booking.id);
    if (existingLink) {
      await meetingService.deactivateMeetingLink(existingLink.id);
    }

    // Generate new meeting link
    const meetingLink = await meetingService.generateMeetingLink(
      booking.id,
      req.body.provider || 'zoom',
      req.body.meeting_type || 'video'
    );

    logger.info(`Meeting link generated for booking: ${booking.id}`, {
      user_id: req.user.id,
      provider: req.body.provider || 'zoom'
    });

    res.json(meetingLink);
  } catch (error) {
    logger.error('Error generating meeting link:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/bookings/:id/meeting-link
 * @desc    Get meeting link for booking
 * @access  Private
 */
router.get('/:id/meeting-link', auth, async (req, res) => {
  try {
    const booking = await db('bookings')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const meetingLink = await meetingService.getMeetingLink(booking.id);

    if (!meetingLink) {
      return res.status(404).json({ message: 'Meeting link not found' });
    }

    res.json(meetingLink);
  } catch (error) {
    logger.error('Error fetching meeting link:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   POST /api/bookings/:id/join
 * @desc    Join meeting session
 * @access  Private
 */
router.post('/:id/join', auth, async (req, res) => {
  try {
    const booking = await db('bookings')
      .where('id', req.params.id)
      .where('user_id', req.user.id)
      .first();

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if it's time to join
    const now = new Date();
    const startTime = new Date(booking.start_time);
    const timeUntilStart = startTime - now;

    if (timeUntilStart > 5 * 60 * 1000) { // 5 minutes before start
      return res.status(400).json({ 
        message: 'Session has not started yet',
        timeUntilStart: Math.ceil(timeUntilStart / (1000 * 60))
      });
    }

    if (timeUntilStart < -60 * 60 * 1000) { // 1 hour after start
      return res.status(400).json({ message: 'Session has ended' });
    }

    const meetingLink = await meetingService.getMeetingLink(booking.id);

    if (!meetingLink) {
      return res.status(404).json({ message: 'Meeting link not found' });
    }

    // Log session join
    await db('user_sessions_log').insert({
      user_id: req.user.id,
      session_id: booking.id,
      action: 'join_session',
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    });

    logger.info(`User joined session: ${booking.id}`, {
      user_id: req.user.id,
      meeting_id: meetingLink.meeting_id
    });

    res.json({
      meeting_url: meetingLink.meeting_url,
      meeting_password: meetingLink.meeting_password,
      provider: meetingLink.provider
    });
  } catch (error) {
    logger.error('Error joining session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
