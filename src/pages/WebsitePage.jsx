import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CardMedia,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Business,
  ShoppingCart,
  People,
  Schedule,
  Star,
  CheckCircle,
  ArrowForward,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import businessService from '../services/businessService';
import '../styles/WebsitePage.css';
import { showSuccess, showError } from '../utils/alerts';
import { APP_CONFIG, SOCIAL_LINKS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import Footer from '../components/layout/Footer';

const WebsitePage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para diálogos
  const [contactDialog, setContactDialog] = useState(false);
  const [quoteDialog, setQuoteDialog] = useState(false);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState(null);

  // Estados para formularios
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    description: '',
    budget: '',
  });

  useEffect(() => {
    loadWebsiteData();
  }, []);

  const loadWebsiteData = async () => {
    setLoading(true);
    try {
      const productsData = await businessService.getPublicCatalog();

      setFeaturedProducts(productsData.slice(0, 6));
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async () => {
    try {
      await businessService.sendContactInquiry(contactForm);
      showSuccess('Mensaje enviado', 'Nos contactaremos contigo pronto');
      setContactDialog(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      showError('Error', 'No se pudo enviar el mensaje');
    }
  };

  const handleQuoteRequest = async () => {
    try {
      await businessService.requestQuote(quoteForm);
      showSuccess('Cotización solicitada', 'Te enviaremos una cotización en breve');
      setQuoteDialog(false);
      setQuoteForm({ name: '', email: '', phone: '', businessType: '', description: '', budget: '' });
    } catch (error) {
      showError('Error', 'No se pudo enviar la solicitud');
    }
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuAnchor(null);
  };

  return (
    <div className="website-page">
      {/* Header */}
      <AppBar position="fixed" sx={{ bgcolor: 'primary.main' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {APP_CONFIG.COMPANY}
          </Typography>
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => scrollToSection('inicio')}>
                Inicio
              </Button>
              <Button color="inherit" onClick={() => scrollToSection('servicios')}>
                Servicios
              </Button>
              <Button 
                component={RouterLink} 
                to="/login" 
                variant="outlined" 
                color="inherit"
                sx={{ ml: 2 }}
              >
                Iniciar Sesión
              </Button>
            </Box>
          )}

          {/* Mobile Navigation */}
          {isMobile && (
            <IconButton
              color="inherit"
              onClick={(e) => setMobileMenuAnchor(e.currentTarget)}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={() => setMobileMenuAnchor(null)}
      >
        <MenuItem onClick={() => scrollToSection('inicio')}>Inicio</MenuItem>
        <MenuItem onClick={() => scrollToSection('servicios')}>Servicios</MenuItem>
        <Divider />
        <MenuItem component={RouterLink} to="/login">Iniciar Sesión</MenuItem>
      </Menu>

      {/* Hero Section */}
      <section id="inicio" className="hero-section">
        <Container maxWidth="lg">
          <div className="hero-content">
            <Grid container spacing={4} alignItems="center">
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h2" component="h1" className="hero-title">
                  Soluciones Empresariales Multi-Giro
                </Typography>
                <Typography variant="h5" className="hero-subtitle">
                  Plataforma integral para gestionar múltiples líneas de negocio desde un solo lugar. 
                  Control centralizado con operación descentralizada para cada giro.
                </Typography>
                <div className="hero-buttons">
                  <Button 
                    variant="contained" 
                    size="large" 
                    className="hero-button-primary"
                    onClick={() => setQuoteDialog(true)}
                  >
                    Solicitar Cotización
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    className="hero-button-secondary"
                    onClick={() => scrollToSection('servicios')}
                  >
                    Conocer Más
                  </Button>
                </div>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop&q=80"
                  alt="Dashboard Multi-Giro"
                  sx={{
                    width: '100%',
                    height: 400,
                    objectFit: 'cover',
                    borderRadius: 2,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  }}
                />
              </Grid>
            </Grid>
          </div>
        </Container>
      </section>

      {/* Services Section */}
      <section id="servicios" className="features-section">
        <Container maxWidth="lg">
          <div className="section-header">
            <Typography variant="h3" component="h2" className="section-title">
              Nuestros Giros de Negocio
            </Typography>
            <Typography variant="h6" className="section-subtitle">
              Soluciones especializadas para cada línea de negocio
            </Typography>
          </div>

          <Grid container spacing={4} className="features-grid">
            {[
              {
                title: 'Extracción Minera',
                description: 'Control de producción en plantas de Cobán, El Progreso, Quetzaltenango y Petén',
                icon: <Business />,
              },
              {
                title: 'Procesamiento Industrial',
                description: 'Gestión de plantas de producción de materiales de construcción y cerámicos',
                icon: <ShoppingCart />,
              },
              {
                title: 'Maquinaria y Equipos',
                description: 'Venta y alquiler de maquinaria de construcción con cobertura nacional',
                icon: <Business />,
              },
              {
                title: 'Transporte y Logística',
                description: 'Transporte de materia prima y productos, inter-puertos e inter-fronteras',
                icon: <ShoppingCart />,
              },
              {
                title: 'Servicios de Construcción',
                description: 'Construcción de puentes, carreteras y edificaciones en general',
                icon: <Business />,
              },
              {
                title: 'Gestión Centralizada',
                description: 'Control administrativo y contable desde oficinas centrales con reportería consolidada',
                icon: <People />,
              },
            ].map((service, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Card sx={{ height: '100%', '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.3s' } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {service.icon}
                      </Avatar>
                      <Typography variant="h5" component="h3">
                        {service.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => setQuoteDialog(true)}>
                      Solicitar información
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      {/* Contact Dialog */}
      <Dialog open={contactDialog} onClose={() => setContactDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Envíanos un Mensaje</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Mensaje"
                multiline
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setContactDialog(false)}>Cancelar</Button>
          <Button onClick={handleContactSubmit} variant="contained">Enviar</Button>
        </DialogActions>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog open={quoteDialog} onClose={() => setQuoteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Solicitar Cotización</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Nombre"
                value={quoteForm.name}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={quoteForm.email}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Teléfono"
                value={quoteForm.phone}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Tipo de negocio"
                value={quoteForm.businessType}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, businessType: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción del proyecto"
                multiline
                rows={4}
                value={quoteForm.description}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Presupuesto estimado"
                value={quoteForm.budget}
                onChange={(e) => setQuoteForm(prev => ({ ...prev, budget: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuoteDialog(false)}>Cancelar</Button>
          <Button onClick={handleQuoteRequest} variant="contained">Solicitar Cotización</Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default WebsitePage;
