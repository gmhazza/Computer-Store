<script setup>
import { onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProductsStore } from '@/stores/products'
import { useCategoriesStore } from '@/stores/categories'
import ProductFilters from '@/components/product/ProductFilters.vue'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps({
  categorySlug: {
    type: String,
    default: ''
  }
})

const route = useRoute()
const productsStore = useProductsStore()
const categoriesStore = useCategoriesStore()

onMounted(async () => {
  await categoriesStore.fetchCategories()
  applyRouteParams()
})

// Binds route query/param changes to store filter values
function applyRouteParams() {
  productsStore.resetFilters()

  // 1. Category check
  if (props.categorySlug) {
    const category = categoriesStore.getCategoryBySlug(props.categorySlug)
    if (category) {
      productsStore.filters.category = category.id
    }
  }

  // 2. Search check
  if (route.query.search) {
    productsStore.filters.search = route.query.search
  }

  productsStore.fetchProducts()
}

// Watch slug or queries (like search input changes from Navbar)
watch(
  () => [props.categorySlug, route.query.search],
  () => {
    applyRouteParams()
  }
)

const activeCategoryName = computed(() => {
  if (!productsStore.filters.category) return 'All Components'
  const cat = categoriesStore.categories.find(c => c.id === productsStore.filters.category)
  return cat ? cat.name : 'Components'
})

const totalPages = computed(() => {
  return Math.ceil(productsStore.total / productsStore.filters.perPage)
})

function handleSortChange(event) {
  const [field, dir] = event.target.value.split('-')
  productsStore.filters.sort = field
  productsStore.filters.sortDir = dir
  productsStore.filters.page = 1
  productsStore.fetchProducts()
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return
  productsStore.filters.page = page
  productsStore.fetchProducts()
}

const currentSortValue = computed(() => {
  return `${productsStore.filters.sort}-${productsStore.filters.sortDir}`
})
</script>

<template>
  <div class="products-container animate-fade-in">
    <!-- Breadcrumbs / Heading -->
    <div class="products-header">
      <div>
        <h1 class="category-heading">{{ activeCategoryName }}</h1>
        <p class="results-count">Showing {{ productsStore.products.length }} of {{ productsStore.total }} items</p>
      </div>

      <!-- Sort Controls -->
      <div class="controls-row">
        <select :value="currentSortValue" class="sort-select glass" @change="handleSortChange">
          <option value="created_at-desc">Newest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>
    </div>

    <!-- Layout Grid -->
    <div class="products-layout">
      <!-- Left Filters Sidebar -->
      <aside class="sidebar-col">
        <ProductFilters />
      </aside>

      <!-- Right Products Content -->
      <main class="products-col">
        <!-- Search query helper tag -->
        <div v-if="productsStore.filters.search" class="search-tag glass">
          <span>Search query: <strong>"{{ productsStore.filters.search }}"</strong></span>
          <button class="clear-search-btn" @click="productsStore.filters.search = ''; productsStore.fetchProducts()">✕</button>
        </div>

        <!-- Skeleton Loading State -->
        <div v-if="productsStore.loading" class="grid-skeleton">
          <div v-for="i in 6" :key="i" class="card skeleton-card">
            <div class="shimmer skeleton-image"></div>
            <div class="skeleton-details">
              <div class="shimmer skeleton-line w-1/3"></div>
              <div class="shimmer skeleton-line w-3/4"></div>
              <div class="shimmer skeleton-line w-1/2"></div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="productsStore.products.length === 0" class="empty-products glass">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <h3>No products match your criteria</h3>
          <p>Try resetting some filters or search query terms to find components.</p>
        </div>

        <!-- Product Cards Grid -->
        <template v-else>
          <div class="products-grid">
            <div v-for="prod in productsStore.products" :key="prod.id">
              <ProductCard :product="prod" />
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="pagination-btn glass"
              :disabled="productsStore.filters.page === 1"
              @click="changePage(productsStore.filters.page - 1)"
            >
              Previous
            </button>
            <span class="pagination-info">Page {{ productsStore.filters.page }} of {{ totalPages }}</span>
            <button
              class="pagination-btn glass"
              :disabled="productsStore.filters.page === totalPages"
              @click="changePage(productsStore.filters.page + 1)"
            >
              Next
            </button>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>

<style scoped>
.products-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 16px;
}

.category-heading {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
}

.results-count {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.sort-select {
  padding: 8px 14px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  background-color: var(--color-bg-secondary);
}

.products-layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 32px;
  align-items: start;
}

.products-col {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.search-tag {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  font-size: 13px;
  border-radius: var(--radius-md);
  align-self: flex-start;
}
.clear-search-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px;
  display: flex;
  transition: color var(--transition-fast);
}
.clear-search-btn:hover {
  color: var(--color-text-primary);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

/* Skeletons */
.grid-skeleton {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.skeleton-card {
  height: 380px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.skeleton-image {
  aspect-ratio: 4/3;
  width: 100%;
}
.skeleton-details {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.skeleton-line {
  height: 16px;
  border-radius: var(--radius-sm);
}
.w-1-3 { width: 33%; }
.w-3-4 { width: 75%; }
.w-1-2 { width: 50%; }

/* Empty state */
.empty-products {
  padding: 64px 32px;
  border-radius: var(--radius-lg);
  text-align: center;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-products h3 {
  margin: 0;
  color: var(--color-text-primary);
}
.empty-products p {
  margin: 0;
  max-width: 360px;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination-btn {
  padding: 8px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  background: var(--color-bg-secondary);
}
.pagination-btn:hover:not(:disabled) {
  color: var(--color-text-primary);
  border-color: var(--color-border-light);
}
.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pagination-info {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* Responsive */
@media (max-width: 1024px) {
  .products-grid, .grid-skeleton { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .products-layout { grid-template-columns: 1fr; }
  .sidebar-col { display: none; } /* Hide filters on mobile for simpler MVP */
}

@media (max-width: 480px) {
  .products-grid, .grid-skeleton { grid-template-columns: 1fr; }
  .products-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
