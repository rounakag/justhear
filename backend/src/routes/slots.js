const express = require('express');
const router = express.Router();

// Mock slots data
const mockSlots = [
  {
    id: 1,
    listener_id: 2,
    date: '2024-01-15',
    start_time: '10:00:00',
    end_time: '11:00:00',
    status: 'available',
    price: 25.00,
    created_at: new Date()
  },
  {
    id: 2,
    listener_id: 2,
    date: '2024-01-15',
    start_time: '14:00:00',
    end_time: '15:00:00',
    status: 'booked',
    price: 25.00,
    created_at: new Date()
  },
  {
    id: 3,
    listener_id: 2,
    date: '2024-01-16',
    start_time: '09:00:00',
    end_time: '10:00:00',
    status: 'available',
    price: 25.00,
    created_at: new Date()
  }
];

// Get all slots
router.get('/', (req, res) => {
  const { date, listener_id, status } = req.query;
  
  let filteredSlots = [...mockSlots];
  
  if (date) {
    filteredSlots = filteredSlots.filter(slot => slot.date === date);
  }
  
  if (listener_id) {
    filteredSlots = filteredSlots.filter(slot => slot.listener_id === parseInt(listener_id));
  }
  
  if (status) {
    filteredSlots = filteredSlots.filter(slot => slot.status === status);
  }
  
  res.json({
    slots: filteredSlots,
    total: filteredSlots.length
  });
});

// Get slot by ID
router.get('/:id', (req, res) => {
  const slotId = parseInt(req.params.id);
  const slot = mockSlots.find(s => s.id === slotId);
  
  if (!slot) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  
  res.json({ slot });
});

// Create new slot
router.post('/', (req, res) => {
  const { listener_id, date, start_time, end_time, price } = req.body;
  
  if (!listener_id || !date || !start_time || !end_time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newSlot = {
    id: mockSlots.length + 1,
    listener_id: parseInt(listener_id),
    date,
    start_time,
    end_time,
    status: 'available',
    price: price || 25.00,
    created_at: new Date()
  };
  
  mockSlots.push(newSlot);
  
  res.status(201).json({
    message: 'Slot created successfully',
    slot: newSlot
  });
});

// Update slot
router.put('/:id', (req, res) => {
  const slotId = parseInt(req.params.id);
  const slotIndex = mockSlots.findIndex(s => s.id === slotId);
  
  if (slotIndex === -1) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  
  const updatedSlot = { ...mockSlots[slotIndex], ...req.body };
  mockSlots[slotIndex] = updatedSlot;
  
  res.json({
    message: 'Slot updated successfully',
    slot: updatedSlot
  });
});

// Delete slot
router.delete('/:id', (req, res) => {
  const slotId = parseInt(req.params.id);
  const slotIndex = mockSlots.findIndex(s => s.id === slotId);
  
  if (slotIndex === -1) {
    return res.status(404).json({ error: 'Slot not found' });
  }
  
  mockSlots.splice(slotIndex, 1);
  
  res.json({ message: 'Slot deleted successfully' });
});

module.exports = router;
