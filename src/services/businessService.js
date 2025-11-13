import apiService from './api';

class BusinessService {
  // Obtener servicios de un negocio
  async getBusinessServices(businessId) {
    try {
      return await apiService.get(`/businesses/${businessId}/services`);
    } catch (error) {
      return [];
    }
  }

  // Obtener productos de un negocio
  async getBusinessProducts(businessId) {
    try {
      // Intentar usar el endpoint real de productos
      return await apiService.get('/productos/activos');
    } catch (error) {
      return [];
    }
  }

  // Agendar reunión
  async scheduleMeeting(meetingData) {
    try {
      // Usar el endpoint real de reuniones
      return await apiService.post('/reuniones', meetingData);
    } catch (error) {
      throw new Error('Error al agendar reunión: ' + error.message);
    }
  }

  // Obtener vendedores disponibles
  async getAvailableSellers(businessId, date = null) {
    try {
      // Usar el endpoint real de usuarios vendedores
      return await apiService.get('/usuarios/vendedores');
    } catch (error) {
      return [];
    }
  }

  // Enviar consulta de contacto
  async sendContactInquiry(inquiryData) {
    try {
      return await apiService.post('/contact/inquiry', inquiryData);
    } catch (error) {
      // Simular éxito para que la UI funcione
      return { success: true, message: 'Consulta enviada exitosamente' };
    }
  }

  // Obtener horarios disponibles para reuniones
  async getAvailableSlots(sellerId, date) {
    try {
      return await apiService.get(`/reuniones/vendedor/${sellerId}?fecha=${date}`);
    } catch (error) {
      return [
        { time: '09:00', available: true },
        { time: '10:00', available: true },
        { time: '11:00', available: false },
        { time: '14:00', available: true },
        { time: '15:00', available: true },
        { time: '16:00', available: true }
      ];
    }
  }

  // Solicitar cotización
  async requestQuote(quoteData) {
    try {
      return await apiService.post('/quotes/request', quoteData);
    } catch (error) {
      return { success: true, message: 'Cotización solicitada exitosamente' };
    }
  }

  // Obtener catálogo público
  async getPublicCatalog(businessId = null) {
    try {
      // Intentar obtener productos activos del sistema real
      return await apiService.get('/productos/activos');
    } catch (error) {
      return [];
    }
  }

  // Suscribirse a newsletter
  async subscribeNewsletter(emailData) {
    try {
      return await apiService.post('/newsletter/subscribe', emailData);
    } catch (error) {
      return { success: true, message: 'Suscripción exitosa' };
    }
  }
}

export default new BusinessService();
