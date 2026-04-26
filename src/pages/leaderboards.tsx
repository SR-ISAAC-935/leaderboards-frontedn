import { Container,Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';


function Leaderboards() {
    const navigate = useNavigate();
    return (
        <>  
        <h1>Leaderboards</h1>
       <Container>
        
        <Button variant='success' onClick={()=> navigate('/teams/createScorers')}>Ingresar Goleadores</Button>
        <Button variant='primary' onClick={()=> navigate('/teams/createMatches')}>Agregar Partidos Jugados</Button>
        <Button variant='warning' onClick={()=> navigate('/teams/createTeams')}>Agregar equipos</Button>
        <Button variant='primary' onClick={()=> navigate('/teams/getTeams')}>listado de equipos</Button>
        <Button variant='primary' onClick={()=> navigate('/leaderboard/MatchPage')}>Partidos Jugados</Button>     
        <Button variant='primary' onClick={()=> navigate('/overlay/matchControl')}>Control de Partidos</Button>
        <Button variant='primary' onClick={()=> navigate('/overlay/people')}>Control de Personas</Button>
       </Container>
        </>
    )
}

export default Leaderboards;