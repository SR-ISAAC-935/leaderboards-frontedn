// Pages/UpdateScores.tsx
import { useState, useEffect } from "react";
import { Container, Form, Row, Col, Card, Button, InputGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

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

export default function UpdateScores() {
    const [seasons,  setSeasons]  = useState<Season[]>([]);
    const [journeys, setJourneys] = useState<Journey[]>([]);
    const [fechas,   setFechas]   = useState<Fecha[]>([]);
    const [partidos, setPartidos] = useState<Partido[]>([]);

    const [season_id,   setSeasonId]   = useState<number>(0);
    const [journey_id,  setJourneyId]  = useState<number>(0);
    const [fecha,       setFecha]      = useState<string>('');
    const [loading,     setLoading]    = useState(false);

    const token = localStorage.getItem('token');

    // ✅ Cargar temporadas al montar
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const res = await fetch(
                    'https://apileaderboard.onrender.com/seasons/get-seasons',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const json = await res.json();
                setSeasons(Array.isArray(json.result) ? json.result : []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSeasons();
    }, []);

    // ✅ Cargar jornadas cuando cambia temporada
    useEffect(() => {
        if (!season_id) return;
        setJourneys([]);
        setFechas([]);
        setPartidos([]);
        setJourneyId(0);
        setFecha('');

        const fetchJourneys = async () => {
            try {
                const res = await fetch(
                    `https://apileaderboard.onrender.com/matches/journeys/${season_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const json = await res.json();
                setJourneys(Array.isArray(json.data) ? json.data : []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchJourneys();
    }, [season_id]);

    // ✅ Cargar fechas cuando cambia jornada
    useEffect(() => {
        if (!journey_id) return;
        setFechas([]);
        setPartidos([]);
        setFecha('');

        const fetchFechas = async () => {
            try {
                const res = await fetch(
                    `https://apileaderboard.onrender.com/matches/dates/${journey_id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const json = await res.json();
                setFechas(Array.isArray(json.data) ? json.data : []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchFechas();
    }, [journey_id]);

    // ✅ Cargar partidos cuando cambia fecha
    useEffect(() => {
        if (!journey_id || !fecha) return;
        setPartidos([]);

        const fetchPartidos = async () => {
            try {
                const res = await fetch(
                    `https://apileaderboard.onrender.com/matches/matches/${journey_id}/${fecha}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const json = await res.json();
                setPartidos(Array.isArray(json.data) ? json.data : []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchPartidos();
    }, [fecha]);

    // ✅ Actualizar score local sin tocar BD
    const handleScoreChange = (index: number, field: 'home_score' | 'away_score', value: string) => {
        const nuevos = [...partidos];
        nuevos[index] = {
            ...nuevos[index],
            [field]: value === '' ? null : Number(value)
        };
        setPartidos(nuevos);
    };

    // ✅ Enviar scores al backend
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (partidos.length === 0) {
            toast.error('No hay partidos cargados');
            return;
        }

        // Validar que todos tengan score
        for (let i = 0; i < partidos.length; i++) {
            if (partidos[i].home_score === null || partidos[i].away_score === null) {
                toast.error(`Partido ${i + 1} no tiene marcador completo`);
                return;
            }
        }

        setLoading(true);
        try {
            const response = await fetch(
                'https://apileaderboard.onrender.com/leaderboard/update-scores',
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        season_id,
                        partidos: partidos.map(p => ({
                            id:         p.id,
                            home_score: p.home_score,
                            away_score: p.away_score,
                        }))
                    })
                }
            );

            const data = await response.json();
            if (response.ok) {
                toast.success(data.message);
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
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                    >
                        <Card className="shadow-lg border-0 bg-dark text-white">
                            <Card.Header className="bg-primary text-center py-3 border-0">
                                <h4 className="mb-0 fw-bold">🏆 Actualizar Marcadores</h4>
                            </Card.Header>

                            <Card.Body className="p-4">
                                <form onSubmit={handleSubmit}>

                                    {/* FILTROS */}
                                    <Row className="mb-4 g-3">
                                        <Col md={4}>
                                            <Form.Label className="fw-bold">Temporada</Form.Label>
                                            <Form.Select
                                                className="bg-secondary text-white border-0"
                                                value={season_id}
                                                onChange={(e) => setSeasonId(Number(e.target.value))}
                                            >
                                                <option value={0}>Selecciona</option>
                                                {seasons.map(s => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.current_season}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Label className="fw-bold">Jornada</Form.Label>
                                            <Form.Select
                                                className="bg-secondary text-white border-0"
                                                value={journey_id}
                                                onChange={(e) => setJourneyId(Number(e.target.value))}
                                                disabled={journeys.length === 0}
                                            >
                                                <option value={0}>Selecciona</option>
                                                {journeys.map(j => (
                                                    <option key={j.id} value={j.id}>
                                                        Jornada {j.journey}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>

                                        <Col md={4}>
                                            <Form.Label className="fw-bold">Fecha</Form.Label>
                                            <Form.Select
                                                className="bg-secondary text-white border-0"
                                                value={fecha}
                                                onChange={(e) => setFecha(e.target.value)}
                                                disabled={fechas.length === 0}
                                            >
                                                <option value="">Selecciona</option>
                                                {fechas.map((f, i) => (
                                                    <option key={i} value={f.fecha}>
                                                        {new Date(f.fecha).toLocaleDateString('es-GT', {
                                                            weekday: 'long',
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </option>
                                                ))}
                                            </Form.Select>
                                        </Col>
                                    </Row>

                                    {/* PARTIDOS */}
                                    {partidos.length > 0 && (
                                        <>
                                            {partidos.map((partido, i) => (
                                                <motion.div
                                                    key={partido.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    className="mb-3"
                                                >
                                                    <Card className="bg-secondary border-0">
                                                        <Card.Body className="p-3">
                                                            <Row className="align-items-center g-2">

                                                                {/* LOCAL */}
                                                                <Col xs={4} className="text-center">
                                                                    <img
                                                                        src={partido.logo_local}
                                                                        alt={partido.equipo_local}
                                                                        width={40}
                                                                        className="mb-1"
                                                                    />
                                                                    <div className="small fw-bold">
                                                                        {partido.equipo_local}
                                                                    </div>
                                                                </Col>

                                                                {/* SCORES */}
                                                                <Col xs={4}>
                                                                    <InputGroup className="justify-content-center">
                                                                        <Form.Control
                                                                            type="number"
                                                                            min={0}
                                                                            className="bg-dark text-white border-0 text-center shadow-none"
                                                                            style={{ width: '60px' }}
                                                                            value={partido.home_score ?? ''}
                                                                            onChange={(e) => handleScoreChange(i, 'home_score', e.target.value)}
                                                                        />
                                                                        <InputGroup.Text className="bg-dark text-white border-0 fw-bold">
                                                                            -
                                                                        </InputGroup.Text>
                                                                        <Form.Control
                                                                            type="number"
                                                                            min={0}
                                                                            className="bg-dark text-white border-0 text-center shadow-none"
                                                                            style={{ width: '60px' }}
                                                                            value={partido.away_score ?? ''}
                                                                            onChange={(e) => handleScoreChange(i, 'away_score', e.target.value)}
                                                                        />
                                                                    </InputGroup>
                                                                    <div className="text-center text-muted small mt-1">
                                                                        {new Date(partido.match_date).toLocaleTimeString('es-GT', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </div>
                                                                </Col>

                                                                {/* VISITANTE */}
                                                                <Col xs={4} className="text-center">
                                                                    <img
                                                                        src={partido.logo_visitante}
                                                                        alt={partido.equipo_visitante}
                                                                        width={40}
                                                                        className="mb-1"
                                                                    />
                                                                    <div className="small fw-bold">
                                                                        {partido.equipo_visitante}
                                                                    </div>
                                                                </Col>

                                                            </Row>
                                                        </Card.Body>
                                                    </Card>
                                                </motion.div>
                                            ))}

                                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                                <Button
                                                    type="submit"
                                                    variant="success"
                                                    className="w-100 py-2 fw-bold mt-2"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Guardando...' : '💾 Guardar Marcadores'}
                                                </Button>
                                            </motion.div>
                                        </>
                                    )}

                                    {/* EMPTY STATE */}
                                    {partidos.length === 0 && fecha && (
                                        <div className="text-center text-muted py-4">
                                            No hay partidos para esta fecha
                                        </div>
                                    )}

                                </form>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
}