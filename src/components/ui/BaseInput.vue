<script setup>
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  icon: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="input-group">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="input-wrapper" :class="{ 'has-error': error }">
      <span v-if="icon" class="input-icon" v-html="icon"></span>
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        class="input-field"
        :class="{ 'with-icon': icon }"
        @input="emit('update:modelValue', $event.target.value)"
      />
    </div>
    <p v-if="error" class="input-error">{{ error }}</p>
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  transition: all var(--transition-fast);
}

.input-field.with-icon {
  padding-left: 40px;
}

.input-field::placeholder {
  color: var(--color-text-muted);
}

.input-field:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.has-error .input-field {
  border-color: var(--color-danger);
}
.has-error .input-field:focus {
  box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.15);
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  pointer-events: none;
}
.input-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.input-error {
  margin: 0;
  font-size: 12px;
  color: var(--color-danger);
}
</style>
