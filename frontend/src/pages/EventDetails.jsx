import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Calendar, MapPin, Ticket, Clock, ArrowLeft, Loader, ShieldCheck } from 'lucide-react';
import { formatDateTimeRange } from '../utils/dateFormatter';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get('/events');
        const found = data.find(e => e.id === parseInt(id));
        setEvent(found);
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader className="animate-spin" color="var(--accent-primary)" size={48} /></div>;
  if (!event) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><h2>Event not found</h2><Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Home</Link></div>;

  return (
    <div className="animate-fade-in">
      <div className="container">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontSize: '0.9rem' }} className="text-secondary">
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
          {/* Main Info */}
          <div>
            <div style={{ 
              height: '400px', 
              borderRadius: '16px', 
              overflow: 'hidden',
              marginBottom: '2rem',
              boxShadow: 'var(--shadow-md)',
              background: `url(${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200'}) center/cover`
            }}></div>
            
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>{event.title}</h1>
            
             <div style={{ marginBottom: '2.5rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '2px solid var(--accent-primary)', display: 'inline-block' }}>About this Event</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                  {event.description || "No description provided for this event. Please contact the organizer for more details about the schedule, performers, and age restrictions."}
                </p>
             </div>
          </div>

          {/* Sidebar Info & Booking */}
          <div>
            <div className="card" style={{ position: 'sticky', top: 'calc(var(--header-height) + 2rem)', padding: '2rem' }}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                   <div style={{ background: '#e0e7ff', color: 'var(--accent-primary)', padding: '10px', borderRadius: '8px' }}>
                     <Calendar size={20} />
                   </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date & Time</p>
                      <p style={{ fontWeight: 600 }}>
                        {formatDateTimeRange(event)}
                      </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
                   <div style={{ background: '#e0e7ff', color: 'var(--accent-primary)', padding: '10px', borderRadius: '8px' }}>
                     <MapPin size={20} />
                   </div>
                   <div>
                     <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Location</p>
                     <p style={{ fontWeight: 600 }}>{event.location}</p>
                   </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ background: '#e0e7ff', color: 'var(--accent-primary)', padding: '10px', borderRadius: '8px' }}>
                     <ShieldCheck size={20} />
                   </div>
                   <div>
                     <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Organizer</p>
                     <p style={{ fontWeight: 600 }}>{event.organizer_name || "Verified Organizer"}</p>
                   </div>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', marginBottom: '2rem' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <span className="text-secondary">Admission Fee</span>
                   <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{event.price === 0 ? 'FREE' : `$${event.price}`}</span>
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span className="text-secondary">Availability</span>
                   <span style={{ fontWeight: 600, color: '#22c55e' }}>{event.seats} Seats Left</span>
                 </div>
              </div>

              <Link to={`/book/${event.id}`} className="btn btn-primary" style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}>
                 Book Tickets Now
              </Link>
              <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem' }} className="text-secondary">
                 Secure checkout powered by EventFlow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
