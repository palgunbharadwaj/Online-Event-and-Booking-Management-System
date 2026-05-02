import { useState, useEffect } from 'react';
import api from '../api';
import { Calendar, MapPin, Search, Loader, Clock, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Grid, List } from 'lucide-react';
import { formatDateTimeRange } from '../utils/dateFormatter';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState(location.state?.mode || 'list');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (location.state?.mode) {
      setViewMode(location.state.mode);
    } else {
      setViewMode('list');
    }
  }, [location.state]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: eventsData } = await api.get('/events');
        
        // Filter out past events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingOnly = eventsData.filter(e => new Date(e.date) >= today);

        // Sort events chronologically
        const sortedEvents = upcomingOnly.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(sortedEvents);

        if (user) {
          const { data: bookingsData } = await api.get('/bookings/my');
          setMyBookings(bookingsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const filteredEvents = events.filter(e => 
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get nearest upcoming booking
  const upcomingBooking = myBookings
    .filter(b => new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

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

    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), currentMonth: false });
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push({ day: i, month, year, currentMonth: true });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), currentMonth: false });
    }
    return days;
  };

  const getEventsForDate = (day, month, year) => {
    const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === d);
  };

  const onDateClick = (day, month, year) => {
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (user?.role === 'organizer' || user?.role === 'admin') {
      navigate('/organizer', { state: { mode: 'list', prefillDate: dateString } });
    } else if (!user) {
      navigate('/auth', { state: { mode: 'register', from: { pathname: '/organizer' }, prefillDate: dateString } });
    }
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section - Clean Light */}
      <section style={{ 
        minHeight: 'calc(100vh - var(--header-height, 60px))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '3rem',
        padding: '2rem 0'
      }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Find Your Next <span className="gradient-text">Experience</span>
          </h1>
          <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            Browse through hundreds of curated events, workshops, and concerts and book your tickets in seconds.
          </p>
          
          <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
            <input 
              type="text" 
              placeholder="Search by name, category or location..." 
              style={{ paddingLeft: '3rem', height: '50px', borderRadius: '50px', boxShadow: 'var(--shadow-sm)' }}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (e.target.value) {
                  setViewMode('list');
                }
              }}
            />
          </div>
        </div>
      </section>

      <div className="container">
        {/* User's Upcoming Event Section */}
        {user && upcomingBooking && (
          <div className="card" style={{ 
            marginBottom: '3rem', 
            background: 'linear-gradient(to right, #eef2ff, #ffffff)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderLeft: '4px solid var(--accent-primary)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                width: '60px', height: '60px', 
                borderRadius: '12px', 
                background: 'white', 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border-color)'
              }}>
                 <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{new Date(upcomingBooking.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</span>
                 <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{new Date(upcomingBooking.date).getDate()}</span>
              </div>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Next Event</p>
                <h3 style={{ fontSize: '1.2rem', margin: '2px 0' }}>{upcomingBooking.title}</h3>
                <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                   <MapPin size={14} style={{ marginBottom: '-2px' }} /> {upcomingBooking.location}
                </p>
              </div>
            </div>
            <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>
               <UserCheck size={18} /> View Ticket
            </Link>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{viewMode === 'calendar' ? 'Event Calendar' : 'Upcoming Events'}</h2>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="text-secondary" style={{ fontSize: '0.9rem' }}>Showing {filteredEvents.length} events</div>
          </div>
        </div>
        
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader className="animate-spin" color="var(--accent-primary)" size={40} />
          </div>
        ) : (
          viewMode === 'calendar' ? (
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
                          <div key={event.id} className="event-mark approved" title={event.title} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {dayEvents.slice(0, 2).map(event => (
                          <div key={event.id} className="event-item-mini" onClick={(e) => { e.stopPropagation(); navigate(`/event/${event.id}`); }}>
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
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {filteredEvents.length > 0 ? filteredEvents.map(event => (
                <div key={event.id} className="card animate-fade-in" style={{ padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ 
                    height: '160px', 
                    background: `url(${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=600'}) center/cover` 
                  }}></div>
                  <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.3 }}>{event.title}</h3>
                    </div>
                    
                    <div style={{ marginTop: 'auto' }}>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                        <Calendar size={14} className="accent-primary" /> {formatDateTimeRange(event)}
                      </p>
                      <p style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <MapPin size={14} className="accent-primary" /> {event.location}
                      </p>
                      
                      <div style={{ marginTop: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                          {event.price === 0 ? 'FREE' : `$${event.price}`}
                        </span>
                        <Link to={`/event/${event.id}`} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                  <p className="text-secondary">No events found matching your search.</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
