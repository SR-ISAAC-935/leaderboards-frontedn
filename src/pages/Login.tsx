import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { Container, Row, Col, Form, Button, Card, InputGroup, Spinner } from 'react-bootstrap';
import '../CSS/Login.css';
function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('https://apileaderboard.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(`¡Bienvenido de nuevo, ${username}!`);
        localStorage.setItem('token',data.token)
        localStorage.setItem('username', username);
        setTimeout(() => navigate('/Leaderboards'), 1500);
      } else {
        toast.error(data.message || 'Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center min-vh-100">
      <Toaster position="top-center" />

      {/* Título animado con Bootstrap classes */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-5"
      >
        <h1 className="display-4 fw-bold text-white shadow-text">🏆 La Carrera</h1>
        <p className="lead text-light">Descenso y Clasificación a la Liguilla</p>
      </motion.div>

      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-lg border-0 bg-dark text-white p-4 glass-card">
              <Card.Body>
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                
                <Form onSubmit={handleLogin}>
                  <Form.Group className="mb-3">
                    <Form.Label>Usuario</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-primary border-0 text-white">👤</InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Tu nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="bg-secondary text-white border-0 shadow-none"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Contraseña</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-primary border-0 text-white">🔒</InputGroup.Text>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="bg-secondary text-white border-0 shadow-none"
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="w-100 py-2 fw-bold text-uppercase"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                          Cargando...
                        </>
                      ) : 'Entrar al Estadio'}
                    </Button>
                  </motion.div>
                </Form>
              </Card.Body>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;