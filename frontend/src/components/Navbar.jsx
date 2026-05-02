import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ 
      height: 'var(--header-height)', 
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky', 
      top: 0, 
      zIndex: 1000,
    }}>
      <div className="container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        height: '100%' 
      }}>
        <a href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '1.25rem', 
          fontWeight: 'bold' 
        }}>
          <span className="gradient-text">EventFlow</span>
        </a>

        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="/" className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500 }}>Home</a>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Shield size={16} /> Admin
                </Link>
              )}
              {(user.role === 'organizer' || user.role === 'admin') && (
                <Link to="/organizer" state={{ mode: 'calendar' }} className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={16} /> Calendar
                </Link>
              )}
              <Link to="/dashboard" className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <User size={16} /> My Bookings
              </Link>
              <button onClick={handleLogout} className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <LogOut size={16} /> Logout
              </button>
              <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`badge badge-${user.role}`} style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  {user.role}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>{user.name}</span>
              </div>
            </>
          ) : (
            <>
              <Link to="/" state={{ mode: 'calendar' }} className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Calendar size={16} /> Calendar
              </Link>
              <Link to="/auth" state={{ mode: 'login' }} className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Login
              </Link>
              <Link to="/auth" state={{ mode: 'register' }} className="text-secondary" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
