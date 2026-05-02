import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import EventDetails from './pages/EventDetails';
import BookingForm from './pages/BookingForm';
import AdminPanel from './pages/AdminPanel';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="App">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/book/:id" element={user ? <BookingForm /> : <Navigate to="/auth" />} />
          <Route path="/dashboard" element={user ? <UserDashboard /> : <Navigate to="/auth" />} />
          <Route path="/organizer" element={user?.role === 'organizer' || user?.role === 'admin' ? <OrganizerDashboard /> : <Navigate to="/" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
