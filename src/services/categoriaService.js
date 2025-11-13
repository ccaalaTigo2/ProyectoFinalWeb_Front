import apiService from './api';
import alertService from './alertService';

class CategoriaService {
  // Listar todas las categorías
  async getCategorias(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/categorias-productos?${queryParams}` : '/categorias-productos';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener categorías: ' + error.message);
    }
  }

  // Obtener categorías activas
  async getCategoriasActivas() {
    try {
      return await apiService.get('/categorias-productos/activas');
    } catch (error) {
      throw new Error('Error al obtener categorías activas: ' + error.message);
    }
  }

  // Obtener categoría por ID
  async getCategoriaById(id) {
    try {
      return await apiService.get(`/categorias-productos/${id}`);
    } catch (error) {
      throw new Error('Error al obtener categoría: ' + error.message);
    }
  }

  // Obtener categorías por giro de negocio
  async getCategoriasByGiro(giroId) {
    try {
      return await apiService.get(`/categorias-productos/giro/${giroId}`);
    } catch (error) {
      throw new Error('Error al obtener categorías por giro: ' + error.message);
    }
  }

  // Crear nueva categoría
  async createCategoria(categoriaData) {
    try {
      // Validar datos requeridos
      if (!categoriaData.nombre) {
        const errorMsg = 'El nombre de la categoría es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.post('/categorias-productos', {
        nombre: categoriaData.nombre.trim(),
        descripcion: categoriaData.descripcion?.trim() || null,
        giroNegocioId: categoriaData.giroNegocioId || null,
        activo: categoriaData.activo !== undefined ? categoriaData.activo : true
      });

      alertService.success('¡Éxito!', 'Categoría creada correctamente');
      return response;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.message?.includes('nombre')) {
        const errorMsg = 'Ya existe una categoría con ese nombre';
        alertService.error('Nombre Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al crear categoría: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Crear Categoría', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Actualizar categoría
  async updateCategoria(id, categoriaData) {
    try {
      if (!id) {
        const errorMsg = 'ID de la categoría es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.put(`/categorias-productos/${id}`, {
        nombre: categoriaData.nombre.trim(),
        descripcion: categoriaData.descripcion?.trim() || null,
        giroNegocioId: categoriaData.giroNegocioId || null,
        activo: categoriaData.activo !== undefined ? categoriaData.activo : true
      });

      alertService.success('¡Éxito!', 'Categoría actualizada correctamente');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Categoría no encontrada';
        alertService.error('Categoría No Encontrada', errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 400 && error.response.data?.message?.includes('nombre')) {
        const errorMsg = 'El nombre ya está registrado por otra categoría';
        alertService.error('Nombre Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al actualizar categoría: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Actualizar', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Eliminar categoría
  async deleteCategoria(id) {
    try {
      if (!id) {
        const errorMsg = 'ID de la categoría es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      await apiService.delete(`/categorias-productos/${id}`);
      alertService.success('¡Éxito!', 'Categoría eliminada correctamente');
      return { success: true };
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Categoría no encontrada';
        alertService.error('Categoría No Encontrada', errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 409) {
        const errorMsg = 'No se puede eliminar la categoría porque tiene productos asociados';
        alertService.error('Categoría en Uso', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al eliminar categoría: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Eliminar', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Buscar categorías
  async searchCategorias(query) {
    try {
      return await apiService.get(`/categorias-productos/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      throw new Error('Error al buscar categorías: ' + error.message);
    }
  }

  // Validar nombre único
  async validateNombre(nombre, excludeId = null) {
    try {
      const params = excludeId ? `?excludeId=${excludeId}` : '';
      return await apiService.get(`/categorias-productos/validate-nombre/${encodeURIComponent(nombre)}${params}`);
    } catch (error) {
      throw new Error('Error al validar nombre: ' + error.message);
    }
  }
}

export default new CategoriaService();
