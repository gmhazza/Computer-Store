<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const categoriesStore = useCategoriesStore()
const toast = useToast()

const brands = ref([])
const loadingBrands = ref(true)

// Forms state
const categoryForm = ref({
  name: '',
  slug: '',
  description: ''
})

const brandForm = ref({
  name: '',
  slug: ''
})

const savingCategory = ref(false)
const savingBrand = ref(false)

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
    if (error) throw error
    brands.value = data || []
  } catch (err) {
    console.error(err)
  } finally {
    loadingBrands.value = false
  }
}

// Auto generate slugs
function handleCatNameInput() {
  categoryForm.value.slug = categoryForm.value.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function handleBrandNameInput() {
  brandForm.value.slug = brandForm.value.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function handleCreateCategory() {
  if (!categoryForm.value.name.trim() || !categoryForm.value.slug.trim() || savingCategory.value) return
  savingCategory.value = true

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: categoryForm.value.name.trim(),
        slug: categoryForm.value.slug.trim(),
        description: categoryForm.value.description.trim()
      })
      .select()
      .single()

    if (error) throw error
    toast.success(`Category created: ${data.name}`)
    
    // Refresh categories store list
    categoriesStore.loaded = false
    await categoriesStore.fetchCategories()

    // Reset Form
    categoryForm.value = { name: '', slug: '', description: '' }
  } catch (err) {
    console.error(err)
    toast.error('Failed to create category. Slug might already exist.')
  } finally {
    savingCategory.value = false
  }
}

async function handleCreateBrand() {
  if (!brandForm.value.name.trim() || !brandForm.value.slug.trim() || savingBrand.value) return
  savingBrand.value = true

  try {
    const { data, error } = await supabase
      .from('brands')
      .insert({
        name: brandForm.value.name.trim(),
        slug: brandForm.value.slug.trim()
      })
      .select()
      .single()

    if (error) throw error
    toast.success(`Brand created: ${data.name}`)
    
    brands.value.push(data)
    brands.value.sort((a,b) => a.name.localeCompare(b.name))

    // Reset Form
    brandForm.value = { name: '', slug: '' }
  } catch (err) {
    console.error(err)
    toast.error('Failed to create brand. Slug might already exist.')
  } finally {
    savingBrand.value = false
  }
}
</script>

<template>
  <div class="admin-layout-wrapper">
    <AdminSidebar />

    <main class="admin-main-content">
      <!-- Title -->
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Taxonomy Settings</h1>
          <p class="admin-subtitle">Add product categories and brand catalogs to classify inventory.</p>
        </div>
      </div>

      <div class="sections-grid mt-6">
        <!-- 1. CATEGORIES -->
        <div class="management-col">
          <div class="management-card glass">
            <h3 class="col-title">Create Category</h3>
            <form @submit.prevent="handleCreateCategory" class="col-form">
              <BaseInput
                v-model="categoryForm.name"
                label="Category Name"
                placeholder="Motherboards"
                :disabled="savingCategory"
                @input="handleCatNameInput"
              />
              <BaseInput
                v-model="categoryForm.slug"
                label="Slug URL"
                placeholder="motherboards"
                :disabled="savingCategory"
              />
              <BaseInput
                v-model="categoryForm.description"
                label="Description"
                placeholder="Short descriptive overview..."
                :disabled="savingCategory"
              />
              <BaseButton variant="primary" :loading="savingCategory" type="submit">
                Create Category
              </BaseButton>
            </form>
          </div>

          <div class="list-card glass mt-6">
            <h3 class="col-title">Categories List</h3>
            <div v-if="categoriesStore.loading" class="spinner-box">
              <LoadingSpinner />
            </div>
            <div v-else class="list-wrapper">
              <div v-for="cat in categoriesStore.categories" :key="cat.id" class="list-item-row">
                <div class="item-info">
                  <span class="item-name">{{ cat.name }}</span>
                  <span class="item-slug font-mono">{{ cat.slug }}</span>
                </div>
                <p class="item-desc" v-if="cat.description">{{ cat.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. BRANDS -->
        <div class="management-col">
          <div class="management-card glass">
            <h3 class="col-title">Create Brand</h3>
            <form @submit.prevent="handleCreateBrand" class="col-form">
              <BaseInput
                v-model="brandForm.name"
                label="Brand Name"
                placeholder="Corsair"
                :disabled="savingBrand"
                @input="handleBrandNameInput"
              />
              <BaseInput
                v-model="brandForm.slug"
                label="Slug URL"
                placeholder="corsair"
                :disabled="savingBrand"
              />
              <BaseButton variant="primary" :loading="savingBrand" type="submit">
                Create Brand
              </BaseButton>
            </form>
          </div>

          <div class="list-card glass mt-6">
            <h3 class="col-title">Brands List</h3>
            <div v-if="loadingBrands" class="spinner-box">
              <LoadingSpinner />
            </div>
            <div v-else class="list-wrapper">
              <div v-for="brand in brands" :key="brand.id" class="list-item-row">
                <div class="item-info">
                  <span class="item-name">{{ brand.name }}</span>
                  <span class="item-slug font-mono">{{ brand.slug }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-layout-wrapper {
  display: flex;
  min-height: 100vh;
}

.admin-main-content {
  flex: 1;
  margin-left: 240px;
  padding: 40px;
  box-sizing: border-box;
}

.admin-header {
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
  margin-bottom: 28px;
}
.admin-title { margin: 0 0 6px; font-size: 28px; font-weight: 700; }
.admin-subtitle { margin: 0; font-size: 14px; color: var(--color-text-secondary); }

.mt-6 { margin-top: 24px; }

/* Columns Grid */
.sections-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  align-items: start;
}

.management-col {
  display: flex;
  flex-direction: column;
}

.management-card, .list-card {
  padding: 24px;
  border-radius: var(--radius-lg);
}

.col-title {
  margin: 0 0 20px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.col-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* List details */
.spinner-box {
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.list-item-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.item-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.item-slug {
  font-size: 10px;
  color: var(--color-text-muted);
}
.font-mono { font-family: monospace; }

.item-desc {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

@media (max-width: 1000px) {
  .sections-grid { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main-content { margin-left: 0; padding: 24px; }
}
</style>
