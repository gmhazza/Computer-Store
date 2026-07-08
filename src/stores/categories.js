import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const loaded = ref(false)

  async function fetchCategories() {
    if (loaded.value) return
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
      if (error) throw error
      categories.value = data || []
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  function getCategoryBySlug(slug) {
    return categories.value.find(c => c.slug === slug) || null
  }

  return { categories, loading, loaded, fetchCategories, getCategoryBySlug }
})
