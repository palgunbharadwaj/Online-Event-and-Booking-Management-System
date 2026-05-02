const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' -- user, organizer, admin
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    custom_event_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT,
    end_date TEXT,
    end_time TEXT,
    location TEXT NOT NULL,
    price REAL NOT NULL,
    seats INTEGER NOT NULL,
    organizer_id INTEGER,
    image_url TEXT,
    custom_organizer TEXT,
    category TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    ticket_id TEXT UNIQUE NOT NULL,
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'confirmed',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (event_id) REFERENCES events (id)
  );
`);

console.log('Database initialized successfully.');

module.exports = db;
