import { Form, Card, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { motion } from 'framer-motion';
import '../CSS/inscripcionEquipos.css';

type Props = {
    data: {
        club_name: string;
        estadio: string;
        images: File | null;
    };
    onChange: (data: any) => void;
};

export default function InscripcionEquipos({ data, onChange }: Props) {
    // ✅ Sin estados locales — el padre maneja todo

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="shadow-lg border-0 bg-dark text-white glass-card">
                            <Card.Header className="bg-primary text-center py-3 border-0">
                                <h3 className="mb-0 fw-bold text-white">📝 Registro de Equipo</h3>
                            </Card.Header>

                            <Card.Body className="p-4">
                                <Form as="div">
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Nombre del Equipo</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-secondary text-white border-0">⚽</InputGroup.Text>
                                            <Form.Control
                                                className="bg-secondary text-white border-0 shadow-none custom-input"
                                                value={data.club_name}
                                                onChange={(e) => onChange({ ...data, club_name: e.target.value })}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Nombre del Estadio</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-secondary border-0 text-white">🏟️</InputGroup.Text>
                                            <Form.Control
                                                className="bg-secondary text-white border-0 shadow-none custom-input"
                                                value={data.estadio}
                                                onChange={(e) => onChange({ ...data, estadio: e.target.value })}
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-bold">Logo del Equipo</Form.Label>
                                        <Form.Control
                                            className="bg-secondary text-white border-0 custom-file-input"
                                            type="file"
                                            accept='.png, .jpg, .jpeg'
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const tiposPermitidos = ["image/png", "image/jpeg"];
                                                if (!tiposPermitidos.includes(file.type)) {
                                                    alert("Solo PNG o JPG");
                                                    return;
                                                }

                                                onChange({ ...data, images: file });
                                            }}
                                        />
                                        <Form.Text className="text-muted">
                                            Usa imágenes en formato PNG o JPG (Máx. 2MB).
                                        </Form.Text>
                                    </Form.Group>

                                    {/* ✅ Sin botón — el submit lo maneja el padre con su propio botón */}

                                </Form>
                            </Card.Body>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </Container>
    );
}