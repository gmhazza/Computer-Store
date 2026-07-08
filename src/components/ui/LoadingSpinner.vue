<script setup>
defineProps({
  size: { type: String, default: 'md' },
})
</script>

<template>
  <div class="spinner-wrapper">
    <svg :class="['spinner', `spinner-${size}`]" viewBox="0 0 50 50">
      <circle class="spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4"/>
      <circle class="spinner-circle" cx="25" cy="25" r="20" fill="none" stroke-width="4" stroke-linecap="round"/>
    </svg>
  </div>
</template>

<style scoped>
.spinner-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  animation: rotate 1s linear infinite;
}

.spinner-sm { width: 20px; height: 20px; }
.spinner-md { width: 36px; height: 36px; }
.spinner-lg { width: 56px; height: 56px; }

.spinner-track {
  stroke: var(--color-border);
}

.spinner-circle {
  stroke: var(--color-accent);
  stroke-dasharray: 90, 150;
  stroke-dashoffset: 0;
  animation: dash 1.2s ease-in-out infinite;
}

@keyframes rotate {
  100% { transform: rotate(360deg); }
}

@keyframes dash {
  0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
  50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
  100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
}
</style>
