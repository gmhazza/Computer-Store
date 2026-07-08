<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'sm' },
})
</script>

<template>
  <span :class="['badge', `badge-${variant}`, `badge-${size}`]">
    <slot />
  </span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  border-radius: 999px;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

/* Sizes */
.badge-xs { padding: 2px 8px; font-size: 10px; }
.badge-sm { padding: 3px 10px; font-size: 11px; }
.badge-md { padding: 4px 14px; font-size: 13px; }

/* Variants */
.badge-default {
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
}
.badge-success {
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
}
.badge-warning {
  background: rgba(251, 191, 36, 0.15);
  color: #fbbf24;
}
.badge-danger {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
}
.badge-info {
  background: rgba(34, 211, 238, 0.15);
  color: #22d3ee;
}
.badge-purple {
  background: rgba(139, 92, 246, 0.15);
  color: #a78bfa;
}
</style>
