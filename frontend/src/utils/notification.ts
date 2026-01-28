import toast from 'react-hot-toast';

/**
 * Muestra una notificación de éxito
 * @param message - Mensaje a mostrar
 */
export const showSuccess = (message: string) => {
  toast.success(message);
};

/**
 * Muestra una notificación de error
 * @param message - Mensaje a mostrar
 */
export const showError = (message: string) => {
  toast.error(message);
};

/**
 * Muestra una notificación informativa
 * @param message - Mensaje a mostrar
 */
export const showInfo = (message: string) => {
  toast(message, {
    icon: 'ℹ️',
  });
};

/**
 * Muestra una notificación de advertencia
 * @param message - Mensaje a mostrar
 */
export const showWarning = (message: string) => {
  toast(message, {
    icon: '⚠️',
    style: {
      background: '#fef3c7',
      color: '#92400e',
    },
  });
};

/**
 * Muestra una notificación de carga con promesa
 * @param promise - Promesa a ejecutar
 * @param messages - Mensajes para loading, success y error
 */
export const showPromise = <T,>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) => {
  return toast.promise(promise, messages);
};
