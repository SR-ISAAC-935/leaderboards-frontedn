// Pages/MatchesPage.tsx
import { useState } from "react";
import { Container, Tab, Tabs } from "react-bootstrap";
import CreateMatches from "../teams/createMatches";
import UpdateScores from "../../Components/UpdateScores";

export default function MatchesPage() {
    const [activeTab, setActiveTab] = useState('crear');

    return (
        <Container className="py-4">
            <h2 className="text-white mb-4">⚽ Gestión de Partidos</h2>
            <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k || 'crear')}
                className="mb-3"
            >
                <Tab eventKey="crear" title="📅 Crear Jornada">
                    <CreateMatches />
                </Tab>
                <Tab eventKey="actualizar" title="🏆 Actualizar Scores">
                    <UpdateScores />
                </Tab>
            </Tabs>
        </Container>
    );
}