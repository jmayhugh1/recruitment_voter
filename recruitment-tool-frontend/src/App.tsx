import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SignInScreen from './pages/SignInScreen';
import CandidateScreen from './pages/CandidateScreen';
import { UserContext } from './context/UserContext';
import type { UserContextType } from './context/UserContext';
import Footer from './components/Footer';
export default function App() {
  const [user, setUser] = useState<UserContextType['user']>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Routes>
        <Route path="/" element={<SignInScreen />} />
        <Route path="/candidates" element={<CandidateScreen />} />
      </Routes>
      <Footer />
    </UserContext.Provider>
  );
}
