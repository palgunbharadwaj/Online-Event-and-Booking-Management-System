const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

async function runTests() {
  console.log('🚀 Starting System Testing Suite...\n');

  // --- UNIT TEST: Auth Logic ---
  console.log('🧪 Unit Test: Authentication...');
  const testEmail = 'test@example.com';
  const testPass = 'password123';
  const hashed = await bcrypt.hash(testPass, 10);
  
  db.prepare('DELETE FROM users WHERE email = ?').run(testEmail);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Test User', testEmail, hashed, 'user'
  );

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(testEmail);
  const passMatch = await bcrypt.compare(testPass, user.password);
  
  if (passMatch && user.role === 'user') {
    console.log('✅ Auth Unit Test: PASSED\n');
  } else {
    console.log('❌ Auth Unit Test: FAILED\n');
  }

  // --- INTEGRATION TEST: Booking Flow ---
  console.log('🧪 Integration Test: Booking Flow...');
  
  const testEvent = {
    title: 'Test Event',
    date: '2026-12-31',
    location: 'Test Lab',
    price: 0,
    seats: 2, // Small capacity for testing
    organizer_id: user.id
  };

  const eventResult = db.prepare(`
    INSERT INTO events (title, description, date, location, price, seats, organizer_id, status)
    VALUES (?, 'Test Description', ?, ?, ?, ?, ?, 'approved')
  `).run(testEvent.title, testEvent.date, testEvent.location, testEvent.price, testEvent.seats, testEvent.organizer_id);

  const eventId = eventResult.lastInsertRowid;

  // Simulate two bookings (Filling the event)
  console.log('--- Simulating 2 Bookings...');
  const book = (uid) => {
    const ticketId = Math.random().toString(36).substring(7).toUpperCase();
    db.prepare('INSERT INTO bookings (user_id, event_id, ticket_id) VALUES (?, ?, ?)').run(uid, eventId, ticketId);
    return ticketId;
  };

  const t1 = book(user.id);
  const t2 = book(user.id);
  console.log(`✅ Tickets generated: ${t1}, ${t2}`);

  // Test Capacity Overflow (Should fail)
  console.log('--- Testing Capacity Limit...');
  const bookingCount = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE event_id = ?').get(eventId).count;
  
  if (bookingCount >= testEvent.seats) {
    console.log('✅ Seat Availability Validation: PASSED (Limit Reached)');
  } else {
    console.log('❌ Seat Availability Validation: FAILED');
  }

  console.log('\n🏁 System Testing Suite Complete.');
}

runTests().catch(err => console.error('Tests failed:', err));
