import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
  function addToast(message, type = 'info', duration = 3500) {
    const id = ++toastId
    toasts.value.push({ id, message, type, leaving: false })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id) {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.leaving = true
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 300)
    }
  }

  function success(message) { addToast(message, 'success') }
  function error(message) { addToast(message, 'error', 5000) }
  function warning(message) { addToast(message, 'warning') }
  function info(message) { addToast(message, 'info') }

  return { toasts, addToast, removeToast, success, error, warning, info }
}
