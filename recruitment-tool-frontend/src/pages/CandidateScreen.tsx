import React, { useEffect, useState, useContext } from 'react';
import CandidateCard from '../components/CandidateCard';
import type { VoteInfo, Candidate } from '../types';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import Loading from '../components/Loading';

const apiUrl = import.meta.env.VITE_API_URL as string;
const VOTE_LIMIT = 30;

const CandidateScreen: React.FC = () => {
  const [activeVoteCount, setActiveVoteCount] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

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

      if (!response.ok) {
        console.error(
          `Failed to fetch candidates: ${response.status} ${response.statusText}`,
        );
        return [];
      }

      const data = (await response.json()) as Candidate[];
      const candidate_list = Array.isArray(data) ? data : [];

      // Sort by last name
      candidate_list.sort((a, b) => {
        const a_last = a.name.split(' ').slice(1).join(' ');
        const b_last = b.name.split(' ').slice(1).join(' ');
        return a_last.localeCompare(b_last);
      });

      return candidate_list;
    } catch (error) {
      console.error(
        'An unexpected error occurred while fetching candidates:',
        error,
      );
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
      const used = candList.reduce(
        (acc, c) => acc + (c.recruiter_specific_vote ? 1 : 0),
        0,
      );
      setActiveVoteCount(used);
      setLoading(false);
    };

    fetchData();
  }, [navigate, recruiter]);

  const VoteCountComponent: React.FC = () => (
    <div
      style={{
        textAlign: 'center',
        margin: '1rem 0',
        fontWeight: 'bold',
        color: activeVoteCount >= VOTE_LIMIT ? 'red' : 'black',
      }}
    >
      Votes used: {activeVoteCount} / {VOTE_LIMIT}
    </div>
  );

  const handleVoteChange = (prevVote: number, newVote: number) => {
    const wasActive = prevVote !== 0;
    const nowActive = newVote !== 0;
    if (!wasActive && nowActive) setActiveVoteCount((x) => x + 1);
    else if (wasActive && !nowActive) setActiveVoteCount((x) => x - 1);
  };

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
      <VoteCountComponent />
      {/* Candidate grid */}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1rem' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            justifyContent: 'center',
          }}
        >
          {candidates.length === 0 ? (
            <p style={{ opacity: 0.7, padding: '1rem' }}>No matches found.</p>
          ) : (
            candidates.map((cand) => {
              const alreadyVoted = !!cand.recruiter_specific_vote;
              const canVote = activeVoteCount < VOTE_LIMIT || alreadyVoted; // allow undo/flip of an existing vote

              return (
                <CandidateCard
                  key={cand.id}
                  id={cand.id}
                  name={cand.name}
                  grad_date={cand.grad_date}
                  major={cand.major}
                  image_url={cand.image_url}
                  recruiter_specific_vote={cand.recruiter_specific_vote}
                  // NEW props:
                  canVote={canVote}
                  onVoteChange={handleVoteChange}
                  onHitLimit={() => {
                    // optional UX: inform user once
                    alert(
                      `You've reached the vote limit of ${VOTE_LIMIT}. You can undo or flip existing votes, but you can't add more.`,
                    );
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateScreen;
