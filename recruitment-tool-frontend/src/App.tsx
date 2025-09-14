import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import SignInScreen from './pages/SignInScreen';
import CandidateScreen from './pages/CandidateScreen';
import { UserContext } from './context/UserContext';
import type { UserContextType } from './context/UserContext';
import Footer from './components/Footer';
import AnalyticsScreen from './pages/AnalyticsScreen';
import Box from '@mui/material/Box';
import { FOOTER_SIZE } from './types';

export default function App() {
  const [recruiter, setRecruiter] =
    useState<UserContextType['recruiter']>(null);

  return (
    <UserContext.Provider value={{ recruiter, setRecruiter }}>
      <Box
        sx={{
          minHeight: '100dvh',
          // keep content above the floating footer
          pb: `calc(${FOOTER_SIZE}px + env(safe-area-inset-bottom))`,
        }}
      >
        <Routes>
          <Route path="/" element={<SignInScreen />} />
          <Route path="/candidates" element={<CandidateScreen />} />
          <Route path="/analytics" element={<AnalyticsScreen />} />
        </Routes>
      </Box>
      <Footer />
    </UserContext.Provider>
  );
}
