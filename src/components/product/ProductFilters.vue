<script setup>
import { ref, onMounted } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import { supabase } from '@/lib/supabase'

const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()

const brands = ref([])
const loadingBrands = ref(false)

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await fetchBrands()
})

async function fetchBrands() {
  loadingBrands.value = true
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name')
    if (!error && data) {
      brands.value = data
    }
  } finally {
    loadingBrands.value = false
  }
}

function handlePriceChange() {
  productsStore.filters.page = 1
  productsStore.fetchProducts()
}

function selectCategory(id) {
  productsStore.filters.category = productsStore.filters.category === id ? null : id
  productsStore.filters.page = 1
  productsStore.fetchProducts()
}

function selectBrand(id) {
  productsStore.filters.brand = productsStore.filters.brand === id ? null : id
  productsStore.filters.page = 1
  productsStore.fetchProducts()
}

function toggleInStock() {
  productsStore.filters.inStock = !productsStore.filters.inStock
  productsStore.filters.page = 1
  productsStore.fetchProducts()
}

function resetAll() {
  productsStore.resetFilters()
  productsStore.fetchProducts()
}
</script>

<template>
  <div class="filters-sidebar glass">
    <div class="filter-header">
      <h3 class="filter-title">Filters</h3>
      <button class="reset-btn" @click="resetAll">Reset All</button>
    </div>

    <!-- Categories -->
    <div class="filter-section">
      <h4 class="section-title">Categories</h4>
      <div v-if="categoriesStore.loading" class="skeleton-list">
        <span class="shimmer skeleton-item" v-for="i in 5" :key="i"></span>
      </div>
      <div v-else class="list-group">
        <button
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          class="list-item"
          :class="{ 'item-active': productsStore.filters.category === cat.id }"
          @click="selectCategory(cat.id)"
        >
          {{ cat.name }}
          <span v-if="productsStore.filters.category === cat.id" class="check">✓</span>
        </button>
      </div>
    </div>

    <!-- Brands -->
    <div class="filter-section">
      <h4 class="section-title">Brands</h4>
      <div v-if="loadingBrands" class="skeleton-list">
        <span class="shimmer skeleton-item" v-for="i in 4" :key="i"></span>
      </div>
      <div v-else-if="brands.length === 0" class="empty-text">
        No brands found
      </div>
      <div v-else class="list-group">
        <button
          v-for="brand in brands"
          :key="brand.id"
          class="list-item"
          :class="{ 'item-active': productsStore.filters.brand === brand.id }"
          @click="selectBrand(brand.id)"
        >
          {{ brand.name }}
          <span v-if="productsStore.filters.brand === brand.id" class="check">✓</span>
        </button>
      </div>
    </div>

    <!-- Price Range -->
    <div class="filter-section">
      <h4 class="section-title">Price Range</h4>
      <div class="price-inputs">
        <div class="price-field">
          <span class="currency">$</span>
          <input
            v-model.number="productsStore.filters.minPrice"
            type="number"
            placeholder="Min"
            class="price-input"
            @change="handlePriceChange"
          />
        </div>
        <span class="separator">-</span>
        <div class="price-field">
          <span class="currency">$</span>
          <input
            v-model.number="productsStore.filters.maxPrice"
            type="number"
            placeholder="Max"
            class="price-input"
            @change="handlePriceChange"
          />
        </div>
      </div>
    </div>

    <!-- Availability -->
    <div class="filter-section border-none">
      <label class="checkbox-label">
        <input
          type="checkbox"
          :checked="productsStore.filters.inStock"
          class="checkbox-input"
          @change="toggleInStock"
        />
        <span class="checkbox-box"></span>
        <span class="checkbox-text">In Stock Only</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
.filters-sidebar {
  padding: 20px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.filter-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.reset-btn {
  background: none;
  border: none;
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}
.reset-btn:hover {
  background: var(--color-accent-subtle);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
}

.border-none {
  border-bottom: none;
  padding-bottom: 0;
}

.section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.list-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  text-align: left;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-family: inherit;
  transition: all var(--transition-fast);
}
.list-item:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-secondary);
}
.item-active {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
  font-weight: 600;
}

.check {
  font-size: 12px;
}

.empty-text {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-field {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
}

.currency {
  position: absolute;
  left: 10px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.price-input {
  width: 100%;
  padding: 8px 8px 8px 22px;
  font-size: 13px;
  font-family: inherit;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color var(--transition-fast);
}
.price-input:focus {
  border-color: var(--color-accent);
}

/* Remove number spinner buttons */
.price-input::-webkit-outer-spin-button,
.price-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.separator {
  color: var(--color-text-muted);
}

/* Checkbox option */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-input {
  display: none;
}

.checkbox-box {
  width: 18px;
  height: 18px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  background: var(--color-bg-primary);
  flex-shrink: 0;
}
.checkbox-input:checked + .checkbox-box {
  border-color: var(--color-accent);
  background: var(--color-accent);
}
.checkbox-box::after {
  content: '';
  width: 5px;
  height: 9px;
  border: solid #09090b;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-1px, -1px);
  opacity: 0;
}
.checkbox-input:checked + .checkbox-box::after {
  opacity: 1;
}

.checkbox-text {
  font-size: 14px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}
.checkbox-label:hover .checkbox-text {
  color: var(--color-text-primary);
}

/* Skeleton loader */
.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.skeleton-item {
  height: 32px;
  width: 100%;
}
</style>
