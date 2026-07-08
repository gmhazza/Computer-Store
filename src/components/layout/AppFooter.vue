<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand">
          <RouterLink :to="{ name: 'home' }" class="footer-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#footer-grad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <defs><linearGradient id="footer-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#8b5cf6"/></linearGradient></defs>
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            <span>Computer<span class="gradient-text">Store</span></span>
          </RouterLink>
          <p class="footer-tagline">Your one-stop shop for PC components, builds, and accessories.</p>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h4 class="footer-heading">Shop</h4>
          <RouterLink :to="{ name: 'products' }" class="footer-link">All Products</RouterLink>
          <RouterLink :to="{ name: 'products', params: { categorySlug: 'cpus' } }" class="footer-link">CPUs</RouterLink>
          <RouterLink :to="{ name: 'products', params: { categorySlug: 'gpus' } }" class="footer-link">GPUs</RouterLink>
          <RouterLink :to="{ name: 'products', params: { categorySlug: 'ram' } }" class="footer-link">RAM</RouterLink>
          <RouterLink :to="{ name: 'products', params: { categorySlug: 'monitors' } }" class="footer-link">Monitors</RouterLink>
        </div>

        <!-- Company -->
        <div class="footer-col">
          <h4 class="footer-heading">Account</h4>
          <RouterLink :to="{ name: 'login' }" class="footer-link">Login</RouterLink>
          <RouterLink :to="{ name: 'register' }" class="footer-link">Register</RouterLink>
          <RouterLink :to="{ name: 'cart' }" class="footer-link">Cart</RouterLink>
          <RouterLink :to="{ name: 'profile' }" class="footer-link">My Orders</RouterLink>
        </div>

        <!-- Support -->
        <div class="footer-col">
          <h4 class="footer-heading">Support</h4>
          <span class="footer-link">Contact Us</span>
          <span class="footer-link">Shipping Info</span>
          <span class="footer-link">Return Policy</span>
          <span class="footer-link">FAQ</span>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ new Date().getFullYear() }} ComputerStore. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  margin-top: 80px;
}

.footer-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 48px 24px 24px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  gap: 40px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  text-decoration: none;
  margin-bottom: 12px;
}

.footer-tagline {
  font-size: 14px;
  color: var(--color-text-muted);
  line-height: 1.6;
  margin: 0;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-heading {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 4px;
}

.footer-link {
  font-size: 14px;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition-fast);
  cursor: pointer;
}
.footer-link:hover {
  color: var(--color-text-primary);
}

.footer-bottom {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
  text-align: center;
}
.footer-bottom p {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 32px;
  }
}
@media (max-width: 480px) {
  .footer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
