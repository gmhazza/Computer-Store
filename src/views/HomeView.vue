<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useCategoriesStore } from '@/stores/categories'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/product/ProductCard.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const categoriesStore = useCategoriesStore()
const productsStore = useProductsStore()

onMounted(async () => {
  await categoriesStore.fetchCategories()
  await productsStore.fetchFeatured()
})

const features = [
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    title: 'AI Build Assistant',
    description: 'Describe your budget and gaming or work needs, and let our custom AI builder generate compatible lists.'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    title: 'Compatibility Checks',
    description: 'We run rule checks on socket fit, RAM versions, GPU clearing, and power wattage so parts fit together.'
  },
  {
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    title: 'Express Delivery',
    description: 'Fast, secure shipping with padded component protection layers so hardware arrives safely.'
  }
]

// Map categories to decorative SVG paths for a premium look
const categoryIcons = {
  cpus: '<path d="M4 4h16v16H4V4zm4 4h8v8H8V8zM2 9h2m0 3h2m0 3h2M9 2v2m3 0v2m3 0v2M18 9h2m0 3h2m0 3h2M9 18v2m3 0v2m3 0v2" stroke-width="2"/>',
  gpus: '<rect x="2" y="4" width="20" height="12" rx="2"/><circle cx="8" cy="10" r="3"/><circle cx="16" cy="10" r="3"/><path d="M2 16h20" stroke-width="2"/>',
  ram: '<rect x="2" y="6" width="20" height="8" rx="1"/><path d="M6 14v4M10 14v4M14 14v4M18 14v4M4 6v2M8 6v2M12 6v2M16 6v2M20 6v2" stroke-width="2"/>',
  motherboards: '<rect x="2" y="2" width="20" height="20" rx="2"/><rect x="6" y="6" width="6" height="6"/><path d="M16 6h2M16 10h2M6 16h12" stroke-width="2"/>',
  'storage-devices': '<rect x="3" y="2" width="18" height="20" rx="2"/><circle cx="12" cy="7" r="3"/><path d="M7 15h10M7 18h10" stroke-width="2"/>',
  'power-supplies': '<rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="3"/><path d="M14 6h4M14 10h4M10 16h4v4" stroke-width="2"/>',
  'pc-cases': '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M12 2v20M4 6h16M4 18h16" stroke-width="2"/>',
  cooling: '<circle cx="12" cy="12" r="10"/><path d="M12 2v20M2 12h20M7 7l10 10M7 17L17 7" stroke-width="2"/>',
  monitors: '<rect x="2" y="3" width="20" height="13" rx="2"/><path d="M8 21h8M12 16v5" stroke-width="2"/>',
  keyboards: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h2M11 10h2M16 10h2M8 14h8" stroke-width="2"/>',
  mice: '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 2v10M6 10h12" stroke-width="2"/>',
  headsets: '<path d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9M3 14h3v5H3v-5zm15 0h3v5h-3v-5z" stroke-width="2"/>'
}
</script>

<template>
  <div class="home-container">
    <!-- Hero Banner -->
    <section class="hero-section animate-fade-in">
      <div class="hero-content">
        <div class="glow-box">
          <span class="hero-tag">NEXT GENERATION CATALOG</span>
          <h1 class="hero-headline">Build Your Ultimate <br/><span class="gradient-text">Dream PC</span></h1>
          <p class="hero-subtext">
            Browse compatible high-performance computer parts and build configurations. Get curated component guidance powered by our smart AI assistant.
          </p>
          <div class="hero-actions">
            <RouterLink :to="{ name: 'products' }">
              <BaseButton variant="primary" size="lg">Explore Components</BaseButton>
            </RouterLink>
          </div>
        </div>
      </div>
      <div class="hero-graphics">
        <div class="graphics-glow"></div>
        <div class="pc-silhouette">
          <!-- Premium decorative wireframe computer visual -->
          <svg viewBox="0 0 300 300" class="wireframe-pc" fill="none" stroke="url(#wire-grad)" stroke-width="1.5">
            <defs>
              <linearGradient id="wire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#8b5cf6" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <!-- Case frame -->
            <rect x="50" y="30" width="200" height="240" rx="16"/>
            <line x1="220" y1="30" x2="220" y2="270" stroke-dasharray="4 4"/>
            <!-- Motherboard slot -->
            <rect x="70" y="55" width="130" height="150" rx="8" stroke-dasharray="2 2"/>
            <!-- GPU -->
            <rect class="gpu-box" x="80" y="120" width="150" height="40" rx="4"/>
            <path d="M120 140h70M80 130h150" stroke-opacity="0.6"/>
            <!-- CPU Cooler circle -->
            <circle cx="135" cy="90" r="28" stroke-dasharray="4 2"/>
            <circle cx="135" cy="90" r="12"/>
            <!-- PSU -->
            <rect x="70" y="220" width="110" height="40" rx="4"/>
            <circle cx="155" cy="240" r="10"/>
            <!-- Fans -->
            <circle cx="230" cy="80" r="16"/>
            <circle cx="230" cy="140" r="16"/>
            <circle cx="230" cy="200" r="16"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- Value Propositions -->
    <section class="features-section animate-slide-up">
      <div class="features-grid">
        <div v-for="feat in features" :key="feat.title" class="feature-card glass">
          <div class="feature-icon" v-html="feat.icon"></div>
          <h3 class="feature-title">{{ feat.title }}</h3>
          <p class="feature-description">{{ feat.description }}</p>
        </div>
      </div>
    </section>

    <!-- Categories Directory -->
    <section class="categories-section">
      <div class="section-header">
        <h2 class="section-title">Browse by <span class="gradient-text">Category</span></h2>
        <p class="section-desc">Select component segments to search stock listings.</p>
      </div>

      <div v-if="categoriesStore.loading" class="spinner-box">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else class="categories-grid">
        <RouterLink
          v-for="cat in categoriesStore.categories"
          :key="cat.id"
          :to="{ name: 'products', params: { categorySlug: cat.slug } }"
          class="category-card card card-interactive"
        >
          <div class="cat-icon-box">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              v-html="categoryIcons[cat.slug] || '<circle cx=12 cy=12 r=10 stroke-width=2/>'"
            ></svg>
          </div>
          <h3 class="cat-name">{{ cat.name }}</h3>
          <p class="cat-desc">{{ cat.description }}</p>
        </RouterLink>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured-section">
      <div class="section-header">
        <h2 class="section-title">Featured <span class="gradient-text">Gear</span></h2>
        <p class="section-desc">Curated selection of components chosen for speed, reliability, and value.</p>
      </div>

      <div v-if="productsStore.loading" class="spinner-box">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="productsStore.featuredProducts.length === 0" class="empty-featured glass">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M21 12H3M12 3v18"/></svg>
        <p>No featured products in catalog yet. Visit Admin Panel to seed or import products!</p>
      </div>

      <div v-else class="featured-grid">
        <div v-for="prod in productsStore.featuredProducts" :key="prod.id">
          <ProductCard :product="prod" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

/* Hero Section */
.hero-section {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: center;
  gap: 40px;
  padding: 20px 0;
  min-height: 480px;
}

.hero-content {
  display: flex;
  flex-direction: column;
}

.hero-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.15em;
  text-transform: uppercase;
}

.hero-headline {
  margin: 12px 0 20px;
  font-size: 48px;
  font-weight: 800;
  line-height: 1.15;
  color: var(--color-text-primary);
  letter-spacing: -0.03em;
}

.hero-subtext {
  font-size: 16px;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 520px;
  margin: 0 0 32px;
}

.hero-actions {
  display: flex;
  gap: 16px;
}

.hero-graphics {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.graphics-glow {
  position: absolute;
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, rgba(139, 92, 246, 0.1) 50%, rgba(0,0,0,0) 70%);
  filter: blur(20px);
}

.pc-silhouette {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wireframe-pc {
  width: 100%;
  height: 100%;
  animation: bounce-subtle 4s ease-in-out infinite;
}

.gpu-box {
  stroke: var(--color-accent);
  animation: pulse-glow 2.5s ease-in-out infinite;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.feature-card {
  padding: 30px 24px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feature-icon {
  width: 44px;
  height: 44px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  color: var(--color-accent);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.feature-description {
  margin: 0;
  font-size: 14px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

/* Categories Directory */
.section-header {
  margin-bottom: 32px;
}
.section-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.section-desc {
  margin: 0;
  font-size: 15px;
  color: var(--color-text-secondary);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.category-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

.cat-icon-box {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cat-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.cat-desc {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

/* Featured Products */
.featured-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.empty-featured {
  padding: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--color-text-muted);
  text-align: center;
  font-size: 14px;
  max-width: 500px;
  margin: 0 auto;
}

.spinner-box {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Responsive */
@media (max-width: 1024px) {
  .categories-grid { grid-template-columns: repeat(3, 1fr); }
  .featured-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 30px;
  }
  .hero-subtext { margin: 0 auto 32px; }
  .hero-actions { justify-content: center; }
  .features-grid { grid-template-columns: 1fr; }
  .categories-grid { grid-template-columns: repeat(2, 1fr); }
  .featured-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 480px) {
  .hero-headline { font-size: 36px; }
  .categories-grid { grid-template-columns: 1fr; }
  .featured-grid { grid-template-columns: 1fr; }
}
</style>
