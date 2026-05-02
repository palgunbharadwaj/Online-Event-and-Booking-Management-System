import { useState, useEffect } from 'react';
import api from '../api';
import { Ticket, Calendar, MapPin, Download, Loader, ExternalLink } from 'lucide-react';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await api.get('/bookings/my');
        setBookings(data);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="container">
        <header style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>My Tickets</h1>
          <p className="text-secondary">Manage your upcoming event experiences and access your tickets</p>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
            <Loader className="animate-spin" color="var(--accent-primary)" size={40} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {bookings.length > 0 ? bookings.map((booking) => (
              <div key={booking.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  {/* Event Summary Side */}
                  <div style={{ padding: '1.5rem', flex: 1, borderRight: '1px dashed var(--border-color)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <span className="badge badge-seats" style={{ marginBottom: '0.8rem', fontSize: '0.7rem' }}>Confirmed Booking</span>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.8rem' }}>{booking.title}</h2>
                        
                        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }} className="text-secondary">
                            <Calendar size={16} className="accent-primary" /> {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }} className="text-secondary">
                            <MapPin size={16} className="accent-primary" /> {booking.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Stub Side */}
                  <div style={{ 
                    padding: '1.5rem', 
                    width: '300px', 
                    background: 'var(--bg-primary)', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Ticket Number</p>
                    <p style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 800, 
                      fontFamily: 'monospace', 
                      letterSpacing: '2px', 
                      color: 'var(--accent-primary)',
                      background: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '4px',
                      border: '1px solid var(--border-color)'
                    }}>{booking.ticket_id}</p>
                    <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', fontSize: '0.85rem' }}>
                      <Download size={16} /> Download PDF
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                <Ticket size={48} className="text-secondary" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No tickets yet</h3>
                <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>You haven't booked any events yet. Check out the home page for upcoming events!</p>
                <button onClick={() => window.location.href = '/'} className="btn btn-primary">Find Events</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
