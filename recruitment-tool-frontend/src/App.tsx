import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import CandidateCard from './components/CandidateCard';
import './App.css';

function App() {
  return (
    <CandidateCard
      name="John Doe"
      gradDate={2024}
      imageUrl="https://via.placeholder.com/150"
    ></CandidateCard>
  );
}

export default App;
