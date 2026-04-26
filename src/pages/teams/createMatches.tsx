import { useState, useEffect } from "react";
import JornadaFutbol from "../../Components/jornadaFutbol";
import { Button, Container, Form } from "react-bootstrap";
import toast from "react-hot-toast";

type Partido = {
    id_local_club: number;
    id_away_club: number;
    id_estadio: number;
    nombreLocal: string;
    nombreVisitante: string;
    nombreEstadio: string;
    home_score: number;
    away_score: number;
    match_date: string;  // ✅ faltaba
};

type Season = {
    id: number;
    current_season: string;
};

function CreateMatches() {
    const [partidos, setPartidos] = useState<Partido[]>([]);
    const [agregarPartido, setAgregarPartido] = useState(1);
    const [journey, setJourney] = useState<number>(0);
    const [season_id, setSeasonId] = useState<number>(0);
    const [seasons, setSeasons] = useState<Season[]>([]);

    const token = localStorage.getItem('token');

    // ✅ Cargar temporadas para el dropdown
    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await fetch(
                    'https://apileaderboard.onrender.com/seasons/get-seasons',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const json = await response.json();
                setSeasons(Array.isArray(json.result) ? json.result : []);
            } catch (error) {
                console.error(error);
            }
        };
        fetchSeasons();
    }, []);

    const handlePartidoChange = (index: number, data: Partido) => {
        const nuevos = [...partidos];
        nuevos[index] = data;
        setPartidos(nuevos);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // ✅ Validaciones antes de enviar
        if (!season_id || !journey) {
            toast.error('Selecciona temporada y número de jornada');
            return;
        }

        const partidosValidos = partidos.filter(
            p => p && p.id_local_club && p.id_away_club && p.match_date
        );

        if (partidosValidos.length === 0) {
            toast.error('No hay partidos válidos');
            return;
        }
        console.log(partidosValidos);
        try {
            const response = await fetch(
                'https://apileaderboard.onrender.com/leaderboard/create-matches',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    // ✅ Formato exacto que espera el backend
                    body: JSON.stringify({
                        season_id,
                        journey,
                        // ✅ Verifica que en CreateMatches.tsx el mapeo sea así:
                        // En handleSubmit de CreateMatches.tsx
                        partidos: partidosValidos.map(p => ({
                            home_club_id: p.id_local_club,
                            away_club_id: p.id_away_club,
                            home_score: p.home_score ?? null,
                            away_score: p.away_score ?? null,
                            match_date: p.match_date ? `${p.match_date}:00` : null, // ✅ agrega :00
                        }))
                    })
                }
            );

            const data = await response.json();
            console.log(data);
            if (response.ok) {
                toast.success(data.message);
                setPartidos([]);
                setAgregarPartido(1);
            } else {
                console.log(data);
                toast.error(data.message || 'Error al guardar');
            }

        } catch (error) {
            toast.error('Error de conexión');
        }
    };

    return (
        <div>
            <h1>Crear Jornada</h1>
            <Container>

                {/* ✅ Dropdown temporada */}
                <Form.Group className="mb-3">
                    <Form.Label>Temporada</Form.Label>
                    <Form.Select
                        value={season_id}
                        onChange={(e) => setSeasonId(Number(e.target.value))}
                    >
                        <option value={0}>Selecciona temporada</option>
                        {seasons.map(s => (
                            <option key={s.id} value={s.id}>{s.current_season}</option>
                        ))}
                    </Form.Select>
                </Form.Group>

                {/* ✅ Input jornada con estado */}
                <Form.Group className="mb-3">
                    <Form.Label>Número de Jornada</Form.Label>
                    <Form.Control
                        type="number"
                        placeholder="Ej: 1"
                        value={journey || ''}
                        onChange={(e) => setJourney(Number(e.target.value))}
                    />
                </Form.Group>

                <form onSubmit={handleSubmit}>
                    <Button variant="primary" onClick={() => setAgregarPartido(prev => prev + 1)}>
                        Agregar partido
                    </Button>

                    <Button type="submit" variant="success" className="ms-2">
                        Guardar jornada completa
                    </Button>

                    {Array.from({ length: agregarPartido }).map((_, i) => (
                        <JornadaFutbol
                            key={i}
                            numeroPartido={i + 1}
                            data={partidos[i] || {
                                id_local_club: 0,
                                id_away_club: 0,
                                id_estadio: 0,
                                nombreLocal: '',
                                nombreVisitante: '',
                                nombreEstadio: '',
                                home_score: null,
                                away_score: null,
                                match_date: '',  // ✅
                            }}
                            onChange={(data) => handlePartidoChange(i, data)}
                            onSave={() => console.log('Partido:', partidos[i])}
                        />
                    ))}
                </form>
            </Container>
        </div>
    );
}

export default CreateMatches;