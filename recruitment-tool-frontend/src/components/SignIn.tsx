import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Autocomplete,
  Container,
  Typography,
  Box,
  Button,
} from '@mui/material';
import { UserContext } from '../context/UserContext';
const apiUrl = import.meta.env.VITE_API_URL as string;
const SignIn: React.FC = () => {
  const [recruitmentTeam, setRecruitmentTeam] = useState<string[]>([]);
  const { setUser } = useContext(UserContext);
  const [tempName, setTempName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/recruitment-team`)
      .then((res) => res.json())
      .then((data: { recruiter_name: string }[]) =>
        setRecruitmentTeam(data.map((d) => d.recruiter_name)),
      )
      .catch((err) => {
        alert('Failed to fetch recruitment team. Please try again later.');
        console.error('Failed to fetch recruitment team:', err);
        setRecruitmentTeam([]);
      });
    setLoading(false);
  }, []);

  const submitClicked = () => {
    if (tempName) {
      setUser(tempName);
      console.log('Selected Name:', tempName);
      navigate('/candidates');
    } else {
      alert('Please select your name to continue.');
    }
  };
  if (loading) {
    return <Container maxWidth="sm">Loading...</Container>;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>

        <Autocomplete<string, false, false, false>
          options={recruitmentTeam}
          value={tempName}
          onChange={(_, newValue) => setTempName(newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select your name"
              variant="outlined"
              sx={{ minWidth: 320 }}
            />
          )}
          ListboxProps={{
            style: { maxHeight: 220, overflowY: 'auto', minWidth: 320 },
          }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={submitClicked}
          disabled={!tempName}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default SignIn;
