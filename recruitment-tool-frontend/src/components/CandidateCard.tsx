import React, { useState, useContext } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { Candidate } from '../types';
import { UserContext } from '../context/UserContext';

const apiUrl = import.meta.env.VITE_API_URL;

// Constants for votes
const UPVOTE = 1;
const DOWNVOTE = -1;
const NOVOTE = 0;

const CandidateCard: React.FC<Candidate> = ({
  id,
  name,
  grad_date,
  major,
  image_url,
  recruiter_specific_vote = NOVOTE, // preload recruiter’s current vote from backend
}) => {
  const { recruiter } = useContext(UserContext);

  // Track the recruiter’s vote locally (number form)
  const [selectedVote, setSelectedVote] = useState<number>(
    recruiter_specific_vote,
  );

  const updateVotes = (vote: number) => {
    let increment = vote;

    if (selectedVote === vote) {
      // Deselect (undo vote)
      increment = -vote;
      setSelectedVote(NOVOTE);
    } else if (selectedVote !== NOVOTE && selectedVote !== vote) {
      // Switching votes: e.g. -1 → 1 means +2 adjustment
      increment = vote * 2;
      setSelectedVote(vote);
    } else {
      // Fresh vote
      setSelectedVote(vote);
    }

    fetch(`${apiUrl}/vote`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        increment,
        recruiter_name: recruiter?.recruiter_name,
      }),
    });
  };

  return (
    <Card sx={{ maxWidth: 345, margin: 'auto', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="140"
        image={image_url}
        alt={`${name}'s profile`}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Major: {major}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Graduation Date: {grad_date}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          color="primary"
          variant={selectedVote === UPVOTE ? 'contained' : 'outlined'}
          onClick={() => updateVotes(UPVOTE)}
        >
          UpVote
        </Button>
        <Button
          size="small"
          color="secondary"
          variant={selectedVote === DOWNVOTE ? 'contained' : 'outlined'}
          onClick={() => updateVotes(DOWNVOTE)}
        >
          DownVote
        </Button>
      </CardActions>
    </Card>
  );
};

export default CandidateCard;
