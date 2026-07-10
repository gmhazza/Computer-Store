<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { supabase } from '@/lib/supabase'
import { useCategoriesStore } from '@/stores/categories'
import { useToast } from '@/composables/useToast'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseBadge from '@/components/ui/BaseBadge.vue'

const categoriesStore = useCategoriesStore()
const toast = useToast()

const products = ref([])
const totalProducts = ref(0)
const loading = ref(true)
const searchQuery = ref('')

const importModalOpen = ref(false)
const importFile = ref(null)
const importing = ref(false)

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await fetchProducts()
})

async function fetchProducts() {
  loading.value = true
  try {
    let query = supabase
      .from('products')
      .select('*, categories(name), brands(name)', { count: 'exact' })
      .order('created_at', { ascending: false })

    if (searchQuery.value.trim()) {
      query = query.ilike('name', `%${searchQuery.value.trim()}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    products.value = data || []
    totalProducts.value = count || 0
  } catch (err) {
    console.error(err)
    toast.error('Failed to load products list.')
  } finally {
    loading.value = false
  }
}

async function handleDelete(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) return

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error

    toast.success(`Deleted product: ${name}`)
    await fetchProducts()
  } catch (err) {
    console.error(err)
    toast.error('Failed to delete product. It may be linked to an order item.')
  }
}

// Bulk CSV Import Logic
function handleFileChange(event) {
  const files = event.target.files
  if (files.length > 0) {
    importFile.value = files[0]
  }
}

// Helper to parse CSV lines safely
function parseCSV(text) {
  const lines = text.split('\n')
  const results = []
  
  if (lines.length <= 1) return results
  
  // Header line
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    // Parse line handling values possibly containing commas wrapped in quotes
    const values = []
    let inQuotes = false
    let currentVal = ''
    
    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        values.push(currentVal.trim())
        currentVal = ''
      } else {
        currentVal += char
      }
    }
    values.push(currentVal.trim())
    
    // Build object
    const rowObj = {}
    headers.forEach((header, index) => {
      let val = values[index]
      if (val && val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1)
      }
      rowObj[header] = val
    })
    results.push(rowObj)
  }
  return results
}

async function handleCSVImport() {
  if (!importFile.value || importing.value) return
  importing.value = true

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const text = e.target.result
      const parsedRows = parseCSV(text)
      
      if (parsedRows.length === 0) {
        throw new Error('CSV file is empty or invalid.')
      }

      // We need to resolve category slugs and brand slugs to IDs.
      // Let's query all categories and brands
      const [
        { data: cats, error: catErr },
        { data: brs, error: brErr }
      ] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('brands').select('*')
      ])

      if (catErr) throw catErr
      if (brErr) throw brErr

      const catMap = {}
      cats.forEach(c => catMap[c.slug] = c.id)

      const brandMap = {}
      brs.forEach(b => brandMap[b.slug] = b.id)

      // Collect new brands to auto-create if missing
      const newBrandsToCreate = new Set()
      parsedRows.forEach(row => {
        const brandSlug = row.brand_slug
        if (brandSlug && !brandMap[brandSlug]) {
          newBrandsToCreate.add(brandSlug)
        }
      })

      // Insert new brands
      if (newBrandsToCreate.size > 0) {
        const brandsData = Array.from(newBrandsToCreate).map(slug => ({
          name: slug.toUpperCase(),
          slug: slug
        }))

        const { data: createdBrands, error: cbError } = await supabase
          .from('brands')
          .insert(brandsData)
          .select()

        if (cbError) throw cbError
        createdBrands.forEach(b => {
          brandMap[b.slug] = b.id
        })
      }

      // Map rows to Supabase product structure
      const productsToInsert = []
      const errorsList = []

      parsedRows.forEach((row, idx) => {
        const categoryId = catMap[row.category_slug]
        const brandId = brandMap[row.brand_slug]

        if (!categoryId) {
          errorsList.push(`Row ${idx + 2}: Category slug "${row.category_slug}" not found in database.`)
          return
        }
        if (!brandId) {
          errorsList.push(`Row ${idx + 2}: Brand slug "${row.brand_slug}" failed to resolve.`)
          return
        }
        if (!row.name || !row.slug || !row.price) {
          errorsList.push(`Row ${idx + 2}: Missing required fields (name, slug, price).`)
          return
        }

        productsToInsert.push({
          name: row.name,
          slug: row.slug,
          description: row.description || '',
          category_id: categoryId,
          brand_id: brandId,
          price: parseFloat(row.price),
          sale_price: row.sale_price ? parseFloat(row.sale_price) : null,
          stock_quantity: parseInt(row.stock_quantity || '0'),
          image_url: row.image_url || '',
          is_featured: row.is_featured === 'true' || row.is_featured === '1',
          is_active: row.is_active !== 'false' && row.is_active !== '0', // Default active true
          specifications: row.specifications ? JSON.parse(row.specifications) : {},
          compatibility_data: row.compatibility_data ? JSON.parse(row.compatibility_data) : {}
        })
      })

      if (errorsList.length > 0) {
        throw new Error(`Validation errors:\n${errorsList.slice(0, 3).join('\n')}\n(Total errors: ${errorsList.length})`)
      }

      if (productsToInsert.length === 0) {
        throw new Error('No valid products to insert.')
      }

      // Insert into Supabase
      const { error: insertErr } = await supabase
        .from('products')
        .insert(productsToInsert)

      if (insertErr) throw insertErr

      toast.success(`Successfully imported ${productsToInsert.length} products!`)
      importModalOpen.value = false
      importFile.value = null
      await fetchProducts()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to parse or import CSV. Please check formatting.')
    } finally {
      importing.value = false
    }
  }
  reader.readAsText(importFile.value)
}
</script>

<template>
  <div class="admin-layout-wrapper">
    <AdminSidebar />

    <main class="admin-main-content">
      <!-- Title Actions -->
      <div class="admin-header">
        <div>
          <h1 class="admin-title">Products Directory</h1>
          <p class="admin-subtitle">Manage items, stock counts, pricing tiers, and bulk imports.</p>
        </div>

        <div class="header-actions">
          <button class="import-csv-btn glass" @click="importModalOpen = true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Import CSV
          </button>
          <RouterLink :to="{ name: 'admin-product-new' }">
            <BaseButton variant="primary">Add Product</BaseButton>
          </RouterLink>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls-row glass">
        <div class="search-field">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search catalog by name..."
            class="search-input"
            @input="fetchProducts"
          />
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-card glass mt-6">
        <div v-if="loading" class="spinner-box">
          <LoadingSpinner />
        </div>

        <div v-else-if="products.length === 0" class="empty-box">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>
          <p>No products found in directory catalog.</p>
        </div>

        <div v-else class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th class="actions-th">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="prod in products" :key="prod.id">
                <td class="product-info-td">
                  <div class="product-detail-cell">
                    <span class="product-title" :title="prod.name">{{ prod.name }}</span>
                    <span class="product-slug font-mono">{{ prod.slug }}</span>
                  </div>
                </td>
                <td>{{ prod.categories?.name || 'Uncategorized' }}</td>
                <td>{{ prod.brands?.name || 'Generic' }}</td>
                <td>
                  <div class="price-cell">
                    <span :class="{ 'strike-price': prod.sale_price }">${{ Number(prod.price).toFixed(2) }}</span>
                    <span v-if="prod.sale_price" class="sale-price-txt">${{ Number(prod.sale_price).toFixed(2) }}</span>
                  </div>
                </td>
                <td>
                  <span :class="prod.stock_quantity <= 5 ? 'low-stock-text' : ''">
                    {{ prod.stock_quantity }} units
                  </span>
                </td>
                <td>
                  <BaseBadge :variant="prod.is_active ? 'success' : 'default'" size="xs">
                    {{ prod.is_active ? 'Active' : 'Hidden' }}
                  </BaseBadge>
                </td>
                <td class="actions-td">
                  <div class="actions-group">
                    <RouterLink :to="{ name: 'admin-product-edit', params: { id: prod.id } }">
                      <button class="action-btn edit-btn" title="Edit Product">Edit</button>
                    </RouterLink>
                    <button class="action-btn delete-btn" title="Delete Product" @click="handleDelete(prod.id, prod.name)">Remove</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- CSV Bulk Import Modal dialog -->
    <div v-if="importModalOpen" class="modal-overlay" @click.self="importModalOpen = false">
      <div class="modal-content glass animate-scale-in">
        <div class="modal-header">
          <h3>Bulk Product Import (CSV)</h3>
          <button class="close-btn" @click="importModalOpen = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="import-help">
            Upload a `.csv` file. Required columns: <br />
            <code class="code-block">name, slug, description, category_slug, brand_slug, price, sale_price, stock_quantity, image_url, is_featured, is_active, specifications, compatibility_data</code>
          </p>
          
          <div class="file-picker-wrapper">
            <input type="file" accept=".csv" @change="handleFileChange" class="file-input" />
          </div>

          <div class="modal-footer">
            <BaseButton variant="ghost" :disabled="importing" @click="importModalOpen = false">Cancel</BaseButton>
            <BaseButton variant="primary" :loading="importing" :disabled="!importFile" @click="handleCSVImport">
              Start Import
            </BaseButton>
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
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 20px;
  margin-bottom: 28px;
}
.admin-title { margin: 0 0 6px; font-size: 28px; font-weight: 700; }
.admin-subtitle { margin: 0; font-size: 14px; color: var(--color-text-secondary); }

.header-actions {
  display: flex;
  gap: 12px;
}

.import-csv-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-primary);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.import-csv-btn:hover {
  background: var(--color-bg-tertiary);
  border-color: var(--color-border-light);
}

/* Controls */
.controls-row {
  padding: 14px 20px;
  border-radius: var(--radius-md);
}
.search-field {
  position: relative;
  display: flex;
  align-items: center;
  max-width: 320px;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 8px 12px 8px 36px;
  font-size: 13px;
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-text-primary);
  border-radius: var(--radius-md);
  outline: none;
  font-family: inherit;
  transition: border-color var(--transition-fast);
}
.search-input:focus { border-color: var(--color-accent); }

.mt-6 { margin-top: 24px; }

/* Table style */
.table-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.spinner-box, .empty-box {
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-box {
  flex-direction: column;
  gap: 12px;
  color: var(--color-text-muted);
  font-size: 14px;
}
.table-wrapper {
  overflow-x: auto;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.data-table th {
  padding: 12px 18px;
  font-size: 11px;
  text-transform: uppercase;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
  letter-spacing: 0.05em;
}
.data-table td {
  padding: 16px 18px;
  font-size: 13px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}
.data-table tr:last-child td { border-bottom: none; }

.product-detail-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.product-title {
  font-weight: 600;
  color: var(--color-text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-width: 280px;
}
.product-slug {
  font-size: 10px;
  color: var(--color-text-muted);
}
.font-mono { font-family: monospace; }
.font-semibold { font-weight: 600; }

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.strike-price {
  text-decoration: line-through;
  color: var(--color-text-muted);
  font-size: 11px;
}
.sale-price-txt {
  color: var(--color-accent);
  font-weight: 600;
}

.low-stock-text {
  color: var(--color-warning);
  font-weight: 600;
}

.actions-th { text-align: right !important; }
.actions-td { text-align: right; }
.actions-group {
  display: inline-flex;
  gap: 8px;
}
.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  font-size: 14px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}
.action-btn:hover {
  background: var(--color-bg-tertiary);
}

/* Modal Overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}
.modal-content {
  width: 100%;
  max-width: 500px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: 24px;
  box-shadow: var(--shadow-lg);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
  margin-bottom: 16px;
}
.modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; }
.close-btn { background: none; border: none; color: var(--color-text-muted); cursor: pointer; }
.import-help {
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.5;
  margin-top: 0;
}
.code-block {
  font-family: monospace;
  background: var(--color-bg-primary);
  padding: 4px 6px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  display: block;
  margin-top: 6px;
  word-break: break-all;
}
.file-picker-wrapper {
  margin: 24px 0;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  padding: 30px;
  text-align: center;
}
.file-input {
  color: var(--color-text-secondary);
  font-size: 13px;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid var(--color-border);
  padding-top: 16px;
}

@media (max-width: 768px) {
  .admin-sidebar { display: none; }
  .admin-main-content { margin-left: 0; padding: 24px; }
  .admin-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>
