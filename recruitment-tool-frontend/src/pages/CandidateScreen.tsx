import React, { useEffect, useState } from 'react';
import CandidateCard from '../components/CandidateCard';
import type { Candidate } from '../types';
const apiUrl = import.meta.env.VITE_API_URL;

const CandidateScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = `${apiUrl}/candidates`;
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
          key={cand.id}
          id={cand.id}
          name={cand.name}
          grad_date={cand.grad_date}
          major={cand.major}
          image_url={cand.image_url}
        />
      ))}
    </div>
  );
};

export default CandidateScreen;
