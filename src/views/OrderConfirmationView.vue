<script setup>
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  }
})

const order = ref(null)
const orderItems = ref([])
const loading = ref(true)

onMounted(async () => {
  await fetchOrderDetails()
})

async function fetchOrderDetails() {
  loading.value = true
  try {
    // 1. Fetch order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', props.orderId)
      .single()
    if (orderError) throw orderError
    order.value = orderData

    // 2. Fetch order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', props.orderId)
    if (itemsError) throw itemsError
    orderItems.value = itemsData || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const statusVariant = computed(() => {
  if (!order.value) return 'default'
  const status = order.value.status
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'pending') return 'warning'
  return 'info'
})

const statusLabel = computed(() => {
  if (!order.value) return ''
  return order.value.status.charAt(0).toUpperCase() + order.value.status.slice(1)
})
</script>

<template>
  <div class="confirm-container animate-fade-in">
    <div v-if="loading" class="spinner-box">
      <LoadingSpinner size="lg" />
    </div>

    <div v-else-if="!order" class="error-box glass">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
      <h2>Order Not Found</h2>
      <p>We couldn't retrieve details for this order ID. Please check your history in profile.</p>
      <RouterLink :to="{ name: 'home' }">
        <BaseButton variant="primary">Go Home</BaseButton>
      </RouterLink>
    </div>

    <div v-else class="confirm-card glass">
      <!-- Success Icon -->
      <div class="success-icon-badge">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
      </div>

      <h1 class="confirm-title">Order Confirmed!</h1>
      <p class="confirm-desc">Thank you for your purchase. Your order has been placed and is being processed.</p>

      <!-- Details Grid -->
      <div class="details-grid">
        <div class="info-block">
          <span class="block-label">Order ID</span>
          <span class="block-val">{{ order.id }}</span>
        </div>
        <div class="info-block">
          <span class="block-label">Status</span>
          <BaseBadge :variant="statusVariant" size="sm">{{ statusLabel }}</BaseBadge>
        </div>
        <div class="info-block">
          <span class="block-label">Date Placed</span>
          <span class="block-val">{{ new Date(order.created_at).toLocaleDateString() }}</span>
        </div>
        <div class="info-block">
          <span class="block-label">Total Amount</span>
          <span class="block-val font-semibold text-cyan">${{ Number(order.total).toFixed(2) }}</span>
        </div>
      </div>

      <!-- Items Section -->
      <div class="items-section">
        <h3 class="section-title">Purchased Items</h3>
        <div class="items-list">
          <div v-for="item in orderItems" :key="item.id" class="item-row">
            <span class="item-qty">{{ item.quantity }}x</span>
            <span class="item-name">{{ item.product_name }}</span>
            <span class="item-price">${{ (Number(item.unit_price) * item.quantity).toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- Shipping details -->
      <div class="shipping-section">
        <h3 class="section-title">Shipping Address</h3>
        <p class="shipping-address">
          <strong>{{ order.shipping_details?.full_name }}</strong><br />
          {{ order.shipping_details?.street }}<br />
          {{ order.shipping_details?.city }}, {{ order.shipping_details?.state }} {{ order.shipping_details?.zip }}<br />
          {{ order.shipping_details?.country }}<br />
          Phone: {{ order.shipping_details?.phone }}
        </p>
      </div>

      <div class="confirm-actions">
        <RouterLink :to="{ name: 'products' }">
          <BaseButton variant="primary">Continue Shopping</BaseButton>
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated" :to="{ name: 'profile' }">
          <BaseButton variant="ghost">View Order History</BaseButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.confirm-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.spinner-box {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-box {
  padding: 40px;
  border-radius: var(--radius-lg);
  text-align: center;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.error-box h2 { margin: 0; color: var(--color-text-primary); }
.error-box p { margin: 0 0 8px; color: var(--color-text-secondary); line-height: 1.5; }

.confirm-card {
  width: 100%;
  max-width: 600px;
  padding: 40px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: var(--shadow-lg);
}

.success-icon-badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.confirm-title {
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
}

.confirm-desc {
  margin: 0 0 32px;
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  max-width: 440px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  width: 100%;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 24px;
  margin-bottom: 24px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.block-label {
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.block-val {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-semibold { font-weight: 600; }
.text-cyan { color: var(--color-accent); }

/* Items list */
.items-section, .shipping-section {
  width: 100%;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 24px;
  margin-bottom: 24px;
}
.shipping-section {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 32px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  gap: 12px;
}
.item-qty {
  color: var(--color-accent);
  font-weight: 600;
  flex-shrink: 0;
}
.item-name {
  color: var(--color-text-primary);
  flex-grow: 1;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.item-price {
  color: var(--color-text-secondary);
  font-weight: 500;
  flex-shrink: 0;
}

.shipping-address {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

.confirm-actions {
  display: flex;
  gap: 16px;
}

@media (max-width: 480px) {
  .details-grid { grid-template-columns: 1fr; }
  .confirm-actions { flex-direction: column; width: 100%; gap: 12px; }
  .confirm-card { padding: 24px; }
}
</style>
