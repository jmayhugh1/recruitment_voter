import React, { useState } from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { Candidate } from '../types';
import useSelectedName from '../hooks/useSelectedName';

const apiUrl = import.meta.env.VITE_API_URL;

const CandidateCard: React.FC<Candidate> = ({
  id,
  name,
  grad_date,
  major,
  image_url,
}) => {
  const [selectedVote, setSelectedVote] = useState<null | 'up' | 'down'>(null);
  const { selectedName } = useSelectedName();

  const voteMap = {
    up: 1,
    down: -1,
  };

  const updateVotes = (voteType: 'up' | 'down') => {
    // If the user clicks the same button again, deselect (remove vote)
    console.log('Selected Name is voting:', selectedName);
    if (selectedVote === voteType) {
      setSelectedVote(null);

      fetch(`${apiUrl}/vote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          increment: -voteMap[voteType], // undo the vote
          recruiter_name: selectedName,
        }),
      });
      return;
    }

    // If switching from up -> down or down -> up
    if (selectedVote && selectedVote !== voteType) {
      setSelectedVote(voteType);

      fetch(`${apiUrl}/vote`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name,
          increment: voteMap[voteType] * 2, // double adjustment
          recruiter_name: selectedName,
        }),
      });
      return;
    }

    // If voting fresh (no previous vote)
    setSelectedVote(voteType);
    fetch(`${apiUrl}/vote`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        name,
        increment: voteMap[voteType],
        recruiter_name: selectedName,
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
          variant={selectedVote === 'up' ? 'contained' : 'outlined'}
          onClick={() => updateVotes('up')}
        >
          UpVote
        </Button>
        <Button
          size="small"
          color="secondary"
          variant={selectedVote === 'down' ? 'contained' : 'outlined'}
          onClick={() => updateVotes('down')}
        >
          DownVote
        </Button>
      </CardActions>
    </Card>
  );
};

export default CandidateCard;
