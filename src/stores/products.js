import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { supabase } from '@/lib/supabase'


const API_URL = import.meta.env.VITE_BACKEND_URL

export const useProductsStore = defineStore('products', () => {
  const products = ref([])
  const product = ref(null)
  const featuredProducts = ref([])
  const total = ref(0)
  const loading = ref(false)

  const filters = reactive({
    category: null,
    brand: null,
    search: '',
    minPrice: null,
    maxPrice: null,
    inStock: false,
    sort: 'created_at',
    sortDir: 'desc',
    page: 1,
    perPage: 12,
  })

async function fetchProducts(customFilters = {}) {
  loading.value = true
  try {
    const f = { ...filters, ...customFilters }

    const response = await fetch(`${API_URL}/fetchallproducts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(f),
    })

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const result = await response.json()
    if (!result.success) throw new Error(result.error || 'Failed to fetch products')

    products.value = result.products || []
    total.value = result.total || 0
  } catch (error) {
    console.error('fetchProducts error:', error)
    products.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

async function fetchProduct(slug) {
  loading.value = true
  try {
    const response = await fetch(`${API_URL}/fetchproduct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error || `Request failed with status ${response.status}`)
    }

    product.value = result.product
    return result.product
  } catch (error) {
    console.error('fetchProduct error:', error)
    product.value = null
    return null
  } finally {
    loading.value = false
  }
}

  async function fetchFeatured() {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(8)
    if (!error) {
      featuredProducts.value = data || []
    }
  }

  async function fetchRelated(categoryId, excludeId, limit = 4) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug), brands(name, slug)')
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .neq('id', excludeId)
      .order('is_featured', { ascending: false })
      .limit(limit)
    if (!error) return data || []
    return []
  }

  function resetFilters() {
    filters.category = null
    filters.brand = null
    filters.search = ''
    filters.minPrice = null
    filters.maxPrice = null
    filters.inStock = false
    filters.sort = 'created_at'
    filters.sortDir = 'desc'
    filters.page = 1
  }

  return {
    products, product, featuredProducts, total, loading, filters,
    fetchProducts, fetchProduct, fetchFeatured, fetchRelated, resetFilters
  }
})
