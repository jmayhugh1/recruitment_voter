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
import Loading from './Loading';
import type { Recruiter } from '../types.ts';

const apiUrl = import.meta.env.VITE_API_URL as string;
const SignIn: React.FC = () => {
  const [recruitmentTeam, setRecruitmentTeam] = useState<Recruiter[]>([]);
  const { setRecruiter } = useContext(UserContext);
  const [tempRecruiter, setTempRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/recruitment-team`)
      .then((res) => res.json())
      .then((data: { recruiter_name: string; admin: boolean }[]) =>
        setRecruitmentTeam(
          data.map((d) => ({
            recruiter_name: d.recruiter_name,
            admin: d.admin,
          })),
        ),
      )
      .catch((err) => {
        alert('Failed to fetch recruitment team. Please try again later.');
        console.error('Failed to fetch recruitment team:', err);
        setRecruitmentTeam([]);
      });
    setLoading(false);
  }, []);

  const submitClicked = () => {
    if (tempRecruiter) {
      setRecruiter(tempRecruiter);
      console.log('Selected Name:', tempRecruiter);
      navigate('/candidates');
    } else {
      alert('Please select your name to continue.');
    }
  };
  if (loading) {
    return <Loading />;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" gutterBottom>
          Sign In
        </Typography>

        <Autocomplete<Recruiter, false, false, false>
          options={recruitmentTeam}
          value={tempRecruiter}
          onChange={(_, newValue) => setTempRecruiter(newValue)}
          getOptionLabel={(option) => option.recruiter_name}
          isOptionEqualToValue={(opt, val) =>
            opt.recruiter_name === val.recruiter_name
          }
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
          autoHighlight
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={submitClicked}
          disabled={!tempRecruiter}
        >
          Submit
        </Button>
      </Box>
    </Container>
  );
};

export default SignIn;
