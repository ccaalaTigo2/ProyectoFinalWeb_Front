// Configuración base para las llamadas a la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;
        
        try {
          const contentType = response.headers.get('content-type');
          const responseText = await response.text();
          
          if (contentType && contentType.includes('application/json') && responseText) {
            try {
              errorDetails = JSON.parse(responseText);
              
              if (errorDetails.message) {
                errorMessage = errorDetails.message;
              } else if (errorDetails.error) {
                errorMessage = errorDetails.error;
              } else if (errorDetails.detail) {
                errorMessage = errorDetails.detail;
              } else if (errorDetails.errors && Array.isArray(errorDetails.errors)) {
                errorMessage = errorDetails.errors.join(', ');
              } else if (typeof errorDetails === 'string') {
                errorMessage = errorDetails;
              }
            } catch (jsonError) {
              errorMessage = responseText || errorMessage;
            }
          } else if (responseText) {
            errorMessage = responseText;
          }
        } catch (parseError) {
          // Error reading response body
        }
        
        const error = new Error(errorMessage);
        error.details = errorDetails;
        error.status = response.status;
        throw error;
      }
      
      // Verificar si hay contenido antes de parsear JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      } else {
        return await response.text() || { success: true };
      }
    } catch (error) {
      throw error;
    }
  }

  // Métodos HTTP básicos
  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  }
}

export default new ApiService();