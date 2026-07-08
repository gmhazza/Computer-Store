<script setup>
import { computed } from 'vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({
  stock: {
    type: Number,
    required: true
  }
})

const badgeConfig = computed(() => {
  if (props.stock === 0) {
    return { variant: 'danger', text: 'Out of Stock' }
  } else if (props.stock <= 5) {
    return { variant: 'warning', text: `Only ${props.stock} Left` }
  } else if (props.stock <= 10) {
    return { variant: 'warning', text: 'Low Stock' }
  } else {
    return { variant: 'success', text: 'In Stock' }
  }
})
</script>

<template>
  <BaseBadge :variant="badgeConfig.variant" size="xs">
    <span class="dot" :class="`dot-${badgeConfig.variant}`"></span>
    {{ badgeConfig.text }}
  </BaseBadge>
</template>

<style scoped>
.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}
.dot-success { background-color: #34d399; }
.dot-warning { background-color: #fbbf24; }
.dot-danger { background-color: #f87171; }
</style>
