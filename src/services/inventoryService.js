import apiService from './api';

class InventoryService {
  // Obtener todos los productos
  async getProducts(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/productos?${queryParams}` : '/productos';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener productos: ' + error.message);
    }
  }

  // Obtener productos activos
  async getActiveProducts() {
    try {
      return await apiService.get('/productos/activos');
    } catch (error) {
      throw new Error('Error al obtener productos activos: ' + error.message);
    }
  }

  // Obtener productos con stock
  async getProductsWithStock() {
    try {
      return await apiService.get('/productos/con-stock');
    } catch (error) {
      throw new Error('Error al obtener productos con stock: ' + error.message);
    }
  }

  // Obtener productos con stock bajo
  async getLowStockProducts() {
    try {
      return await apiService.get('/productos/stock-bajo');
    } catch (error) {
      throw new Error('Error al obtener productos con stock bajo: ' + error.message);
    }
  }

  // Obtener productos por categoría
  async getProductsByCategory(categoryId) {
    try {
      return await apiService.get(`/productos/categoria/${categoryId}`);
    } catch (error) {
      throw new Error('Error al obtener productos por categoría: ' + error.message);
    }
  }

  // Obtener producto por ID
  async getProductById(id) {
    try {
      return await apiService.get(`/productos/${id}`);
    } catch (error) {
      throw new Error('Error al obtener producto: ' + error.message);
    }
  }

  async createProduct(productData) {
    try {
      const response = await apiService.post('/productos', productData);
      return response;
    } catch (error) {
      throw new Error('Error al crear producto: ' + (error.message || 'Error desconocido'));
    }
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    try {
      return await apiService.put(`/productos/${id}`, productData);
    } catch (error) {
      throw new Error('Error al actualizar producto: ' + error.message);
    }
  }

  // Actualizar stock del producto
  async updateProductStock(id, stockData) {
    try {
      return await apiService.put(`/productos/${id}/stock`, stockData);
    } catch (error) {
      throw new Error('Error al actualizar stock: ' + error.message);
    }
  }

  // Eliminar producto
  async deleteProduct(id) {
    try {
      return await apiService.delete(`/productos/${id}`);
    } catch (error) {
      throw new Error('Error al eliminar producto: ' + error.message);
    }
  }

  // Métodos auxiliares para categorías (si necesitas obtener las categorías)
  async getCategories() {
    try {
      return await apiService.get('/categorias-productos');
    } catch (error) {
      throw new Error('Error al obtener categorías: ' + error.message);
    }
  }

  // Métodos auxiliares para giros de negocio
  async getGirosNegocio() {
    try {
      return await apiService.get('/giros-negocio');
    } catch (error) {
      throw new Error('Error al obtener giros de negocio: ' + error.message);
    }
  }

  // Reporte de inventario
  async getInventoryReport(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/inventario?${queryParams}` : '/reportes/inventario';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de inventario: ' + error.message);
    }
  }
}

export default new InventoryService();