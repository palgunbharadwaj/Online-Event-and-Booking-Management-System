const db = require('./db');
const bcrypt = require('bcryptjs');

const seed = async () => {
  console.log('Seeding database...');
  
  // Clear existing data
  db.prepare('DELETE FROM bookings').run();
  db.prepare('DELETE FROM events').run();
  db.prepare('DELETE FROM users').run();

  const salt = 10;
  const userPass = await bcrypt.hash('user123', salt);
  const orgPass = await bcrypt.hash('org123', salt);
  const adminPass = await bcrypt.hash('admin123', salt);

  // Users
  const userResult = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Demo User', 'user@example.com', userPass, 'user'
  );
  const orgResult = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Demo Organizer', 'organizer@example.com', orgPass, 'organizer'
  );
  const adminResult = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'Demo Admin', 'admin@example.com', adminPass, 'admin'
  );

  // Events
  const baseEvents = [
    ['Tech Conference', 'Join industry leaders and innovators for a deep dive into the future of AI and Robotics.', '06-15', 'Silicon Valley, CA', 299, 500, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Summer Music Festival', 'Experience the biggest music event of the season in the heart of New York City.', '07-20', 'Central Park, NY', 99, 1000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Design Workshop', 'Unlock your creative potential with our hands-on workshop focused on modern UI/UX design principles.', '08-10', 'London, UK', 150, 50, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Makar Sankranti Kite Festival', 'Celebrate the harvest festival with a grand kite flying event.', '01-14', 'Ahmedabad, India', 10, 5000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Republic Day Parade Viewing', 'Join us for a special screening and celebration of India\'s Republic Day.', '01-26', 'New Delhi, India', 0, 1000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Maha Shivaratri Celebration', 'A night of devotion and meditation celebrating Lord Shiva.', '02-15', 'Varanasi, India', 0, 3000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Holi Colors Celebration', 'Join the most vibrant festival of the year!', '03-03', 'Mumbai, India', 25, 1500, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1533327325824-76bc4e62d560?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Ugadi / Gudi Padwa Festival', 'Celebrate the traditional New Year with cultural programs.', '03-20', 'Bengaluru, India', 15, 2000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Eid ul-Fitr Grand Feast', 'Join the community for a joyous Eid celebration.', '03-20', 'Hyderabad, India', 30, 2500, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Baisakhi Harvest Festival', 'Celebrate the vibrant harvest festival of Punjab.', '04-14', 'Amritsar, India', 15, 2000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1533327325824-76bc4e62d560?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Rama Navami Utsav', 'Join us in celebrating the birth of Lord Rama.', '04-19', 'Ayodhya, India', 0, 8000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Thrissur Pooram Grand Display', 'Experience the grandeur of Kerala\'s most spectacular temple festival.', '04-26', 'Thrissur, India', 25, 10000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['May Day / Labour Day Celebration', 'A special event honoring the working class.', '05-01', 'Kolkata, India', 0, 1500, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Rabindra Jayanti Cultural Evening', 'A musical and literary evening dedicated to the works of Rabindranath Tagore.', '05-09', 'Kolkata, India', 10, 800, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Buddha Purnima Meditation Retreat', 'Find peace and enlightenment on the auspicious occasion of Buddha Purnima.', '05-22', 'Bodh Gaya, India', 0, 1200, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Kabir Das Jayanti Satsang', 'A soulful evening celebrating the mystic poet Saint Kabir.', '06-20', 'Varanasi, India', 5, 1000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Rath Yatra Chariot Festival', 'Be part of the massive chariot festival.', '06-24', 'Puri, India', 0, 15000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Guru Purnima Spiritual Gathering', 'Pay homage to spiritual teachers and gurus.', '07-09', 'Rishikesh, India', 0, 2000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1529154036614-a60975f5c760?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Hemis Festival Cultural Dance', 'Experience the rich culture of Ladakh at the Hemis Festival.', '07-10', 'Ladakh, India', 50, 1500, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Bonalu Festival Procession', 'Celebrate the traditional Hindu festival of Telangana.', '07-26', 'Hyderabad, India', 0, 3000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Independence Day Cultural Fest', 'Celebrate India\'s independence with flag hoisting ceremonies and performances.', '08-15', 'New Delhi, India', 0, 5000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Raksha Bandhan Mela', 'A special event celebrating the bond between siblings.', '08-28', 'Jaipur, India', 10, 1500, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1604085572504-a392ddf0d86a?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Krishna Janmashtami Dahi Handi', 'Experience the thrill of the traditional Dahi Handi competition.', '09-04', 'Mathura, India', 0, 4000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1533327325824-76bc4e62d560?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Ganesh Chaturthi Utsav', 'Join the grand celebration of Lord Ganesha.', '09-14', 'Pune, India', 0, 5000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Navratri Garba Night', 'Get ready for nine nights of devotion, dance, and celebration.', '10-10', 'Ahmedabad, India', 15, 3000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Dussehra Ravan Dahan', 'Witness the spectacular theatrical performance of Ramleela followed by the grand burning of the Ravana effigy.', '10-19', 'Mysuru, India', 0, 10000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Diwali Festival of Lights', 'Celebrate the triumph of light over darkness with our grand Diwali event.', '11-08', 'New Delhi, India', 0, 2000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600', 'approved'],
    ['Christmas Carnival', 'A magical Christmas celebration featuring a beautifully lit Christmas tree and winter market.', '12-25', 'Goa, India', 20, 2000, orgResult.lastInsertRowid, 'https://images.unsplash.com/photo-1512389142860-9c449e58a543?auto=format&fit=crop&q=80&w=600', 'approved'],
  ];

  const events = [];
  for (const year of ['2026', '2027']) {
    for (const event of baseEvents) {
      const [title, desc, monthDay, loc, price, seats, orgId, img, status] = event;
      events.push([`${title} ${year}`, desc, `${year}-${monthDay}`, loc, price, seats, orgId, img, status]);
    }
  }

  const stmt = db.prepare('INSERT INTO events (title, description, date, location, price, seats, organizer_id, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const event of events) {
    stmt.run(...event);
  }

  console.log('Seeding complete.');
  console.log('--- Credentials ---');
  console.log('User: user@example.com / user123');
  console.log('Organizer: organizer@example.com / org123');
  console.log('Admin: admin@example.com / admin123');
};

seed().catch(err => console.error(err));
