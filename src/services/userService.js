import apiService from './api';

class UserService {
  // Autenticación (adaptada para Spring Boot)
  async login(credentials) {
    try {
      // Usar endpoint de usuarios para autenticación
      // En un escenario real, Spring Boot debería tener /api/auth/login
      // Por ahora, simularemos la autenticación con los usuarios existentes
      const response = await apiService.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.token && response.usuario) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.usuario));
        return response;
      } else {
        throw new Error('Respuesta de autenticación inválida');
      }
    } catch (error) {
      // Si no existe el endpoint de auth, usar mock
      
      // Mock para desarrollo - removir cuando tengas el endpoint real
      const mockResponse = {
        token: 'mock-token-' + Date.now(),
        usuario: {
          id: 1,
          nombre: 'Usuario Demo',
          email: credentials.email,
          role: 'ADMIN',
          activo: true
        }
      };
      
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.usuario));
      return mockResponse;
    }
  }

  async register(userData) {
    try {
      // Crear nuevo usuario usando el endpoint de usuarios
      const response = await this.createUser(userData);
      return response;
    } catch (error) {
      throw new Error('Error en el registro: ' + error.message);
    }
  }

  async logout() {
    try {
      // Intentar logout en el servidor si existe el endpoint
      try {
        await apiService.post('/auth/logout');
      } catch (error) {
        // Si no existe el endpoint, solo limpiar local storage
      }
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  async getUserProfile() {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.id) {
        return await this.getUserById(user.id);
      } else {
        throw new Error('Usuario no encontrado en sesión');
      }
    } catch (error) {
      throw new Error('Error al obtener perfil de usuario: ' + error.message);
    }
  }

  // Gestión de usuarios (adaptada para endpoints /api/usuarios)
  async getUsers(filters = {}) {
    try {
      return await apiService.get('/usuarios');
    } catch (error) {
      throw new Error('Error al obtener usuarios: ' + error.message);
    }
  }

  async getUserById(id) {
    try {
      return await apiService.get(`/usuarios/${id}`);
    } catch (error) {
      throw new Error('Error al obtener usuario: ' + error.message);
    }
  }

  // Obtener vendedores
  async getVendedores() {
    try {
      return await apiService.get('/usuarios/vendedores');
    } catch (error) {
      throw new Error('Error al obtener vendedores: ' + error.message);
    }
  }

  // Obtener clientes
  async getClientes() {
    try {
      return await apiService.get('/usuarios/clientes');
    } catch (error) {
      throw new Error('Error al obtener clientes: ' + error.message);
    }
  }

  async createUser(userData) {
    try {
      return await apiService.post('/usuarios', userData);
    } catch (error) {
      throw new Error('Error al crear usuario: ' + error.message);
    }
  }

  async updateUser(id, userData) {
    try {
      return await apiService.put(`/usuarios/${id}`, userData);
    } catch (error) {
      throw new Error('Error al actualizar usuario: ' + error.message);
    }
  }

  // Activar/desactivar usuario (método específico de tu API)
  async toggleUserStatus(id) {
    try {
      return await apiService.put(`/usuarios/${id}/toggle-activo`);
    } catch (error) {
      throw new Error('Error al cambiar estado del usuario: ' + error.message);
    }
  }

  async deleteUser(id) {
    try {
      return await apiService.delete(`/usuarios/${id}`);
    } catch (error) {
      throw new Error('Error al eliminar usuario: ' + error.message);
    }
  }

  // Perfil de usuario
  async getUserProfile() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      throw new Error('Error al obtener perfil: ' + error.message);
    }
  }

  async updateProfile(profileData) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return await apiService.put(`/usuarios/${user.id}`, profileData);
    } catch (error) {
      throw new Error('Error al actualizar perfil: ' + error.message);
    }
  }
}

export default new UserService();
