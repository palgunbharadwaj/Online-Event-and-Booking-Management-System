const express = require('express');
const router = express.Router();
const db = require('./db');
const { verifyToken } = require('./auth');

// Get all approved events (Home page)
router.get('/', (req, res) => {
  const events = db.prepare(`
    SELECT e.*, COALESCE(e.custom_organizer, u.name) as organizer_name,
    (SELECT COUNT(*) FROM bookings WHERE event_id = e.id) as booked_count
    FROM events e 
    JOIN users u ON e.organizer_id = u.id
    WHERE e.status = 'approved'
    ORDER BY date ASC
  `).all();
  res.json(events);
});

// Get all events for the logged-in organizer (Dashboard)
router.get('/my-events', verifyToken, (req, res) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const events = db.prepare(`
    SELECT e.*, COALESCE(e.custom_organizer, ?) as organizer_name,
    (SELECT COUNT(*) FROM bookings WHERE event_id = e.id) as booked_count
    FROM events e
    WHERE e.organizer_id = ?
    ORDER BY date DESC
  `).all(req.user.name, req.user.id);
  res.json(events);
});

// Create event (Organizer only)
router.post('/', verifyToken, (req, res) => {
  if (req.user.role !== 'organizer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only organizers and admins can create events' });
  }

  const { custom_event_id, title, description, date, time, end_date, end_time, location, price, seats, image_url, organizer_name, category } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO events (custom_event_id, title, description, date, time, end_date, end_time, location, price, seats, organizer_id, image_url, custom_organizer, category, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `);
    const result = stmt.run(custom_event_id, title, description, date, time, end_date, end_time, location, price, seats, req.user.id, image_url, organizer_name, category);
    res.status(201).json({ message: 'Event created successfully', eventId: result.lastInsertRowid });
  } catch (error) {
    res.status(400).json({ error: 'Failed to create event' });
  }
});

// Update event (Organizer or Admin)
router.put('/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;
  const { custom_event_id, title, description, date, time, end_date, end_time, location, price, seats, image_url, organizer_name, category } = req.body;
  
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  
  if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to edit this event' });
  }

  try {
    db.prepare(`
      UPDATE events 
      SET custom_event_id = ?, title = ?, description = ?, date = ?, time = ?, end_date = ?, end_time = ?, location = ?, price = ?, seats = ?, image_url = ?, custom_organizer = ?, category = ?
      WHERE id = ?
    `).run(custom_event_id, title, description, date, time, end_date, end_time, location, price, seats, image_url, organizer_name, category, eventId);
    res.json({ message: 'Event updated successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to update event' });
  }
});

// Delete event (Organizer or Admin)
router.delete('/:id', verifyToken, (req, res) => {
  const eventId = req.params.id;
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);

  if (!event) return res.status(404).json({ error: 'Event not found' });
  if (req.user.role !== 'admin' && event.organizer_id !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized to delete this event' });
  }

  db.prepare('DELETE FROM events WHERE id = ?').run(eventId);
  res.json({ message: 'Event deleted' });
});

module.exports = router;
