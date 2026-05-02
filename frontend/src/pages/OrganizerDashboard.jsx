import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';
import { Plus, Calendar, MapPin, Users, Trash2, Loader, LayoutDashboard, Ticket, ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';

const OrganizerDashboard = () => {
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    custom_event_id: '', title: '', description: '', date: '', time: '', 
    end_date: '', end_time: '',
    location: '', price: 0, seats: 50, image_url: '', organizer_name: '',
    category: '', expected_attendance: '', age_restriction: '', equipment: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [viewMode, setViewMode] = useState(location.state?.mode || 'list'); // 'list' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (location.state?.mode) {
      setViewMode(location.state.mode);
    }
    if (location.state?.prefillDate) {
      setNewEvent(prev => ({ ...prev, date: location.state.prefillDate }));
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.state]);

  const fetchOrganizerData = async () => {
    try {
      const { data } = await api.get('/events/my-events');
      setEvents(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await api.put(`/events/${editingId}`, newEvent);
      } else {
        await api.post('/events', newEvent);
      }
      setShowAddForm(false);
      setEditingId(null);
      setNewEvent({ 
        custom_event_id: '', title: '', description: '', date: '', time: '', location: '', price: 0, seats: 50, image_url: '', organizer_name: '',
        category: '', expected_attendance: '', age_restriction: '', equipment: ''
      });
      fetchOrganizerData();
    } catch (err) {
      alert(`Failed to ${editingId ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setNewEvent({
      custom_event_id: event.custom_event_id || '',
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time || '',
      end_date: event.end_date || '',
      end_time: event.end_time || '',
      location: event.location,
      price: event.price,
      seats: event.seats,
      image_url: event.image_url || '',
      organizer_name: event.organizer_name || '',
      category: event.category || '',
      expected_attendance: event.expected_attendance || '',
      age_restriction: event.age_restriction || '',
      equipment: event.equipment || ''
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${id}`);
      fetchOrganizerData();
    } catch (err) {
       alert('Delete failed');
    }
  };

  const fetchBookings = async (eventId) => {
    try {
      const { data } = await api.get(`/bookings/event/${eventId}`);
      setBookings(prev => ({ ...prev, [eventId]: data }));
    } catch (err) {
      console.error(err);
    }
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const calendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = [];
    const totalDays = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Prev month padding
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), currentMonth: false });
    }

    // Current month
    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, month, year, currentMonth: true });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), currentMonth: false });
    }
    return days;
  };

  const getEventsForDate = (day, month, year) => {
    // Safer local date string construction to avoid timezone shifts
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === d);
  };

  const onDateClick = (day, month, year) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setNewEvent({ ...newEvent, date: dateString });
    setShowAddForm(true);
    setEditingId(null); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="animate-fade-in">
      <div className="container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Organizer Dashboard</h1>
            <p className="text-secondary">Create and manage your professional events and monitor ticket sales</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => setViewMode('list')}
                className={`btn ${viewMode === 'list' ? 'btn-primary' : ''}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: viewMode === 'list' ? 'var(--accent-primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', border: 'none' }}
              >
                <List size={16} /> List
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`btn ${viewMode === 'calendar' ? 'btn-primary' : ''}`}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', background: viewMode === 'calendar' ? 'var(--accent-primary)' : 'transparent', color: viewMode === 'calendar' ? 'white' : 'var(--text-secondary)', border: 'none' }}
              >
                <Calendar size={16} /> Calendar
              </button>
            </div>
            <button 
              onClick={() => {
                if (showAddForm) {
                  setShowAddForm(false);
                  setEditingId(null);
                  setNewEvent({ 
                    custom_event_id: '', title: '', description: '', date: '', time: '', location: '', price: 0, seats: 50, image_url: '', organizer_name: '',
                    category: '', expected_attendance: '', age_restriction: '', equipment: ''
                  });
                } else {
                  setShowAddForm(true);
                }
              }} 
              className="btn btn-primary"
            >
              {showAddForm ? 'Cancel' : <><Plus size={20} /> Create New Event</>}
            </button>
          </div>
        </header>

        {showAddForm && (
          <div className="card animate-fade-in" style={{ marginBottom: '3rem', maxWidth: '800px' }}>
            <h3 style={{ marginBottom: '1.5rem', fontWeight: 700 }}>{editingId ? 'Edit Event Details' : 'Event Details'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Event ID</label>
                <input type="text" placeholder="E.g., EVT-001" required value={newEvent.custom_event_id} onChange={(e) => setNewEvent({...newEvent, custom_event_id: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Event Title</label>
                <input type="text" placeholder="E.g., Summer Music Festival" required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>About the Event (Details & Schedule)</label>
                <textarea rows="6" placeholder="Describe your event in detail (5-6 lines recommended)..." value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Start Date</label>
                <input type="date" required value={newEvent.date} onChange={(e) => setNewEvent({...newEvent, date: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Start Time</label>
                <input type="time" value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>End Date (Optional for single day)</label>
                <input type="date" value={newEvent.end_date} onChange={(e) => setNewEvent({...newEvent, end_date: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>End Time (Optional)</label>
                <input type="time" value={newEvent.end_time} onChange={(e) => setNewEvent({...newEvent, end_time: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Venue / Location Details</label>
                <input type="text" placeholder="E.g. Royal Orchid Hotel, Bangalore / Online" required value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Organizer / Company Name</label>
                <input type="text" placeholder="E.g. TechEvents Pvt Ltd" required value={newEvent.organizer_name} onChange={(e) => setNewEvent({...newEvent, organizer_name: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Price ($)</label>
                <input type="number" min="0" value={newEvent.price} onChange={(e) => setNewEvent({...newEvent, price: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Total Seats</label>
                <input type="number" min="1" value={newEvent.seats} onChange={(e) => setNewEvent({...newEvent, seats: e.target.value})} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Banner Image URL (Optional)</label>
                <input type="url" placeholder="https://example.com/banner.jpg" value={newEvent.image_url} onChange={(e) => setNewEvent({...newEvent, image_url: e.target.value})} />
              </div>
              
              <div style={{ gridColumn: '1 / -1', background: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '8px', border: '1px dashed var(--border-color)', marginTop: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Planning Questionnaire</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Event Category / Type?</label>
                    <input type="text" placeholder="e.g. Technical Seminar, Music Concert" value={newEvent.category} onChange={(e) => setNewEvent({...newEvent, category: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>How many people are expected?</label>
                    <input type="number" placeholder="500" value={newEvent.expected_attendance} onChange={(e) => setNewEvent({...newEvent, expected_attendance: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Is there any age restriction?</label>
                    <input type="text" placeholder="e.g. 18+, Family Friendly" value={newEvent.age_restriction} onChange={(e) => setNewEvent({...newEvent, age_restriction: e.target.value})} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.4rem' }}>Equipment or stage requirements?</label>
                    <input type="text" placeholder="e.g. Projector, Sound System" value={newEvent.equipment} onChange={(e) => setNewEvent({...newEvent, equipment: e.target.value})} />
                  </div>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', height: '48px' }}>
                  {loading ? <Loader className="animate-spin" size={20} /> : (editingId ? 'Save Changes' : 'Publish Event')}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading && !showAddForm ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader className="animate-spin" color="var(--accent-primary)" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {viewMode === 'calendar' ? (
              <div className="calendar-container animate-fade-in">
                <div className="calendar-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontWeight: 700 }}>
                    {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handlePrevMonth} className="btn btn-outline" style={{ padding: '0.4rem' }}><ChevronLeft size={20} /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>Today</button>
                    <button onClick={handleNextMonth} className="btn btn-outline" style={{ padding: '0.4rem' }}><ChevronRight size={20} /></button>
                  </div>
                </div>

                <div className="calendar-grid">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="calendar-day-label">{day}</div>
                  ))}
                  {calendarDays().map((dateObj, index) => {
                    const dayEvents = getEventsForDate(dateObj.day, dateObj.month, dateObj.year);
                    const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();
                    
                    return (
                      <div 
                        key={index} 
                        className={`calendar-day ${!dateObj.currentMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                        onClick={() => dateObj.currentMonth && onDateClick(dateObj.day, dateObj.month, dateObj.year)}
                      >
                        <span className="day-number">{dateObj.day}</span>
                        <div className="event-marks">
                          {dayEvents.map(event => (
                            <div 
                              key={event.id} 
                              className={`event-mark ${event.status}`} 
                              title={`${event.title} (${event.status})`}
                            />
                          ))}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {dayEvents.slice(0, 2).map(event => (
                            <div key={event.id} className="event-item-mini">
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>+{dayEvents.length - 2} more</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {events.length > 0 ? events.map(event => (
                  <div key={event.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{event.title}</h2>
                          <span className={`badge badge-${event.status}`}>{event.status}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }} className="text-secondary">
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14} /> {event.location}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Ticket size={14} /> Total: {event.seats} seats</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            onClick={() => bookings[event.id] ? setBookings(prev => {
                              const copy = {...prev};
                              delete copy[event.id];
                              return copy;
                            }) : fetchBookings(event.id)} 
                            className="btn btn-outline"
                            style={{ fontSize: '0.8rem' }}
                          >
                            {bookings[event.id] ? 'Hide Bookings' : 'View Bookings'}
                          </button>
                          <button onClick={() => handleEdit(event)} className="btn btn-outline" style={{ color: 'var(--accent-primary)' }}>Edit</button>
                          <button onClick={() => handleDelete(event.id)} className="btn btn-outline" style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                      </div>
                    </div>

                    {bookings[event.id] && (
                      <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-primary)' }}>
                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={16} className="accent-primary" /> Registered Attendees ({bookings[event.id].length})
                        </h4>
                        {bookings[event.id].length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                            {bookings[event.id].map(b => (
                              <div key={b.id} className="card" style={{ padding: '1rem', background: 'white' }}>
                                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{b.user_name}</p>
                                <p className="text-secondary" style={{ fontSize: '0.8rem' }}>{b.user_email}</p>
                                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                                  ID: {b.ticket_id}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>No bookings for this event yet.</p>
                        )}
                      </div>
                    )}
                  </div>
                )) : (
                  <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    <LayoutDashboard size={48} className="text-secondary" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No events created</h3>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>Start by creating your first event to see it here.</p>
                    <button onClick={() => setShowAddForm(true)} className="btn btn-primary">Create Event</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
