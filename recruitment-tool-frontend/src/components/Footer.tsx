import { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FaceIcon from '@mui/icons-material/Face';
import InsightsIcon from '@mui/icons-material/Insights';
import { useLocation, useNavigate } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(location.pathname);
  useEffect(() => {
    setValue(location.pathname);
  }, [location.pathname]);
  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={(_, newValue: string) => {
        setValue(newValue);
        navigate(newValue);
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
  );
};

export default Footer;
