<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()

const isDiscounted = computed(() => {
  return props.item.product.sale_price !== null && props.item.product.sale_price < props.item.product.price
})

const unitPrice = computed(() => {
  return isDiscounted.value ? props.item.product.sale_price : props.item.product.price
})

const formattedUnitPrice = computed(() => {
  return `$${Number(unitPrice.value).toFixed(2)}`
})

const formattedSubtotal = computed(() => {
  const sub = unitPrice.value * props.item.quantity
  return `$${sub.toFixed(2)}`
})

const imageUrl = computed(() => {
  if (props.item.product.image_url) return props.item.product.image_url
  return `https://placehold.co/120x90/18181b/fafafa?text=${encodeURIComponent(props.item.product.name)}`
})

function adjustQty(val) {
  const newQty = props.item.quantity + val
  if (newQty < 1 || newQty > props.item.product.stock_quantity) return
  cartStore.updateQuantity(props.item.product.id, newQty)
}

function remove() {
  cartStore.removeItem(props.item.product.id)
}
</script>

<template>
  <div class="cart-item glass">
    <!-- Thumbnail -->
    <RouterLink :to="{ name: 'product-detail', params: { slug: props.item.product.slug } }" class="thumb-link">
      <img :src="imageUrl" :alt="props.item.product.name" class="item-thumb" />
    </RouterLink>

    <!-- Details -->
    <div class="item-details">
      <RouterLink :to="{ name: 'product-detail', params: { slug: props.item.product.slug } }" class="item-title-link">
        <h4 class="item-name">{{ props.item.product.name }}</h4>
      </RouterLink>
      <div class="price-remove-row">
        <span class="unit-price">{{ formattedUnitPrice }} each</span>
        <button class="remove-btn" @click="remove">Remove</button>
      </div>
    </div>

    <!-- Quantity control -->
    <div class="qty-column">
      <div class="qty-buttons">
        <button
          class="qty-btn"
          :disabled="props.item.quantity <= 1"
          @click="adjustQty(-1)"
        >
          -
        </button>
        <span class="qty-number">{{ props.item.quantity }}</span>
        <button
          class="qty-btn"
          :disabled="props.item.quantity >= props.item.product.stock_quantity"
          @click="adjustQty(1)"
        >
          +
        </button>
      </div>
      <span class="stock-alert" v-if="props.item.product.stock_quantity <= 5">
        Only {{ props.item.product.stock_quantity }} left
      </span>
    </div>

    <!-- Subtotal -->
    <div class="subtotal-column">
      <span class="subtotal-label">Subtotal</span>
      <span class="subtotal-amount">{{ formattedSubtotal }}</span>
    </div>
  </div>
</template>

<style scoped>
.cart-item {
  display: grid;
  grid-template-columns: 100px 1fr 150px 120px;
  gap: 20px;
  align-items: center;
  padding: 16px;
  border-radius: var(--radius-lg);
}

.item-thumb {
  width: 100px;
  height: 75px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.item-title-link {
  text-decoration: none;
  color: inherit;
}
.item-name {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}
.item-title-link:hover .item-name {
  color: var(--color-accent);
}

.price-remove-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
.unit-price {
  font-size: 13px;
  color: var(--color-text-secondary);
}
.remove-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  font-weight: 500;
}
.remove-btn:hover {
  text-decoration: underline;
}

/* Quantity control */
.qty-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.qty-buttons {
  display: flex;
  align-items: center;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--color-bg-primary);
}
.qty-btn {
  background: none;
  border: none;
  color: var(--color-text-primary);
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background var(--transition-fast);
}
.qty-btn:hover:not(:disabled) {
  background: var(--color-bg-tertiary);
}
.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.qty-number {
  min-width: 32px;
  text-align: center;
  font-weight: 600;
  font-size: 13px;
}
.stock-alert {
  font-size: 10px;
  color: var(--color-warning);
  font-weight: 600;
}

/* Subtotal */
.subtotal-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}
.subtotal-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
}
.subtotal-amount {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

@media (max-width: 768px) {
  .cart-item {
    grid-template-columns: 80px 1fr;
    gap: 16px;
  }
  .item-thumb {
    width: 80px;
    height: 60px;
  }
  .qty-column {
    grid-column: 1 / 3;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    border-top: 1px solid var(--color-border);
    padding-top: 12px;
  }
  .subtotal-column {
    grid-column: 1 / 3;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    border-top: 1px dashed var(--color-border);
    padding-top: 8px;
    align-items: center;
  }
}
</style>
