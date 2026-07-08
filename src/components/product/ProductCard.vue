<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/composables/useToast'
import StockBadge from './StockBadge.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const cartStore = useCartStore()
const toast = useToast()

const categoryName = computed(() => props.product.categories?.name || 'Category')
const brandName = computed(() => props.product.brands?.name || 'Brand')

const imageUrl = computed(() => {
  if (props.product.image_url) return props.product.image_url
  // Dynamic placeholder with brand & category info
  return `https://placehold.co/400x300/18181b/fafafa?text=${encodeURIComponent(props.product.name)}`
})

const isDiscounted = computed(() => {
  return props.product.sale_price !== null && props.product.sale_price < props.product.price
})

const formattedPrice = computed(() => {
  return `$${Number(props.product.price).toFixed(2)}`
})

const formattedSalePrice = computed(() => {
  if (!isDiscounted.value) return ''
  return `$${Number(props.product.sale_price).toFixed(2)}`
})

function addToCart() {
  if (props.product.stock_quantity <= 0) return
  cartStore.addItem(props.product)
  toast.success(`${props.product.name} added to cart!`)
}
</script>

<template>
  <div class="product-card card card-interactive">
    <!-- Image -->
    <RouterLink :to="{ name: 'product-detail', params: { slug: props.product.slug } }" class="image-wrapper">
      <img :src="imageUrl" :alt="props.product.name" class="product-image" loading="lazy" />
      <span v-if="isDiscounted" class="sale-badge">SALE</span>
    </RouterLink>

    <!-- Details -->
    <div class="product-details">
      <div class="meta-row">
        <span class="meta-tag">{{ brandName }}</span>
        <span class="meta-separator">•</span>
        <span class="meta-tag">{{ categoryName }}</span>
      </div>

      <RouterLink :to="{ name: 'product-detail', params: { slug: props.product.slug } }" class="product-title-link">
        <h3 class="product-title" :title="props.product.name">{{ props.product.name }}</h3>
      </RouterLink>

      <div class="status-price-row">
        <StockBadge :stock="props.product.stock_quantity" />
        <div class="price-group">
          <span v-if="isDiscounted" class="original-price">{{ formattedPrice }}</span>
          <span class="current-price" :class="{ 'sale-price-text': isDiscounted }">
            {{ isDiscounted ? formattedSalePrice : formattedPrice }}
          </span>
        </div>
      </div>

      <!-- Action -->
      <BaseButton
        variant="primary"
        size="sm"
        block
        :disabled="props.product.stock_quantity <= 0"
        @click="addToCart"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
        Add to Cart
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.image-wrapper {
  position: relative;
  aspect-ratio: 4/3;
  width: 100%;
  background: var(--color-bg-primary);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
  display: block;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}
.image-wrapper:hover .product-image {
  transform: scale(1.04);
}

.sale-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: var(--color-danger);
  color: #fafafa;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  letter-spacing: 0.05em;
}

.product-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text-muted);
}
.meta-tag {
  font-weight: 500;
}
.meta-separator {
  color: var(--color-border-light);
}

.product-title-link {
  text-decoration: none;
  color: inherit;
}
.product-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.4;
  height: 42px; /* Two line height constraint */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color var(--transition-fast);
}
.product-title-link:hover .product-title {
  color: var(--color-accent);
}

.status-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.price-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.original-price {
  font-size: 11px;
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.current-price {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.sale-price-text {
  color: var(--color-accent);
}
</style>
