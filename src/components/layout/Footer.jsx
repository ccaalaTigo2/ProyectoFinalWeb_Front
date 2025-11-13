import React from 'react';
import {
  Box,
  Container,
  Typography,
} from '@mui/material';
import { APP_CONFIG } from '../../utils/constants';
import '../../styles/Footer.css';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} {APP_CONFIG.COMPANY}. 
            Todos los derechos reservados.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;