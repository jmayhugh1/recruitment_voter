import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { Candidate } from '../types';
const apiUrl = import.meta.env.VITE_API_URL;

const CandidateCard: React.FC<Candidate> = ({
  id,
  name,
  grad_date,
  major,
  image_url,
}) => {
  const voteMap = {
    up: 1,
    down: -1,
  };

  const updateVotes = (voteType: 'up' | 'down') => {
    const url = `${apiUrl}/vote`;
    const params = {
      id: id,
      name: name,
      increment: voteMap[voteType],
    };
    console.log('Updating vote for:', params);

    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Vote updated:', data);
      })
      .catch((error) => {
        console.error('Error updating vote:', error);
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
        <Button size="small" color="primary" onClick={() => updateVotes('up')}>
          UpVote
        </Button>
        <Button
          size="small"
          color="secondary"
          onClick={() => updateVotes('down')}
        >
          DownVote
        </Button>
      </CardActions>
    </Card>
  );
};

export default CandidateCard;
