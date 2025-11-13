import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Menu,
  Fab,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Edit,
  Delete,
  MoreVert,
  Add,
  Search,
  FilterList,
  Person,
  Email,
  Phone,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import { 
  showSuccess, 
  showError, 
  showDeleteConfirm,
  showInputDialog 
} from '../utils/alerts';
import { 
  USER_ROLES, 
  USER_ROLE_LABELS, 
  PAGINATION,
  ERROR_MESSAGES 
} from '../utils/constants';
import { formatDate, debounce } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusChip from '../components/common/StatusChip';

const UsersManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
  });

  // Estados para diálogos
  const [userDialog, setUserDialog] = useState({
    open: false,
    mode: 'create', // 'create' | 'edit'
    user: null,
  });

  const [menuState, setMenuState] = useState({
    anchorEl: null,
    selectedUser: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: USER_ROLES.CUSTOMER,
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, [page, rowsPerPage, searchTerm, filters]);

  const debouncedLoadUsers = debounce(loadUsers, 500);

  useEffect(() => {
    if (searchTerm) {
      debouncedLoadUsers();
    } else {
      loadUsers();
    }
  }, [searchTerm]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        ...filters,
      };

      const response = await userService.getUsers(params);
      setUsers(response.data || response.users || []);
      setTotal(response.total || response.data?.length || 0);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUserDialog = (mode, user = null) => {
    setUserDialog({ open: true, mode, user });
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || USER_ROLES.CUSTOMER,
        password: '',
        confirmPassword: '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: USER_ROLES.CUSTOMER,
        password: '',
        confirmPassword: '',
      });
    }
    setFormErrors({});
  };

  const handleCloseUserDialog = () => {
    setUserDialog({ open: false, mode: 'create', user: null });
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: USER_ROLES.CUSTOMER,
      password: '',
      confirmPassword: '',
    });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.email.trim()) {
      errors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (userDialog.mode === 'create') {
      if (!formData.password) {
        errors.password = ERROR_MESSAGES.REQUIRED_FIELD;
      } else if (formData.password.length < 6) {
        errors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
      };

      if (userDialog.mode === 'create') {
        userData.password = formData.password;
        await userService.createUser(userData);
        showSuccess('Usuario creado', 'El usuario se ha creado exitosamente');
      } else {
        await userService.updateUser(userDialog.user.id, userData);
        showSuccess('Usuario actualizado', 'El usuario se ha actualizado exitosamente');
      }

      handleCloseUserDialog();
      loadUsers();
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const handleDeleteUser = async (user) => {
    const result = await showDeleteConfirm(
      '¿Eliminar usuario?',
      `¿Estás seguro de que deseas eliminar a ${user.name}? Esta acción no se puede deshacer.`
    );

    if (result.isConfirmed) {
      try {
        await userService.deleteUser(user.id);
        showSuccess('Usuario eliminado', 'El usuario se ha eliminado exitosamente');
        loadUsers();
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  const handleChangeRole = async (user) => {
    const result = await showInputDialog(
      'Cambiar rol de usuario',
      'Selecciona el nuevo rol',
      user.role
    );

    if (result.isConfirmed) {
      try {
        await userService.updateUserRole(user.id, result.value);
        showSuccess('Rol actualizado', 'El rol del usuario se ha actualizado exitosamente');
        loadUsers();
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  const handleMenuOpen = (event, user) => {
    setMenuState({
      anchorEl: event.currentTarget,
      selectedUser: user,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      selectedUser: null,
    });
  };

  const canEditUser = (user) => {
    return currentUser?.role === USER_ROLES.ADMIN || 
           (currentUser?.role === USER_ROLES.MANAGER && user.role !== USER_ROLES.ADMIN);
  };

  const canDeleteUser = (user) => {
    return currentUser?.role === USER_ROLES.ADMIN && user.id !== currentUser.id;
  };

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestión de Usuarios
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra los usuarios del sistema
        </Typography>
      </Box>

      {/* Controles de búsqueda y filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Filtrar por rol</InputLabel>
              <Select
                value={filters.role}
                label="Filtrar por rol"
                onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
              >
                <MenuItem value="">Todos los roles</MenuItem>
                {Object.values(USER_ROLES).map(role => (
                  <MenuItem key={role} value={role}>
                    {USER_ROLE_LABELS[role]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de usuarios */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Fecha de Registro</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <LoadingSpinner loading={true} />
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 1, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>
                      <StatusChip status={user.role} type="role" />
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Activo' : 'Inactivo'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, user)}
                        disabled={!canEditUser(user)}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron usuarios
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={PAGINATION.PAGE_SIZE_OPTIONS}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
          }
        />
      </Paper>

      {/* FAB para agregar usuario */}
      {currentUser?.role === USER_ROLES.ADMIN && (
        <Fab
          color="primary"
          aria-label="agregar usuario"
          onClick={() => handleOpenUserDialog('create')}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>
      )}

      {/* Menú de acciones */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleOpenUserDialog('edit', menuState.selectedUser);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        {canDeleteUser(menuState.selectedUser) && (
          <MenuItem 
            onClick={() => {
              handleDeleteUser(menuState.selectedUser);
              handleMenuClose();
            }}
          >
            <Delete fontSize="small" sx={{ mr: 1 }} />
            Eliminar
          </MenuItem>
        )}
      </Menu>

      {/* Dialog para crear/editar usuario */}
      <Dialog
        open={userDialog.open}
        onClose={handleCloseUserDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {userDialog.mode === 'create' ? 'Crear Usuario' : 'Editar Usuario'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Nombre completo"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Correo electrónico"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: <Phone sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Rol</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Rol"
                  onChange={handleFormChange}
                >
                  {Object.values(USER_ROLES).map(role => (
                    <MenuItem key={role} value={role}>
                      {USER_ROLE_LABELS[role]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {userDialog.mode === 'create' && (
              <>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Contraseña"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Confirmar contraseña"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleFormChange}
                    error={!!formErrors.confirmPassword}
                    helperText={formErrors.confirmPassword}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUserDialog}>
            Cancelar
          </Button>
          <Button onClick={handleSaveUser} variant="contained">
            {userDialog.mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UsersManagement;
