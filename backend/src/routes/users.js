const express = require('express');
const router = express.Router();

// Mock user data
const mockUsers = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@justhear.com',
    role: 'admin',
    status: 'active',
    created_at: new Date()
  },
  {
    id: 2,
    username: 'listener1',
    email: 'listener1@justhear.com',
    role: 'listener',
    status: 'active',
    created_at: new Date()
  },
  {
    id: 3,
    username: 'user1',
    email: 'user1@justhear.com',
    role: 'user',
    status: 'active',
    created_at: new Date()
  }
];

// Get all users
router.get('/', (req, res) => {
  res.json({
    users: mockUsers.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    }))
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = mockUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      created_at: user.created_at
    }
  });
});

module.exports = router;
