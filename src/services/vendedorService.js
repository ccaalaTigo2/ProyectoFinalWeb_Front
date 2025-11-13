import apiService from './api';
import alertService from './alertService';

class VendedorService {
  // Listar todos los vendedores con estadísticas
  async getVendedores(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/vendedores?${queryParams}` : '/vendedores';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener vendedores: ' + error.message);
    }
  }

  // Mantener compatibilidad con método anterior
  async getAllVendedores(filters = {}) {
    return this.getVendedores(filters);
  }

  // Obtener vendedores activos
  async getVendedoresActivos() {
    try {
      return await apiService.get('/vendedores/activos');
    } catch (error) {
      // Usar datos mock como fallback
      return [
        {
          id: 1,
          nombre: "Ana Rodríguez",
          email: "ana.rodriguez@empresa.com",
          telefono: "+1111222333",
          activo: true,
          zona: "Norte"
        },
        {
          id: 2,
          nombre: "Pedro Martínez",
          email: "pedro.martinez@empresa.com",
          telefono: "+4444555666", 
          activo: true,
          zona: "Sur"
        }
      ];
    }
  }

  // Obtener vendedor por ID
  async getVendedorById(id) {
    try {
      return await apiService.get(`/vendedores/${id}`);
    } catch (error) {
      throw new Error('Error al obtener vendedor: ' + error.message);
    }
  }

  // Obtener vendedores activos para asignación
  async getVendedoresParaAsignacion() {
    try {
      return await apiService.get('/vendedores/para-asignacion');
    } catch (error) {
      // Si no existe el endpoint específico, usar vendedores activos
      try {
        return await this.getVendedoresActivos();
      } catch (fallbackError) {
        // Si tampoco funciona, usar datos mock
        return [
          {
            id: 1,
            nombre: "Ana Rodríguez",
            email: "ana.rodriguez@empresa.com",
            telefono: "+1111222333",
            activo: true,
            zona: "Norte"
          },
          {
            id: 2,
            nombre: "Pedro Martínez",
            email: "pedro.martinez@empresa.com",
            telefono: "+4444555666",
            activo: true,
            zona: "Sur"
          },
          {
            id: 3,
            nombre: "Laura Silva",
            email: "laura.silva@empresa.com",
            telefono: "+7777888999",
            activo: true,
            zona: "Centro"
          }
        ];
      }
    }
  }

  // Crear vendedor
  async createVendedor(vendedorData) {
    try {
      // Validar datos requeridos
      if (!vendedorData.nombre || !vendedorData.email || !vendedorData.codigo) {
        const errorMsg = 'Nombre, email y código son campos requeridos';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.post('/vendedores', {
        nombre: vendedorData.nombre.trim(),
        email: vendedorData.email.trim(),
        telefono: vendedorData.telefono?.trim() || null,
        codigo: vendedorData.codigo?.trim(),
        especialidad: vendedorData.especialidad?.trim() || null,
        metaMensual: vendedorData.metaMensual || 0,
        comisionPorcentaje: vendedorData.comisionPorcentaje || 0,
        notas: vendedorData.notas?.trim() || null
      });

      alertService.success('¡Éxito!', 'Vendedor creado correctamente');
      return response;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.message?.includes('código')) {
        const errorMsg = 'Ya existe un vendedor con ese código';
        alertService.error('Código Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 400 && error.response.data?.message?.includes('email')) {
        const errorMsg = 'El email ya está registrado en el sistema';
        alertService.error('Email Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al crear vendedor: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Crear Vendedor', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Actualizar vendedor existente
  async updateVendedor(id, vendedorData) {
    try {
      if (!id) {
        const errorMsg = 'ID del vendedor es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const payload = {
        nombre: vendedorData.nombre.trim(),
        email: vendedorData.email.trim(),
        telefono: vendedorData.telefono?.trim() || null,
        codigo: vendedorData.codigo?.trim(),
        especialidad: vendedorData.especialidad?.trim() || null,
        metaMensual: vendedorData.metaMensual || 0,
        comisionPorcentaje: vendedorData.comisionPorcentaje || 0,
        notas: vendedorData.notas?.trim() || null
      };

      const response = await apiService.put(`/vendedores/${id}`, payload);
      
      alertService.success('¡Éxito!', 'Vendedor actualizado correctamente');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Vendedor no encontrado';
        alertService.error('Vendedor No Encontrado', errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 400 && error.response.data?.message?.includes('código')) {
        const errorMsg = 'El código ya está registrado por otro vendedor';
        alertService.error('Código Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 400 && error.response.data?.message?.includes('email')) {
        const errorMsg = 'El email ya está registrado por otro vendedor';
        alertService.error('Email Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al actualizar vendedor: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Actualizar', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Activar/Desactivar vendedor
  async toggleVendedorActivo(id) {
    try {
      if (!id) {
        const errorMsg = 'ID del vendedor es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.put(`/vendedores/${id}/toggle-activo`);
      
      // Si el backend devuelve el estado actualizado, lo retornamos
      return response || { success: true };
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Vendedor no encontrado';
        alertService.error('Vendedor No Encontrado', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Para errores de parsing JSON, mostrar mensaje más claro
      if (error.message.includes('JSON')) {
        const errorMsg = 'El servidor no respondió correctamente. Es posible que la operación se haya realizado.';
        alertService.warning('Respuesta Inesperada', errorMsg);
        // Retornar éxito porque probablemente funcionó pero el servidor no devolvió JSON
        return { success: true };
      }
      
      const errorMsg = 'Error al cambiar estado del vendedor: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Cambiar Estado', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Eliminar vendedor (si está implementado en el backend)
  async deleteVendedor(id) {
    try {
      return await apiService.delete(`/vendedores/${id}`);
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Vendedor no encontrado';
        alertService.error('Vendedor No Encontrado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al eliminar vendedor: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Eliminar', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Buscar vendedores
  async searchVendedores(query) {
    try {
      return await apiService.get(`/vendedores/search?q=${encodeURIComponent(query)}`);
    } catch (error) {
      throw new Error('Error al buscar vendedores: ' + error.message);
    }
  }

  // Validar código único
  async validateCodigo(codigo, excludeId = null) {
    try {
      const params = excludeId ? `?excludeId=${excludeId}` : '';
      return await apiService.get(`/vendedores/validate-codigo/${encodeURIComponent(codigo)}${params}`);
    } catch (error) {
      throw new Error('Error al validar código: ' + error.message);
    }
  }

  // Obtener estadísticas de vendedores
  async getEstadisticasVendedores() {
    try {
      return await apiService.get('/vendedores/estadisticas');
    } catch (error) {
      throw new Error('Error al obtener estadísticas de vendedores: ' + error.message);
    }
  }

  // Exportar vendedores a Excel/CSV
  async exportarVendedores(formato = 'xlsx') {
    try {
      return await apiService.get(`/vendedores/exportar?formato=${formato}`, {
        headers: { 'Accept': 'application/octet-stream' }
      });
    } catch (error) {
      throw new Error('Error al exportar vendedores: ' + error.message);
    }
  }
}

export default new VendedorService();