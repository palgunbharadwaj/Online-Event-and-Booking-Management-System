const express = require('express');
const router = express.Router();
const db = require('./db');
const { verifyToken } = require('./auth');
const crypto = require('crypto');

// Create booking
router.post('/', verifyToken, (req, res) => {
  const { event_id } = req.body;
  const user_id = req.user.id;

  if (!event_id) {
    return res.status(400).json({ error: 'event_id is required' });
  }

  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(event_id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE event_id = ?').get(event_id).count;
  if (bookingCount >= event.seats) {
    return res.status(400).json({ error: 'Event is fully booked' });
  }

  const transaction = db.transaction(() => {
    const ticketId = crypto.randomBytes(8).toString('hex').toUpperCase();
    const stmt = db.prepare('INSERT INTO bookings (user_id, event_id, ticket_id) VALUES (?, ?, ?)');
    const result = stmt.run(user_id, event_id, ticketId);
    return { bookingId: result.lastInsertRowid, ticketId, user_id, event_id };
  });

  try {
    const booking = transaction();
    res.status(201).json({ message: 'Booking successful', ...booking });
  } catch (error) {
    res.status(400).json({ error: 'Failed to book event' });
  }
});

// Get user bookings
router.get('/my', verifyToken, (req, res) => {
  const bookings = db.prepare(`
    SELECT b.*, e.title, e.date, e.location, e.price, e.image_url 
    FROM bookings b 
    JOIN events e ON b.event_id = e.id 
    WHERE b.user_id = ?
    ORDER BY b.booking_date DESC
  `).all(req.user.id);
  res.json(bookings);
});

// Get event bookings (Organizer or Admin)
router.get('/event/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const bookings = db.prepare(`
    SELECT b.*, u.name as user_name, u.email as user_email 
    FROM bookings b 
    JOIN users u ON b.user_id = u.id 
    WHERE b.event_id = ?
  `).all(eventId);
  
  res.json(bookings);
});

module.exports = router;
