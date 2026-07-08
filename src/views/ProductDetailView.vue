<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import StockBadge from '@/components/product/StockBadge.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  slug: {
    type: String,
    required: true
  }
})

const route = useRoute()
const productsStore = useProductsStore()
const cartStore = useCartStore()
const toast = useToast()

const quantity = ref(1)
const relatedProducts = ref([])
const loadingRelated = ref(false)

onMounted(async () => {
  await loadProduct()
})

watch(
  () => props.slug,
  async () => {
    await loadProduct()
  }
)

async function loadProduct() {
  quantity.value = 1
  try {
    const prod = await productsStore.fetchProduct(props.slug)
    if (prod) {
      loadRelated(prod.category_id, prod.id)
    }
  } catch (err) {
    toast.error('Failed to load product details.')
  }
}

async function loadRelated(categoryId, productId) {
  loadingRelated.value = true
  try {
    const data = await productsStore.fetchRelated(categoryId, productId)
    relatedProducts.value = data
  } finally {
    loadingRelated.value = false
  }
}

const currentProduct = computed(() => productsStore.product)

const imageUrl = computed(() => {
  if (currentProduct.value?.image_url) return currentProduct.value.image_url
  return `https://placehold.co/600x450/18181b/fafafa?text=${encodeURIComponent(currentProduct.value?.name || 'Loading')}`
})

const isDiscounted = computed(() => {
  return currentProduct.value?.sale_price !== null && currentProduct.value?.sale_price < currentProduct.value?.price
})

const formattedPrice = computed(() => {
  return `$${Number(currentProduct.value?.price).toFixed(2)}`
})

const formattedSalePrice = computed(() => {
  if (!isDiscounted.value) return ''
  return `$${Number(currentProduct.value?.sale_price).toFixed(2)}`
})

function adjustQty(val) {
  const newQty = quantity.value + val
  if (newQty < 1 || newQty > currentProduct.value.stock_quantity) return
  quantity.value = newQty
}

function addToCart() {
  if (!currentProduct.value || currentProduct.value.stock_quantity <= 0) return
  cartStore.addItem(currentProduct.value, quantity.value)
  toast.success(`${currentProduct.value.name} (x${quantity.value}) added to cart!`)
}

// Convert specifications object to iterable list
const specsList = computed(() => {
  const specs = currentProduct.value?.specifications
  if (!specs || typeof specs !== 'object') return []
  return Object.entries(specs).map(([key, val]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: val
  }))
})

// Convert compatibility data object to list
const compatibilityList = computed(() => {
  const compat = currentProduct.value?.compatibility_data
  if (!compat || typeof compat !== 'object') return []
  return Object.entries(compat).map(([key, val]) => ({
    label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: val
  }))
})
</script>

<template>
  <div class="detail-container">
    <!-- Loading spinner -->
    <div v-if="productsStore.loading && !currentProduct" class="spinner-box">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Product Layout -->
    <template v-else-if="currentProduct">
      <div class="product-layout animate-fade-in">
        <!-- Image Column -->
        <div class="image-col">
          <div class="img-wrapper glass">
            <img :src="imageUrl" :alt="currentProduct.name" class="detail-image" />
            <span v-if="isDiscounted" class="sale-tag">SALE</span>
          </div>
        </div>

        <!-- Info Column -->
        <div class="info-col">
          <div class="meta-row">
            <span class="meta-item">{{ currentProduct.brands?.name || 'Brand' }}</span>
            <span class="separator">•</span>
            <span class="meta-item">{{ currentProduct.categories?.name || 'Category' }}</span>
          </div>

          <h1 class="product-title">{{ currentProduct.name }}</h1>

          <div class="price-stock-row">
            <div class="price-group">
              <span v-if="isDiscounted" class="original-price">{{ formattedPrice }}</span>
              <span class="current-price" :class="{ 'sale-price': isDiscounted }">
                {{ isDiscounted ? formattedSalePrice : formattedPrice }}
              </span>
            </div>
            <StockBadge :stock="currentProduct.stock_quantity" />
          </div>

          <p class="description">{{ currentProduct.description || 'No description available for this product.' }}</p>

          <!-- Add to Cart Widget -->
          <div class="purchase-widget glass">
            <div class="qty-control-group">
              <span class="qty-label">Quantity</span>
              <div class="qty-buttons">
                <button
                  class="qty-btn"
                  :disabled="quantity <= 1 || currentProduct.stock_quantity <= 0"
                  @click="adjustQty(-1)"
                >
                  -
                </button>
                <span class="qty-number">{{ currentProduct.stock_quantity <= 0 ? 0 : quantity }}</span>
                <button
                  class="qty-btn"
                  :disabled="quantity >= currentProduct.stock_quantity || currentProduct.stock_quantity <= 0"
                  @click="adjustQty(1)"
                >
                  +
                </button>
              </div>
            </div>

            <BaseButton
              variant="primary"
              size="lg"
              block
              :disabled="currentProduct.stock_quantity <= 0"
              @click="addToCart"
            >
              Add to Cart
            </BaseButton>
          </div>

          <!-- Compatibility Guidance advisory notes -->
          <div v-if="compatibilityList.length > 0" class="compatibility-advisory glass">
            <div class="advisory-header">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
              <h4>Compatibility Guidance</h4>
            </div>
            <p class="advisory-text">Use these parameters to ensure fitment when combining components:</p>
            <div class="compat-grid">
              <div v-for="item in compatibilityList" :key="item.label" class="compat-item">
                <span class="compat-label">{{ item.label }}:</span>
                <span class="compat-val">{{ item.value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tech Specs Section -->
      <section class="specs-section animate-slide-up">
        <h2 class="section-title">Technical Specifications</h2>
        <div v-if="specsList.length === 0" class="empty-specs glass">
          No detailed specifications listed for this product.
        </div>
        <div v-else class="specs-table glass">
          <div v-for="spec in specsList" :key="spec.label" class="specs-row">
            <span class="spec-label">{{ spec.label }}</span>
            <span class="spec-value">{{ spec.value }}</span>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section v-if="relatedProducts.length > 0" class="related-section">
        <h2 class="section-title">Related Products</h2>
        <div class="related-grid">
          <div v-for="prod in relatedProducts" :key="prod.id">
            <ProductCard :product="prod" />
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.detail-container {
  display: flex;
  flex-direction: column;
  gap: 60px;
}

.spinner-box {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 48px;
  align-items: start;
}

/* Image */
.img-wrapper {
  aspect-ratio: 4/3;
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  position: relative;
}

.detail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sale-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  background: var(--color-danger);
  color: #fafafa;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-sm);
}

/* Info */
.info-col {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}
.separator {
  color: var(--color-border);
}
.meta-item {
  font-weight: 500;
}

.product-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
}

.price-stock-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.price-group {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.original-price {
  font-size: 15px;
  text-decoration: line-through;
  color: var(--color-text-muted);
}
.current-price {
  font-size: 24px;
  font-weight: 800;
}
.sale-price {
  color: var(--color-accent);
}

.description {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary);
  line-height: 1.6;
}

/* Purchase Widget */
.purchase-widget {
  padding: 20px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.qty-control-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.qty-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
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
  width: 36px;
  height: 36px;
  cursor: pointer;
  font-size: 16px;
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
  min-width: 36px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

/* Compatibility Advisory */
.compatibility-advisory {
  padding: 16px;
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-accent);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.advisory-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.advisory-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-accent);
}
.advisory-text {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.compat-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-top: 4px;
}
.compat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.compat-label {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  font-weight: 600;
}
.compat-val {
  font-size: 12px;
  color: var(--color-text-primary);
  font-weight: 500;
}

/* Tech Specs Table */
.specs-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.section-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}
.empty-specs {
  padding: 20px;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-muted);
  text-align: center;
}
.specs-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.specs-row {
  display: grid;
  grid-template-columns: 240px 1fr;
  padding: 14px 20px;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}
.specs-row:last-child {
  border-bottom: none;
}
.spec-label {
  color: var(--color-text-secondary);
  font-weight: 500;
}
.spec-value {
  color: var(--color-text-primary);
  font-weight: 600;
}

/* Related Products */
.related-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.related-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

/* Responsive */
@media (max-width: 1024px) {
  .related-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .product-layout { grid-template-columns: 1fr; gap: 32px; }
  .related-grid { grid-template-columns: repeat(2, 1fr); }
  .specs-row { grid-template-columns: 140px 1fr; }
}

@media (max-width: 480px) {
  .product-title { font-size: 24px; }
  .related-grid { grid-template-columns: 1fr; }
  .specs-row { grid-template-columns: 1fr; gap: 4px; }
}
</style>
