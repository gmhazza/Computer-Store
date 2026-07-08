import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'
import { supabase } from '@/lib/supabase'

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
      let query = supabase
        .from('products')
        .select('*, categories(name, slug), brands(name, slug)', { count: 'exact' })
        .eq('is_active', true)

      if (f.category) query = query.eq('category_id', f.category)
      if (f.brand) query = query.eq('brand_id', f.brand)
      if (f.search) query = query.ilike('name', `%${f.search}%`)
      if (f.minPrice != null) query = query.gte('price', f.minPrice)
      if (f.maxPrice != null) query = query.lte('price', f.maxPrice)
      if (f.inStock) query = query.gt('stock_quantity', 0)

      const from = (f.page - 1) * f.perPage
      const to = from + f.perPage - 1
      query = query.order(f.sort, { ascending: f.sortDir === 'asc' }).range(from, to)

      const { data, error, count } = await query
      if (error) throw error
      products.value = data || []
      total.value = count || 0
    } finally {
      loading.value = false
    }
  }

  async function fetchProduct(slug) {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(id, name, slug), brands(id, name, slug)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      if (error) throw error
      product.value = data
      return data
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
