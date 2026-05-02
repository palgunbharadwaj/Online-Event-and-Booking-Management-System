import { useState, useEffect } from 'react';
import api from '../api';
import { Shield, Users, Calendar, Trash2, Loader, CheckCircle, XCircle, RefreshCcw, Ticket } from 'lucide-react';
import { formatDateTimeRange } from '../utils/dateFormatter';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: userData } = await api.get('/admin/users');
      setUsers(userData);
      
      const { data: eventData } = await api.get('/admin/events');
      setEvents(eventData);

      const { data: bookingData } = await api.get('/admin/bookings');
      setBookings(bookingData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (id, status) => {
    try {
      await api.patch(`/admin/events/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user account?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="container">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Shield className="accent-primary" /> Admin Panel
            </h1>
            <p className="text-secondary">System-wide moderation of events, users, and global booking records</p>
          </div>
          <button onClick={fetchData} className="btn btn-outline" title="Refresh">
            <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </header>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><Loader className="animate-spin" color="var(--accent-primary)" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
              {/* Event Moderation */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                  <Calendar size={18} className="accent-primary" /> Event Moderation
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {events.length > 0 ? events.map(event => (
                    <div key={event.id} style={{ padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{event.title}</p>
                          <p style={{ fontSize: '0.75rem' }} className="text-secondary">
                            {event.organizer_name} • {formatDateTimeRange(event)} • <span className={`badge badge-${event.status}`}>{event.status}</span>
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {event.status === 'pending' && (
                            <>
                              <button onClick={() => updateEventStatus(event.id, 'approved')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', color: '#22c55e', borderColor: '#22c55e' }}>Approve</button>
                              <button onClick={() => updateEventStatus(event.id, 'rejected')} className="btn btn-outline" style={{ fontSize: '0.7rem', padding: '0.4rem 0.8rem', color: '#ef4444', borderColor: '#ef4444' }}>Reject</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )) : <p className="text-secondary" style={{ fontSize: '0.9rem' }}>No events found.</p>}
                </div>
              </div>

              {/* User Management */}
              <div className="card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                  <Users size={18} className="accent-primary" /> User Management
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {users.filter(u => u.role !== 'admin').map(u => (
                    <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.name}</p>
                        <p style={{ fontSize: '0.75rem' }} className="text-secondary">{u.email} • <span className="accent-primary">{u.role}</span></p>
                      </div>
                      <button onClick={() => handleDeleteUser(u.id)} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Global Bookings Recap */}
            <div className="card">
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem' }}>
                <Ticket size={18} className="accent-primary" /> Global Booking Records
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '1rem' }}>Ticket ID</th>
                      <th style={{ padding: '1rem' }}>Attendee</th>
                      <th style={{ padding: '1rem' }}>Event</th>
                      <th style={{ padding: '1rem' }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-primary)' }}>{b.ticket_id}</td>
                        <td style={{ padding: '1rem' }}>
                          <p style={{ fontWeight: 500 }}>{b.user_name}</p>
                          <p style={{ fontSize: '0.75rem' }} className="text-secondary">{b.user_email}</p>
                        </td>
                        <td style={{ padding: '1rem' }}>{b.event_title}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
