import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

interface CandidateCardProps {
  name: string;
  gradDate: number;
  major: string;
  imageUrl: string;
}

const CandidateCard: React.FC<CandidateCardProps> = ({
  name,
  gradDate,
  major,
  imageUrl,
}) => {
  return (
    <Card sx={{ maxWidth: 345, margin: 'auto', boxShadow: 3 }}>
      <CardMedia
        component="img"
        height="140"
        image={imageUrl}
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
          Graduation Date: {gradDate}
        </Typography>
      </CardContent>
      <CardActions>
        <Button size="small" color="primary">
          UpVote
        </Button>
        <Button size="small" color="secondary">
          DownVote
        </Button>
      </CardActions>
    </Card>
  );
};

export default CandidateCard;
