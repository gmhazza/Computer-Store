<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const toast = useToast()

const activeTab = ref('profile') // profile | orders
const orders = ref([])
const loadingOrders = ref(false)
const savingProfile = ref(false)

// Form fields
const profileForm = ref({
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States'
})

onMounted(async () => {
  prefillForm()
  await fetchUserOrders()
})

function prefillForm() {
  if (authStore.profile) {
    profileForm.value.fullName = authStore.profile.full_name || ''
    profileForm.value.phone = authStore.profile.phone || ''
    const addr = authStore.profile.shipping_address
    if (addr && typeof addr === 'object') {
      profileForm.value.street = addr.street || ''
      profileForm.value.city = addr.city || ''
      profileForm.value.state = addr.state || ''
      profileForm.value.zip = addr.zip || ''
      profileForm.value.country = addr.country || 'United States'
    }
  }
}

async function fetchUserOrders() {
  if (!authStore.user) return
  loadingOrders.value = true
  try {
    // Fetch orders with order_items in a single query or sequential queries
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', authStore.user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    orders.value = data || []
  } catch (err) {
    console.error(err)
    toast.error('Failed to load order history.')
  } finally {
    loadingOrders.value = false
  }
}

async function handleSaveProfile() {
  savingProfile.value = true
  try {
    const updates = {
      full_name: profileForm.value.fullName,
      phone: profileForm.value.phone,
      shipping_address: {
        street: profileForm.value.street,
        city: profileForm.value.city,
        state: profileForm.value.state,
        zip: profileForm.value.zip,
        country: profileForm.value.country
      }
    }
    await authStore.updateProfile(updates)
    toast.success('Profile updated successfully!')
  } catch (err) {
    console.error(err)
    toast.error('Failed to save profile changes.')
  } finally {
    savingProfile.value = false
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
  <div class="profile-container animate-fade-in">
    <!-- Sidebar Navigation -->
    <aside class="profile-sidebar glass">
      <div class="user-info-block">
        <div class="user-avatar">
          {{ profileForm.fullName ? profileForm.fullName.charAt(0).toUpperCase() : 'U' }}
        </div>
        <h3 class="user-name">{{ profileForm.fullName || 'User Profile' }}</h3>
        <p class="user-email">{{ authStore.user?.email }}</p>
      </div>

      <nav class="sidebar-nav">
        <button
          class="nav-tab-btn"
          :class="{ 'btn-active': activeTab === 'profile' }"
          @click="activeTab = 'profile'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Account Details
        </button>
        <button
          class="nav-tab-btn"
          :class="{ 'btn-active': activeTab === 'orders' }"
          @click="activeTab = 'orders'"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Order History
          <span v-if="orders.length > 0" class="badge-count">{{ orders.length }}</span>
        </button>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="profile-content">
      <!-- 1. ACCOUNT DETAILS -->
      <section v-if="activeTab === 'profile'" class="content-card glass">
        <h2 class="content-title">Account Details</h2>
        
        <form @submit.prevent="handleSaveProfile" class="profile-form">
          <div class="input-grid">
            <BaseInput
              v-model="profileForm.fullName"
              label="Full Name"
              placeholder="Your Name"
              :disabled="savingProfile"
            />
            <BaseInput
              v-model="profileForm.phone"
              label="Phone Number"
              placeholder="(555) 000-0000"
              :disabled="savingProfile"
            />
          </div>

          <div class="form-section-divider"></div>
          <h3 class="subsection-title">Default Shipping Address</h3>

          <div class="input-full">
            <BaseInput
              v-model="profileForm.street"
              label="Street Address"
              placeholder="123 Main St"
              :disabled="savingProfile"
            />
          </div>

          <div class="address-grid">
            <BaseInput
              v-model="profileForm.city"
              label="City"
              placeholder="San Jose"
              :disabled="savingProfile"
            />
            <BaseInput
              v-model="profileForm.state"
              label="State"
              placeholder="CA"
              :disabled="savingProfile"
            />
            <BaseInput
              v-model="profileForm.zip"
              label="ZIP"
              placeholder="95101"
              :disabled="savingProfile"
            />
          </div>

          <div class="input-full">
            <label class="select-label">Country</label>
            <select v-model="profileForm.country" class="country-select glass" :disabled="savingProfile">
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
          </div>

          <BaseButton
            variant="primary"
            type="submit"
            :loading="savingProfile"
            class="save-btn"
          >
            Save Changes
          </BaseButton>
        </form>
      </section>

      <!-- 2. ORDER HISTORY -->
      <section v-else class="content-card glass">
        <h2 class="content-title">Order History</h2>

        <div v-if="loadingOrders" class="orders-spinner">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else-if="orders.length === 0" class="empty-orders">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <p>You haven't placed any orders yet.</p>
        </div>

        <div v-else class="orders-list">
          <div v-for="ord in orders" :key="ord.id" class="order-item-card glass">
            <!-- Header info -->
            <div class="order-item-header">
              <div class="header-block">
                <span class="block-label">Order ID</span>
                <span class="block-val">{{ ord.id.substring(0, 8) }}...</span>
              </div>
              <div class="header-block">
                <span class="block-label">Date</span>
                <span class="block-val">{{ new Date(ord.created_at).toLocaleDateString() }}</span>
              </div>
              <div class="header-block">
                <span class="block-label">Total</span>
                <span class="block-val font-semibold text-cyan">${{ Number(ord.total).toFixed(2) }}</span>
              </div>
              <div class="header-block">
                <span class="block-label">Status</span>
                <BaseBadge :variant="getStatusVariant(ord.status)" size="xs">
                  {{ ord.status.toUpperCase() }}
                </BaseBadge>
              </div>
            </div>

            <!-- Items checklist -->
            <div class="order-items-preview">
              <div v-for="item in ord.order_items" :key="item.id" class="item-preview-row">
                <span class="item-qty">{{ item.quantity }}x</span>
                <span class="item-name">{{ item.product_name }}</span>
                <span class="item-price">${{ (Number(item.unit_price) * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.profile-container {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
}

.profile-sidebar {
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: fit-content;
}

.user-info-block {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-accent-subtle);
  border: 2px solid var(--color-accent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.user-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.user-email {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-md);
  font-family: inherit;
  font-weight: 500;
  transition: all var(--transition-fast);
  text-align: left;
}
.nav-tab-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
}
.nav-tab-btn.btn-active {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
  font-weight: 600;
}

.badge-count {
  margin-left: auto;
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  font-weight: 700;
}

.nav-tab-btn.btn-active .badge-count {
  background: var(--color-accent);
  color: #09090b;
}

/* Content Area */
.profile-content {
  display: flex;
  flex-direction: column;
}

.content-card {
  padding: 30px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-section-divider {
  height: 1px;
  background: var(--color-border);
  margin: 10px 0;
}

.subsection-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.select-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 6px;
}

.country-select {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
}

.save-btn {
  align-self: flex-start;
  margin-top: 10px;
}

/* Orders list */
.orders-spinner, .empty-orders {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-orders {
  flex-direction: column;
  gap: 12px;
  color: var(--color-text-muted);
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.order-item-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.order-item-header {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  padding: 16px 20px;
  background: rgba(24, 24, 27, 0.4);
  border-bottom: 1px solid var(--color-border);
}

.header-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.block-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.block-val {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}
.font-semibold { font-weight: 600; }
.text-cyan { color: var(--color-accent); }

.order-items-preview {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  gap: 12px;
}
.item-qty {
  color: var(--color-accent);
  font-weight: 600;
}
.item-name {
  color: var(--color-text-primary);
  flex-grow: 1;
}
.item-price {
  color: var(--color-text-muted);
}

@media (max-width: 900px) {
  .profile-container { grid-template-columns: 1fr; }
  .profile-sidebar { height: auto; }
}

@media (max-width: 600px) {
  .input-grid { grid-template-columns: 1fr; }
  .address-grid { grid-template-columns: 1fr; }
  .order-item-header { grid-template-columns: repeat(2, 1fr); }
}
</style>
