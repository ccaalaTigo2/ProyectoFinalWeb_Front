import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  TextField,
  Box,
  Grid,
  Alert,
  Divider,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import inventoryService from '../services/inventoryService';
import { showSuccess, showError } from '../utils/alerts';

const StockAPITest = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await inventoryService.getProducts();
      setProducts(response.data || response || []);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los productos');
    }
  };

  const addResult = (operation, success, data, error = null) => {
    const result = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      operation,
      success,
      data,
      error
    };
    setResults(prev => [result, ...prev]);
  };

  const handleSetStock = async () => {
    if (!selectedProduct || !quantity) {
      showError('Error', 'Selecciona un producto e ingresa una cantidad');
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryService.updateProductStock(selectedProduct, parseInt(quantity));
      addResult('Establecer Stock', true, response);
      showSuccess('Éxito', `Stock establecido en ${quantity} unidades`);
      loadProducts(); // Recargar para ver cambios
    } catch (error) {
      addResult('Establecer Stock', false, null, error.message);
      showError('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementStock = async () => {
    if (!selectedProduct || !quantity) {
      showError('Error', 'Selecciona un producto e ingresa una cantidad');
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryService.incrementProductStock(selectedProduct, parseInt(quantity));
      addResult('Incrementar Stock', true, response);
      showSuccess('Éxito', `Stock incrementado en ${quantity} unidades`);
      loadProducts();
    } catch (error) {
      addResult('Incrementar Stock', false, null, error.message);
      showError('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecrementStock = async () => {
    if (!selectedProduct || !quantity) {
      showError('Error', 'Selecciona un producto e ingresa una cantidad');
      return;
    }

    setLoading(true);
    try {
      const response = await inventoryService.decrementProductStock(selectedProduct, parseInt(quantity));
      addResult('Decrementar Stock', true, response);
      showSuccess('Éxito', `Stock decrementado en ${quantity} unidades`);
      loadProducts();
    } catch (error) {
      addResult('Decrementar Stock', false, null, error.message);
      showError('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedProductInfo = () => {
    return products.find(p => p.id.toString() === selectedProduct);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Test de API de Gestión de Stock
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Controles de Prueba
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select
                value={selectedProduct}
                label="Producto"
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {products.map(product => (
                  <MenuItem key={product.id} value={product.id.toString()}>
                    {product.nombre || product.name} (Stock: {product.stock})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Cantidad"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            {getSelectedProductInfo() && (
              <Alert severity="info">
                Stock actual: {getSelectedProductInfo().stock}
              </Alert>
            )}
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSetStock}
                disabled={loading}
              >
                Establecer Stock
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="success"
                onClick={handleIncrementStock}
                disabled={loading}
              >
                Incrementar Stock
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="error"
                onClick={handleDecrementStock}
                disabled={loading}
              >
                Decrementar Stock
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Resultados de las Pruebas
        </Typography>
        
        {results.length === 0 ? (
          <Alert severity="info">No hay resultados aún</Alert>
        ) : (
          <Box>
            {results.map(result => (
              <Card key={result.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {result.operation}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.timestamp}
                    </Typography>
                  </Box>
                  
                  {result.success ? (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      Operación exitosa
                    </Alert>
                  ) : (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      Error: {result.error}
                    </Alert>
                  )}
                  
                  {result.data && (
                    <Box>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Respuesta del servidor:
                      </Typography>
                      <Box 
                        component="pre" 
                        sx={{ 
                          backgroundColor: '#f5f5f5', 
                          p: 2, 
                          borderRadius: 1,
                          fontSize: '0.875rem',
                          overflow: 'auto'
                        }}
                      >
                        {JSON.stringify(result.data, null, 2)}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default StockAPITest;