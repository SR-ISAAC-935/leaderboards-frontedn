import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import '../CSS/Navbar.css';
function MyNavbarLogout() {
  // En MyNavbarLogout.tsx agrega esto al inicio:
const location = useLocation();
if (location.pathname === '/overlay/people') return null; // ✅ oculta navbar en overlay
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogout = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('https://apileaderboard.onrender.com/auth/logout', {
        method: 'POST',
        credentials: 'include', 
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Si guardaste algo en localStorage (como el nombre de usuario), límpialo aquí
        localStorage.removeItem('token'); 
        localStorage.removeItem('username');
        Cookies.remove('username');
        navigate('/'); // Redirige a la página de Login
      } else {
        setError('No se pudo cerrar sesión.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <>
    
     <Navbar bg='dark' data-bs-theme="dark" className="bg-body-tertiary" expand="lg" >
  {/* sin Container, el CSS controla el ancho */}
  <Nav className="ms-auto d-flex align-items-center gap-2">
    <Nav.Link onClick={() => navigate('/Leaderboards')}>
      🏆 Leaderboard
    </Nav.Link>
    <Button variant="outline-danger" onClick={handleLogout} disabled={loading}>
      {loading ? <Spinner animation="border" size="sm" /> : 'Logout'}
    </Button>
    <label className="form-label">Welcome, {localStorage.getItem('username') || Cookies.get('username') || 'User'}</label>
  </Nav>
</Navbar>
      
      {/* Mostrar error si falla el logout */}
      {error && <div className="alert alert-danger py-1 text-center m-0">{error}</div>}
    </>
  );
}

export default MyNavbarLogout;

