import React from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
} from '@mui/icons-material';

const ErrorBoundary = ({ 
  error, 
  resetError, 
  title = 'Oops! Algo salió mal',
  message = 'Ha ocurrido un error inesperado. Por favor, intenta recargar la página.',
  showHomeButton = true,
  showRefreshButton = true,
}) => {
  const handleGoHome = () => {
    window.location.href = '/';
  };

  const handleRefresh = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <ErrorOutline
          sx={{
            fontSize: 80,
            color: 'error.main',
            mb: 3,
          }}
        />
        
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {message}
        </Typography>
        
        {import.meta.env.DEV && error && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              backgroundColor: '#f5f5f5',
              borderRadius: 1,
              maxWidth: '100%',
              overflow: 'auto',
            }}
          >
            <Typography variant="caption" component="pre">
              {error.toString()}
            </Typography>
          </Box>
        )}
        
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 4,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {showRefreshButton && (
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={handleRefresh}
            >
              Intentar de nuevo
            </Button>
          )}
          
          {showHomeButton && (
            <Button
              variant="outlined"
              startIcon={<Home />}
              onClick={handleGoHome}
            >
              Ir al inicio
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorBoundary;