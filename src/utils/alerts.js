import Swal from 'sweetalert2';

// Configuración por defecto de SweetAlert2
const defaultConfig = {
  confirmButtonColor: '#1976d2',
  cancelButtonColor: '#d32f2f',
  confirmButtonText: 'Aceptar',
  cancelButtonText: 'Cancelar',
};

export const showSuccess = (title, text = '') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'success',
    title,
    text,
    timer: 3000,
    timerProgressBar: true,
    showConfirmButton: false,
  });
};

export const showError = (title, text = '') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Entendido',
  });
};

export const showWarning = (title, text = '') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
  });
};

export const showInfo = (title, text = '') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'info',
    title,
    text,
  });
};

export const showConfirm = (title, text = '', confirmText = 'Confirmar') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
  });
};

export const showDeleteConfirm = (title = '¿Estás seguro?', text = 'Esta acción no se puede deshacer') => {
  return Swal.fire({
    ...defaultConfig,
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    confirmButtonColor: '#d32f2f',
  });
};

export const showLoading = (title = 'Cargando...') => {
  return Swal.fire({
    title,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

export const closeLoading = () => {
  Swal.close();
};

export const showInputDialog = (title, inputPlaceholder = '', inputValue = '') => {
  return Swal.fire({
    ...defaultConfig,
    title,
    input: 'text',
    inputPlaceholder,
    inputValue,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Por favor ingresa un valor';
      }
    },
  });
};

export const showTextareaDialog = (title, inputPlaceholder = '', inputValue = '') => {
  return Swal.fire({
    ...defaultConfig,
    title,
    input: 'textarea',
    inputPlaceholder,
    inputValue,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Por favor ingresa un valor';
      }
    },
  });
};

export const showSelectDialog = (title, inputOptions, inputValue = '') => {
  return Swal.fire({
    ...defaultConfig,
    title,
    input: 'select',
    inputOptions,
    inputValue,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return 'Por favor selecciona una opción';
      }
    },
  });
};

export const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  },
});

export const showToast = (icon, title) => {
  return Toast.fire({
    icon,
    title,
  });
};