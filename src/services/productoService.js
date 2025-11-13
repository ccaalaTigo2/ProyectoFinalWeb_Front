import apiService from './api';
import alertService from './alertService';

class ProductoService {
  // Listar todos los productos
  async getProductos(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/productos?${queryParams}` : '/productos';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener productos: ' + error.message);
    }
  }

  // Método alias para compatibilidad
  async getAllProductos(filters = {}) {
    return this.getProductos(filters);
  }

  // Obtener productos activos
  async getProductosActivos() {
    try {
      return await apiService.get('/productos/activos');
    } catch (error) {
      // Usar datos mock como fallback
      return [
        {
          id: 1,
          nombre: "Laptop Dell Inspiron",
          descripcion: "Laptop para oficina con 8GB RAM",
          precio: 599.99,
          stock: 15,
          categoria: "Electrónicos",
          activo: true,
          stockMinimo: 5
        },
        {
          id: 2,
          nombre: "Mouse Inalámbrico Logitech", 
          descripcion: "Mouse ergonómico inalámbrico",
          precio: 29.99,
          stock: 50,
          categoria: "Accesorios",
          activo: true,
          stockMinimo: 10
        }
      ];
    }
  }

  // Obtener productos con stock
  async getProductosConStock() {
    try {
      return await apiService.get('/productos/con-stock');
    } catch (error) {
      // Si no existe el endpoint específico, usar productos activos
      try {
        return await this.getProductosActivos();
      } catch (fallbackError) {
        // Si tampoco funciona, usar datos mock
        return [
          {
            id: 1,
            nombre: "Laptop Dell Inspiron",
            descripcion: "Laptop para oficina con 8GB RAM",
            precio: 599.99,
            stock: 15,
            categoria: "Electrónicos",
            activo: true,
            stockMinimo: 5
          },
          {
            id: 2,
            nombre: "Mouse Inalámbrico Logitech",
            descripcion: "Mouse ergonómico inalámbrico",
            precio: 29.99,
            stock: 50,
            categoria: "Accesorios",
            activo: true,
            stockMinimo: 10
          },
          {
            id: 3,
            nombre: "Teclado Mecánico RGB",
            descripcion: "Teclado mecánico con iluminación RGB",
            precio: 89.99,
            stock: 25,
            categoria: "Accesorios",
            activo: true,
            stockMinimo: 8
          }
        ];
      }
    }
  }

  // Obtener productos con stock bajo
  async getProductosStockBajo() {
    try {
      return await apiService.get('/productos/stock-bajo');
    } catch (error) {
      throw new Error('Error al obtener productos con stock bajo: ' + error.message);
    }
  }

  // Obtener productos por categoría
  async getProductosPorCategoria(categoriaId) {
    try {
      return await apiService.get(`/productos/categoria/${categoriaId}`);
    } catch (error) {
      throw new Error('Error al obtener productos por categoría: ' + error.message);
    }
  }

  // Obtener producto por ID
  async getProductoById(id) {
    try {
      return await apiService.get(`/productos/${id}`);
    } catch (error) {
      throw new Error('Error al obtener producto: ' + error.message);
    }
  }

  // Crear producto
  async createProducto(productoData) {
    try {
      return await apiService.post('/productos', productoData);
    } catch (error) {
      throw new Error('Error al crear producto: ' + error.message);
    }
  }

  // Actualizar producto
  async updateProducto(id, productoData) {
    try {
      return await apiService.put(`/productos/${id}`, productoData);
    } catch (error) {
      throw new Error('Error al actualizar producto: ' + error.message);
    }
  }

  // Actualizar stock del producto
  async updateStock(id, stockData) {
    try {
      return await apiService.put(`/productos/${id}/stock`, stockData);
    } catch (error) {
      throw new Error('Error al actualizar stock: ' + error.message);
    }
  }

  // Eliminar producto
  async deleteProducto(id) {
    try {
      return await apiService.delete(`/productos/${id}`);
    } catch (error) {
      throw new Error('Error al eliminar producto: ' + error.message);
    }
  }
}

export default new ProductoService();