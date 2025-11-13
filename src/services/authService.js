import apiService from './api';
import alertService from './alertService';

class AuthService {
  constructor() {
    // Configurar interceptores para manejo automático de errores de autenticación
    this.setupInterceptors();
  }

  /**
   * Iniciar sesión de usuario
   * @param {Object} credentials - Credenciales de login
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object>} Respuesta de autenticación con datos del usuario
   */
  async login(credentials) {
    try {
      const response = await apiService.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response && response.usuarioId) {
        // Crear estructura de autenticación basada en la respuesta del API
        const authData = {
          usuario: {
            id: response.usuarioId,
            nombre: response.nombre,
            email: response.email,
            rol: response.rol,
            activo: response.activo
          },
          // Generar token de sesión local (ya que el backend no utiliza tokens)
          sessionToken: this.generateSessionToken(),
          loginTime: new Date().toISOString()
        };
        
        // Guardar datos de autenticación
        this.setAuthData(authData);
        
        return {
          success: true,
          message: response.mensaje || 'Login exitoso',
          usuario: authData.usuario,
          token: authData.sessionToken
        };
      } else {
        const errorMsg = 'Respuesta de autenticación inválida';
        alertService.error('Error de Autenticación', errorMsg);
        throw new Error(errorMsg);
      }
      
    } catch (error) {
      // Manejar diferentes tipos de errores con SweetAlert2
      if (error.response?.status === 401) {
        const errorMsg = 'Credenciales inválidas. Verifique su email y contraseña.';
        alertService.error('Credenciales Inválidas', errorMsg);
        throw new Error(errorMsg);
      } else if (error.response?.status === 404) {
        const errorMsg = 'Usuario no encontrado.';
        alertService.error('Usuario No Encontrado', errorMsg);
        throw new Error(errorMsg);
      } else if (error.response?.status >= 500) {
        const errorMsg = 'Error del servidor. Intente nuevamente más tarde.';
        alertService.error('Error del Servidor', errorMsg);
        throw new Error(errorMsg);
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error de autenticación';
        alertService.error('Error de Autenticación', errorMsg);
        throw new Error(errorMsg);
      }
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData - Datos del usuario a registrar
   * @param {string} userData.nombre - Nombre completo
   * @param {string} userData.email - Email
   * @param {string} userData.password - Contraseña
   * @param {string} userData.rol - Rol del usuario
   * @returns {Promise<Object>} Respuesta del registro
   */
  async register(userData) {
    try {
      const response = await apiService.post('/auth/register', {
        nombre: userData.nombre,
        email: userData.email,
        password: userData.password,
        rol: userData.rol || 'CLIENTE' // Rol por defecto
      });
      
      return response;
    } catch (error) {
      // Manejar diferentes tipos de errores con SweetAlert2
      if (error.response?.status === 400) {
        const errorMsg = error.response.data.message || 'Datos inválidos para el registro';
        alertService.error('Datos Inválidos', errorMsg);
        throw new Error(errorMsg);
      } else if (error.response?.status === 409) {
        const errorMsg = 'El email ya está registrado';
        alertService.error('Email Duplicado', errorMsg);
        throw new Error(errorMsg);
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Error en el registro';
        alertService.error('Error de Registro', errorMsg);
        throw new Error(errorMsg);
      }
    }
  }

  /**
   * Obtener roles disponibles en el sistema
   * @returns {Promise<Array>} Lista de roles disponibles
   */
  async getRoles() {
    try {
      const response = await apiService.get('/auth/roles');
      return response;
    } catch (error) {
      const errorMsg = 'Error al obtener roles del sistema';
      alertService.error('Error de Sistema', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Obtener credenciales de prueba para desarrollo
   * @returns {Promise<Object>} Credenciales de prueba
   */
  async getTestCredentials() {
    try {
      const response = await apiService.get('/auth/test-credentials');
      return response;
    } catch (error) {
      const errorMsg = 'Error al obtener credenciales de prueba';
      alertService.warning('Desarrollo', errorMsg);
      throw new Error(errorMsg);
    }
  }

  /**
   * Cerrar sesión del usuario
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Limpiar datos locales (no hay endpoint de logout en el backend)
      this.clearAuthData();
    } catch (error) {
      // Asegurar que los datos se limpien incluso si hay error
      this.clearAuthData();
      alertService.toastWarning('Error al cerrar sesión, pero se limpió la sesión local');
    }
  }

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} True si está autenticado
   */
  isAuthenticated() {
    const authData = this.getAuthData();
    
    if (!authData || !authData.usuario || !authData.sessionToken) {
      return false;
    }

    // Verificar si la sesión no ha expirado (opcional - 24 horas)
    if (authData.loginTime) {
      const loginDate = new Date(authData.loginTime);
      const now = new Date();
      const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  /**
   * Obtener token de sesión
   * @returns {string|null} Token de sesión o null
   */
  getToken() {
    const authData = this.getAuthData();
    return authData?.sessionToken || null;
  }

  /**
   * Obtener datos del usuario autenticado
   * @returns {Object|null} Datos del usuario o null
   */
  getUser() {
    const authData = this.getAuthData();
    return authData?.usuario || null;
  }

  /**
   * Obtener perfil completo del usuario actual
   * @returns {Promise<Object>} Datos del perfil del usuario
   */
  async getUserProfile() {
    try {
      const user = this.getUser();
      if (user) {
        return {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          activo: user.activo,
          isAuthenticated: true
        };
      } else {
        const errorMsg = 'Usuario no encontrado en sesión';
        alertService.error('Sesión Expirada', 'Por favor, inicie sesión nuevamente');
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error);
      throw new Error('Error al obtener perfil de usuario: ' + error.message);
    }
  }

  /**
   * Validar token de sesión actual
   * @returns {Promise<boolean>} True si el token es válido
   */
  async validateToken() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      const user = this.getUser();
      const isValid = !!(user && user.id && user.email && user.activo);
      
      if (!isValid) {
        this.clearAuthData();
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Error validando token:', error);
      this.clearAuthData();
      return false;
    }
  }

  // ===============================================
  // MÉTODOS DE GESTIÓN DE ROLES Y PERMISOS
  // ===============================================

  /**
   * Obtener rol del usuario actual
   * @returns {string|null} Rol del usuario o null
   */
  getUserRole() {
    const user = this.getUser();
    return user ? user.rol : null;
  }

  /**
   * Verificar si el usuario tiene un rol específico
   * @param {string} role - Rol a verificar
   * @returns {boolean} True si tiene el rol
   */
  hasRole(role) {
    return this.getUserRole() === role;
  }

  /**
   * Verificar si el usuario tiene permisos de administrador
   * @returns {boolean} True si es admin
   */
  isAdmin() {
    return this.hasRole('ADMIN');
  }

  /**
   * Verificar si el usuario es vendedor
   * @returns {boolean} True si es vendedor
   */
  isVendedor() {
    return this.hasRole('VENDEDOR');
  }

  /**
   * Verificar si el usuario es cliente
   * @returns {boolean} True si es cliente
   */
  isCliente() {
    return this.hasRole('CLIENTE');
  }

  /**
   * Obtener permisos basados en el rol
   * @returns {Object} Objeto con permisos
   */
  getPermissions() {
    const role = this.getUserRole();
    
    const permissions = {
      canViewDashboard: false,
      canManageUsers: false,
      canManageClients: false,
      canManageVendors: false,
      canManageProducts: false,
      canManageOrders: false,
      canManageMeetings: false,
      canViewReports: false,
      canCreateOrders: false,
      canScheduleMeetings: false
    };

    switch (role) {
      case 'ADMIN':
        // Administrador tiene todos los permisos
        Object.keys(permissions).forEach(key => {
          permissions[key] = true;
        });
        break;
        
      case 'VENDEDOR':
        permissions.canViewDashboard = true;
        permissions.canViewReports = true;
        permissions.canManageClients = true;
        permissions.canManageOrders = true;
        permissions.canManageMeetings = true;
        permissions.canCreateOrders = true;
        permissions.canScheduleMeetings = true;
        break;
        
      case 'CLIENTE':
        permissions.canViewDashboard = true;
        permissions.canCreateOrders = true;
        permissions.canScheduleMeetings = true;
        break;
    }

    return permissions;
  }

  // ===============================================
  // MÉTODOS AUXILIARES Y UTILIDADES
  // ===============================================

  /**
   * Generar token de sesión local
   * @returns {string} Token único para la sesión
   */
  generateSessionToken() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `session_${timestamp}_${random}`;
  }

  /**
   * Configurar interceptores para manejo automático de errores
   */
  setupInterceptors() {
    // Este método se puede expandir para configurar interceptores de axios
  }

  /**
   * Guardar datos de autenticación en localStorage
   * @param {Object} authData - Datos de autenticación
   */
  setAuthData(authData) {
    try {
      localStorage.setItem('authData', JSON.stringify(authData));
    } catch (error) {
      console.error('❌ Error guardando datos de autenticación:', error);
      throw new Error('Error al guardar datos de sesión');
    }
  }

  /**
   * Obtener datos de autenticación del localStorage
   * @returns {Object|null} Datos de autenticación o null
   */
  getAuthData() {
    try {
      const authDataStr = localStorage.getItem('authData');
      return authDataStr ? JSON.parse(authDataStr) : null;
    } catch (error) {
      console.error('❌ Error parsing auth data:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Limpiar todos los datos de autenticación
   */
  clearAuthData() {
    try {
      localStorage.removeItem('authData');
      // Mantener compatibilidad con versión anterior
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('❌ Error limpiando datos de autenticación:', error);
    }
  }

  /**
   * Obtener información de la sesión actual
   * @returns {Object} Información de la sesión
   */
  getSessionInfo() {
    const authData = this.getAuthData();
    
    if (!authData) {
      return {
        isAuthenticated: false,
        sessionActive: false
      };
    }

    const loginDate = authData.loginTime ? new Date(authData.loginTime) : null;
    const now = new Date();
    const sessionDuration = loginDate ? (now - loginDate) / (1000 * 60) : 0; // en minutos

    return {
      isAuthenticated: this.isAuthenticated(),
      sessionActive: true,
      usuario: authData.usuario,
      loginTime: authData.loginTime,
      sessionDuration: Math.floor(sessionDuration),
      permissions: this.getPermissions()
    };
  }

  /**
   * Verificar conectividad con el backend
   * @returns {Promise<Object>} Estado de la conexión
   */
  async checkConnection() {
    try {
      // Intentar obtener credenciales de prueba como health check
      const response = await apiService.get('/auth/test-credentials');
      
      return {
        connected: true,
        status: 'online',
        message: 'Conexión establecida correctamente',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Error de conectividad:', error);
      
      return {
        connected: false,
        status: 'offline',
        message: error.message || 'No se pudo conectar con el servidor',
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Exportar instancia única del servicio
export default new AuthService();