import { BrowserRouter, Routes, Route} from "react-router-dom";
import Login from "./pages/Login";
import Leaderboards from "../src/pages/leaderboards";
import CreateTeams from "./pages/teams/createTeams";
import MyNavbarLogout from "./Components/Navbar";import CreateScorers from "./pages/teams/createScorers";
import CreateMatches from "./pages/teams/createMatches";
import GetTeams from "../src/pages/teams/getTeams";
import MatchesPage from "./pages/teams/MatchesPage";
import MatchControl from "./pages/overlays/MatchControl";
import Overlay from "./pages/Overlay";
 "./Components/Navbar";
function App() {
  return (
    <BrowserRouter>

        <MyNavbarLogout/>
         <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/leaderboards" element={<Leaderboards />} />
        <Route path="/teams/createTeams" element={<CreateTeams/>} />
        <Route path="/teams/createScorers" element={<CreateScorers/>} />
        <Route path="/teams/createMatches" element={<CreateMatches/>} />
        <Route path="/teams/getTeams" element={<GetTeams/>} />
        <Route path="/leaderboard/MatchPage" element={<MatchesPage/>} />
        <Route path="/overlay/matchControl" element={<MatchControl />} />
        <Route path="/overlay/people" element={<Overlay />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;