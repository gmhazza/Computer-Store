<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :class="[
      'btn',
      `btn-${variant}`,
      `btn-${size}`,
      { 'btn-block': block, 'btn-loading': loading }
    ]"
    :disabled="disabled || loading"
  >
    <svg v-if="loading" class="btn-spinner" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
      </circle>
    </svg>
    <span :class="{ 'opacity-0': loading }">
      <slot />
    </span>
  </button>
</template>

<style scoped>
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  font-family: inherit;
  letter-spacing: 0.01em;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Variants */
.btn-primary {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
  color: #09090b;
  box-shadow: 0 2px 8px rgba(6, 182, 212, 0.25);
}
.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #22d3ee, #06b6d4);
  box-shadow: 0 4px 16px rgba(34, 211, 238, 0.35);
  transform: translateY(-1px);
}

.btn-secondary {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: #fafafa;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25);
}
.btn-secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #a78bfa, #8b5cf6);
  box-shadow: 0 4px 16px rgba(139, 92, 246, 0.35);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.btn-ghost:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fafafa;
}
.btn-danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #f87171, #ef4444);
  transform: translateY(-1px);
}

.btn-outline {
  background: transparent;
  color: var(--color-accent);
  border: 1px solid var(--color-accent);
}
.btn-outline:hover:not(:disabled) {
  background: var(--color-accent-subtle);
}

/* Sizes */
.btn-sm { padding: 6px 14px; font-size: 13px; border-radius: var(--radius-sm); }
.btn-md { padding: 10px 20px; font-size: 14px; }
.btn-lg { padding: 14px 28px; font-size: 16px; border-radius: 12px; }

.btn-block { width: 100%; }

/* Spinner */
.btn-spinner {
  position: absolute;
  width: 20px;
  height: 20px;
}
.btn-loading { pointer-events: none; }
</style>
