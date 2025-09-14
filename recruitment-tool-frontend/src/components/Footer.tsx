import { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FaceIcon from '@mui/icons-material/Face';
import InsightsIcon from '@mui/icons-material/Insights';
import { useLocation, useNavigate } from 'react-router-dom';
import { FOOTER_SIZE } from '../types';
const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(location.pathname);

  useEffect(() => setValue(location.pathname), [location.pathname]);

  return (
    <Paper
      component="footer"
      elevation={3}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (t) => t.zIndex.appBar,
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue: string) => {
          setValue(newValue);
          navigate(newValue);
        }}
        sx={{
          height: `${FOOTER_SIZE}px`,
          // Add safe-area padding for iOS home indicator
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigationAction
          label="login"
          value="/"
          icon={<AccountBoxIcon />}
        />
        <BottomNavigationAction
          label="candidates"
          value="/candidates"
          icon={<FaceIcon />}
        />
        <BottomNavigationAction
          label="analytics"
          value="/analytics"
          icon={<InsightsIcon />}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default Footer;
