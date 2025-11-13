import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Divider,
  Grid,
} from '@mui/material';
import {
  Login as LoginIcon,
  Person,
  Lock,
  ErrorOutline,
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import alertService from '../services/alertService';
import { APP_CONFIG, ERROR_MESSAGES } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar errores cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
    
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.email) {
      errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }
    
    if (!formData.password) {
      errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (formData.password.length < 6) {
      errors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      await login(formData);
      alertService.success('¡Bienvenido!', 'Inicio de sesión exitoso');
      navigate('/dashboard');
    } catch (error) {
      // El authService ya maneja los errores con SweetAlert2
      console.error('Error de login:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Iniciando sesión..." backdrop={true} />;
  }

  return (
    <div className="login-container">
      <Paper className="login-paper">
        <div className="login-header">
          <div className="login-logo">
            <LoginIcon />
          </div>
          <Typography component="h1" className="login-title">
            {APP_CONFIG.SHORT_NAME}
          </Typography>
          <Typography variant="body2" className="login-subtitle">
            Accede a tu cuenta para gestionar tu negocio
          </Typography>
        </div>

        {/* Error global */}
        {error && (
          <div className="error-message">
            <ErrorOutline className="error-icon" />
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Correo Electrónico"
            name="email"
            autoComplete="email"
            autoFocus
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
            className="login-field"
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!formErrors.password}
            helperText={formErrors.password}
            className="login-field"
          />
          
          <div className="login-options">
            <Link component={RouterLink} to="/forgot-password" className="forgot-password">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            className={`login-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-loading"></span>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
          
          <Divider className="login-divider">
            <span className="login-divider-text">o</span>
          </Divider>
          
          <div className="signup-link">
            ¿No tienes cuenta?{' '}
            <Link component={RouterLink} to="/register">
              Regístrate aquí
            </Link>
          </div>
          
          <div className="signup-link" style={{ marginTop: '16px' }}>
            ¿Eres cliente?{' '}
            <Link component={RouterLink} to="/website">
              Visita nuestro sitio web
            </Link>
          </div>
        </form>
      </Paper>
    </div>
  );
};

export default Login;