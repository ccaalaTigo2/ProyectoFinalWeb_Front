import apiService from './api';

class MeetingService {
  // Crear nueva reunión
  async createReunion(reunionData) {
    try {
      return await apiService.post('/reuniones', reunionData);
    } catch (error) {
      throw new Error('Error al crear reunión: ' + error.message);
    }
  }

  // Obtener todas las reuniones
  async getReuniones(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reuniones?${queryParams}` : '/reuniones';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reuniones: ' + error.message);
    }
  }

  // Obtener reuniones por estado
  async getReunionesByEstado(estado) {
    try {
      return await apiService.get(`/reuniones/estado/${estado}`);
    } catch (error) {
      throw new Error('Error al obtener reuniones por estado: ' + error.message);
    }
  }

  // Obtener reuniones por vendedor
  async getReunionesByVendedor(vendedorId) {
    try {
      return await apiService.get(`/reuniones/vendedor/${vendedorId}`);
    } catch (error) {
      throw new Error('Error al obtener reuniones del vendedor: ' + error.message);
    }
  }

  // Obtener reuniones por cliente
  async getReunionesByCliente(clienteId) {
    try {
      return await apiService.get(`/reuniones/cliente/${clienteId}`);
    } catch (error) {
      throw new Error('Error al obtener reuniones del cliente: ' + error.message);
    }
  }

  // Obtener reuniones por pedido
  async getReunionesByPedido(pedidoId) {
    try {
      return await apiService.get(`/reuniones/pedido/${pedidoId}`);
    } catch (error) {
      throw new Error('Error al obtener reuniones del pedido: ' + error.message);
    }
  }

  // Obtener reunión por ID
  async getReunionById(id) {
    try {
      return await apiService.get(`/reuniones/${id}`);
    } catch (error) {
      throw new Error('Error al obtener reunión: ' + error.message);
    }
  }

  // Actualizar reunión
  async updateReunion(id, reunionData) {
    try {
      return await apiService.put(`/reuniones/${id}`, reunionData);
    } catch (error) {
      throw new Error('Error al actualizar reunión: ' + error.message);
    }
  }

  // Actualizar estado de la reunión
  async updateEstadoReunion(id, estadoData) {
    try {
      return await apiService.put(`/reuniones/${id}/estado`, estadoData);
    } catch (error) {
      throw new Error('Error al actualizar estado de la reunión: ' + error.message);
    }
  }

  // Eliminar reunión
  async deleteReunion(id) {
    try {
      return await apiService.delete(`/reuniones/${id}`);
    } catch (error) {
      throw new Error('Error al eliminar reunión: ' + error.message);
    }
  }

  // Métodos de conveniencia para gestión de reuniones

  // Programar reunión (crear con estado PROGRAMADA)
  async programarReunion(reunionData) {
    try {
      const dataWithStatus = {
        ...reunionData,
        estado: 'PROGRAMADA'
      };
      return await this.createReunion(dataWithStatus);
    } catch (error) {
      throw new Error('Error al programar reunión: ' + error.message);
    }
  }

  // Iniciar reunión (cambiar estado a EN_PROCESO)
  async iniciarReunion(id) {
    try {
      return await this.updateEstadoReunion(id, { 
        estado: 'EN_PROCESO',
        fechaInicio: new Date().toISOString()
      });
    } catch (error) {
      throw new Error('Error al iniciar reunión: ' + error.message);
    }
  }

  // Completar reunión (cambiar estado a COMPLETADA)
  async completarReunion(id, resultadoData = {}) {
    try {
      return await this.updateEstadoReunion(id, { 
        estado: 'COMPLETADA',
        fechaFinalizacion: new Date().toISOString(),
        ...resultadoData
      });
    } catch (error) {
      throw new Error('Error al completar reunión: ' + error.message);
    }
  }

  // Cancelar reunión (cambiar estado a CANCELADA)
  async cancelarReunion(id, motivoCancelacion = '') {
    try {
      return await this.updateEstadoReunion(id, { 
        estado: 'CANCELADA',
        motivoCancelacion,
        fechaCancelacion: new Date().toISOString()
      });
    } catch (error) {
      throw new Error('Error al cancelar reunión: ' + error.message);
    }
  }

  // Reprogramar reunión
  async reprogramarReunion(id, nuevaFecha, nuevoHorario) {
    try {
      return await this.updateReunion(id, {
        fecha: nuevaFecha,
        horario: nuevoHorario,
        estado: 'PROGRAMADA',
        fechaReprogramacion: new Date().toISOString()
      });
    } catch (error) {
      throw new Error('Error al reprogramar reunión: ' + error.message);
    }
  }

  // Obtener reuniones del día
  async getReunionesHoy() {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await apiService.get(`/reuniones?fecha=${today}`);
    } catch (error) {
      throw new Error('Error al obtener reuniones de hoy: ' + error.message);
    }
  }

  // Obtener reuniones de la semana
  async getReunionesSemana() {
    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const fechaInicio = startOfWeek.toISOString().split('T')[0];
      const fechaFin = endOfWeek.toISOString().split('T')[0];
      
      return await apiService.get(`/reuniones?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`);
    } catch (error) {
      throw new Error('Error al obtener reuniones de la semana: ' + error.message);
    }
  }

  // Reporte de reuniones
  async getReunionesReport(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/reuniones?${queryParams}` : '/reportes/reuniones';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de reuniones: ' + error.message);
    }
  }
}

export default new MeetingService();