import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import LiveTiming from './pages/LiveTiming';
import Schedule from './pages/Schedule';
import Results from './pages/Results';
import DriverStandings from './pages/DriverStandings';
import ConstructorStandings from './pages/ConstructorStandings';
import Drivers from './pages/Drivers';
import Teams from './pages/Teams';
import DriverStats from './pages/DriverStats';
import HeadToHead from './pages/HeadToHead';
import Consistency from './pages/Consistency';
import RacePace from './pages/RacePace';
import PitStops from './pages/PitStops';
import TechUpdates from './pages/TechUpdates';
import UsedElements from './pages/UsedElements';
import DestructorsChampionship from './pages/DestructorsChampionship';
import TrackDNA from './pages/TrackDNA';
import Feedback from './pages/Feedback';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="live-timing" element={<LiveTiming />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="results" element={<Results />} />
            <Route path="driver-standings" element={<DriverStandings />} />
            <Route path="constructor-standings" element={<ConstructorStandings />} />
            <Route path="drivers" element={<Drivers />} />
            <Route path="teams" element={<Teams />} />
            <Route path="driver-stats" element={<DriverStats />} />
            <Route path="head-to-head" element={<HeadToHead />} />
            <Route path="consistency" element={<Consistency />} />
            <Route path="race-pace" element={<RacePace />} />
            <Route path="pit-stops" element={<PitStops />} />
            <Route path="tech-updates" element={<TechUpdates />} />
            <Route path="used-elements" element={<UsedElements />} />
            <Route path="destructors-championship" element={<DestructorsChampionship />} />
            <Route path="track-dna" element={<TrackDNA />} />
            <Route path="feedback" element={<Feedback />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
