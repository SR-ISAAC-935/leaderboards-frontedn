// src/Pages/MatchControl.tsx
import { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, InputGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://apileaderboard.onrender.com';
const BASE_URL = import.meta.env.VITE_API_URL || 'https://apileaderboard.onrender.com/api';

type Season   = { id: number; current_season: string; };
type Journey  = { id: number; journey: number; };
type Fecha    = { fecha: string; };
type Partido  = {
    id: number;
    equipo_local: string;
    equipo_visitante: string;
    logo_local: string;
    logo_visitante: string;
    home_score: number | null;
    away_score: number | null;
    match_date: string;
};

export default function MatchControl() {
    const [seasons,   setSeasons]   = useState<Season[]>([]);
    const [journeys,  setJourneys]  = useState<Journey[]>([]);
    const [fechas,    setFechas]    = useState<Fecha[]>([]);
    const [partidos,  setPartidos]  = useState<Partido[]>([]);

    const [season_id,  setSeasonId]  = useState<number>(0);
    const [journey_id, setJourneyId] = useState<number>(0);
    const [fecha,      setFecha]     = useState<string>('');
    const [loading,    setLoading]   = useState(false);

    const token = localStorage.getItem('token');

    // ✅ Cargar temporadas
    useEffect(() => {
        const fetch_ = async () => {
            try {
                const res = await fetch(`${BASE_URL}/seasons/get-seasons`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                setSeasons(Array.isArray(json.result) ? json.result : []);
            } catch (e) { console.error(e); }
        };
        fetch_();
    }, []);

    // ✅ Cargar jornadas cuando cambia temporada
    useEffect(() => {
        if (!season_id) return;
        setJourneys([]); setFechas([]); setPartidos([]);
        setJourneyId(0); setFecha('');

        const fetch_ = async () => {
            try {
                const res = await fetch(`${BASE_URL}/matches/journeys/${season_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                setJourneys(Array.isArray(json.data) ? json.data : []);
            } catch (e) { console.error(e); }
        };
        fetch_();
    }, [season_id]);

    // ✅ Cargar fechas cuando cambia jornada
    useEffect(() => {
        if (!journey_id) return;
        setFechas([]); setPartidos([]); setFecha('');

        const fetch_ = async () => {
            try {
                const res = await fetch(`${BASE_URL}/matches/dates/${journey_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                setFechas(Array.isArray(json.data) ? json.data : []);
            } catch (e) { console.error(e); }
        };
        fetch_();
    }, [journey_id]);

    // ✅ Cargar partidos cuando cambia fecha
    useEffect(() => {
        if (!journey_id || !fecha) return;
        setPartidos([]);

        const fetch_ = async () => {
            try {
                const res = await fetch(`${BASE_URL}/matches/matches/${journey_id}/${fecha}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                setPartidos(Array.isArray(json.data) ? json.data : []);
            } catch (e) { console.error(e); }
        };
        fetch_();
    }, [fecha]);

    // ✅ Actualizar score localmente
    const handleScoreChange = (index: number, field: 'home_score' | 'away_score', value: string) => {
        const nuevos = [...partidos];
        nuevos[index] = {
            ...nuevos[index],
            [field]: value === '' ? null : Number(value)
        };
        setPartidos(nuevos);
    };

    // ✅ Guardar scores → BD + WebSocket
    const handleUpdateScores = async () => {
        if (partidos.length === 0) {
            toast.error('No hay partidos cargados');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/leaderboard/update-scores`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    season_id,
                    partidos: partidos.map(p => ({
                        id:         p.id,
                        home_score: p.home_score ?? 0,
                        away_score: p.away_score ?? 0,
                    }))
                })
            });

            const data = await response.json();
            if (response.ok) {
                toast.success('Scores actualizados ✅');
            } else {
                toast.error(data.message || 'Error al actualizar');
            }
        } catch (error) {
            toast.error('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#1a1a2e', minHeight: '100vh', padding: '20px' }}>
            <Container fluid>
                <h2 className="text-white mb-4">🎮 Match Control</h2>

                {/* SELECTORES */}
                <Row className="mb-4 g-3">
                    <Col md={4}>
                        <Form.Label className="text-white fw-bold">Temporada</Form.Label>
                        <Form.Select
                            className="bg-secondary text-white border-0"
                            value={season_id}
                            onChange={(e) => setSeasonId(Number(e.target.value))}
                        >
                            <option value={0}>Selecciona temporada</option>
                            {seasons.map(s => (
                                <option key={s.id} value={s.id}>{s.current_season}</option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col md={4}>
                        <Form.Label className="text-white fw-bold">Jornada</Form.Label>
                        <Form.Select
                            className="bg-secondary text-white border-0"
                            value={journey_id}
                            onChange={(e) => setJourneyId(Number(e.target.value))}
                            disabled={journeys.length === 0}
                        >
                            <option value={0}>Selecciona jornada</option>
                            {journeys.map(j => (
                                <option key={j.id} value={j.id}>Jornada {j.journey}</option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col md={4}>
                        <Form.Label className="text-white fw-bold">Fecha</Form.Label>
                        <Form.Select
                            className="bg-secondary text-white border-0"
                            value={fecha}
                            onChange={(e) => setFecha(e.target.value)}
                            disabled={fechas.length === 0}
                        >
                            <option value="">Selecciona fecha</option>
                            {fechas.map((f, i) => (
                                <option key={i} value={f.fecha}>
                                    {new Date(f.fecha).toLocaleDateString('es-GT', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long'
                                    })}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>
                </Row>

                {/* PARTIDOS */}
                {partidos.length > 0 && (
                    <>
                        <Row className="g-3 mb-4">
                            {partidos.map((partido, i) => (
                                <Col key={partido.id} md={4} lg={2}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card className="bg-dark border-secondary text-white h-100">
                                            <Card.Body className="p-3">

                                                {/* LOCAL */}
                                                <div className="text-center mb-2">
                                                    <img
                                                        src={partido.logo_local}
                                                        alt={partido.equipo_local}
                                                        width={40}
                                                        className="mb-1"
                                                    />
                                                    <div className="small fw-bold">
                                                        {partido.equipo_local}
                                                    </div>
                                                </div>

                                                {/* SCORE */}
                                                <InputGroup className="mb-2">
                                                    <Form.Control
                                                        type="number"
                                                        min={0}
                                                        className="bg-secondary text-white border-0 text-center shadow-none"
                                                        value={partido.home_score ?? ''}
                                                        onChange={(e) => handleScoreChange(i, 'home_score', e.target.value)}
                                                    />
                                                    <InputGroup.Text className="bg-dark text-white border-0 fw-bold">
                                                        -
                                                    </InputGroup.Text>
                                                    <Form.Control
                                                        type="number"
                                                        min={0}
                                                        className="bg-secondary text-white border-0 text-center shadow-none"
                                                        value={partido.away_score ?? ''}
                                                        onChange={(e) => handleScoreChange(i, 'away_score', e.target.value)}
                                                    />
                                                </InputGroup>

                                                {/* VISITANTE */}
                                                <div className="text-center">
                                                    <img
                                                        src={partido.logo_visitante}
                                                        alt={partido.equipo_visitante}
                                                        width={40}
                                                        className="mb-1"
                                                    />
                                                    <div className="small fw-bold">
                                                        {partido.equipo_visitante}
                                                    </div>
                                                </div>

                                            </Card.Body>
                                        </Card>
                                    </motion.div>
                                </Col>
                            ))}
                        </Row>

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                variant="success"
                                size="lg"
                                className="w-100 fw-bold"
                                onClick={handleUpdateScores}
                                disabled={loading}
                            >
                                {loading ? 'Actualizando...' : '📡 Actualizar Scores en Vivo'}
                            </Button>
                        </motion.div>
                    </>
                )}

                {partidos.length === 0 && fecha && (
                    <div className="text-center text-muted py-5">
                        No hay partidos para esta fecha
                    </div>
                )}

            </Container>
        </div>
    );
}