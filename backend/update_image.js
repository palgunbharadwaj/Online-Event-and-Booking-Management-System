const db = require('./db');
db.prepare("UPDATE events SET image_url = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600' WHERE title = 'Tech Conference 2026'").run();
console.log('Updated Tech Conference 2026 image URL');
