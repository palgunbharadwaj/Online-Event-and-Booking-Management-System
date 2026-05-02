import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight, Loader } from 'lucide-react';

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.mode !== 'register');

  useEffect(() => {
    if (location.state?.mode) {
      setIsLogin(location.state.mode === 'login');
    }
  }, [location.state]);

  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true, state: { ...location.state, mode: 'list' } });
      } else {
        await api.post('/auth/register', formData);
        setIsLogin(true);
        alert('Registration successful! Please login.');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: 'calc(100vh - var(--header-height) - 4rem)',
      padding: '1rem'
    }}>
      <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ 
            width: '48px', height: '48px', 
            borderRadius: '12px', 
            background: 'var(--accent-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 1rem',
            color: 'white'
          }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
          <p className="text-secondary" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
            {isLogin ? 'Enter your credentials to access your account' : 'Register as an attendee or organizer to join Indian community events'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {!isLogin && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  style={{ paddingLeft: '2.8rem' }}
                  required 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                />
              </div>
            </div>
          )}
          
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="email" 
                placeholder="name@company.com" 
                style={{ paddingLeft: '2.8rem' }}
                required 
                value={formData.email} 
                onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                placeholder="••••••••" 
                style={{ paddingLeft: '2.8rem' }}
                required 
                value={formData.password} 
                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Role</label>
            <select 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="user">Attendee/Guest</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ height: '48px', marginTop: '0.5rem' }}>
            {loading ? <Loader className="animate-spin" size={20} /> : (
              <>
                {isLogin ? `Sign In as ${formData.role === 'user' ? 'Attendee/Guest' : formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}` : 'Create Account'} <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
          <p className="text-secondary" style={{ fontSize: '0.9rem' }}>
            {isLogin ? "New to EventFlow?" : "Already a member?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              style={{ color: 'var(--accent-primary)', fontWeight: 600, marginLeft: '8px', cursor: 'pointer' }}
            >
              {isLogin ? 'Open Register Form' : 'Back to Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
