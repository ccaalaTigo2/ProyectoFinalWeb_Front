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
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Alert,
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
  LocationOn as LocationIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import clienteService from '../services/clienteService';
import alertService from '../services/alertService';
import { formatDate } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const TIPO_CLIENTE_OPTIONS = [
  { value: 'PERSONA', label: 'Persona', icon: <PersonIcon /> },
  { value: 'EMPRESA', label: 'Empresa', icon: <BusinessIcon /> },
  { value: 'DISTRIBUIDOR', label: 'Distribuidor', icon: <StoreIcon /> },
  { value: 'MAYORISTA', label: 'Mayorista', icon: <BusinessIcon /> },
  { value: 'MINORISTA', label: 'Minorista', icon: <PersonIcon /> }
];

const ClienteManagement = () => {
  // Estados principales
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState([]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    empresa: '',
    tipoCliente: 'PERSONA',
    notas: ''
  });

  // Estados de notificaciones
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Estados de validación
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Cargar clientes al montar el componente
  useEffect(() => {
    loadClientes();
  }, []);

  // Filtrar clientes basado en búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClientes(clientes);
    } else {
      const filtered = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cliente.empresa && cliente.empresa.toLowerCase().includes(searchTerm.toLowerCase())) ||
        cliente.tipoCliente.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await clienteService.getAllClientes();
      const clientesData = response.data || response || [];
      setClientes(clientesData);
      setFilteredClientes(clientesData);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      showSnackbar('Error al cargar clientes: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      direccion: '',
      empresa: '',
      tipoCliente: 'PERSONA',
      notas: ''
    });
    setFormErrors({});
    setEditMode(false);
    setSelectedCliente(null);
  };

  const handleOpenDialog = (cliente = null) => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || '',
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        empresa: cliente.empresa || '',
        tipoCliente: cliente.tipoCliente || 'PERSONA',
        notas: cliente.notas || ''
      });
      setSelectedCliente(cliente);
      setEditMode(true);
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setTimeout(() => resetForm(), 300);
  };

  const validateForm = () => {
    const errors = {};

    // Validar nombre (requerido)
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es requerido';
    }

    // Validar email (requerido y formato)
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Formato de email inválido';
    }

    // Validar notas (máximo 1000 caracteres)
    if (formData.notas && formData.notas.length > 1000) {
      errors.notas = 'Las notas no pueden exceder 1000 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo si existe
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showSnackbar('Por favor corrige los errores del formulario', 'warning');
      return;
    }

    try {
      setSubmitting(true);

      const clienteData = {
        ...formData,
        // Limpiar campos vacíos opcionales
        telefono: formData.telefono.trim() || undefined,
        direccion: formData.direccion.trim() || undefined,
        empresa: formData.empresa.trim() || undefined,
        notas: formData.notas.trim() || undefined
      };

      if (editMode && selectedCliente) {
        // Actualizar cliente existente
        await clienteService.updateCliente(selectedCliente.id, clienteData);
        showSnackbar('Cliente actualizado exitosamente');
      } else {
        // Crear nuevo cliente
        await clienteService.createCliente(clienteData);
        showSnackbar('Cliente creado exitosamente');
      }

      handleCloseDialog();
      loadClientes();

    } catch (error) {
      console.error('Error guardando cliente:', error);
      
      // Manejar error de email duplicado
      if (error.response?.status === 400 && error.response.data?.message?.includes('email')) {
        setFormErrors({ email: 'Este email ya está registrado' });
        showSnackbar('Email ya registrado', 'error');
      } else {
        showSnackbar('Error al guardar cliente: ' + error.message, 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (cliente) => {
    try {
      // Confirmación antes de cambiar estado
      const accion = cliente.activo ? 'desactivar' : 'activar';
      const result = await alertService.confirm(
        `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} cliente?`,
        `¿Está seguro que desea ${accion} al cliente "${cliente.nombre}"?`,
        `Sí, ${accion}`
      );

      if (result.isConfirmed) {
        await clienteService.toggleClienteActivo(cliente.id);
        alertService.toastSuccess(
          `Cliente ${cliente.activo ? 'desactivado' : 'activado'} exitosamente`
        );
        loadClientes();
      }
    } catch (error) {
      console.error('Error cambiando estado del cliente:', error);
      // El clienteService ya maneja el error con SweetAlert2
    }
  };

  const getTipoClienteInfo = (tipo) => {
    return TIPO_CLIENTE_OPTIONS.find(option => option.value === tipo) || 
           { value: tipo, label: tipo, icon: <PersonIcon /> };
  };

  const getClienteIcon = (tipoCliente) => {
    const tipoInfo = getTipoClienteInfo(tipoCliente);
    return tipoInfo.icon;
  };

  if (loading) {
    return <LoadingSpinner loading={true} message="Cargando clientes..." />;
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Gestión de Clientes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ px: 3, py: 1 }}
        >
          Nuevo Cliente
        </Button>
      </Box>

      {/* Estadísticas rápidas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {clientes.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clientes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {clientes.filter(c => c.activo).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Activos
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {clientes.filter(c => c.tipoCliente === 'EMPRESA').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Empresas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <CardContent>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {clientes.filter(c => c.tipoCliente === 'PERSONA').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Personas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Búsqueda */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar clientes por nombre, email, empresa o tipo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
            }}
          />
        </CardContent>
      </Card>

      {/* Tabla de clientes */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Lista de Clientes ({filteredClientes.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Contacto</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Registro</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClientes.map((cliente) => (
                  <TableRow key={cliente.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {getClienteIcon(cliente.tipoCliente)}
                        <Box sx={{ ml: 2 }}>
                          <Typography variant="subtitle2" fontWeight="bold" sx={{ color: 'black' }}>
                            {cliente.nombre}
                          </Typography>
                          {cliente.empresa && (
                            <Typography variant="body2" color="text.secondary">
                              {cliente.empresa}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                          <Typography variant="body2">{cliente.email}</Typography>
                        </Box>
                        {cliente.telefono && (
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PhoneIcon sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                            <Typography variant="body2">{cliente.telefono}</Typography>
                          </Box>
                        )}
                        {cliente.direccion && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                            <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'action.active' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                              {cliente.direccion}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        icon={getClienteIcon(cliente.tipoCliente)}
                        label={getTipoClienteInfo(cliente.tipoCliente).label}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Chip
                        label={cliente.activo ? 'Activo' : 'Inactivo'}
                        size="small"
                        color={cliente.activo ? 'success' : 'default'}
                        variant={cliente.activo ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(cliente.fechaRegistro)}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <Tooltip title="Editar cliente">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(cliente)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title={cliente.activo ? 'Desactivar cliente' : 'Activar cliente'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleEstado(cliente)}
                            color={cliente.activo ? 'warning' : 'success'}
                          >
                            {cliente.activo ? <BlockIcon /> : <ActivateIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                
                {filteredClientes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                        {searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog para crear/editar cliente */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        disableEnforceFocus
        disableAutoFocus
      >
        <DialogTitle>
          {editMode ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {/* Nombre */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre Completo *"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  error={!!formErrors.nombre}
                  helperText={formErrors.nombre}
                  disabled={submitting}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                  disabled={submitting}
                />
              </Grid>

              {/* Teléfono */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  disabled={submitting}
                />
              </Grid>

              {/* Tipo de Cliente */}
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Tipo de Cliente</InputLabel>
                  <Select
                    value={formData.tipoCliente}
                    onChange={(e) => handleInputChange('tipoCliente', e.target.value)}
                    label="Tipo de Cliente"
                    disabled={submitting}
                  >
                    {TIPO_CLIENTE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {option.icon}
                          <Typography sx={{ ml: 1 }}>{option.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Empresa */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Empresa"
                  value={formData.empresa}
                  onChange={(e) => handleInputChange('empresa', e.target.value)}
                  disabled={submitting}
                  helperText="Opcional - Solo si es aplicable"
                />
              </Grid>

              {/* Dirección */}
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  disabled={submitting}
                />
              </Grid>

              {/* Notas */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notas"
                  multiline
                  rows={3}
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  error={!!formErrors.notas}
                  helperText={formErrors.notas || `${formData.notas.length}/1000 caracteres`}
                  disabled={submitting}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : undefined}
          >
            {submitting ? 'Guardando...' : editMode ? 'Actualizar' : 'Crear Cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={closeSnackbar}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ClienteManagement;