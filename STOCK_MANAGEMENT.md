# Gestión de Stock - Documentación

## Nuevas Funcionalidades Implementadas

Este documento describe las nuevas funcionalidades de gestión de stock implementadas en el sistema, que se integran con los endpoints de la API backend.

## API Endpoints Implementados

### 1. Actualizar Stock (Establecer valor específico)
- **Método:** `PUT /api/productos/{id}/stock?nuevoStock={cantidad}`
- **Servicio:** `inventoryService.updateProductStock(id, nuevoStock)`
- **Descripción:** Establece un valor específico de stock para un producto

### 2. Incrementar Stock (Agregar cantidad)
- **Método:** `PUT /api/productos/{id}/stock/incrementar?cantidad={cantidad}`
- **Servicio:** `inventoryService.incrementProductStock(id, cantidad)`
- **Descripción:** Incrementa el stock actual agregando la cantidad especificada

### 3. Decrementar Stock (Restar cantidad)
- **Método:** `PUT /api/productos/{id}/stock/decrementar?cantidad={cantidad}`
- **Servicio:** `inventoryService.decrementProductStock(id, cantidad)`
- **Descripción:** Decrementa el stock actual restando la cantidad especificada

## Componentes Nuevos/Modificados

### StockManagementDialog.jsx
Componente de diálogo para gestión avanzada de stock que incluye:

- **Tres tipos de operaciones:**
  - Establecer stock (valor específico)
  - Incrementar stock (agregar cantidad)
  - Decrementar stock (restar cantidad)

- **Características:**
  - Validación de cantidades
  - Preview del stock resultante
  - Manejo de errores específicos
  - Interfaz intuitiva con iconos y colores

- **Validaciones:**
  - Cantidad debe ser mayor a 0
  - Para decrementar: no puede ser mayor al stock actual
  - Muestra el cálculo del stock resultante

### Modificaciones en InventoryManagement.jsx
- Integración del nuevo `StockManagementDialog`
- Reemplazo de los botones de incrementar/decrementar por un botón único de gestión de stock
- Actualización automática de la lista al modificar stock

### Servicios Actualizados

#### inventoryService.js
Nuevos métodos agregados:

```javascript
// Establecer stock específico
async updateProductStock(id, nuevoStock)

// Incrementar stock
async incrementProductStock(id, cantidad)

// Decrementar stock  
async decrementProductStock(id, cantidad)
```

## Página de Pruebas

### StockAPITest.jsx
Página de pruebas que permite:
- Seleccionar productos existentes
- Probar las tres operaciones de stock
- Ver respuestas de la API en tiempo real
- Historial de operaciones realizadas

Para acceder a la página de pruebas, agregar la ruta en el router principal.

## Manejo de Errores

El sistema maneja los siguientes tipos de errores:

### Errores del Cliente (400 Bad Request)
- Stock insuficiente al decrementar
- Cantidades inválidas (negativas o no numéricas)

### Errores del Servidor (404 Not Found)
- Producto no encontrado

### Errores de Validación
- Campos requeridos vacíos
- Tipos de datos incorrectos

## Características de UX/UI

### StockManagementDialog
- **Diseño responsivo:** Se adapta a dispositivos móviles
- **Feedback visual:** Colores diferenciados por tipo de operación
- **Información contextual:** Muestra stock actual y resultante
- **Validación en tiempo real:** Errores mostrados inmediatamente
- **Animaciones:** Transiciones suaves entre estados

### Iconografía
- 📝 **Establecer:** Icono de edición (Edit)
- 📈 **Incrementar:** Icono de tendencia hacia arriba (TrendingUp) 
- 📉 **Decrementar:** Icono de tendencia hacia abajo (TrendingDown)
- 📦 **Gestionar:** Icono de inventario (Inventory2)

## Integraciones

### Alertas y Notificaciones
- Utiliza el sistema de alertas existente (`showSuccess`, `showError`)
- Mensajes específicos para cada tipo de operación
- Confirmaciones visuales de cambios exitosos

### Actualización en Tiempo Real
- Actualización automática de la lista de productos
- Sincronización inmediata del stock mostrado
- Persistencia de filtros y paginación

## Estilos CSS

### StockManagementDialog.css
Estilos específicos para:
- Botones de operación con hover effects
- Layout responsivo para móviles
- Animaciones de transición
- Estados de éxito/error/advertencia
- Grid de operaciones adaptativo

## Uso Recomendado

1. **Recepción de mercancía:** Usar "Incrementar Stock"
2. **Ventas/Salidas:** Usar "Decrementar Stock"  
3. **Inventarios físicos:** Usar "Establecer Stock"
4. **Correcciones:** Usar "Establecer Stock"

## Extensibilidad

El diseño permite agregar fácilmente:
- Nuevos tipos de operaciones
- Motivos/razones para los cambios
- Historial de movimientos
- Validaciones adicionales
- Integración con códigos de barras

## Testing

Utilizar `StockAPITest.jsx` para:
- Verificar conectividad con la API
- Probar manejo de errores
- Validar respuestas del servidor
- Depurar problemas de integración

## Consideraciones de Rendimiento

- Las operaciones son asíncronas y no bloquean la UI
- Se utiliza debounce en búsquedas para reducir llamadas a la API
- Actualización selectiva de productos en lugar de recargas completas
- Gestión eficiente del estado para evitar re-renders innecesarios