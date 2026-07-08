<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import { supabase } from '@/lib/supabase'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const toast = useToast()

const submitting = ref(false)

// Form fields
const form = ref({
  fullName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: 'United States'
})

// Errors
const errors = ref({})

onMounted(() => {
  if (cartStore.items.length === 0) {
    toast.warning('Your cart is empty. Add components before checking out.')
    router.push({ name: 'cart' })
    return
  }

  // Prefill user details if logged in
  if (authStore.user) {
    form.value.email = authStore.user.email
    if (authStore.profile) {
      form.value.fullName = authStore.profile.full_name || ''
      form.value.phone = authStore.profile.phone || ''
      const addr = authStore.profile.shipping_address
      if (addr && typeof addr === 'object') {
        form.value.street = addr.street || ''
        form.value.city = addr.city || ''
        form.value.state = addr.state || ''
        form.value.zip = addr.zip || ''
        form.value.country = addr.country || 'United States'
      }
    }
  }
})

function validate() {
  const errs = {}
  if (!form.value.fullName.trim()) errs.fullName = 'Full name is required'
  if (!form.value.email.trim()) {
    errs.email = 'Email address is required'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errs.email = 'Invalid email address'
  }
  if (!form.value.phone.trim()) errs.phone = 'Phone number is required'
  if (!form.value.street.trim()) errs.street = 'Street address is required'
  if (!form.value.city.trim()) errs.city = 'City is required'
  if (!form.value.state.trim()) errs.state = 'State is required'
  if (!form.value.zip.trim()) errs.zip = 'ZIP/Postal code is required'
  
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function placeOrder() {
  if (!validate() || submitting.value) return
  submitting.value = true

  try {
    // 1. Prepare Order Header
    const orderData = {
      user_id: authStore.user ? authStore.user.id : null,
      status: 'pending',
      subtotal: cartStore.subtotal,
      shipping_cost: cartStore.shippingCost,
      total: cartStore.total,
      guest_email: authStore.user ? null : form.value.email,
      shipping_details: {
        full_name: form.value.fullName,
        phone: form.value.phone,
        email: form.value.email,
        street: form.value.street,
        city: form.value.city,
        state: form.value.state,
        zip: form.value.zip,
        country: form.value.country
      }
    }

    // 2. Insert Order Header
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    // 3. Insert Order Items & Decrement Stock in parallel
    const itemInsertPromises = cartStore.items.map(async (item) => {
      const price = item.product.sale_price || item.product.price
      
      // A. Insert order line item
      const { error: lineError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: item.product.id,
          product_name: item.product.name,
          unit_price: price,
          quantity: item.quantity
        })
      if (lineError) throw lineError

      // B. Decrement stock quantity using database RPC function
      const { error: rpcError } = await supabase.rpc('decrement_product_stock', {
        product_id: item.product.id,
        qty: item.quantity
      })
      if (rpcError) throw rpcError
    })

    await Promise.all(itemInsertPromises)

    // 4. Cleanup & Redirect
    cartStore.clearCart()
    toast.success('Order placed successfully!')
    router.push({ name: 'order-confirmation', params: { orderId: order.id } })
  } catch (err) {
    console.error(err)
    toast.error(err.message || 'An error occurred while placing your order. Please check stock levels.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="checkout-container animate-fade-in">
    <h1 class="page-title">Checkout</h1>

    <div class="checkout-layout">
      <!-- Checkout Form -->
      <main class="form-column">
        <form @submit.prevent="placeOrder" class="checkout-form glass">
          <!-- Shipping section -->
          <div class="form-section">
            <h3 class="section-title">Shipping & Contact Details</h3>
            
            <div class="input-grid">
              <BaseInput
                v-model="form.fullName"
                label="Full Name"
                placeholder="John Doe"
                :error="errors.fullName"
                :disabled="submitting"
              />
              <BaseInput
                v-model="form.email"
                type="email"
                label="Email Address"
                placeholder="john@example.com"
                :error="errors.email"
                :disabled="submitting || authStore.isAuthenticated"
              />
              <BaseInput
                v-model="form.phone"
                label="Phone Number"
                placeholder="(555) 000-0000"
                :error="errors.phone"
                :disabled="submitting"
              />
            </div>
          </div>

          <!-- Address Section -->
          <div class="form-section border-none">
            <h3 class="section-title">Shipping Address</h3>
            
            <div class="input-full">
              <BaseInput
                v-model="form.street"
                label="Street Address"
                placeholder="123 Main St, Apt 4"
                :error="errors.street"
                :disabled="submitting"
              />
            </div>

            <div class="address-grid">
              <BaseInput
                v-model="form.city"
                label="City"
                placeholder="San Jose"
                :error="errors.city"
                :disabled="submitting"
              />
              <BaseInput
                v-model="form.state"
                label="State / Province"
                placeholder="CA"
                :error="errors.state"
                :disabled="submitting"
              />
              <BaseInput
                v-model="form.zip"
                label="ZIP / Postal Code"
                placeholder="95101"
                :error="errors.zip"
                :disabled="submitting"
              />
            </div>

            <div class="input-full mt-4">
              <label class="select-label">Country</label>
              <select v-model="form.country" class="country-select glass" :disabled="submitting">
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
        </form>
      </main>

      <!-- Sidebar Order summary -->
      <aside class="summary-column">
        <div class="summary-card glass">
          <h3 class="summary-title">Order Summary</h3>

          <!-- Items loop -->
          <div class="cart-items-preview">
            <div v-for="item in cartStore.items" :key="item.product.id" class="preview-item">
              <span class="item-name" :title="item.product.name">
                {{ item.quantity }}x {{ item.product.name }}
              </span>
              <span class="item-price">
                ${{ ((item.product.sale_price || item.product.price) * item.quantity).toFixed(2) }}
              </span>
            </div>
          </div>

          <div class="summary-details">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>${{ cartStore.subtotal.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span :class="{ 'free-shipping': cartStore.shippingCost === 0 }">
                {{ cartStore.shippingCost === 0 ? 'FREE' : `$${cartStore.shippingCost.toFixed(2)}` }}
              </span>
            </div>
            <div class="summary-total-row">
              <span>Total</span>
              <span>${{ cartStore.total.toFixed(2) }}</span>
            </div>
          </div>

          <BaseButton
            variant="primary"
            size="lg"
            block
            :loading="submitting"
            @click="placeOrder"
          >
            Place Order (${{ cartStore.total.toFixed(2) }})
          </BaseButton>

          <p class="terms-text">
            By placing your order, you agree to our Terms of Sale and Privacy Policy. Taxes calculated at shipping.
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.checkout-container {
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

.checkout-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 32px;
  align-items: start;
}

.checkout-form {
  padding: 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 30px;
}

.border-none {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.input-full {
  width: 100%;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
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

.mt-4 { margin-top: 16px; }

/* Summary Column */
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

.cart-items-preview {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 180px;
  overflow-y: auto;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  gap: 12px;
}
.preview-item .item-name {
  color: var(--color-text-secondary);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.preview-item .item-price {
  font-weight: 600;
  color: var(--color-text-primary);
  flex-shrink: 0;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.summary-total-row {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.free-shipping {
  color: var(--color-success);
}

.terms-text {
  margin: 0;
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.4;
  text-align: center;
}

@media (max-width: 900px) {
  .checkout-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .input-grid { grid-template-columns: 1fr; }
  .address-grid { grid-template-columns: 1fr; }
}
</style>
