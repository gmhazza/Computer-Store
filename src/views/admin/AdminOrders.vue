<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/composables/useToast'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const toast = useToast()

const orders = ref([])
const loading = ref(true)
const updatingId = ref(null)
const expandedOrderId = ref(null)

onMounted(async () => {
  await fetchOrders()
})

async function fetchOrders() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false })
    if (error) throw error
    orders.value = data || []
  } catch (err) {
    console.error(err)
    toast.error('Failed to fetch orders.')
  } finally {
    loading.value = false
  }
}

async function handleStatusChange(orderId, newStatus) {
  updatingId.value = orderId
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
    if (error) throw error

    toast.success(`Updated order status to: ${newStatus}`)
    
    // Update local state directly
    const order = orders.value.find(o => o.id === orderId)
    if (order) {
      order.status = newStatus
    }
  } catch (err) {
    console.error(err)
    toast.error('Failed to update order status.')
  } finally {
    updatingId.value = null
  }
}

function getStatusVariant(status) {
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'pending') return 'warning'
  return 'info'
}

function toggleExpand(orderId) {
  expandedOrderId.value = expandedOrderId.value === orderId ? null : orderId
}
</script>

<template>
  <div class="admin-layout-wrapper">
    <AdminSidebar />

    <main class="admin-main-content">
      <!-- Title -->
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Orders Management</h1>
          <p class="admin-subtitle">Track orders status, ship packages, and view customer summaries.</p>
        </div>
      </div>

      <!-- Content -->
      <div class="table-card glass mt-6">
        <div v-if="loading" class="spinner-box">
          <LoadingSpinner />
        </div>

        <div v-else-if="orders.length === 0" class="empty-box">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <p>No orders found in database.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer Details</th>
                <th>Total Price</th>
                <th>Status</th>
                <th>Update Status</th>
                <th class="actions-th">Details</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="ord in orders" :key="ord.id">
                <!-- Base row -->
                <tr :class="{ 'row-expanded': expandedOrderId === ord.id }">
                  <td class="font-mono text-xs">{{ ord.id.substring(0, 8) }}...</td>
                  <td>{{ new Date(ord.created_at).toLocaleDateString() }}</td>
                  <td>
                    <div class="customer-info">
                      <span class="customer-name">{{ ord.shipping_details?.full_name || 'Guest Checkout' }}</span>
                      <span class="customer-email">{{ ord.shipping_details?.email || ord.guest_email }}</span>
                    </div>
                  </td>
                  <td class="font-semibold text-cyan">${{ Number(ord.total).toFixed(2) }}</td>
                  <td>
                    <BaseBadge :variant="getStatusVariant(ord.status)" size="xs">
                      {{ ord.status.toUpperCase() }}
                    </BaseBadge>
                  </td>
                  <td>
                    <select
                      :value="ord.status"
                      class="status-select glass"
                      :disabled="updatingId === ord.id"
                      @change="handleStatusChange(ord.id, $event.target.value)"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td class="actions-td">
                    <button class="expand-btn" @click="toggleExpand(ord.id)">
                      {{ expandedOrderId === ord.id ? '▲ Collapse' : '▼ Expand' }}
                    </button>
                  </td>
                </tr>

                <!-- Expanded Items and shipping details row -->
                <tr v-if="expandedOrderId === ord.id" class="detail-row">
                  <td colspan="7">
                    <div class="expanded-card animate-fade-in">
                      <div class="details-section-grid">
                        <!-- Left: Order items checklist -->
                        <div class="items-summary-col">
                          <h4 class="col-title">Ordered Components</h4>
                          <div class="order-items-list">
                            <div v-for="item in ord.order_items" :key="item.id" class="item-summary-row">
                              <span class="qty">{{ item.quantity }}x</span>
                              <span class="name">{{ item.product_name }}</span>
                              <span class="price">${{ (Number(item.unit_price) * item.quantity).toFixed(2) }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- Right: Shipping summary -->
                        <div class="shipping-summary-col">
                          <h4 class="col-title">Shipping Information</h4>
                          <p class="address-paragraph">
                            <strong>{{ ord.shipping_details?.full_name }}</strong><br />
                            {{ ord.shipping_details?.street }}<br />
                            {{ ord.shipping_details?.city }}, {{ ord.shipping_details?.state }} {{ ord.shipping_details?.zip }}<br />
                            {{ ord.shipping_details?.country }}<br />
                            Phone: {{ ord.shipping_details?.phone }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.admin-main-content {
  flex: 1;
  margin-left: 240px;
  padding: 40px;
  box-sizing: border-box;
}

.admin-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
  margin-bottom: 28px;
}
.admin-title { margin: 0 0 6px; font-size: 28px; font-weight: 700; }
.admin-subtitle { margin: 0; font-size: 14px; color: var(--color-text-secondary); }

.mt-6 { margin-top: 24px; }

/* Table styling */
.table-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.spinner-box, .empty-box {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-box {
  flex-direction: column;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 14px;
}
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.data-table th {
  padding: 12px 18px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  letter-spacing: 0.05em;
}
.data-table td {
  padding: 16px 18px;
  font-size: 13px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.data-table tr.row-expanded td {
  border-bottom: none;
  background: rgba(24, 24, 27, 0.2);
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.customer-name {
  font-weight: 500;
}
.customer-email {
  font-size: 11px;
  color: var(--color-text-muted);
}

.text-cyan { color: var(--color-accent); }
.font-mono { font-family: monospace; }
.font-semibold { font-weight: 600; }

.status-select {
  padding: 6px 10px;
  font-size: 12px;
  font-family: inherit;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
}

.actions-th { text-align: right !important; }
.actions-td { text-align: right; }
.expand-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.expand-btn:hover {
  background: var(--color-accent-subtle);
}

/* Expanded Detail Row */
.detail-row td {
  padding: 0 18px 20px !important;
  background: rgba(24, 24, 27, 0.2);
}

.expanded-card {
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 20px;
}

.details-section-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 32px;
}

.col-title {
  margin: 0 0 12px;
  font-size: 12px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.order-items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.item-summary-row {
  display: flex;
  font-size: 13px;
  gap: 10px;
}
.item-summary-row .qty { color: var(--color-accent); font-weight: 600; }
.item-summary-row .name { color: var(--color-text-primary); flex-grow: 1; }
.item-summary-row .price { color: var(--color-text-secondary); }

.address-paragraph {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

@media (max-width: 900px) {
  .details-section-grid { grid-template-columns: 1fr; gap: 24px; }
}

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main-content { margin-left: 0; padding: 24px; }
}
</style>
