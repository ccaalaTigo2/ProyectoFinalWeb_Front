import apiService from './api';
import alertService from './alertService';

class ClienteService {
  // Listar todos los clientes con estadísticas
  async getAllClientes(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/clientes?${queryParams}` : '/clientes';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener clientes: ' + error.message);
    }
  }

  // Mantener compatibilidad con método anterior
  async getClientes(filters = {}) {
    return this.getAllClientes(filters);
  }

  // Obtener cliente por ID
  async getClienteById(id) {
    try {
      return await apiService.get(`/clientes/${id}`);
    } catch (error) {
      throw new Error('Error al obtener cliente: ' + error.message);
    }
  }


  // Crear nuevo cliente
  async createCliente(clienteData) {
    try {
      // Validar datos requeridos
      if (!clienteData.nombre || !clienteData.email) {
        const errorMsg = 'Nombre y email son campos requeridos';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.post('/clientes', {
        nombre: clienteData.nombre.trim(),
        email: clienteData.email.trim(),
        telefono: clienteData.telefono?.trim() || null,
        direccion: clienteData.direccion?.trim() || null,
        empresa: clienteData.empresa?.trim() || null,
        tipoCliente: clienteData.tipoCliente || 'PERSONA',
        notas: clienteData.notas?.trim() || null
      });

      alertService.success('¡Éxito!', 'Cliente creado correctamente');
      return response;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data?.message?.includes('email')) {
        const errorMsg = 'El email ya está registrado en el sistema';
        alertService.error('Email Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al crear cliente: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Crear Cliente', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Actualizar cliente existente
  async updateCliente(id, clienteData) {
    try {
      if (!id) {
        const errorMsg = 'ID del cliente es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.put(`/clientes/${id}`, {
        nombre: clienteData.nombre.trim(),
        email: clienteData.email.trim(),
        telefono: clienteData.telefono?.trim() || null,
        direccion: clienteData.direccion?.trim() || null,
        empresa: clienteData.empresa?.trim() || null,
        tipoCliente: clienteData.tipoCliente || 'PERSONA',
        notas: clienteData.notas?.trim() || null
      });

      alertService.success('¡Éxito!', 'Cliente actualizado correctamente');
      return response;
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Cliente no encontrado';
        alertService.error('Cliente No Encontrado', errorMsg);
        throw new Error(errorMsg);
      }
      if (error.response?.status === 400 && error.response.data?.message?.includes('email')) {
        const errorMsg = 'El email ya está registrado por otro cliente';
        alertService.error('Email Duplicado', errorMsg);
        throw new Error(errorMsg);
      }
      const errorMsg = 'Error al actualizar cliente: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Actualizar', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Activar/Desactivar cliente
  async toggleClienteActivo(id) {
    try {
      if (!id) {
        const errorMsg = 'ID del cliente es requerido';
        alertService.error('Datos Incompletos', errorMsg);
        throw new Error(errorMsg);
      }

      const response = await apiService.put(`/clientes/${id}/toggle-activo`);
      
      // Si el backend devuelve el estado actualizado, lo retornamos
      return response || { success: true };
    } catch (error) {
      if (error.response?.status === 404) {
        const errorMsg = 'Cliente no encontrado';
        alertService.error('Cliente No Encontrado', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Para errores de parsing JSON, mostrar mensaje más claro
      if (error.message.includes('JSON')) {
        const errorMsg = 'El servidor no respondió correctamente. Es posible que la operación se haya realizado.';
        alertService.warning('Respuesta Inesperada', errorMsg);
        // Retornar éxito porque probablemente funcionó pero el servidor no devolvió JSON
        return { success: true };
      }
      
      const errorMsg = 'Error al cambiar estado del cliente: ' + (error.response?.data?.message || error.message);
      alertService.error('Error al Cambiar Estado', errorMsg);
      throw new Error(errorMsg);
    }
  }

  // Eliminar cliente (si está implementado en el backend)
  async deleteCliente(id) {
    try {
      return await apiService.delete(`/clientes/${id}`);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Cliente no encontrado');
      }
      throw new Error('Error al eliminar cliente: ' + (error.response?.data?.message || error.message));
    }
  }

  // Buscar clientes por término
  async searchClientes(searchTerm, filters = {}) {
    try {
      const params = { 
        search: searchTerm,
        ...filters 
      };
      const queryParams = new URLSearchParams(params).toString();
      return await apiService.get(`/clientes/search?${queryParams}`);
    } catch (error) {
      throw new Error('Error al buscar clientes: ' + error.message);
    }
  }

  // Validar email único (para formularios)
  async validateEmail(email, excludeId = null) {
    try {
      const params = { email };
      if (excludeId) {
        params.excludeId = excludeId;
      }
      const queryParams = new URLSearchParams(params).toString();
      return await apiService.get(`/clientes/validate-email?${queryParams}`);
    } catch (error) {
      throw new Error('Error al validar email: ' + error.message);
    }
  }

  // Obtener estadísticas de clientes
  async getClientesStats() {
    try {
      return await apiService.get('/clientes/stats');
    } catch (error) {
      throw new Error('Error al obtener estadísticas de clientes: ' + error.message);
    }
  }

  // Exportar clientes (si está implementado)
  async exportClientes(format = 'csv', filters = {}) {
    try {
      const params = { format, ...filters };
      const queryParams = new URLSearchParams(params).toString();
      return await apiService.get(`/clientes/export?${queryParams}`, {
        responseType: 'blob'
      });
    } catch (error) {
      throw new Error('Error al exportar clientes: ' + error.message);
    }
  }
}

export default new ClienteService();