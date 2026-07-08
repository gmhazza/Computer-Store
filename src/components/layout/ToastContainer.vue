<script setup>
import { useToast } from '@/composables/useToast'
const { toasts, removeToast } = useToast()

const iconMap = {
  success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linecap="round"><path d="M20 6L9 17l-5-5"/></svg>',
  error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round"><path d="M12 9v4M12 17h.01"/><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
}
</script>

<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', `toast-${toast.type}`, { 'toast-leaving': toast.leaving }]"
        >
          <span class="toast-icon" v-html="iconMap[toast.type]"></span>
          <p class="toast-message">{{ toast.message }}</p>
          <button class="toast-close" @click="removeToast(toast.id)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  min-width: 300px;
  max-width: 420px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  animation: toast-in 300ms ease-out;
}

.toast-leaving {
  animation: toast-out 300ms ease-in forwards;
}

.toast-icon {
  flex-shrink: 0;
  display: flex;
}

.toast-message {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-primary);
  flex: 1;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  transition: color var(--transition-fast);
}
.toast-close:hover {
  color: var(--color-text-primary);
}

.toast-success { border-left: 3px solid #34d399; }
.toast-error { border-left: 3px solid #f87171; }
.toast-warning { border-left: 3px solid #fbbf24; }
.toast-info { border-left: 3px solid #22d3ee; }

/* TransitionGroup */
.toast-enter-active { animation: toast-in 300ms ease-out; }
.toast-leave-active { animation: toast-out 300ms ease-in; }
.toast-move { transition: transform 300ms ease; }
</style>
