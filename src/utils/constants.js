// Constantes para estados de pedidos (coinciden con el backend Spring Boot)
export const ORDER_STATUS = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  ENTREGADO: 'ENTREGADO',
  CANCELADO: 'CANCELADO',
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PENDIENTE]: 'Pendiente',
  [ORDER_STATUS.EN_PROCESO]: 'En Proceso',
  [ORDER_STATUS.ENTREGADO]: 'Entregado',
  [ORDER_STATUS.CANCELADO]: 'Cancelado',
};

export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PENDIENTE]: '#ff9800',
  [ORDER_STATUS.EN_PROCESO]: '#2196f3',
  [ORDER_STATUS.ENTREGADO]: '#4caf50',
  [ORDER_STATUS.CANCELADO]: '#f44336',
};

// Constantes para estados de reuniones (coinciden con el backend Spring Boot)
export const MEETING_STATUS = {
  PROGRAMADA: 'PROGRAMADA',
  EN_PROCESO: 'EN_PROCESO',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
};

export const MEETING_STATUS_LABELS = {
  [MEETING_STATUS.PROGRAMADA]: 'Programada',
  [MEETING_STATUS.EN_PROCESO]: 'En Proceso',
  [MEETING_STATUS.COMPLETADA]: 'Completada',
  [MEETING_STATUS.CANCELADA]: 'Cancelada',
};

export const MEETING_STATUS_COLORS = {
  [MEETING_STATUS.PROGRAMADA]: '#ff9800',
  [MEETING_STATUS.EN_PROCESO]: '#2196f3',
  [MEETING_STATUS.COMPLETADA]: '#4caf50',
  [MEETING_STATUS.CANCELADA]: '#f44336',
};

// Constantes para roles de usuarios (coinciden con el backend Spring Boot)
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  VENDEDOR: 'VENDEDOR',
  CLIENTE: 'CLIENTE',
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrador',
  [USER_ROLES.VENDEDOR]: 'Vendedor',
  [USER_ROLES.CLIENTE]: 'Cliente',
};

// Constantes para tipos de negocio
export const BUSINESS_TYPES = {
  RETAIL: 'retail',
  WHOLESALE: 'wholesale',
  SERVICES: 'services',
  MANUFACTURING: 'manufacturing',
  RESTAURANT: 'restaurant',
  OTHER: 'other',
};

export const BUSINESS_TYPE_LABELS = {
  [BUSINESS_TYPES.RETAIL]: 'Venta al Menudeo',
  [BUSINESS_TYPES.WHOLESALE]: 'Venta al Mayoreo',
  [BUSINESS_TYPES.SERVICES]: 'Servicios',
  [BUSINESS_TYPES.MANUFACTURING]: 'Manufactura',
  [BUSINESS_TYPES.RESTAURANT]: 'Restaurante',
  [BUSINESS_TYPES.OTHER]: 'Otro',
};

// Constantes para tipos de productos
export const PRODUCT_CATEGORIES = {
  ELECTRONICS: 'electronics',
  CLOTHING: 'clothing',
  FOOD: 'food',
  BOOKS: 'books',
  HOME: 'home',
  SPORTS: 'sports',
  AUTOMOTIVE: 'automotive',
  OTHER: 'other',
};

export const PRODUCT_CATEGORY_LABELS = {
  [PRODUCT_CATEGORIES.ELECTRONICS]: 'Electrónicos',
  [PRODUCT_CATEGORIES.CLOTHING]: 'Ropa',
  [PRODUCT_CATEGORIES.FOOD]: 'Alimentos',
  [PRODUCT_CATEGORIES.BOOKS]: 'Libros',
  [PRODUCT_CATEGORIES.HOME]: 'Hogar',
  [PRODUCT_CATEGORIES.SPORTS]: 'Deportes',
  [PRODUCT_CATEGORIES.AUTOMOTIVE]: 'Automotriz',
  [PRODUCT_CATEGORIES.OTHER]: 'Otro',
};

// Constantes para métodos de pago
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  CHECK: 'check',
  PAYPAL: 'paypal',
  OTHER: 'other',
};

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Efectivo',
  [PAYMENT_METHODS.CARD]: 'Tarjeta',
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia',
  [PAYMENT_METHODS.CHECK]: 'Cheque',
  [PAYMENT_METHODS.PAYPAL]: 'PayPal',
  [PAYMENT_METHODS.OTHER]: 'Otro',
};

// Constantes para tipos de movimientos de inventario
export const INVENTORY_MOVEMENT_TYPES = {
  ENTRY: 'entry',
  EXIT: 'exit',
  ADJUSTMENT: 'adjustment',
  RETURN: 'return',
  DAMAGE: 'damage',
  TRANSFER: 'transfer',
};

export const INVENTORY_MOVEMENT_LABELS = {
  [INVENTORY_MOVEMENT_TYPES.ENTRY]: 'Entrada',
  [INVENTORY_MOVEMENT_TYPES.EXIT]: 'Salida',
  [INVENTORY_MOVEMENT_TYPES.ADJUSTMENT]: 'Ajuste',
  [INVENTORY_MOVEMENT_TYPES.RETURN]: 'Devolución',
  [INVENTORY_MOVEMENT_TYPES.DAMAGE]: 'Daño',
  [INVENTORY_MOVEMENT_TYPES.TRANSFER]: 'Transferencia',
};

// Constantes para prioridades
export const PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const PRIORITY_LABELS = {
  [PRIORITIES.LOW]: 'Baja',
  [PRIORITIES.MEDIUM]: 'Media',
  [PRIORITIES.HIGH]: 'Alta',
  [PRIORITIES.URGENT]: 'Urgente',
};

export const PRIORITY_COLORS = {
  [PRIORITIES.LOW]: '#4caf50',
  [PRIORITIES.MEDIUM]: '#ff9800',
  [PRIORITIES.HIGH]: '#ff5722',
  [PRIORITIES.URGENT]: '#f44336',
};

// Configuración de paginación
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
};

// Configuración de formatos
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss',
};

// Configuración de la aplicación
export const APP_CONFIG = {
  NAME: 'TransPort - Sistema de Gestión Multi-Giro',
  SHORT_NAME: 'TransPort',
  VERSION: '1.0.0',
  COMPANY: 'TransPort Guatemala',
  CONTACT_EMAIL: 'contacto@transport.gt',
  SUPPORT_EMAIL: 'soporte@transport.gt',
  PHONE: '+502 2334-5678',
};

// URLs de redes sociales
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/miempresa',
  TWITTER: 'https://twitter.com/miempresa',
  INSTAGRAM: 'https://instagram.com/miempresa',
  LINKEDIN: 'https://linkedin.com/company/miempresa',
  YOUTUBE: 'https://youtube.com/miempresa',
};

// Configuración de archivos
export const FILE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  ALLOWED_DOCUMENTS: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
  ALLOWED_ALL: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'Este campo es obligatorio',
  INVALID_EMAIL: 'El email no tiene un formato válido',
  INVALID_PHONE: 'El teléfono no tiene un formato válido',
  PASSWORD_TOO_SHORT: 'La contraseña debe tener al menos 6 caracteres',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  INVALID_DATE: 'La fecha no es válida',
  INVALID_NUMBER: 'El valor debe ser un número válido',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
  NETWORK_ERROR: 'Error de conexión. Por favor, intenta de nuevo.',
  UNKNOWN_ERROR: 'Ha ocurrido un error inesperado',
};