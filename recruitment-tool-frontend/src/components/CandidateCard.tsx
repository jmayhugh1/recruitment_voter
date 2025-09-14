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

// Votes
const UPVOTE = 1;
// const DOWNVOTE = -1;
const NOVOTE = 0;

// Standardized tile + media sizes (tweak as you like)
const TILE_WIDTH = 320;
const TILE_HEIGHT = 400;
const MEDIA_HEIGHT = 220;

const CandidateCard: React.FC<Candidate> = ({
  id,
  name,
  grad_date,
  major,
  image_url,
  recruiter_specific_vote = NOVOTE,
}) => {
  const { recruiter } = useContext(UserContext);
  const [selectedVote, setSelectedVote] = useState<number>(recruiter_specific_vote);

  const updateVotes = (vote: number) => {
    let increment = vote;

    if (selectedVote === vote) {
      increment = -vote; // undo
      setSelectedVote(NOVOTE);
    } else if (selectedVote !== NOVOTE && selectedVote !== vote) {
      increment = vote * 2; // flip (-1 -> +1 or +1 -> -1)
      setSelectedVote(vote);
    } else {
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
    <Card
      sx={{
        width: TILE_WIDTH,
        height: TILE_HEIGHT,
        margin: 'auto',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Fixed image box, full image visible, black background */}
      <CardMedia
        component="img"
        image={image_url}
        alt={`${name}'s profile`}
        loading="lazy"
        draggable={false}
        sx={{
          height: `${MEDIA_HEIGHT}px`,
          width: '100%',
          bgcolor: '#000',
          objectFit: 'contain',       // show whole image (letterboxed)
          objectPosition: 'center',   // center it
          display: 'block',
        }}
        // (Optional) simple fallback if an image fails to load:
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          target.src =
            'data:image/svg+xml;utf8,' +
            encodeURIComponent(
              `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="440">
                 <rect width="100%" height="100%" fill="black"/>
                 <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                       fill="white" font-family="Arial" font-size="18">
                   No image
                 </text>
               </svg>`
            );
        }}
      />

      {/* Content grows to fill so actions stay pinned at bottom */}
      <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
        <Typography gutterBottom variant="h6" component="div" sx={{ mb: 0.5, lineHeight: 1.2 }}>
          {name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Major: {major}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Graduation Date: {grad_date}
        </Typography>
      </CardContent>

      <CardActions sx={{ pt: 0, pb: 1.5, px: 2 }}>
        <Button
          size="small"
          color="primary"
          variant={selectedVote === UPVOTE ? 'contained' : 'outlined'}
          onClick={() => updateVotes(UPVOTE)}
        >
          UpVote
        </Button>
        {/* <Button
          size="small"
          color="secondary"
          variant={selectedVote === DOWNVOTE ? 'contained' : 'outlined'}
          onClick={() => updateVotes(DOWNVOTE)}
        >
          DownVote
        </Button> */}
      </CardActions>
    </Card>
  );
};

export default CandidateCard;
