import React, { useEffect, useState } from 'react';
import CandidateCard from '../components/CandidateCard';
const apiUrl = import.meta.env.VITE_API_URL;

interface Candidate {
  name: string;
  gradDate: number;
  major: string;
  imageUrl: string;
}

const CandidateScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${apiUrl}/candidates`;
    console.log('Fetching candidates from:', url);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCandidates(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch candidates:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
      {candidates.map((cand) => (
        <CandidateCard
          name={cand.name}
          gradDate={cand.gradDate}
          major={cand.major}
          imageUrl={cand.imageUrl}
        />
      ))}
    </div>
  );
};

export default CandidateScreen;
