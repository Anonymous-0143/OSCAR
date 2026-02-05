import { Routes, Route } from 'react-router-dom';
import { GridBackground } from './components/ui/background';
import LandingPage from './components/LandingPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <GridBackground gridSize={40} darkGridColor="#555" fadeIntensity={20}>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </div>
    </GridBackground>
  );
}

export default App;
