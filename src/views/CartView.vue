<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import CartItem from '@/components/cart/CartItem.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const cartStore = useCartStore()

const formattedSubtotal = computed(() => `$${cartStore.subtotal.toFixed(2)}`)
const formattedShipping = computed(() => {
  return cartStore.shippingCost === 0 ? 'FREE' : `$${cartStore.shippingCost.toFixed(2)}`
})
const formattedTotal = computed(() => `$${cartStore.total.toFixed(2)}`)

function clear() {
  if (confirm('Are you sure you want to empty your cart?')) {
    cartStore.clearCart()
  }
}
</script>

<template>
  <div class="cart-container animate-fade-in">
    <h1 class="page-title">Shopping Cart</h1>

    <!-- Empty State -->
    <div v-if="cartStore.items.length === 0" class="empty-cart-state glass">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
      <h2>Your cart is empty</h2>
      <p>Looks like you haven't added any components to your cart yet.</p>
      <RouterLink :to="{ name: 'products' }">
        <BaseButton variant="primary">Continue Shopping</BaseButton>
      </RouterLink>
    </div>

    <!-- Main Layout -->
    <div v-else class="cart-layout">
      <!-- Items List -->
      <div class="items-column">
        <div class="column-header">
          <span>Items ({{ cartStore.itemCount }})</span>
          <button class="clear-all-btn" @click="clear">Clear Cart</button>
        </div>
        <div class="items-list">
          <CartItem
            v-for="item in cartStore.items"
            :key="item.product.id"
            :item="item"
          />
        </div>
      </div>

      <!-- Summary Card -->
      <aside class="summary-column">
        <div class="summary-card glass">
          <h3 class="summary-title">Order Summary</h3>
          
          <div class="summary-row">
            <span class="row-label">Subtotal</span>
            <span class="row-value">{{ formattedSubtotal }}</span>
          </div>

          <div class="summary-row">
            <span class="row-label">Shipping</span>
            <span class="row-value" :class="{ 'free-shipping': cartStore.shippingCost === 0 }">
              {{ formattedShipping }}
            </span>
          </div>
          <p class="shipping-threshold" v-if="cartStore.shippingCost > 0">
            Add <strong>${{ (100 - cartStore.subtotal).toFixed(2) }}</strong> more for FREE shipping!
          </p>

          <div class="summary-total-row">
            <span>Total</span>
            <span>{{ formattedTotal }}</span>
          </div>

          <RouterLink :to="{ name: 'checkout' }">
            <BaseButton variant="primary" size="lg" block>
              Proceed to Checkout
            </BaseButton>
          </RouterLink>

          <div class="badge-lock-note">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure checkout. Stocks reserved for 30 minutes.
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.cart-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

/* Empty State */
.empty-cart-state {
  padding: 80px 40px;
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--color-text-muted);
}
.empty-cart-state h2 {
  margin: 0;
  color: var(--color-text-primary);
}
.empty-cart-state p {
  margin: 0 0 8px;
  max-width: 380px;
}

/* Layout Grid */
.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 32px;
  align-items: start;
}

.items-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-secondary);
  font-weight: 500;
}
.clear-all-btn {
  background: none;
  border: none;
  color: var(--color-danger);
  cursor: pointer;
  padding: 2px 6px;
  font-weight: 600;
  font-size: 13px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}
.clear-all-btn:hover {
  background: rgba(248, 113, 113, 0.1);
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Summary Card */
.summary-card {
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.summary-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.row-value {
  font-weight: 600;
  color: var(--color-text-primary);
}

.free-shipping {
  color: var(--color-success);
}

.shipping-threshold {
  margin: -10px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  color: var(--color-text-primary);
}

.badge-lock-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .cart-layout {
    grid-template-columns: 1fr;
  }
}
</style>
