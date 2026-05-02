const db = require('./db');
const events = db.prepare('SELECT * FROM events').all();
console.log(JSON.stringify(events, null, 2));
