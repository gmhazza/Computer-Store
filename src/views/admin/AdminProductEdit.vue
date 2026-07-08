<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const props = defineProps({
  id: {
    type: String,
    default: ''
  }
})

const router = useRouter()
const route = useRoute()
const categoriesStore = useCategoriesStore()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)

const isEditMode = computed(() => !!props.id)

// Brands list
const brands = ref([])
const newBrandName = ref('')
const brandModalOpen = ref(false)

// Specifications array (key-value pair mappings for UI)
const specs = ref([
  { key: 'model', val: '' },
  { key: 'tdp', val: '' }
])

// Compatibility parameters array
const compats = ref([
  { key: 'socket_type', val: '' },
  { key: 'ram_type', val: '' }
])

// Form state
const form = ref({
  name: '',
  slug: '',
  description: '',
  category_id: '',
  brand_id: '',
  price: 0,
  sale_price: null,
  stock_quantity: 0,
  image_url: '',
  is_featured: false,
  is_active: true
})

const errors = ref({})

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await fetchBrands()
  if (isEditMode.value) {
    await fetchProductDetails()
  }
})

// Auto generate slug from name in creation mode
watch(
  () => form.value.name,
  (newVal) => {
    if (!isEditMode.value) {
      form.value.slug = newVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
    }
  }
)

async function fetchBrands() {
  const { data, error } = await supabase
    .from('brands')
    .select('*')
    .order('name')
  if (!error && data) {
    brands.value = data
  }
}

async function fetchProductDetails() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', props.id)
      .single()
    if (error) throw error

    form.value.name = data.name
    form.value.slug = data.slug
    form.value.description = data.description || ''
    form.value.category_id = data.category_id
    form.value.brand_id = data.brand_id
    form.value.price = Number(data.price)
    form.value.sale_price = data.sale_price !== null ? Number(data.sale_price) : null
    form.value.stock_quantity = data.stock_quantity
    form.value.image_url = data.image_url || ''
    form.value.is_featured = data.is_featured
    form.value.is_active = data.is_active

    // Load specs JSON -> Array mapping
    if (data.specifications && typeof data.specifications === 'object') {
      const arr = Object.entries(data.specifications).map(([k, v]) => ({ key: k, val: v }))
      if (arr.length > 0) specs.value = arr
    }

    // Load compatibility JSON -> Array mapping
    if (data.compatibility_data && typeof data.compatibility_data === 'object') {
      const arr = Object.entries(data.compatibility_data).map(([k, v]) => ({ key: k, val: v }))
      if (arr.length > 0) compats.value = arr
    }

  } catch (err) {
    console.error(err)
    toast.error('Failed to load product details.')
  } finally {
    loading.value = false
  }
}

async function handleAddBrand() {
  if (!newBrandName.value.trim()) return
  const slug = newBrandName.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
  
  try {
    const { data, error } = await supabase
      .from('brands')
      .insert({ name: newBrandName.value.trim(), slug })
      .select()
      .single()
    if (error) throw error

    toast.success(`Brand created: ${data.name}`)
    brands.value.push(data)
    form.value.brand_id = data.id
    newBrandName.value = ''
    brandModalOpen.value = false
  } catch (err) {
    console.error(err)
    toast.error('Failed to create new brand.')
  }
}

function validate() {
  const errs = {}
  if (!form.value.name.trim()) errs.name = 'Product name is required'
  if (!form.value.slug.trim()) errs.slug = 'Slug is required'
  if (!form.value.category_id) errs.category_id = 'Category selection is required'
  if (!form.value.brand_id) errs.brand_id = 'Brand selection is required'
  if (form.value.price === null || form.value.price < 0) errs.price = 'Valid price is required'
  if (form.value.stock_quantity === null || form.value.stock_quantity < 0) errs.stock_quantity = 'Stock quantity is required'
  
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function handleSave() {
  if (!validate() || saving.value) return
  saving.value = true

  try {
    // 1. Pack specifications array -> JSON
    const specsJson = {}
    specs.value.forEach(s => {
      if (s.key.trim()) {
        specsJson[s.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_')] = s.val
      }
    })

    // 2. Pack compatibility array -> JSON
    const compatJson = {}
    compats.value.forEach(c => {
      if (c.key.trim()) {
        compatJson[c.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_')] = c.val
      }
    })

    const payload = {
      name: form.value.name,
      slug: form.value.slug,
      description: form.value.description,
      category_id: form.value.category_id,
      brand_id: form.value.brand_id,
      price: parseFloat(form.value.price),
      sale_price: form.value.sale_price !== '' && form.value.sale_price !== null ? parseFloat(form.value.sale_price) : null,
      stock_quantity: parseInt(form.value.stock_quantity),
      image_url: form.value.image_url,
      is_featured: form.value.is_featured,
      is_active: form.value.is_active,
      specifications: specsJson,
      compatibility_data: compatJson
    }

    if (isEditMode.value) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', props.id)
      if (error) throw error
      toast.success('Product updated successfully!')
    } else {
      const { error } = await supabase
        .from('products')
        .insert(payload)
      if (error) throw error
      toast.success('Product added successfully!')
    }

    router.push({ name: 'admin-products' })
  } catch (err) {
    console.error(err)
    toast.error(err.message || 'Failed to save product details.')
  } finally {
    saving.value = false
  }
}

// Specs rows manipulations
function addSpecRow() {
  specs.value.push({ key: '', val: '' })
}
function removeSpecRow(index) {
  specs.value.splice(index, 1)
}

// Compat rows manipulations
function addCompatRow() {
  compats.value.push({ key: '', val: '' })
}
function removeCompatRow(index) {
  compats.value.splice(index, 1)
}
</script>

<template>
  <div class="admin-layout-wrapper">
    <AdminSidebar />

    <main class="admin-main-content">
      <!-- Title -->
      <div class="admin-header">
        <div>
          <h1 class="admin-title">{{ isEditMode ? 'Edit Product' : 'Add New Product' }}</h1>
          <p class="admin-subtitle">Update catalog descriptors, compatibility bounds, and technical attributes.</p>
        </div>
      </div>

      <!-- Spinner loading details -->
      <div v-if="loading" class="spinner-box">
        <LoadingSpinner />
      </div>

      <!-- Form Card -->
      <form v-else @submit.prevent="handleSave" class="form-container animate-fade-in">
        <!-- Part 1: Primary Details -->
        <section class="form-card glass">
          <h3 class="section-title">Primary Attributes</h3>
          
          <div class="input-grid-2">
            <BaseInput
              v-model="form.name"
              label="Product Name"
              placeholder="AMD Ryzen 7 7800X3D"
              :error="errors.name"
              :disabled="saving"
            />
            <BaseInput
              v-model="form.slug"
              label="Slug URL"
              placeholder="amd-ryzen-7-7800x3d"
              :error="errors.slug"
              :disabled="saving || isEditMode"
            />
          </div>

          <div class="input-full mt-4">
            <label class="input-label">Description</label>
            <textarea
              v-model="form.description"
              placeholder="Write a descriptive overview of the component..."
              class="desc-textarea glass"
              :disabled="saving"
              rows="4"
            ></textarea>
          </div>
        </section>

        <!-- Part 2: Categories, Brands, Price, and Stock -->
        <section class="form-card glass">
          <h3 class="section-title">Category, Inventory & Pricing</h3>

          <div class="input-grid-4">
            <!-- Category -->
            <div>
              <label class="input-label">Category</label>
              <select v-model="form.category_id" class="select-field glass" :disabled="saving">
                <option value="">Select Category</option>
                <option v-for="cat in categoriesStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <span v-if="errors.category_id" class="error-msg">{{ errors.category_id }}</span>
            </div>

            <!-- Brand -->
            <div>
              <label class="input-label">Brand</label>
              <div class="brand-select-group">
                <select v-model="form.brand_id" class="select-field glass" :disabled="saving">
                  <option value="">Select Brand</option>
                  <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                    {{ brand.name }}
                  </option>
                </select>
                <button type="button" class="add-brand-inline-btn" @click="brandModalOpen = true">+</button>
              </div>
              <span v-if="errors.brand_id" class="error-msg">{{ errors.brand_id }}</span>
            </div>

            <!-- Price -->
            <BaseInput
              v-model.number="form.price"
              type="number"
              label="Price ($)"
              placeholder="399.99"
              :error="errors.price"
              :disabled="saving"
            />

            <!-- Sale Price -->
            <BaseInput
              v-model.number="form.sale_price"
              type="number"
              label="Sale Price ($ - Optional)"
              placeholder="349.99"
              :disabled="saving"
            />
          </div>

          <div class="input-grid-2 mt-4">
            <!-- Stock -->
            <BaseInput
              v-model.number="form.stock_quantity"
              type="number"
              label="Stock Quantity"
              placeholder="25"
              :error="errors.stock_quantity"
              :disabled="saving"
            />

            <!-- Image URL -->
            <BaseInput
              v-model="form.image_url"
              label="Image URL"
              placeholder="https://example.com/image.jpg"
              :disabled="saving"
            />
          </div>

          <!-- Feature Toggles -->
          <div class="checkbox-row mt-4">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_featured" class="checkbox-input" />
              <span class="checkbox-box"></span>
              <span class="checkbox-text">Mark as Featured (show on home page)</span>
            </label>

            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_active" class="checkbox-input" />
              <span class="checkbox-box"></span>
              <span class="checkbox-text">Component Active (visible to customers)</span>
            </label>
          </div>
        </section>

        <!-- Part 3: Technical Specifications JSON creator -->
        <section class="form-card glass">
          <div class="section-header-row">
            <h3 class="section-title">Technical Specifications</h3>
            <button type="button" class="add-row-btn" @click="addSpecRow">+ Add Spec</button>
          </div>
          
          <div class="key-value-list">
            <div v-for="(spec, index) in specs" :key="index" class="key-value-row">
              <input
                v-model="spec.key"
                type="text"
                placeholder="Attribute (e.g. core_clock)"
                class="row-input glass font-mono text-xs"
                :disabled="saving"
              />
              <input
                v-model="spec.val"
                type="text"
                placeholder="Value (e.g. 4.2 GHz)"
                class="row-input glass"
                :disabled="saving"
              />
              <button type="button" class="remove-row-btn" @click="removeSpecRow(index)">✕</button>
            </div>
          </div>
        </section>

        <!-- Part 4: Compatibility Guidance parameters creator -->
        <section class="form-card glass">
          <div class="section-header-row">
            <h3 class="section-title">Compatibility Parameters</h3>
            <button type="button" class="add-row-btn" @click="addCompatRow">+ Add Parameter</button>
          </div>
          
          <div class="key-value-list">
            <div v-for="(compat, index) in compats" :key="index" class="key-value-row">
              <input
                v-model="compat.key"
                type="text"
                placeholder="Parameter Name (e.g. socket_type)"
                class="row-input glass font-mono text-xs"
                :disabled="saving"
              />
              <input
                v-model="compat.val"
                type="text"
                placeholder="Value (e.g. AM5)"
                class="row-input glass"
                :disabled="saving"
              />
              <button type="button" class="remove-row-btn" @click="removeCompatRow(index)">✕</button>
            </div>
          </div>
        </section>

        <!-- Save Form Actions -->
        <div class="form-actions">
          <RouterLink :to="{ name: 'admin-products' }">
            <BaseButton variant="ghost" :disabled="saving">Cancel</BaseButton>
          </RouterLink>
          <BaseButton variant="primary" :loading="saving" type="submit">
            Save Product
          </BaseButton>
        </div>
      </form>
    </main>

    <!-- Create brand inline dialog modal -->
    <div v-if="brandModalOpen" class="modal-overlay" @click.self="brandModalOpen = false">
      <div class="modal-content glass animate-scale-in" style="max-width: 380px;">
        <div class="modal-header">
          <h3>Create Brand</h3>
          <button class="close-btn" @click="brandModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <BaseInput v-model="newBrandName" label="Brand Name" placeholder="e.g. ASUS" />
          <div class="modal-footer">
            <BaseButton variant="ghost" @click="brandModalOpen = false">Cancel</BaseButton>
            <BaseButton variant="primary" :disabled="!newBrandName.trim()" @click="handleAddBrand">Create</BaseButton>
          </div>
        </div>
      </div>
    </div>
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

.spinner-box {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Form cards */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-card {
  padding: 24px;
  border-radius: var(--radius-lg);
}

.section-title {
  margin: 0 0 20px;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.input-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.input-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.input-full { width: 100%; }

.mt-4 { margin-top: 16px; }

.input-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  display: block;
  margin-bottom: 6px;
}

.desc-textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  outline: none;
  resize: vertical;
  transition: border-color var(--transition-fast);
  box-sizing: border-box;
}
.desc-textarea:focus { border-color: var(--color-accent); }

/* Category and Brand selects */
.select-field {
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-primary);
  border-radius: var(--radius-md);
  outline: none;
  cursor: pointer;
  box-sizing: border-box;
}

.brand-select-group {
  display: flex;
  gap: 8px;
}
.add-brand-inline-btn {
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-md);
  padding: 0 14px;
}
.add-brand-inline-btn:hover {
  background: var(--color-border-light);
}

.error-msg {
  font-size: 12px;
  color: var(--color-danger);
  margin-top: 4px;
  display: block;
}

/* Checkboxes */
.checkbox-row {
  display: flex;
  gap: 30px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}
.checkbox-input { display: none; }
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
}
.checkbox-input:checked + .checkbox-box {
  border-color: var(--color-accent);
  background: var(--color-accent);
}
.checkbox-box::after {
  content: '';
  width: 4px;
  height: 8px;
  border: solid #09090b;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg) translate(-0.5px, -0.5px);
  opacity: 0;
}
.checkbox-input:checked + .checkbox-box::after { opacity: 1; }
.checkbox-text { font-size: 13px; color: var(--color-text-secondary); }

/* Specifications list */
.section-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 20px;
}
.section-header-row .section-title { border-bottom: none; margin-bottom: 0; }
.add-row-btn {
  background: var(--color-accent-subtle);
  border: 1px solid var(--color-accent);
  color: var(--color-accent);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.add-row-btn:hover { background: var(--color-accent); color: #09090b; }

.key-value-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.key-value-row {
  display: grid;
  grid-template-columns: 240px 1fr 40px;
  gap: 16px;
  align-items: center;
}
.row-input {
  width: 100%;
  padding: 10px 14px;
  font-size: 13px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  outline: none;
  font-family: inherit;
}
.row-input:focus { border-color: var(--color-accent); }
.font-mono { font-family: monospace; }
.text-xs { font-size: 11px; }

.remove-row-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 16px;
  padding: 6px;
  border-radius: var(--radius-sm);
}
.remove-row-btn:hover { color: var(--color-danger); background: rgba(248,113,113,0.1); }

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 16px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
}
.modal-content {
  width: 100%;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: 24px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 16px;
}
.close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
  margin-top: 20px;
}

@media (max-width: 1000px) {
  .input-grid-4 { grid-template-columns: repeat(2, 1fr); }
  .key-value-row { grid-template-columns: 180px 1fr 40px; }
}

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main-content { margin-left: 0; padding: 24px; }
  .input-grid-2 { grid-template-columns: 1fr; }
  .input-grid-4 { grid-template-columns: 1fr; }
  .key-value-row { grid-template-columns: 1fr 1fr 40px; }
}
</style>
