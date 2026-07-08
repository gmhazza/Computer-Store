<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import StatsCard from '@/components/admin/StatsCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const loading = ref(true)
const stats = ref({
  revenue: 0,
  ordersToday: 0,
  activeProducts: 0,
  lowStockItems: 0
})
const recentOrders = ref([])
const lowStockProducts = ref([])

onMounted(async () => {
  await fetchDashboardData()
})

async function fetchDashboardData() {
  loading.value = true
  try {
    const today = new Date()
    today.setHours(0,0,0,0)
    const todayISO = today.toISOString()

    // 1. Fetch Stats in parallel
    const [
      { data: activeProds, error: pError },
      { data: lowStockProds, error: lsError },
      { data: allOrders, error: oError }
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('products').select('*').eq('is_active', true).lte('stock_quantity', 5).order('stock_quantity'),
      supabase.from('orders').select('*')
    ])

    if (pError) throw pError
    if (lsError) throw lsError
    if (oError) throw oError

    // 2. Process Stats values
    stats.value.activeProducts = activeProds.length
    stats.value.lowStockItems = lowStockProds.length
    lowStockProducts.value = lowStockProds.slice(0, 5) // Limit to top 5 low stock

    let totalRev = 0
    let todayCount = 0
    allOrders.forEach(ord => {
      if (ord.status !== 'cancelled') {
        totalRev += Number(ord.total)
      }
      if (new Date(ord.created_at) >= today) {
        todayCount++
      }
    })

    stats.value.revenue = totalRev
    stats.value.ordersToday = todayCount

    // 3. Process Recent Orders
    recentOrders.value = [...allOrders]
      .sort((a,b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)

  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function getStatusVariant(status) {
  if (status === 'delivered') return 'success'
  if (status === 'cancelled') return 'danger'
  if (status === 'pending') return 'warning'
  return 'info'
}
</script>

<template>
  <div class="admin-layout-wrapper">
    <AdminSidebar />
    
    <main class="admin-main-content">
      <!-- Title -->
      <div class="admin-header">
        <h1 class="admin-title">Dashboard Overview</h1>
        <p class="admin-subtitle">Live health status, revenue summaries, and low-stock alerts.</p>
      </div>

      <!-- Spinner -->
      <div v-if="loading" class="spinner-box">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else class="dashboard-content animate-fade-in">
        <!-- Stats Cards Grid -->
        <section class="stats-grid">
          <StatsCard
            title="Total Revenue"
            :value="`$${stats.revenue.toFixed(2)}`"
            icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
            trend="12.4%"
            trendType="up"
            subtext="Lifetime earnings"
          />
          <StatsCard
            title="Orders Today"
            :value="stats.ordersToday"
            icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>'
            trend="2 new"
            trendType="up"
            subtext="Since midnight"
          />
          <StatsCard
            title="Active Products"
            :value="stats.activeProducts"
            icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7l7 5-7 5z"/></svg>'
            trend="Stable"
            trendType="neutral"
            subtext="Live listings in store"
          />
          <StatsCard
            title="Low Stock Items"
            :value="stats.lowStockItems"
            icon='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
            :trend="`${stats.lowStockItems} items`"
            :trendType="stats.lowStockItems > 0 ? 'down' : 'neutral'"
            subtext="Requires replenishment"
          />
        </section>

        <!-- Tables Section Grid -->
        <div class="tables-grid">
          <!-- Recent Orders -->
          <div class="table-card glass">
            <h3 class="table-card-title">Recent Orders</h3>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer / Email</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="recentOrders.length === 0">
                    <td colspan="4" class="empty-td">No orders found.</td>
                  </tr>
                  <tr v-for="ord in recentOrders" :key="ord.id">
                    <td class="font-mono text-xs">{{ ord.id.substring(0, 8) }}...</td>
                    <td>
                      <div class="customer-info">
                        <span class="customer-name">{{ ord.shipping_details?.full_name || 'Guest' }}</span>
                        <span class="customer-email">{{ ord.shipping_details?.email || ord.guest_email }}</span>
                      </div>
                    </td>
                    <td class="font-semibold">${{ Number(ord.total).toFixed(2) }}</td>
                    <td>
                      <BaseBadge :variant="getStatusVariant(ord.status)" size="xs">
                        {{ ord.status }}
                      </BaseBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Low Stock Alerts -->
          <div class="table-card glass">
            <h3 class="table-card-title text-danger">Low Stock Warnings</h3>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="lowStockProducts.length === 0">
                    <td colspan="3" class="empty-td text-success">All products fully stocked!</td>
                  </tr>
                  <tr v-for="prod in lowStockProducts" :key="prod.id">
                    <td>
                      <span class="product-name" :title="prod.name">{{ prod.name }}</span>
                    </td>
                    <td class="font-semibold">{{ prod.stock_quantity }} units</td>
                    <td>
                      <BaseBadge :variant="prod.stock_quantity === 0 ? 'danger' : 'warning'" size="xs">
                        {{ prod.stock_quantity === 0 ? 'Out of Stock' : 'Low Stock' }}
                      </BaseBadge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
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
  margin-left: 240px; /* Offset side-bar */
  padding: 40px;
  box-sizing: border-box;
}

.admin-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
  margin-bottom: 32px;
}
.admin-title {
  margin: 0 0 6px;
  font-size: 28px;
  font-weight: 700;
}
.admin-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.spinner-box {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.tables-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
}

/* Table Card */
.table-card {
  padding: 20px;
  border-radius: var(--radius-lg);
}

.table-card-title {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
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
  padding: 10px 14px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 14px;
  font-size: 13px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.data-table tr:last-child td {
  border-bottom: none;
}

.font-mono { font-family: monospace; }
.font-semibold { font-weight: 600; }

.empty-td {
  text-align: center;
  color: var(--color-text-muted);
  padding: 30px !important;
}

.customer-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.customer-name {
  font-weight: 500;
  color: var(--color-text-primary);
}
.customer-email {
  font-size: 11px;
  color: var(--color-text-muted);
}

.product-name {
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 220px;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .tables-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main-content { margin-left: 0; padding: 24px; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
