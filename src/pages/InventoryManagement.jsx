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
  FormHelperText,
  Chip,
  Menu,
  Fab,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Avatar,
  Badge,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Search,
  Inventory2,
  Warning,
  TrendingUp,
  TrendingDown,
  MoreVert,
  Category,
  QrCode,
  AttachMoney,
} from '@mui/icons-material';
import inventoryService from '../services/inventoryService';
import '../styles/InventoryManagement.css';
import { 
  showSuccess, 
  showError, 
  showDeleteConfirm 
} from '../utils/alerts';
import { 
  PRODUCT_CATEGORIES, 
  PRODUCT_CATEGORY_LABELS,
  PAGINATION,
  ERROR_MESSAGES 
} from '../utils/constants';
import { formatCurrency, formatNumber, debounce } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StockManagementDialog from '../components/StockManagementDialog';

const InventoryManagement = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGINATION.DEFAULT_PAGE_SIZE);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    lowStock: false,
  });

  // Estados para diálogos
  const [productDialog, setProductDialog] = useState({
    open: false,
    mode: 'create',
    product: null,
  });

  const [stockDialog, setStockDialog] = useState({
    open: false,
    product: null,
  });

  const [menuState, setMenuState] = useState({
    anchorEl: null,
    product: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    sku: '',
    barcode: '',
    minStock: '',
    currentStock: '',
    requiereReunion: false,
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [page, rowsPerPage, searchTerm, filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        ...filters,
      };

      const response = await inventoryService.getProducts(params);
      setProducts(response.data || response);
      setTotal(response.total || response.length);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await inventoryService.getCategories();
      setCategories(response);
    } catch (error) {
    }
  };

  const handleOpenProductDialog = (mode, product = null) => {
    setProductDialog({ open: true, mode, product });
    if (product) {
      setFormData({
        name: product.name || product.nombre || '',
        description: product.description || product.descripcion || '',
        category: product.category || product.categoriaId?.toString() || '',
        price: (product.price || product.precio)?.toString() || '',
        cost: product.cost?.toString() || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        minStock: product.minStock?.toString() || '',
        currentStock: (product.currentStock || product.stock)?.toString() || '',
        requiereReunion: product.requiereReunion || false,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        price: '',
        cost: '',
        sku: '',
        barcode: '',
        minStock: '',
        currentStock: '',
        requiereReunion: false,
      });
    }
    setFormErrors({});
  };

  const handleCloseProductDialog = () => {
    setProductDialog({ open: false, mode: 'create', product: null });
    setFormData({
      name: '',
      description: '',
      category: '',
      price: '',
      cost: '',
      sku: '',
      barcode: '',
      minStock: '',
      currentStock: '',
      requiereReunion: false,
    });
    setFormErrors({});
  };

  const handleOpenStockDialog = (product) => {
    setStockDialog({ open: true, product });
  };

  const handleCloseStockDialog = () => {
    setStockDialog({ open: false, product: null });
  };

  const handleStockUpdated = (updatedProduct) => {
    // Actualizar el producto en la lista
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === updatedProduct.id ? { ...p, stock: updatedProduct.stock } : p
      )
    );
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

    if (!formData.description.trim()) {
      errors.description = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.category) {
      errors.category = ERROR_MESSAGES.REQUIRED_FIELD;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      errors.price = ERROR_MESSAGES.INVALID_NUMBER;
    }

    if (!formData.cost || isNaN(parseFloat(formData.cost))) {
      errors.cost = ERROR_MESSAGES.INVALID_NUMBER;
    }

    if (!formData.minStock || isNaN(parseInt(formData.minStock))) {
      errors.minStock = ERROR_MESSAGES.INVALID_NUMBER;
    }

    if (productDialog.mode === 'create' && (!formData.currentStock || isNaN(parseInt(formData.currentStock)))) {
      errors.currentStock = ERROR_MESSAGES.INVALID_NUMBER;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async () => {
    if (!validateForm()) return;

    try {
      const productData = {
        nombre: formData.name,
        descripcion: formData.description,
        precio: parseFloat(formData.price),
        stock: productDialog.mode === 'create' ? parseInt(formData.currentStock) : undefined,
        categoriaId: parseInt(formData.category),
        requiereReunion: formData.requiereReunion || false
      };

      // Remover campos undefined
      Object.keys(productData).forEach(key => {
        if (productData[key] === undefined) {
          delete productData[key];
        }
      });

      if (productDialog.mode === 'create') {
        await inventoryService.createProduct(productData);
        showSuccess('Producto creado', 'El producto se ha creado exitosamente');
      } else {
        await inventoryService.updateProduct(productDialog.product.id, productData);
        showSuccess('Producto actualizado', 'El producto se ha actualizado exitosamente');
      }

      handleCloseProductDialog();
      loadProducts();
    } catch (error) {
      showError('Error', error.message);
    }
  };

  const handleDeleteProduct = async (product) => {
    const result = await showDeleteConfirm(
      '¿Eliminar producto?',
      `¿Estás seguro de que deseas eliminar "${product.name}"? Esta acción no se puede deshacer.`
    );

    if (result.isConfirmed) {
      try {
        await inventoryService.deleteProduct(product.id);
        showSuccess('Producto eliminado', 'El producto se ha eliminado exitosamente');
        loadProducts();
      } catch (error) {
        showError('Error', error.message);
      }
    }
  };

  const handleMenuOpen = (event, product) => {
    setMenuState({
      anchorEl: event.currentTarget,
      product,
    });
  };

  const handleMenuClose = () => {
    setMenuState({
      anchorEl: null,
      product: null,
    });
  };

  const getStockStatus = (product) => {
    const stock = product.stock || product.currentStock || 0;
    const minStock = product.minStock || 0;
    
    if (stock <= 0) {
      return { label: 'Sin stock', color: 'error', icon: <Warning /> };
    } else if (stock <= minStock) {
      return { label: 'Stock bajo', color: 'warning', icon: <Warning /> };
    } else {
      return { label: 'En stock', color: 'success', icon: null };
    }
  };

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '24px',
      boxSizing: 'border-box'
    }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" color="primary.main" gutterBottom>
          Gestión de Inventario
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra productos y controla el stock
        </Typography>
      </Box>

      {/* Resumen de inventario */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'primary.light', mr: 2 }}>
                  <Inventory2 />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="primary.main">
                    {formatNumber(products.length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Productos
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'warning.light', mr: 2 }}>
                  <Warning />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="warning.main">
                    {formatNumber(products.filter(p => (p.stock || p.currentStock || 0) <= (p.minStock || 0)).length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stock Bajo
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'success.light', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(products.reduce((total, p) => total + ((p.precio || p.price || 0) * (p.stock || p.currentStock || 0)), 0))}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Valor Inventario
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'info.light', mr: 2 }}>
                  <Category />
                </Avatar>
                <Box>
                  <Typography variant="h6" color="info.main">
                    {formatNumber(categories.length)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Categorías
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controles de búsqueda y filtros */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              placeholder="Buscar productos..."
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
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.category}
                label="Categoría"
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              >
                <MenuItem value="">Todas las categorías</MenuItem>
                {Object.values(PRODUCT_CATEGORIES).map(category => (
                  <MenuItem key={category} value={category}>
                    {PRODUCT_CATEGORY_LABELS[category]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid size={{ xs: 12, md: 3 }}>
            <Button
              fullWidth
              variant={filters.lowStock ? 'contained' : 'outlined'}
              startIcon={<Warning />}
              onClick={() => setFilters(prev => ({ ...prev, lowStock: !prev.lowStock }))}
              color={filters.lowStock ? 'warning' : 'primary'}
            >
              Solo Stock Bajo
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de productos */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Producto</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="right">Precio</TableCell>
                <TableCell align="center">Stock</TableCell>
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
              ) : products.length > 0 ? (
                products.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {product.nombre || product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.descripcion || product.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={product.categoriaNombre || PRODUCT_CATEGORY_LABELS[product.category] || product.category}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(product.precio || product.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Badge
                          badgeContent={(product.stock || product.currentStock) <= (product.minStock || 0) ? '!' : 0}
                          color="warning"
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(product.stock || product.currentStock)}
                          </Typography>
                        </Badge>
                        <Typography variant="caption" display="block" color="text.secondary">
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          color={stockStatus.color}
                          size="small"
                          icon={stockStatus.icon}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenStockDialog(product)}
                          color="primary"
                          title="Gestionar Stock"
                        >
                          <Inventory2 />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, product)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No se encontraron productos
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
        />
      </Paper>

      {/* FAB para agregar producto */}
      <Fab
        color="primary"
        aria-label="agregar producto"
        onClick={() => handleOpenProductDialog('create')}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <Add />
      </Fab>

      {/* Menú de acciones */}
      <Menu
        anchorEl={menuState.anchorEl}
        open={Boolean(menuState.anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem 
          onClick={() => {
            handleOpenStockDialog(menuState.product);
            handleMenuClose();
          }}
        >
          <Inventory2 fontSize="small" sx={{ mr: 1 }} />
          Gestionar Stock
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleOpenProductDialog('edit', menuState.product);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteProduct(menuState.product);
            handleMenuClose();
          }}
        >
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Eliminar
        </MenuItem>
      </Menu>

      {/* Dialog para crear/editar producto */}
      <Dialog
        open={productDialog.open}
        onClose={handleCloseProductDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {productDialog.mode === 'create' ? 'Crear Producto' : 'Editar Producto'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre del producto"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Categoría</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  label="Categoría"
                  onChange={handleFormChange}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <FormHelperText>{formErrors.category}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Descripción"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleFormChange}
                error={!!formErrors.description}
                helperText={formErrors.description}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="SKU"
                name="sku"
                value={formData.sku}
                onChange={handleFormChange}
                InputProps={{
                  startAdornment: <QrCode sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Código de barras"
                name="barcode"
                value={formData.barcode}
                onChange={handleFormChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Precio de venta"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleFormChange}
                error={!!formErrors.price}
                helperText={formErrors.price}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Costo"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleFormChange}
                error={!!formErrors.cost}
                helperText={formErrors.cost}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'action.active' }} />,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Stock mínimo"
                name="minStock"
                type="number"
                value={formData.minStock}
                onChange={handleFormChange}
                error={!!formErrors.minStock}
                helperText={formErrors.minStock}
              />
            </Grid>

            {productDialog.mode === 'create' && (
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Stock inicial"
                  name="currentStock"
                  type="number"
                  value={formData.currentStock}
                  onChange={handleFormChange}
                  error={!!formErrors.currentStock}
                  helperText={formErrors.currentStock}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProductDialog}>
            Cancelar
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {productDialog.mode === 'create' ? 'Crear' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Stock Management Dialog */}
      <StockManagementDialog
        open={stockDialog.open}
        onClose={handleCloseStockDialog}
        product={stockDialog.product}
        onStockUpdated={handleStockUpdated}
      />
    </div>
  );
};

export default InventoryManagement;
