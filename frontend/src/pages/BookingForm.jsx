import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Ticket, CreditCard, ArrowLeft, Loader, Calendar, MapPin, CheckCircle, Users, Percent, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateDiscount } from '../utils/festivalUtils';
import { formatDateTimeRange } from '../utils/dateFormatter';

const BookingForm = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingStatus, setBookingStatus] = useState('idle'); // idle, processing, success
  const [bookingDetails, setBookingDetails] = useState(null);
  const [numTickets, setNumTickets] = useState(1);
  const [discountInfo, setDiscountInfo] = useState({ festival: null, percent: 0 });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get('/events');
        const found = data.find(e => e.id === parseInt(id));
        setEvent(found);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  useEffect(() => {
    if (event) {
      const discount = calculateDiscount(event.date, numTickets);
      setDiscountInfo(discount);
    }
  }, [event, numTickets]);

  const subtotal = event ? event.price * numTickets : 0;
  const discountAmount = (subtotal * discountInfo.percent) / 100;
  const total = subtotal - discountAmount;

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingStatus('processing');
    try {
      const response = await api.post('/bookings', { event_id: parseInt(id) });
      setBookingDetails(response.data);
      setBookingStatus('success');
    } catch (error) {
      alert(error.response?.data?.error || 'Booking failed');
      setBookingStatus('idle');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem' }}><Loader className="animate-spin" color="var(--accent-primary)" size={48} /></div>;
  if (!event) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}><h2>Event not found</h2></div>;

  if (bookingStatus === 'success' && bookingDetails) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ textAlign: 'center', padding: '4rem', maxWidth: '600px' }}>
          <div style={{ background: '#dcfce7', color: '#166534', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Success!</h2>
          <p className="text-secondary" style={{ marginBottom: '2rem' }}>Your ticket has been booked successfully. Here are your booking details:</p>
          
          <div style={{ background: 'var(--bg-secondary)', padding: '2rem', borderRadius: '16px', textAlign: 'left', marginBottom: '2rem', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>Ticket Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem', fontSize: '0.95rem' }}>
              <span className="text-secondary">Ticket ID:</span>
              <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{bookingDetails.ticketId}</span>
              
              <span className="text-secondary">Event:</span>
              <span style={{ fontWeight: 600 }}>{event.title}</span>
              
              <span className="text-secondary">Duration:</span>
              <span>{formatDateTimeRange(event)}</span>
              
              <span className="text-secondary">Location:</span>
              <span>{event.location}</span>
              
              <span className="text-secondary">Booked By:</span>
              <span>{user.name}</span>

              {user?.role === 'admin' && (
                <>
                  <span className="text-secondary">Booking ID:</span>
                  <span>{bookingDetails.bookingId}</span>
                  <span className="text-secondary">Organizer ID:</span>
                  <span>{event.organizer_id}</span>
                </>
              )}
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
            Go to My Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="container" style={{ maxWidth: '900px' }}>
        <Link to={`/event/${id}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontSize: '0.9rem' }} className="text-secondary">
          <ArrowLeft size={16} /> Cancel and Back to Details
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          {/* Checkout Form */}
          <div className="card" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem' }}>Checkout</h2>
            
            <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} className="accent-primary" /> Number of Guests / Tickets
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <input 
                      type="number" 
                      min="1" 
                      max={event.seats} 
                      value={numTickets} 
                      onChange={(e) => setNumTickets(parseInt(e.target.value) || 1)}
                      style={{ maxWidth: '120px' }}
                    />
                    <span className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      Group booking available. More tickets = better discounts!
                    </span>
                  </div>
               </div>

               <div style={{ padding: '1.5rem', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CreditCard size={18} className="accent-primary" /> Payment Method
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '1rem', background: 'white', borderRadius: '8px', border: '1px solid var(--accent-primary)' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '6px solid var(--accent-primary)' }}></div>
                    <span style={{ fontWeight: 600 }}>Mock Payment (Demo Mode)</span>
                  </div>
               </div>

               <button type="submit" disabled={bookingStatus === 'processing'} className="btn btn-primary" style={{ height: '56px', fontSize: '1.1rem' }}>
                 {bookingStatus === 'processing' ? <Loader className="animate-spin" size={24} /> : `Complete Booking • $${total.toFixed(2)}`}
               </button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
             <div className="card" style={{ background: 'var(--bg-secondary)', borderStyle: 'dashed' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
                   <div style={{ width: '80px', height: '80px', borderRadius: '8px', background: `url(${event.image_url || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=200'}) center/cover` }}></div>
                   <div>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>{event.title}</p>
                      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Date & Time</p>
                      <p style={{ fontWeight: 600 }}>
                        {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        {event.time && ` • ${event.time}`}
                      </p>
                      <p className="text-secondary" style={{ fontSize: '0.8rem' }}>
                         <MapPin size={12} style={{ marginBottom: '-2px' }} /> {event.location}
                      </p>
                   </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }} className="text-secondary">
                      <span>Standard Ticket x {numTickets}</span>
                      <span>${subtotal.toFixed(2)}</span>
                   </div>
                   {discountInfo.percent > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem', color: '#166534', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 600 }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                           <Percent size={14} /> {discountInfo.festival ? `${discountInfo.festival} Special` : 'Group Discount'}
                         </span>
                         <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }} className="text-secondary">
                      <span>Processing Fee</span>
                      <span>$0.00</span>
                   </div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontWeight: 700 }}>Total Due</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>${total.toFixed(2)}</span>
                   </div>
                </div>

                {discountInfo.festival && (
                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #d1fae5', display: 'flex', gap: '10px' }}>
                       <Info size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                       <p style={{ fontSize: '0.8rem', color: '#065f46', lineHeight: '1.4' }}>
                         <strong>Festival Special Applied!</strong> Because this event is near <strong>{discountInfo.festival}</strong>, you've received an enhanced discount for your group booking.
                       </p>
                    </div>
                 )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;
