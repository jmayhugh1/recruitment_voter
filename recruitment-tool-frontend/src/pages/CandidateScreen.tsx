import React, {
  useEffect,
  useState,
  useContext,
  useMemo,
  useDeferredValue,
} from 'react';
import Fuse from 'fuse.js';
import CandidateCard from '../components/CandidateCard';
import type { VoteInfo, Candidate } from '../types';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Loading from '../components/Loading';

const apiUrl = import.meta.env.VITE_API_URL as string;

const CandidateScreen: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const { recruiter } = useContext(UserContext);
  const navigate = useNavigate();

  const getPreviousSavedVoteInfo = async (): Promise<VoteInfo[]> => {
    try {
      const url_voting_info = `${apiUrl}/saved-vote-info`;
      const body = JSON.stringify({
        recruiter_name: recruiter?.recruiter_name,
      });
      const response = await fetch(url_voting_info, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!response.ok) return [];
      const data: { recruit_id: string; votes: string }[] =
        await response.json();
      return data.map((item) => ({
        id: parseInt(item.recruit_id, 10),
        vote: parseInt(item.votes, 10),
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
      if (!response.ok) return [];
      const data = (await response.json()) as Candidate[];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch candidates:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!recruiter) {
        alert('Please Sign in to view candidates');
        navigate('/');
        return;
      }
      const candList = await getCandidates();
      const previousVotes = await getPreviousSavedVoteInfo();

      candList.forEach((candidate) => {
        const voteInfo = previousVotes.find((v) => v.id === candidate.id);
        candidate.recruiter_specific_vote = voteInfo
          ? (voteInfo.vote as 0 | 1 | -1 | undefined)
          : 0;
      });

      setCandidates(candList);

      setCandidates(candList);
      setLoading(false);
    };

    fetchData();
  }, [navigate, recruiter]);

  // Fuse instance
  const fuse = useMemo(() => {
    return new Fuse<Candidate>(candidates, {
      includeScore: true,
      ignoreLocation: true,
      threshold: 0.33,
      distance: 100,
      minMatchCharLength: 2,
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'major', weight: 0.25 },
        { name: 'grad_date', weight: 0.15 },
      ],
    });
  }, [candidates]);

  // Filtered list using deferred query
  const filteredCandidates = useMemo(() => {
    const q = deferredQuery.trim();
    if (!q) return candidates;
    return fuse.search(q).map((r) => r.item);
  }, [fuse, deferredQuery, candidates]);

  if (loading) return <Loading />;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
      {/* Logged-in banner */}
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '1rem',
          textAlign: 'center',
          margin: '1rem 0',
          fontWeight: 'bold',
        }}
      >
        Logged in as: {recruiter?.recruiter_name || 'Unknown User'}
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        {/* Search bar */}
        <div style={{ maxWidth: 720, margin: '0.75rem auto 1rem' }}>
          <label htmlFor="candidate-search" style={{ display: 'none' }}>
            Search candidates
          </label>
          <input
            id="candidate-search"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, major, or grad year…"
            aria-label="Search candidates"
            autoComplete="off"
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: '1px solid #d0d7de',
              borderRadius: 12,
              fontSize: 16,
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          />
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          {filteredCandidates.length === 0 ? (
            <p style={{ opacity: 0.7, padding: '1rem' }}>No matches found.</p>
          ) : (
            filteredCandidates.map((cand) => (
              <CandidateCard
                key={cand.id}
                id={cand.id}
                name={cand.name}
                grad_date={cand.grad_date}
                major={cand.major}
                image_url={cand.image_url}
                recruiter_specific_vote={cand.recruiter_specific_vote}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateScreen;