<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()

const mobileOpen = ref(false)
const userMenuOpen = ref(false)
const searchQuery = ref('')

const cartCount = computed(() => cartStore.itemCount)

function handleSearch() {
  if (searchQuery.value.trim()) {
    router.push({ name: 'products', query: { search: searchQuery.value.trim() } })
    searchQuery.value = ''
    mobileOpen.value = false
  }
}

function toggleUserMenu() {
  userMenuOpen.value = !userMenuOpen.value
}

async function logout() {
  await authStore.logout()
  userMenuOpen.value = false
  router.push({ name: 'home' })
}

const navLinks = [
  { name: 'Home', to: { name: 'home' } },
  { name: 'Products', to: { name: 'products' } },
]
</script>

<template>
  <header class="navbar glass">
    <div class="navbar-inner">
      <!-- Logo -->
      <RouterLink :to="{ name: 'home' }" class="logo">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="url(#logo-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <defs><linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
        <span class="logo-text">Computer<span class="gradient-text">Store</span></span>
      </RouterLink>

      <!-- Desktop Nav -->
      <nav class="nav-links">
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="nav-link"
        >
          {{ link.name }}
        </RouterLink>
      </nav>

      <!-- Search -->
      <form class="search-bar" @submit.prevent="handleSearch">
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="search-input"
        />
      </form>

      <!-- Actions -->
      <div class="nav-actions">
        <!-- Cart -->
        <RouterLink :to="{ name: 'cart' }" class="action-btn cart-btn" aria-label="Cart">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg>
          <span v-if="cartCount > 0" class="cart-badge">{{ cartCount }}</span>
        </RouterLink>

        <!-- User Menu (logged in) -->
        <div v-if="authStore.user" class="user-menu-wrapper">
          <button class="action-btn user-btn" @click="toggleUserMenu" aria-label="User menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </button>
          <Transition name="dropdown">
            <div v-if="userMenuOpen" class="user-dropdown">
              <p class="dropdown-email">{{ authStore.user.email }}</p>
              <RouterLink :to="{ name: 'profile' }" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Profile
              </RouterLink>
              <RouterLink v-if="authStore.isAdmin" :to="{ name: 'admin-dashboard' }" class="dropdown-item" @click="closeUserMenu">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Admin Panel
              </RouterLink>
              <button class="dropdown-item dropdown-logout" @click="logout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                Log Out
              </button>
            </div>
          </Transition>
        </div>

        <!-- Login (not logged in) -->
        <RouterLink v-else :to="{ name: 'login' }" class="action-btn" aria-label="Login">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
        </RouterLink>

        <!-- Mobile toggle -->
        <button class="mobile-toggle" @click="mobileOpen = !mobileOpen" aria-label="Menu">
          <svg v-if="!mobileOpen" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileOpen" class="mobile-nav">
        <form @submit.prevent="handleSearch" class="mobile-search">
          <input v-model="searchQuery" type="text" placeholder="Search products..." class="search-input" />
        </form>
        <RouterLink
          v-for="link in navLinks"
          :key="link.name"
          :to="link.to"
          class="mobile-link"
          @click="mobileOpen = false"
        >
          {{ link.name }}
        </RouterLink>
        <RouterLink v-if="!authStore.user" :to="{ name: 'login' }" class="mobile-link" @click="mobileOpen = false">Login</RouterLink>
        <RouterLink v-if="!authStore.user" :to="{ name: 'register' }" class="mobile-link" @click="mobileOpen = false">Register</RouterLink>
        <template v-if="authStore.user">
          <RouterLink :to="{ name: 'profile' }" class="mobile-link" @click="mobileOpen = false">Profile</RouterLink>
          <RouterLink v-if="authStore.isAdmin" :to="{ name: 'admin-dashboard' }" class="mobile-link" @click="mobileOpen = false">Admin Panel</RouterLink>
          <button class="mobile-link mobile-logout" @click="logout(); mobileOpen = false">Log Out</button>
        </template>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  border-bottom: 1px solid var(--color-border);
}

.navbar-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}
.logo-text {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

/* Nav Links */
.nav-links {
  display: flex;
  gap: 4px;
}
.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}

/* Search */
.search-bar {
  flex: 1;
  max-width: 400px;
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 12px;
  color: var(--color-text-muted);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 8px 14px 8px 38px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text-primary);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  outline: none;
  transition: all var(--transition-fast);
}
.search-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-subtle);
}
.search-input::placeholder {
  color: var(--color-text-muted);
}

/* Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  text-decoration: none;
}
.action-btn:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}

.cart-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 700;
  color: #09090b;
  background: var(--color-accent);
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

/* User Menu */
.user-menu-wrapper {
  position: relative;
}
.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 60;
}
.dropdown-email {
  margin: 0;
  padding: 12px 14px;
  font-size: 12px;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}
.dropdown-item:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}
.dropdown-logout {
  border-top: 1px solid var(--color-border);
  color: var(--color-danger);
}
.dropdown-logout:hover {
  background: rgba(248, 113, 113, 0.1);
  color: var(--color-danger);
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 200ms ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Mobile */
.mobile-toggle {
  display: none;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 4px;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 12px 24px 20px;
  border-top: 1px solid var(--color-border);
}
.mobile-search {
  margin-bottom: 12px;
}
.mobile-search .search-input {
  padding-left: 14px;
}
.mobile-link {
  display: block;
  padding: 12px 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border: none;
  background: none;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  border-bottom: 1px solid var(--color-border);
  transition: color var(--transition-fast);
}
.mobile-link:hover {
  color: var(--color-text-primary);
}
.mobile-logout {
  color: var(--color-danger);
  width: 100%;
}

.mobile-menu-enter-active,
.mobile-menu-leave-active {
  transition: all 250ms ease;
  overflow: hidden;
}
.mobile-menu-enter-from,
.mobile-menu-leave-to {
  opacity: 0;
  max-height: 0;
}
.mobile-menu-enter-to,
.mobile-menu-leave-from {
  max-height: 500px;
}

@media (max-width: 768px) {
  .nav-links, .search-bar { display: none; }
  .mobile-toggle { display: flex; }
  .mobile-nav { display: flex; }
  .navbar-inner { gap: 12px; }
}
</style>
