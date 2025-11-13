import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Close,
  Add,
  Remove,
  Edit,
  TrendingUp,
  TrendingDown,
  Inventory,
} from '@mui/icons-material';
import inventoryService from '../services/inventoryService';
import { showSuccess, showError } from '../utils/alerts';
import { formatNumber } from '../utils/helpers';
import '../styles/StockManagementDialog.css';

const StockManagementDialog = ({ open, onClose, product, onStockUpdated }) => {
  const [operation, setOperation] = useState('set'); // 'set', 'increment', 'decrement'
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleClose = () => {
    setOperation('set');
    setQuantity('');
    setError('');
    onClose();
  };

  const handleOperationChange = (newOperation) => {
    setOperation(newOperation);
    setQuantity('');
    setError('');
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    setError('');
  };

  const validateQuantity = () => {
    const qty = parseInt(quantity);
    if (!quantity || isNaN(qty) || qty < 0) {
      setError('La cantidad debe ser un número válido mayor o igual a 0');
      return false;
    }
    if (operation === 'decrement' && qty > (product?.stock || 0)) {
      setError(`No puedes decrementar más que el stock actual (${product?.stock || 0})`);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateQuantity()) return;

    setLoading(true);
    setError('');

    try {
      const qty = parseInt(quantity);
      let response;

      switch (operation) {
        case 'set':
          response = await inventoryService.updateProductStock(product.id, qty);
          showSuccess(
            'Stock actualizado', 
            `Stock establecido en ${qty} unidades`
          );
          break;
        case 'increment':
          response = await inventoryService.incrementProductStock(product.id, qty);
          showSuccess(
            'Stock incrementado', 
            `Se agregaron ${qty} unidades al stock`
          );
          break;
        case 'decrement':
          response = await inventoryService.decrementProductStock(product.id, qty);
          showSuccess(
            'Stock decrementado', 
            `Se removieron ${qty} unidades del stock`
          );
          break;
        default:
          throw new Error('Operación no válida');
      }

      if (onStockUpdated) {
        onStockUpdated(response);
      }
      handleClose();
    } catch (error) {
      setError(error.message || 'Error al actualizar el stock');
    } finally {
      setLoading(false);
    }
  };

  const getOperationIcon = (op) => {
    switch (op) {
      case 'set': return <Edit />;
      case 'increment': return <TrendingUp />;
      case 'decrement': return <TrendingDown />;
      default: return <Inventory />;
    }
  };

  const getOperationColor = (op) => {
    switch (op) {
      case 'set': return 'primary';
      case 'increment': return 'success';
      case 'decrement': return 'error';
      default: return 'default';
    }
  };

  const getOperationLabel = (op) => {
    switch (op) {
      case 'set': return 'Establecer Stock';
      case 'increment': return 'Incrementar Stock';
      case 'decrement': return 'Decrementar Stock';
      default: return 'Gestionar Stock';
    }
  };

  const getOperationDescription = (op) => {
    switch (op) {
      case 'set': return 'Establece un valor específico de stock';
      case 'increment': return 'Agrega la cantidad especificada al stock actual';
      case 'decrement': return 'Resta la cantidad especificada del stock actual';
      default: return '';
    }
  };

  const calculateResultingStock = () => {
    if (!quantity || isNaN(parseInt(quantity))) return product?.stock || 0;
    
    const qty = parseInt(quantity);
    const currentStock = product?.stock || 0;
    
    switch (operation) {
      case 'set':
        return qty;
      case 'increment':
        return currentStock + qty;
      case 'decrement':
        return Math.max(0, currentStock - qty);
      default:
        return currentStock;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <Inventory color="primary" />
            <Typography variant="h6">
              Gestión de Stock
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {product && (
          <Box>
            {/* Información del producto */}
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                {product.nombre || product.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {product.descripcion || product.description}
              </Typography>
              <Chip
                label={`Stock actual: ${formatNumber(product.stock || 0)} unidades`}
                color={product.stock > 0 ? 'success' : 'error'}
                variant="outlined"
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Selección de operación */}
            <Box mb={3}>
              <Typography variant="subtitle1" gutterBottom>
                Tipo de Operación
              </Typography>
              <Grid container spacing={2}>
                {['set', 'increment', 'decrement'].map((op) => (
                  <Grid key={op} item xs={12} sm={4}>
                    <Button
                      fullWidth
                      variant={operation === op ? 'contained' : 'outlined'}
                      color={getOperationColor(op)}
                      startIcon={getOperationIcon(op)}
                      onClick={() => handleOperationChange(op)}
                      sx={{ 
                        height: 80,
                        flexDirection: 'column',
                        gap: 1
                      }}
                    >
                      <Typography variant="caption">
                        {getOperationLabel(op)}
                      </Typography>
                    </Button>
                  </Grid>
                ))}
              </Grid>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {getOperationDescription(operation)}
              </Typography>
            </Box>

            {/* Input de cantidad */}
            <Box mb={3}>
              <TextField
                fullWidth
                label="Cantidad"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                error={!!error}
                helperText={error}
                inputProps={{ 
                  min: 0,
                  step: 1
                }}
                placeholder={operation === 'set' ? 'Nuevo valor de stock' : 'Cantidad a modificar'}
              />
            </Box>

            {/* Vista previa del resultado */}
            {quantity && !error && (
              <Alert 
                severity="info" 
                sx={{ mb: 3 }}
                icon={getOperationIcon(operation)}
              >
                <Typography variant="body2">
                  <strong>Stock resultante:</strong> {formatNumber(calculateResultingStock())} unidades
                  {operation !== 'set' && (
                    <span>
                      {' '}({formatNumber(product?.stock || 0)} {operation === 'increment' ? '+' : '-'} {formatNumber(parseInt(quantity))} = {formatNumber(calculateResultingStock())})
                    </span>
                  )}
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color={getOperationColor(operation)}
          disabled={loading || !quantity || !!error}
          startIcon={getOperationIcon(operation)}
        >
          {loading ? 'Procesando...' : getOperationLabel(operation)}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StockManagementDialog;