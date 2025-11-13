import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Typography,
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
  IconButton,
  Box,
  Card,
  CardContent,
  Autocomplete,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import clienteService from '../services/clienteService';
import vendedorService from '../services/vendedorService';
import productoService from '../services/productoService';
import alertService from '../services/alertService';
import { formatCurrency } from '../utils/helpers';
import '../styles/PedidoFormDialog.css';

const PedidoFormDialog = ({ 
  open, 
  onClose, 
  onSubmit, 
  loading = false 
}) => {
  const [formData, setFormData] = useState({
    clienteId: null,
    vendedorId: null,
    notas: '',
    productos: []
  });

  const [clienteData, setClienteData] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  const [clientes, setClientes] = useState([]);
  const [vendedores, setVendedores] = useState([]);
  const [productos, setProductos] = useState([]);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (open) {
      loadInitialData();
      resetForm();
    }
  }, [open]);

  const loadInitialData = async () => {
    try {
      // Cargar datos en paralelo con manejo individual de errores
      const [clientesData, vendedoresData, productosData] = await Promise.allSettled([
        clienteService.getAllClientes({ activo: true }).catch(() => clienteService.getClientes().catch(() => [])),
        vendedorService.getVendedoresActivos().catch(() => vendedorService.getVendedores().catch(() => [])),
        productoService.getProductosConStock().catch(() => productoService.getAllProductos().catch(() => []))
      ]);

      // Procesar resultados
      const clientes = clientesData.status === 'fulfilled' 
        ? (clientesData.value?.data || clientesData.value || [])
        : [];
      
      const vendedores = vendedoresData.status === 'fulfilled' 
        ? (vendedoresData.value?.data || vendedoresData.value || [])
        : [];
      
      const productos = productosData.status === 'fulfilled' 
        ? (productosData.value?.data || productosData.value || [])
        : [];

      setClientes(clientes);
      setVendedores(vendedores);
      setProductosDisponibles(productos);

    } catch (error) {
      setClientes([]);
      setVendedores([]);
      setProductosDisponibles([]);
    }
  };

  const resetForm = () => {
    setFormData({
      clienteId: null,
      vendedorId: null,
      notas: '',
      productos: []
    });
    setClienteData({
      nombre: '',
      email: '',
      telefono: ''
    });
    setProductos([]);
    setSelectedProducto(null);
    setCantidad(1);
  };

  const handleClienteChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, clienteId: newValue?.id || null }));
    
    if (newValue) {
      setClienteData({
        nombre: newValue.nombre || '',
        email: newValue.email || '',
        telefono: newValue.telefono || ''
      });
    } else {
      setClienteData({
        nombre: '',
        email: '',
        telefono: ''
      });
    }
  };

  const handleVendedorChange = (event) => {
    setFormData(prev => ({ ...prev, vendedorId: event.target.value }));
  };

  const handleNotasChange = (event) => {
    setFormData(prev => ({ ...prev, notas: event.target.value }));
  };

  const handleAgregarProducto = () => {
    if (!selectedProducto || cantidad <= 0) {
      alertService.error('Error', 'Selecciona un producto y especifica una cantidad válida');
      return;
    }

    const productoExistente = productos.find(p => p.id === selectedProducto.id);
    
    if (productoExistente) {
      setProductos(prev =>
        prev.map(p =>
          p.id === selectedProducto.id
            ? { ...p, cantidad: p.cantidad + cantidad }
            : p
        )
      );
    } else {
      const nuevoProducto = {
        id: selectedProducto.id,
        nombre: selectedProducto.nombre,
        precio: selectedProducto.precio,
        cantidad: cantidad,
        stock: selectedProducto.stock
      };
      setProductos(prev => [...prev, nuevoProducto]);
    }

    setSelectedProducto(null);
    setCantidad(1);
  };

  const handleRemoverProducto = (productoId) => {
    setProductos(prev => prev.filter(p => p.id !== productoId));
  };

  const handleCantidadChange = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleRemoverProducto(productoId);
      return;
    }

    setProductos(prev =>
      prev.map(p =>
        p.id === productoId
          ? { ...p, cantidad: Math.min(nuevaCantidad, p.stock) }
          : p
      )
    );
  };

  const calcularSubtotal = (precio, cantidad) => {
    return precio * cantidad;
  };

  const calcularTotal = () => {
    return productos.reduce((total, producto) => 
      total + calcularSubtotal(producto.precio, producto.cantidad), 0
    );
  };

  const handleSubmit = async () => {
    if (!formData.clienteId) {
      alertService.error('Error', 'Debe seleccionar un cliente');
      return;
    }

    if (productos.length === 0) {
      alertService.error('Error', 'Debe agregar al menos un producto');
      return;
    }

    // Validaciones adicionales
    const invalidProducts = productos.filter(p => !p.id || p.cantidad <= 0 || !p.precio);
    if (invalidProducts.length > 0) {
      alertService.error('Error', 'Hay productos con datos inválidos');
      return;
    }

    // Verificar que el cliente seleccionado existe en la lista
    const clienteSeleccionado = clientes.find(c => c.id === parseInt(formData.clienteId));
    if (!clienteSeleccionado) {
      alertService.error('Error', 'El cliente seleccionado no es válido');
      return;
    }

    // Verificar que el vendedor seleccionado existe (si se seleccionó uno)
    if (formData.vendedorId) {
      const vendedorSeleccionado = vendedores.find(v => v.id === parseInt(formData.vendedorId));
      if (!vendedorSeleccionado) {
        alertService.error('Error', 'El vendedor seleccionado no es válido');
        return;
      }
    }

    // Verificar que todos los productos existen en la lista de productos disponibles
    const productosInvalidos = productos.filter(p => 
      !productosDisponibles.find(pd => pd.id === p.id)
    );
    if (productosInvalidos.length > 0) {
      alertService.error('Error', 'Algunos productos seleccionados no están disponibles');
      return;
    }

    const productosStockInsuficiente = productos.filter(p => {
      const prodDisponible = productosDisponibles.find(pd => pd.id === p.id);
      return prodDisponible && prodDisponible.stock < p.cantidad;
    });
    if (productosStockInsuficiente.length > 0) {
      alertService.error('Error', 'Stock insuficiente para algunos productos');
      return;
    }

    const totalCalculado = calcularTotal();
    
    if (!totalCalculado || totalCalculado <= 0 || !Number.isFinite(totalCalculado)) {
      alertService.error('Error', 'Error calculando el total del pedido');
      return;
    }

    const pedidoData = {
      clienteId: parseInt(formData.clienteId),
      vendedorId: formData.vendedorId ? parseInt(formData.vendedorId) : null,
      notas: formData.notas || '',
      detalles: productos.map(p => ({
        productoId: parseInt(p.id),
        cantidad: parseInt(p.cantidad),
        precioUnitario: parseFloat(parseFloat(p.precio).toFixed(2))
      }))
    };

    try {
      await onSubmit(pedidoData);
    } catch (error) {
      alertService.error('Error', 'No se pudo crear el pedido');
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      className="pedido-form-dialog"
      disableEnforceFocus
      disableAutoFocus
      keepMounted={false}
    >
      <DialogTitle>
        Crear Nuevo Pedido
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {/* Información del Cliente */}
            <Grid size={12}>
              <Card variant="outlined" className="pedido-form-section cliente-info-section">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información del Cliente
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Autocomplete
                        className="cliente-autocomplete"
                        options={clientes}
                        getOptionLabel={(option) => `${option.nombre} - ${option.email}`}
                        value={clientes.find(c => c.id === formData.clienteId) || null}
                        onChange={handleClienteChange}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccionar Cliente"
                            placeholder="Buscar cliente..."
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <SearchIcon sx={{ mr: 1, color: 'action.active' }} />
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => {
                          const { key, ...optionProps } = props;
                          return (
                            <li key={`cliente-${option.id}`} {...optionProps}>
                              <Box>
                                <Typography variant="body1">
                                  {option.nombre}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {option.email}
                                </Typography>
                              </Box>
                            </li>
                          );
                        }}
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Vendedor Asignado</InputLabel>
                        <Select
                          value={formData.vendedorId || ''}
                          onChange={handleVendedorChange}
                          label="Vendedor Asignado"
                        >
                          <MenuItem value="">
                            <em>Sin asignar</em>
                          </MenuItem>
                          {vendedores.map((vendedor) => (
                            <MenuItem key={vendedor.id} value={vendedor.id}>
                              {vendedor.nombre}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Datos del cliente seleccionado */}
                    {formData.clienteId && (
                      <>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Nombre del cliente"
                            value={clienteData.nombre}
                            InputProps={{
                              readOnly: true,
                            }}
                            variant="filled"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Email del cliente"
                            value={clienteData.email}
                            InputProps={{
                              readOnly: true,
                            }}
                            variant="filled"
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <TextField
                            fullWidth
                            label="Teléfono del cliente"
                            value={clienteData.telefono}
                            InputProps={{
                              readOnly: true,
                            }}
                            variant="filled"
                          />
                        </Grid>
                      </>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Agregar Productos */}
            <Grid size={12}>
              <Card variant="outlined" className="pedido-form-section productos-section">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Agregar Productos
                  </Typography>
                  
                  <Grid container spacing={2} alignItems="end">
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Autocomplete
                        className="producto-autocomplete"
                        options={productosDisponibles}
                        getOptionLabel={(option) => `${option.nombre} - ${formatCurrency(option.precio)}`}
                        value={selectedProducto}
                        onChange={(event, newValue) => setSelectedProducto(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Seleccionar Producto"
                            placeholder="Buscar producto..."
                          />
                        )}
                        renderOption={(props, option) => {
                          const { key, ...optionProps } = props;
                          return (
                            <li key={`producto-${option.id}`} {...optionProps}>
                              <Box>
                                <Typography variant="body1">
                                  {option.nombre}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    {formatCurrency(option.precio)}
                                  </Typography>
                                  <Typography variant="body2" color={option.stock > 10 ? 'success.main' : 'warning.main'}>
                                    Stock: {option.stock}
                                  </Typography>
                                </Box>
                              </Box>
                            </li>
                          );
                        }}
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        label="Cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value) || 1))}
                        inputProps={{
                          min: 1,
                          max: selectedProducto?.stock || 999
                        }}
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 3 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAgregarProducto}
                        disabled={!selectedProducto}
                        sx={{ height: 56 }}
                      >
                        Agregar
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Lista de Productos */}
            {productos.length > 0 && (
              <Grid size={12}>
                <Card variant="outlined" className="pedido-form-section productos-lista-section">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Productos en el Pedido
                    </Typography>
                    
                    <TableContainer component={Paper} variant="outlined" className="productos-table">
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Producto</TableCell>
                            <TableCell align="center">Cantidad</TableCell>
                            <TableCell align="right">Precio Unit.</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                            <TableCell align="center">Acciones</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {productos.map((producto) => (
                            <TableRow key={producto.id}>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {producto.nombre}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Stock disponible: {producto.stock}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <Box className="cantidad-controls">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCantidadChange(producto.id, producto.cantidad - 1)}
                                  >
                                    <RemoveIcon />
                                  </IconButton>
                                  <TextField
                                    size="small"
                                    value={producto.cantidad}
                                    onChange={(e) => handleCantidadChange(producto.id, parseInt(e.target.value) || 0)}
                                    inputProps={{
                                      min: 1,
                                      max: producto.stock,
                                      style: { textAlign: 'center', width: 60 }
                                    }}
                                    type="number"
                                  />
                                  <IconButton
                                    size="small"
                                    onClick={() => handleCantidadChange(producto.id, producto.cantidad + 1)}
                                    disabled={producto.cantidad >= producto.stock}
                                  >
                                    <AddIcon />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                {formatCurrency(producto.precio)}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                  {formatCurrency(calcularSubtotal(producto.precio, producto.cantidad))}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoverProducto(producto.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="total-row">
                            <TableCell colSpan={3}>
                              <Typography variant="h6">
                                Total
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="h6" color="primary">
                                {formatCurrency(calcularTotal())}
                              </Typography>
                            </TableCell>
                            <TableCell />
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {/* Notas */}
            <Grid size={12}>
              <TextField
                fullWidth
                label="Notas (opcional)"
                multiline
                rows={3}
                value={formData.notas}
                onChange={handleNotasChange}
                placeholder="Instrucciones especiales, comentarios adicionales..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions className="pedido-form-actions">
        <Button 
          onClick={handleClose}
          size="large"
        >
          Cancelar
        </Button>
        
        <Button 
          onClick={handleSubmit}
          variant="contained"
          size="large"
          disabled={loading || !formData.clienteId || productos.length === 0}
          className={loading ? 'loading-button' : ''}
        >
          {loading ? 'Creando...' : 'Crear Pedido'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PedidoFormDialog;
