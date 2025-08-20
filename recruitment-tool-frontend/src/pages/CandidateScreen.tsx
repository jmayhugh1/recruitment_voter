import React, { useEffect, useState, useContext } from 'react';
import CandidateCard from '../components/CandidateCard';
import type { VoteInfo, Candidate } from '../types';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
const apiUrl = import.meta.env.VITE_API_URL;

const CandidateScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(UserContext);

  const navigate = useNavigate();
  const getPreviousSavedVoteInfo = async (): Promise<VoteInfo[]> => {
    try {
      const url_voting_info = `${apiUrl}/saved-vote-info`;
      const body = JSON.stringify({
        recruiter_name: user,
      });
      const response = await fetch(url_voting_info, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
      console.log('Response from saved-vote-info:', response);
      if (!response.ok) {
        return [];
      }
      const data: { recruit_id: string; votes: string }[] =
        await response.json();
      return data.map((item) => ({
        id: parseInt(item.recruit_id, 10),
        votes: parseInt(item.votes, 10),
      }));
    } catch (error) {
      console.error('Failed to fetch saved vote info:', error);
      return [];
    }
  };

  const getCandidates = async (): Promise<Candidate[]> => {
    try {
      const url = `${apiUrl}/candidates`;
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        alert('Please Sign in to view candidates');
        navigate('/');
        return;
      }
      const candidates = await getCandidates();
      const previousVotes = await getPreviousSavedVoteInfo();
      console.log('Previous Votes:', previousVotes);
      candidates.forEach((candidate) => {
        const voteInfo = previousVotes.find((vote) => vote.id === candidate.id);
        candidate.votes = voteInfo
          ? (voteInfo.votes as 0 | 1 | -1 | undefined)
          : 0;
      });
      setCandidates(candidates);
      setLoading(false);
    };

    fetchData();
  }, [navigate, user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        justifyContent: 'center',
      }}
    >
      {candidates.map((cand) => (
        <CandidateCard
          key={cand.id}
          id={cand.id}
          name={cand.name}
          grad_date={cand.grad_date}
          major={cand.major}
          image_url={cand.image_url}
          votes={cand.votes}
        />
      ))}
    </div>
  );
};

export default CandidateScreen;
