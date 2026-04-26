import { Card, Col, Container, Form, InputGroup, Row, Button, ListGroup } from "react-bootstrap";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import '../CSS/inscripcionEquipos.css';

type Props = {
  numeroPartido: number;
  data: {
    id_local_club: number;
    id_estadio: number;
    id_away_club: number;
    nombreLocal: string;
    nombreVisitante: string;
    nombreEstadio: string;
    home_score: number;
    away_score: number;
    match_date: string;  // ✅ agrega esto
  };
  onChange: (data: any) => void;
  onSave: () => void;
};

export default function JornadaFutbol({
  numeroPartido,
  data,
  onChange,
  onSave,
}: Props) {

  const [teams, setTeams] = useState<any[]>([]);
  const [filteredLocal, setFilteredLocal] = useState<any[]>([]);
  const [filteredVisitante, setFilteredVisitante] = useState<any[]>([]);

  const token = localStorage.getItem('token');

  // 🔥 FETCH SOLO UNA VEZ
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch(
          'https://apileaderboard.onrender.com/leaderboard/getTeams',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("DATA:", data);

        // 🔥 aseguras SIEMPRE array
        setTeams(
          Array.isArray(data?.result?.recordset)
            ? data.result.recordset
            : []
        );
      } catch (error) {
        console.error(error);
        setTeams([]); // fallback
      }
    };

    fetchTeams();
  }, []);

  // 🔍 FILTRO LOCAL
  const handleSearchLocal = (value: string) => {
   onChange({ ...data, nombreLocal: value });

    if (value.length >= 2) {
      if (!Array.isArray(teams)) return; // 🛡️ protección

      const results = teams.filter(t =>
        t.club_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocal(results);
    } else {
      setFilteredLocal([]);
    }
  };

  // 🔍 FILTRO VISITANTE
  const handleSearchVisitante = (value: string) => {
    onChange({ ...data, nombreVisitante: value });

    if (value.length >= 2) {
      const results = teams.filter(t =>
        t.club_name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredVisitante(results);
    } else {
      setFilteredVisitante([]);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="shadow-lg border-0 bg-dark text-white">
              <Card.Header className="bg-primary text-center py-3 border-0">
                <h4 className="mb-0 fw-bold">⚽ Partido #{numeroPartido}</h4>
              </Card.Header>

              <Card.Body className="p-4">
                <Form as="div">

                  {/* 🔵 EQUIPO LOCAL */}
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>Equipo Local</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-secondary border-0 text-white">⚽</InputGroup.Text>
                      <Form.Control
                        className="bg-secondary text-white border-0 shadow-none"
                        value={data.nombreLocal || ''}
                        onChange={(e) => handleSearchLocal(e.target.value)}
                      />
                    </InputGroup>

                    {filteredLocal.length > 0 && (
                      <ListGroup className="position-absolute w-100 z-3">
                        {filteredLocal.map((team, i) => (
                          <ListGroup.Item
                            key={i}
                            action
                            onClick={() => {
                              onChange({
                                ...data,
                                id_local_club: team.id,
                                id_estadio: team.estadio,
                                nombreLocal: team.club_name,
                                nombreEstadio: team.nombreStadium,
                              });
                              setFilteredLocal([]);
                            }}
                          >
                            {team.club_name}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Form.Group>

                  {/* 🏟️ ESTADIO */}
                  <Form.Group className="mb-3">
                    <Form.Label>Estadio</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-secondary text-white border-0">🏟️</InputGroup.Text>
                      <Form.Control
                        className="bg-secondary text-white border-0 shadow-none"
                        value={data.nombreEstadio || ''}
                        readOnly
                        onChange={(e) =>
                          onChange({
                            ...data,
                            estadio: e.target.value,
                          })

                        }
                      />
                    </InputGroup>
                  </Form.Group>
                  {/* 📅 FECHA Y HORA */}
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha y Hora</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-secondary text-white border-0">📅</InputGroup.Text>
                      <Form.Control
                        type="datetime-local"
                        className="bg-secondary text-white border-0 shadow-none"
                        value={data.match_date || ''}
                        onChange={(e) => onChange({ ...data, match_date: e.target.value })}
                      />
                    </InputGroup>
                  </Form.Group>
                  {/* 🔴 EQUIPO VISITANTE */}
                  <Form.Group className="mb-3 position-relative">
                    <Form.Label>Equipo Visitante</Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="bg-secondary border-0 text-white">⚽</InputGroup.Text>
                      <Form.Control
                        className="bg-secondary text-white border-0 shadow-none"
                        value={data.nombreVisitante || ''}
                        onChange={(e) => handleSearchVisitante(e.target.value)}
                      />
                    </InputGroup>

                    {filteredVisitante.length > 0 && (
                      <ListGroup className="position-absolute w-100 z-3">
                        {filteredVisitante.map((team, i) => (
                          <ListGroup.Item
                            key={i}
                            action
                            onClick={() => {
                              onChange({
                                ...data,
                                id_away_club: team.id,
                                nombreVisitante: team.club_name,
                              });
                              setFilteredVisitante([]);
                            }}
                          >
                            {team.club_name}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </Form.Group>

                  {/* 💾 BOTÓN */}
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <Button
                      variant="success"
                      className="w-100 mt-2"
                      onClick={onSave}
                    >
                      Guardar este partido
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