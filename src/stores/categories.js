import { defineStore } from 'pinia'
import { ref } from 'vue'


export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref([])
  const loading = ref(false)
  const loaded = ref(false)
  const API_URL = import.meta.env.VITE_BACKEND_URL

  async function fetchCategories() {
    if (loaded.value) return
    loading.value = true
    try {
      const response = await fetch(`${API_URL}/fetchcategories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || `Request failed with status ${response.status}`)
      }

      categories.value = result.categories || []
      loaded.value = true
    } catch (error) {
      console.error('fetchCategories error:', error)
    } finally {
      loading.value = false
    }
  }

  function getCategoryBySlug(slug) {
    return categories.value.find(c => c.slug === slug) || null
  }

  return { categories, loading, loaded, fetchCategories, getCategoryBySlug }
})
