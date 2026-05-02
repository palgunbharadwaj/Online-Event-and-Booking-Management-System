const Database = require('better-sqlite3');
const db = new Database('database.sqlite');

const columnsToAdd = [
  { name: 'end_date', type: 'TEXT' },
  { name: 'end_time', type: 'TEXT' }
];

for (const col of columnsToAdd) {
  try {
    db.prepare(`ALTER TABLE events ADD COLUMN ${col.name} ${col.type}`).run();
    console.log(`Added "${col.name}" column to events table.`);
  } catch (err) {
    if (err.message.includes('duplicate column name')) {
      console.log(`Column "${col.name}" already exists.`);
    } else {
      console.error(`Error adding column ${col.name}:`, err);
    }
  }
}

db.close();
