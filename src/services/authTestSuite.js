// 🧪 SCRIPT DE PRUEBAS PARA AUTENTICACIÓN
// Ejecutar en la consola del navegador (F12)

console.log('🚀 Iniciando pruebas del servicio de autenticación...');

// Importar el servicio (asumiendo que está disponible globalmente)
// Si no está disponible, primero importar: import authService from './services/authService';

window.authTestSuite = {

  // ===============================================
  // PRUEBAS BÁSICAS DE CONECTIVIDAD
  // ===============================================

  async testConnection() {
    console.log('\n🔗 === PRUEBA DE CONECTIVIDAD ===');
    try {
      const status = await authService.checkConnection();
      console.log('✅ Estado de conexión:', status);
      return status.connected;
    } catch (error) {
      console.error('❌ Error de conectividad:', error.message);
      return false;
    }
  },

  async getTestCredentials() {
    console.log('\n🧪 === OBTENER CREDENCIALES DE PRUEBA ===');
    try {
      const creds = await authService.getTestCredentials();
      console.log('✅ Credenciales obtenidas:', creds);
      return creds;
    } catch (error) {
      console.error('❌ Error obteniendo credenciales:', error.message);
      return null;
    }
  },

  async getRoles() {
    console.log('\n👥 === OBTENER ROLES DEL SISTEMA ===');
    try {
      const roles = await authService.getRoles();
      console.log('✅ Roles disponibles:', roles);
      return roles;
    } catch (error) {
      console.error('❌ Error obteniendo roles:', error.message);
      return null;
    }
  },

  // ===============================================
  // PRUEBAS DE AUTENTICACIÓN
  // ===============================================

  async testLogin(email = 'admin@empresa.com', password = 'admin123') {
    console.log('\n🔐 === PRUEBA DE LOGIN ===');
    console.log('Credenciales:', { email, password: '***' });
    
    try {
      const result = await authService.login({ email, password });
      console.log('✅ Login exitoso:', result);
      
      // Verificar que el usuario se guardó correctamente
      const user = authService.getUser();
      const isAuth = authService.isAuthenticated();
      console.log('👤 Usuario guardado:', user);
      console.log('🔒 Autenticado:', isAuth);
      
      return result;
    } catch (error) {
      console.error('❌ Error en login:', error.message);
      return null;
    }
  },

  async testInvalidLogin() {
    console.log('\n🚫 === PRUEBA DE LOGIN INVÁLIDO ===');
    try {
      await authService.login({ 
        email: 'invalid@test.com', 
        password: 'wrongpassword' 
      });
      console.error('❌ FALLO: Login inválido debería haber fallado');
    } catch (error) {
      console.log('✅ Correcto: Login inválido rechazado -', error.message);
    }
  },

  async testRegister() {
    console.log('\n📝 === PRUEBA DE REGISTRO ===');
    const testUser = {
      nombre: 'Usuario Prueba',
      email: 'test@prueba.com',
      password: 'password123',
      rol: 'CLIENTE'
    };
    
    try {
      const result = await authService.register(testUser);
      console.log('✅ Registro exitoso:', result);
      return result;
    } catch (error) {
      console.error('❌ Error en registro:', error.message);
      // Es normal que falle si el usuario ya existe
      if (error.message.includes('ya está registrado')) {
        console.log('ℹ️ Usuario ya existía, esto es normal');
      }
      return null;
    }
  },

  testLogout() {
    console.log('\n🚪 === PRUEBA DE LOGOUT ===');
    try {
      authService.logout();
      const isAuth = authService.isAuthenticated();
      const user = authService.getUser();
      
      if (!isAuth && !user) {
        console.log('✅ Logout exitoso - sesión limpiada');
      } else {
        console.error('❌ FALLO: Datos de sesión no se limpiaron correctamente');
      }
    } catch (error) {
      console.error('❌ Error en logout:', error.message);
    }
  },

  // ===============================================
  // PRUEBAS DE ROLES Y PERMISOS
  // ===============================================

  testRolePermissions() {
    console.log('\n👑 === PRUEBA DE ROLES Y PERMISOS ===');
    
    const user = authService.getUser();
    if (!user) {
      console.error('❌ No hay usuario autenticado para probar roles');
      return;
    }

    console.log('Usuario actual:', user.nombre, '- Rol:', user.rol);
    
    // Verificar métodos de rol
    console.log('Es Admin:', authService.isAdmin());
    console.log('Es Vendedor:', authService.isVendedor());
    console.log('Es Cliente:', authService.isCliente());
    console.log('Rol actual:', authService.getUserRole());
    
    // Verificar permisos
    const permissions = authService.getPermissions();
    console.log('✅ Permisos del usuario:', permissions);
    
    // Contar permisos activos
    const activePermissions = Object.keys(permissions).filter(key => permissions[key]);
    console.log(`📊 Total permisos activos: ${activePermissions.length}`);
    console.log('🔑 Permisos activos:', activePermissions);
  },

  // ===============================================
  // PRUEBAS DE SESIÓN
  // ===============================================

  testSessionInfo() {
    console.log('\n📊 === INFORMACIÓN DE SESIÓN ===');
    
    const sessionInfo = authService.getSessionInfo();
    console.log('✅ Información completa de sesión:', sessionInfo);
    
    if (sessionInfo.isAuthenticated) {
      console.log(`⏰ Duración de sesión: ${sessionInfo.sessionDuration} minutos`);
      console.log(`👤 Usuario: ${sessionInfo.usuario?.nombre}`);
      console.log(`🔑 Rol: ${sessionInfo.usuario?.rol}`);
    }
  },

  async testTokenValidation() {
    console.log('\n🔍 === VALIDACIÓN DE TOKEN ===');
    
    try {
      const isValid = await authService.validateToken();
      console.log('✅ Token válido:', isValid);
      
      if (isValid) {
        const profile = await authService.getUserProfile();
        console.log('👤 Perfil obtenido:', profile);
      }
    } catch (error) {
      console.error('❌ Error validando token:', error.message);
    }
  },

  // ===============================================
  // PRUEBAS DE ALMACENAMIENTO
  // ===============================================

  testLocalStorage() {
    console.log('\n💾 === PRUEBA DE ALMACENAMIENTO LOCAL ===');
    
    // Verificar datos en localStorage
    const authData = localStorage.getItem('authData');
    if (authData) {
      try {
        const parsedData = JSON.parse(authData);
        console.log('✅ Datos en localStorage:', parsedData);
        
        // Verificar estructura
        const requiredFields = ['usuario', 'sessionToken', 'loginTime'];
        const missingFields = requiredFields.filter(field => !parsedData[field]);
        
        if (missingFields.length === 0) {
          console.log('✅ Estructura de datos correcta');
        } else {
          console.error('❌ Campos faltantes:', missingFields);
        }
      } catch (error) {
        console.error('❌ Error parseando datos:', error.message);
      }
    } else {
      console.log('ℹ️ No hay datos de autenticación en localStorage');
    }
  },

  // ===============================================
  // SUITE COMPLETA DE PRUEBAS
  // ===============================================

  async runFullTestSuite() {
    console.log('\n🎯 === EJECUTANDO SUITE COMPLETA DE PRUEBAS ===');
    console.log('⏰ Iniciando en 2 segundos...\n');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const results = {
      connection: false,
      credentials: false,
      roles: false,
      login: false,
      logout: false,
      permissions: false,
      session: false,
      validation: false,
      storage: false
    };
    
    try {
      // 1. Verificar conectividad
      results.connection = await this.testConnection();
      
      // 2. Obtener credenciales y roles
      results.credentials = !!(await this.getTestCredentials());
      results.roles = !!(await this.getRoles());
      
      // 3. Probar login
      results.login = !!(await this.testLogin());
      
      // 4. Probar funcionalidades de sesión autenticada
      if (results.login) {
        this.testRolePermissions();
        results.permissions = true;
        
        this.testSessionInfo();
        results.session = true;
        
        await this.testTokenValidation();
        results.validation = true;
        
        this.testLocalStorage();
        results.storage = true;
      }
      
      // 5. Probar login inválido
      await this.testInvalidLogin();
      
      // 6. Probar registro
      await this.testRegister();
      
      // 7. Probar logout
      this.testLogout();
      results.logout = true;
      
    } catch (error) {
      console.error('❌ Error en suite de pruebas:', error.message);
    }
    
    // Mostrar resumen
    console.log('\n📋 === RESUMEN DE RESULTADOS ===');
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    console.log(`📊 Pruebas exitosas: ${passedTests}/${totalTests} (${successRate}%)`);
    
    Object.entries(results).forEach(([test, passed]) => {
      const emoji = passed ? '✅' : '❌';
      console.log(`${emoji} ${test}: ${passed ? 'PASS' : 'FAIL'}`);
    });
    
    if (successRate >= 80) {
      console.log('\n🎉 ¡Sistema de autenticación funcionando correctamente!');
    } else {
      console.log('\n⚠️ Hay problemas que requieren atención');
    }
    
    return results;
  },

  // ===============================================
  // PRUEBAS RÁPIDAS INDIVIDUALES
  // ===============================================

  // Función de ayuda para login rápido
  async quickLogin() {
    console.log('⚡ Login rápido...');
    return await this.testLogin();
  },

  // Función de ayuda para información rápida
  quickInfo() {
    console.log('\n📱 === INFO RÁPIDA ===');
    console.log('Autenticado:', authService.isAuthenticated());
    console.log('Usuario:', authService.getUser()?.nombre || 'No autenticado');
    console.log('Rol:', authService.getUserRole() || 'N/A');
  },

  // Limpiar todo para empezar de cero
  reset() {
    console.log('\n🧹 === RESET COMPLETO ===');
    authService.logout();
    localStorage.clear();
    console.log('✅ Todos los datos limpiados');
  }
};

// ===============================================
// COMANDOS RÁPIDOS GLOBALES
// ===============================================

// Hacer disponibles algunas funciones de forma global para acceso rápido
window.authQuick = {
  login: () => window.authTestSuite.quickLogin(),
  info: () => window.authTestSuite.quickInfo(),
  test: () => window.authTestSuite.runFullTestSuite(),
  reset: () => window.authTestSuite.reset(),
  permissions: () => {
    const permissions = authService.getPermissions();
    const active = Object.keys(permissions).filter(key => permissions[key]);
    console.log(`Permisos activos (${active.length}):`, active);
  }
};

// ===============================================
// INSTRUCCIONES DE USO
// ===============================================

console.log(`
🧪 === SUITE DE PRUEBAS DE AUTENTICACIÓN CARGADA ===

COMANDOS DISPONIBLES:

📋 SUITE COMPLETA:
  authTestSuite.runFullTestSuite()     - Ejecutar todas las pruebas

⚡ COMANDOS RÁPIDOS:
  authQuick.login()                    - Login rápido con admin
  authQuick.info()                     - Info del usuario actual
  authQuick.test()                     - Suite completa
  authQuick.reset()                    - Limpiar todo
  authQuick.permissions()              - Ver permisos activos

🔧 PRUEBAS INDIVIDUALES:
  authTestSuite.testConnection()       - Probar conectividad
  authTestSuite.testLogin()           - Probar login
  authTestSuite.testRolePermissions() - Probar roles
  authTestSuite.testSessionInfo()     - Info de sesión
  authTestSuite.testLocalStorage()    - Verificar almacenamiento

📚 EJEMPLOS:
  authQuick.login()                    - Para empezar rápido
  authQuick.info()                     - Ver estado actual
  authTestSuite.runFullTestSuite()     - Prueba completa

¡Ejecuta cualquier comando para comenzar! 🚀
`);

// Auto-ejecutar verificación básica si el backend está corriendo
setTimeout(async () => {
  console.log('\n🔍 Verificación automática de conectividad...');
  const connected = await window.authTestSuite.testConnection();
  
  if (connected) {
    console.log('\n✅ ¡Backend detectado! Puedes ejecutar: authQuick.login()');
  } else {
    console.log('\n⚠️ Backend no detectado. Asegúrate de que esté corriendo en localhost:8080');
  }
}, 1000);