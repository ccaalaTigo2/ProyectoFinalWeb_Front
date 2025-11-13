import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as ActivateIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Store as StoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Star as StarIcon,
  TrendingUp as TrendingUpIcon,
  Percent as PercentIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import vendedorService from '../services/vendedorService';
import alertService from '../services/alertService';
import { formatDate, formatCurrency } from '../utils/helpers';
import '../styles/VendedorManagement.css';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ESPECIALIDADES_OPTIONS = [
  'Tecnología y Electrónicos',
  'Productos Farmacéuticos',
  'Productos de Consumo',
  'Equipos Industriales',
  'Productos Químicos',
  'Alimentos y Bebidas',
  'Textil y Confecciones',
  'Construcción y Materiales',
  'Automotriz',
  'General'
];

const VendedorManagement = () => {
  const [vendedores, setVendedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentVendedor, setCurrentVendedor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEspecialidad, setFilterEspecialidad] = useState('');
  const [filterActivo, setFilterActivo] = useState('todos');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    codigo: '',
    especialidad: '',
    metaMensual: '',
    comisionPorcentaje: '',
    notas: ''
  });

  // Errores de validación
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadVendedores();
  }, []);

  const loadVendedores = async () => {
    try {
      setLoading(true);
      const response = await vendedorService.getVendedores();
      setVendedores(response?.data || response || []);
    } catch (error) {
      showSnackbar('Error al cargar vendedores', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      codigo: '',
      especialidad: '',
      metaMensual: '',
      comisionPorcentaje: '',
      notas: ''
    });
    setFormErrors({});
    setCurrentVendedor(null);
    setEditMode(false);
  };

  const handleOpenDialog = (vendedor = null) => {
    if (vendedor) {
      setFormData({
        nombre: vendedor.nombre || '',
        email: vendedor.email || '',
        telefono: vendedor.telefono || '',
        codigo: vendedor.codigo || '',
        especialidad: vendedor.especialidad || '',
        metaMensual: vendedor.metaMensual?.toString() || '',
        comisionPorcentaje: vendedor.comisionPorcentaje?.toString() || '',
        notas: vendedor.notas || ''
      });
      setCurrentVendedor(vendedor);
      setEditMode(true);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }

    if (!formData.codigo.trim()) {
      errors.codigo = 'El código es requerido';
    }

    if (formData.metaMensual && (isNaN(formData.metaMensual) || parseFloat(formData.metaMensual) < 0)) {
      errors.metaMensual = 'La meta mensual debe ser un número válido';
    }

    if (formData.comisionPorcentaje && (isNaN(formData.comisionPorcentaje) || parseFloat(formData.comisionPorcentaje) < 0 || parseFloat(formData.comisionPorcentaje) > 100)) {
      errors.comisionPorcentaje = 'El porcentaje de comisión debe estar entre 0 y 100';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const vendedorData = {
        ...formData,
        metaMensual: parseFloat(formData.metaMensual) || 0,
        comisionPorcentaje: parseFloat(formData.comisionPorcentaje) || 0
      };

      if (editMode) {
        await vendedorService.updateVendedor(currentVendedor.id, vendedorData);
      } else {
        await vendedorService.createVendedor(vendedorData);
      }

      handleCloseDialog();
      loadVendedores();
    } catch (error) {
      // El vendedorService ya maneja los errores con SweetAlert2
    } finally {
      setLoading(false);
    }
  };

  const handleToggleEstado = async (vendedor) => {
    try {
      // Confirmación antes de cambiar estado
      const accion = vendedor.activo ? 'desactivar' : 'activar';
      const result = await alertService.confirm(
        `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} vendedor?`,
        `¿Está seguro que desea ${accion} al vendedor "${vendedor.nombre}"?`,
        `Sí, ${accion}`
      );

      if (result.isConfirmed) {
        await vendedorService.toggleVendedorActivo(vendedor.id);
        alertService.toastSuccess(
          `Vendedor ${vendedor.activo ? 'desactivado' : 'activado'} exitosamente`
        );
        loadVendedores();
      }
    } catch (error) {
      // El vendedorService ya maneja el error con SweetAlert2
    }
  };

  const getEspecialidadIcon = (especialidad) => {
    if (especialidad?.includes('Tecnología')) return <BadgeIcon />;
    if (especialidad?.includes('Farmacéuticos')) return <BusinessIcon />;
    if (especialidad?.includes('Industrial')) return <StoreIcon />;
    return <PersonIcon />;
  };

  // Filtrar vendedores
  const filteredVendedores = vendedores.filter(vendedor => {
    const matchesSearch = vendedor.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendedor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendedor.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEspecialidad = filterEspecialidad === '' || vendedor.especialidad === filterEspecialidad;
    const matchesActivo = filterActivo === 'todos' || 
                         (filterActivo === 'activos' && vendedor.activo) ||
                         (filterActivo === 'inactivos' && !vendedor.activo);
    
    return matchesSearch && matchesEspecialidad && matchesActivo;
  });

  if (loading && vendedores.length === 0) {
    return <LoadingSpinner loading={true} message="Cargando vendedores..." />;
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Encabezado */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" color="primary.main" component="h1" gutterBottom>
          Gestión de Vendedores
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ minWidth: 200 }}
        >
          Nuevo Vendedor
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Buscar vendedores"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Especialidad</InputLabel>
                <Select
                  value={filterEspecialidad}
                  onChange={(e) => setFilterEspecialidad(e.target.value)}
                  label="Especialidad"
                >
                  <MenuItem value="">Todas las especialidades</MenuItem>
                  {ESPECIALIDADES_OPTIONS.map((especialidad) => (
                    <MenuItem key={especialidad} value={especialidad}>
                      {especialidad}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Estado</InputLabel>
                <Select
                  value={filterActivo}
                  onChange={(e) => setFilterActivo(e.target.value)}
                  label="Estado"
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="activos">Activos</MenuItem>
                  <MenuItem value="inactivos">Inactivos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Total Vendedores
                  </Typography>
                  <Typography variant="h4" color="blue">
                    {vendedores.length}
                  </Typography>
                </Box>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Activos
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {vendedores.filter(v => v.activo).length}
                  </Typography>
                </Box>
                <ActivateIcon sx={{ fontSize: 40, color: 'success.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Meta Promedio
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {formatCurrency(
                      vendedores.reduce((acc, v) => acc + (v.metaMensual || 0), 0) / Math.max(vendedores.length, 1)
                    )}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'info.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="h6">
                    Comisión Promedio
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {(vendedores.reduce((acc, v) => acc + (v.comisionPorcentaje || 0), 0) / Math.max(vendedores.length, 1)).toFixed(1)}%
                  </Typography>
                </Box>
                <PercentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabla de vendedores */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendedor</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Meta Mensual</TableCell>
              <TableCell>Comisión</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha Ingreso</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredVendedores.length > 0 ? (
              filteredVendedores.map((vendedor) => (
                <TableRow key={vendedor.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getEspecialidadIcon(vendedor.especialidad)}
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {vendedor.nombre}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
                          {vendedor.email}
                        </Typography>
                        {vendedor.telefono && (
                          <Typography variant="body2" color="textSecondary">
                            <PhoneIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {vendedor.telefono}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  
                  <TableCell>
                    <Chip 
                      label={vendedor.codigo} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {vendedor.especialidad || 'No especificada'}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="info.main">
                      {formatCurrency(vendedor.metaMensual || 0)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium" color="warning.main">
                      {vendedor.comisionPorcentaje || 0}%
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Chip
                      label={vendedor.activo ? 'Activo' : 'Inactivo'}
                      size="small"
                      color={vendedor.activo ? 'success' : 'default'}
                      variant={vendedor.activo ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(vendedor.fechaIngreso)}
                    </Typography>
                  </TableCell>
                  
                  <TableCell>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <Tooltip title="Editar vendedor">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(vendedor)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title={vendedor.activo ? 'Desactivar vendedor' : 'Activar vendedor'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleEstado(vendedor)}
                          color={vendedor.activo ? 'warning' : 'success'}
                        >
                          {vendedor.activo ? <BlockIcon /> : <ActivateIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body1" color="textSecondary">
                    No se encontraron vendedores
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para crear/editar vendedor */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>
          {editMode ? 'Editar Vendedor' : 'Crear Nuevo Vendedor'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Nombre */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre completo"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  error={!!formErrors.nombre}
                  helperText={formErrors.nombre}
                  required
                />
              </Grid>
              
              {/* Email */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  required
                />
              </Grid>
              
              {/* Teléfono */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  error={!!formErrors.telefono}
                  helperText={formErrors.telefono}
                />
              </Grid>
              
              {/* Código */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Código de vendedor"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  error={!!formErrors.codigo}
                  helperText={formErrors.codigo}
                  required
                />
              </Grid>
              
              {/* Especialidad */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Especialidad</InputLabel>
                  <Select
                    name="especialidad"
                    value={formData.especialidad}
                    onChange={handleInputChange}
                    label="Especialidad"
                  >
                    {ESPECIALIDADES_OPTIONS.map((especialidad) => (
                      <MenuItem key={especialidad} value={especialidad}>
                        {especialidad}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Meta Mensual */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Meta mensual"
                  name="metaMensual"
                  type="number"
                  value={formData.metaMensual}
                  onChange={handleInputChange}
                  error={!!formErrors.metaMensual}
                  helperText={formErrors.metaMensual}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Q</InputAdornment>,
                  }}
                />
              </Grid>
              
              {/* Comisión */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Porcentaje de comisión"
                  name="comisionPorcentaje"
                  type="number"
                  value={formData.comisionPorcentaje}
                  onChange={handleInputChange}
                  error={!!formErrors.comisionPorcentaje}
                  helperText={formErrors.comisionPorcentaje}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100, step: 0.1 }
                  }}
                />
              </Grid>
              
              {/* Notas */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notas"
                  name="notas"
                  multiline
                  rows={3}
                  value={formData.notas}
                  onChange={handleInputChange}
                  error={!!formErrors.notas}
                  helperText={formErrors.notas}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : (editMode ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box
          sx={{
            bgcolor: snackbar.severity === 'error' ? 'error.main' : 'success.main',
            color: 'white',
            p: 2,
            borderRadius: 1
          }}
        >
          {snackbar.message}
        </Box>
      </Snackbar>
    </div>
  );
};

export default VendedorManagement;
