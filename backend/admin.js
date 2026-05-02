const express = require('express');
const router = express.Router();
const db = require('./db');
const { verifyToken } = require('./auth');

// Middleware to ensure admin status
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get all users (Admin only)
router.get('/users', verifyToken, isAdmin, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role FROM users').all();
  res.json(users);
});

// Delete user (Admin only)
router.delete('/users/:id', verifyToken, isAdmin, (req, res) => {
  const userId = req.params.id;
  if (parseInt(userId) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete yourself' });
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  res.json({ message: 'User deleted' });
});

// Get all events (Admin only)
router.get('/events', verifyToken, isAdmin, (req, res) => {
  const events = db.prepare(`
    SELECT e.*, u.name as organizer_name 
    FROM events e 
    JOIN users u ON e.organizer_id = u.id
    ORDER BY created_at DESC
  `).all();
  res.json(events);
});

// Update event status (Admin only)
router.patch('/events/:id/status', verifyToken, isAdmin, (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE events SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ message: `Event ${status} successfully` });
});

// Get all bookings (Admin only)
router.get('/bookings', verifyToken, isAdmin, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, u.name as user_name, u.email as user_email, e.title as event_title, e.date as event_date
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN events e ON b.event_id = e.id
    ORDER BY b.booking_date DESC
  `).all();
  res.json(bookings);
});

module.exports = router;
