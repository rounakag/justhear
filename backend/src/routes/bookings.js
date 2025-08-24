const express = require('express');
const router = express.Router();

// Mock bookings data
const mockBookings = [
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
    created_at: new Date(),
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
    created_at: new Date(),
    session_date: '2024-01-16',
    session_time: '09:00:00'
  }
];

// Mock reviews data
const mockReviews = [
  {
    id: 1,
    booking_id: 1,
    user_id: 3,
    listener_id: 2,
    rating: 5,
    review: 'Great listener, very understanding and helpful.',
    created_at: new Date()
  }
];

// Get all bookings
router.get('/', (req, res) => {
  const { user_id, listener_id, status } = req.query;
  
  let filteredBookings = [...mockBookings];
  
  if (user_id) {
    filteredBookings = filteredBookings.filter(booking => booking.user_id === parseInt(user_id));
  }
  
  if (listener_id) {
    filteredBookings = filteredBookings.filter(booking => booking.listener_id === parseInt(listener_id));
  }
  
  if (status) {
    filteredBookings = filteredBookings.filter(booking => booking.status === status);
  }
  
  res.json({
    bookings: filteredBookings,
    total: filteredBookings.length
  });
});

// Get booking by ID
router.get('/:id', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const booking = mockBookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  // Get review for this booking
  const review = mockReviews.find(r => r.booking_id === bookingId);
  
  res.json({
    booking: {
      ...booking,
      review
    }
  });
});

// Create new booking
router.post('/', (req, res) => {
  const { user_id, listener_id, time_slot_id, payment_amount } = req.body;
  
  if (!user_id || !listener_id || !time_slot_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newBooking = {
    id: mockBookings.length + 1,
    user_id: parseInt(user_id),
    listener_id: parseInt(listener_id),
    time_slot_id: parseInt(time_slot_id),
    status: 'confirmed',
    payment_status: 'paid',
    payment_amount: payment_amount || 25.00,
    transaction_id: `txn_${Date.now()}`,
    meeting_link: `https://meet.google.com/meeting-${Date.now()}`,
    created_at: new Date(),
    session_date: new Date().toISOString().split('T')[0],
    session_time: new Date().toTimeString().split(' ')[0]
  };
  
  mockBookings.push(newBooking);
  
  res.status(201).json({
    message: 'Booking created successfully',
    booking: newBooking
  });
});

// Update booking status
router.put('/:id/status', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { status } = req.body;
  
  const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
  
  if (bookingIndex === -1) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  mockBookings[bookingIndex].status = status;
  
  res.json({
    message: 'Booking status updated successfully',
    booking: mockBookings[bookingIndex]
  });
});

// Add review to booking
router.post('/:id/review', (req, res) => {
  const bookingId = parseInt(req.params.id);
  const { user_id, rating, review } = req.body;
  
  const booking = mockBookings.find(b => b.id === bookingId);
  
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  
  if (!user_id || !rating || !review) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newReview = {
    id: mockReviews.length + 1,
    booking_id: bookingId,
    user_id: parseInt(user_id),
    listener_id: booking.listener_id,
    rating: parseInt(rating),
    review,
    created_at: new Date()
  };
  
  mockReviews.push(newReview);
  
  res.status(201).json({
    message: 'Review added successfully',
    review: newReview
  });
});

// Get reviews for a listener
router.get('/reviews/listener/:listener_id', (req, res) => {
  const listenerId = parseInt(req.params.listener_id);
  const listenerReviews = mockReviews.filter(r => r.listener_id === listenerId);
  
  res.json({
    reviews: listenerReviews,
    total: listenerReviews.length,
    averageRating: listenerReviews.length > 0 
      ? listenerReviews.reduce((sum, r) => sum + r.rating, 0) / listenerReviews.length 
      : 0
  });
});

module.exports = router;
