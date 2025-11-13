import Swal from 'sweetalert2';

class AlertService {
  // Alerta de éxito
  success(title, message = '') {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      confirmButtonColor: '#4caf50',
      timer: 3000,
      timerProgressBar: true
    });
  }

  // Alerta de error
  error(title, message = '') {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: message,
      confirmButtonColor: '#f44336'
    });
  }

  // Alerta de advertencia
  warning(title, message = '') {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      confirmButtonColor: '#ff9800'
    });
  }

  // Alerta de información
  info(title, message = '') {
    return Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      confirmButtonColor: '#2196f3'
    });
  }

  // Confirmación de acción
  confirm(title, message = '', confirmButtonText = 'Sí, continuar') {
    return Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f44336',
      confirmButtonText: confirmButtonText,
      cancelButtonText: 'Cancelar'
    });
  }

  // Confirmación de eliminación
  confirmDelete(title = '¿Estás seguro?', message = 'Esta acción no se puede deshacer') {
    return Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonColor: '#f44336',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
  }

  // Alerta de carga/procesando
  loading(title = 'Procesando...', message = 'Por favor espera') {
    return Swal.fire({
      title: title,
      text: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  // Cerrar alerta de carga
  close() {
    Swal.close();
  }

  // Toast (notificación pequeña)
  toast(icon, title, position = 'top-end') {
    return Swal.fire({
      toast: true,
      position: position,
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }

  // Toast de éxito
  toastSuccess(message) {
    return this.toast('success', message);
  }

  // Toast de error
  toastError(message) {
    return this.toast('error', message);
  }

  // Toast de advertencia
  toastWarning(message) {
    return this.toast('warning', message);
  }

  // Toast de información
  toastInfo(message) {
    return this.toast('info', message);
  }
}

export default new AlertService();