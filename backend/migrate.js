const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

try {
  db.prepare('ALTER TABLE events ADD COLUMN time TEXT').run();
  console.log('Added "time" column to events table.');
} catch (err) {
  if (err.message.includes('duplicate column name')) {
    console.log('Column "time" already exists.');
  } else {
    console.error('Error adding column:', err);
  }
}
db.close();
