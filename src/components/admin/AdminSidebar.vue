<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push({ name: 'home' })
}

const menuItems = [
  {
    name: 'Dashboard',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>',
    to: { name: 'admin-dashboard' }
  },
  {
    name: 'Products',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    to: { name: 'admin-products' }
  },
  {
    name: 'Orders',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    to: { name: 'admin-orders' }
  },
  {
    name: 'Categories',
    icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    to: { name: 'admin-categories' }
  }
]
</script>

<template>
  <aside class="admin-sidebar border-r">
    <!-- Header Logo -->
    <div class="logo-area">
      <RouterLink :to="{ name: 'home' }" class="logo">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="url(#admin-logo-grad)" stroke-width="2.5">
          <defs><linearGradient id="admin-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
          <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
        </svg>
        <span class="logo-text">Admin<span class="gradient-text">Store</span></span>
      </RouterLink>
    </div>

    <!-- User Profile -->
    <div class="profile-block">
      <div class="avatar">
        {{ authStore.profile?.full_name ? authStore.profile.full_name.charAt(0).toUpperCase() : 'A' }}
      </div>
      <div class="info">
        <h4 class="name">{{ authStore.profile?.full_name || 'Admin User' }}</h4>
        <span class="tag">System Admin</span>
      </div>
    </div>

    <!-- Navigation List -->
    <nav class="sidebar-nav">
      <RouterLink
        v-for="item in menuItems"
        :key="item.name"
        :to="item.to"
        class="nav-link"
      >
        <span class="icon" v-html="item.icon"></span>
        {{ item.name }}
      </RouterLink>
    </nav>

    <!-- Footer Actions -->
    <div class="sidebar-footer">
      <RouterLink :to="{ name: 'home' }" class="footer-btn text-cyan">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Storefront
      </RouterLink>
      <button class="footer-btn text-danger" @click="handleLogout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        Log Out
      </button>
    </div>
  </aside>
</template>

<style scoped>
.admin-sidebar {
  width: 240px;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  background: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.logo-area {
  padding: 24px;
  border-bottom: 1px solid var(--color-border);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}
.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* Profile block */
.profile-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--color-accent-subtle);
  border: 1.5px solid var(--color-accent);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}
.info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}
.name {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
}
.tag {
  font-size: 10px;
  color: var(--color-text-muted);
}

/* Nav */
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 20px 16px;
  flex: 1;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}
.nav-link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-tertiary);
}
.nav-link.router-link-active {
  color: var(--color-accent);
  background: var(--color-accent-subtle);
  font-weight: 600;
}
.icon {
  display: flex;
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: var(--radius-sm);
  font-family: inherit;
  transition: background var(--transition-fast);
  text-decoration: none;
  text-align: left;
}
.footer-btn:hover {
  background: var(--color-bg-tertiary);
}

.text-cyan { color: var(--color-accent); }
.text-danger { color: var(--color-danger); }
</style>
