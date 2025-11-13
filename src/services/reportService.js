import apiService from './api';

class ReportService {
  // Reporte de ventas
  async getReporteVentas(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/ventas?${queryParams}` : '/reportes/ventas';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de ventas: ' + error.message);
    }
  }

  // Reporte de inventario
  async getReporteInventario(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/inventario?${queryParams}` : '/reportes/inventario';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de inventario: ' + error.message);
    }
  }

  // Reporte de pedidos
  async getReportePedidos(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/pedidos?${queryParams}` : '/reportes/pedidos';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de pedidos: ' + error.message);
    }
  }

  // Reporte de reuniones
  async getReporteReuniones(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/reuniones?${queryParams}` : '/reportes/reuniones';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de reuniones: ' + error.message);
    }
  }

  // Reporte de usuarios/vendedores
  async getReporteUsuarios(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/usuarios?${queryParams}` : '/reportes/usuarios';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de usuarios: ' + error.message);
    }
  }

  // Reporte de clientes
  async getReporteClientes(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/clientes?${queryParams}` : '/reportes/clientes';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte de clientes: ' + error.message);
    }
  }

  // Reporte consolidado/general
  async getReporteGeneral(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = queryParams ? `/reportes/general?${queryParams}` : '/reportes/general';
      return await apiService.get(endpoint);
    } catch (error) {
      throw new Error('Error al obtener reporte general: ' + error.message);
    }
  }

  // Métodos de conveniencia para tipos específicos de reportes

  // Reporte de ventas por período
  async getVentasPorPeriodo(fechaInicio, fechaFin) {
    try {
      return await this.getReporteVentas({
        fechaInicio,
        fechaFin
      });
    } catch (error) {
      throw new Error('Error al obtener ventas por período: ' + error.message);
    }
  }

  // Reporte de productos más vendidos
  async getProductosMasVendidos(limite = 10) {
    try {
      return await this.getReporteInventario({
        tipo: 'productos-mas-vendidos',
        limite
      });
    } catch (error) {
      throw new Error('Error al obtener productos más vendidos: ' + error.message);
    }
  }

  // Reporte de productos con stock bajo
  async getProductosStockBajo() {
    try {
      return await this.getReporteInventario({
        tipo: 'stock-bajo'
      });
    } catch (error) {
      throw new Error('Error al obtener productos con stock bajo: ' + error.message);
    }
  }

  // Reporte de pedidos por estado
  async getPedidosPorEstado(estado) {
    try {
      return await this.getReportePedidos({
        estado
      });
    } catch (error) {
      throw new Error('Error al obtener pedidos por estado: ' + error.message);
    }
  }

  // Reporte de performance de vendedores
  async getPerformanceVendedores(fechaInicio, fechaFin) {
    try {
      return await this.getReporteUsuarios({
        tipo: 'performance-vendedores',
        fechaInicio,
        fechaFin
      });
    } catch (error) {
      throw new Error('Error al obtener performance de vendedores: ' + error.message);
    }
  }

  // Reporte de clientes más activos
  async getClientesMasActivos(limite = 10) {
    try {
      return await this.getReporteClientes({
        tipo: 'mas-activos',
        limite
      });
    } catch (error) {
      throw new Error('Error al obtener clientes más activos: ' + error.message);
    }
  }

  // Reporte de reuniones por vendedor
  async getReunionesPorVendedor(vendedorId, fechaInicio, fechaFin) {
    try {
      return await this.getReporteReuniones({
        vendedorId,
        fechaInicio,
        fechaFin
      });
    } catch (error) {
      throw new Error('Error al obtener reuniones por vendedor: ' + error.message);
    }
  }

  // Dashboard - métricas principales
  async getDashboardMetrics(filters = {}) {
    try {
      // Comentado temporalmente - endpoint no disponible
      /*
      return await this.getReporteGeneral({
        tipo: 'dashboard',
        ...filters
      });
      */
      
      // Datos mock para el dashboard
      return {
        metrics: {
          monthlySales: 125000,
          pendingOrders: 15,
          activeCustomers: 340,
          productsInStock: 87
        },
        recentOrders: [
          {
            id: 1,
            cliente: 'Juan Pérez',
            total: 1250.00,
            estado: 'Pendiente',
            fecha: new Date().toISOString()
          },
          {
            id: 2,
            cliente: 'María García',
            total: 850.00,
            estado: 'Completado',
            fecha: new Date(Date.now() - 24*60*60*1000).toISOString()
          }
        ],
        notifications: [
          {
            id: 1,
            message: 'Stock bajo en producto XYZ',
            type: 'warning',
            fecha: new Date().toISOString()
          },
          {
            id: 2,
            message: 'Nueva orden recibida',
            type: 'info',
            fecha: new Date(Date.now() - 2*60*60*1000).toISOString()
          }
        ],
        lowStockProducts: [
          {
            id: 1,
            nombre: 'Producto A',
            stock: 5,
            stockMinimo: 10
          },
          {
            id: 2,
            nombre: 'Producto B',
            stock: 2,
            stockMinimo: 15
          }
        ]
      };
    } catch (error) {
      throw new Error('Error al obtener métricas del dashboard: ' + error.message);
    }
  }

  // Exportación de reportes (si el backend lo soporta)
  async exportarReporte(tipoReporte, formato = 'xlsx', filters = {}) {
    try {
      const params = { 
        formato, 
        ...filters 
      };
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiService.get(`/reportes/${tipoReporte}/exportar?${queryParams}`, {
        headers: { 'Accept': 'application/octet-stream' }
      });
      return response;
    } catch (error) {
      throw new Error('Error al exportar reporte: ' + error.message);
    }
  }
}

export default new ReportService();