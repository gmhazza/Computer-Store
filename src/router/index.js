import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
  },
  {
    path: '/products/:categorySlug?',
    name: 'products',
    component: () => import('@/views/ProductsView.vue'),
    props: true,
  },
  {
    path: '/product/:slug',
    name: 'product-detail',
    component: () => import('@/views/ProductDetailView.vue'),
    props: true,
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('@/views/CartView.vue'),
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: () => import('@/views/CheckoutView.vue'),
  },
  {
    path: '/order-confirmation/:orderId',
    name: 'order-confirmation',
    component: () => import('@/views/OrderConfirmationView.vue'),
    props: true,
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { requiresAuth: true },
  },
  
  // Admin Routes
  {
    path: '/admin',
    meta: { requiresAdmin: true, layout: 'admin' },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/AdminDashboard.vue'),
      },
      {
        path: 'products',
        name: 'admin-products',
        component: () => import('@/views/admin/AdminProducts.vue'),
      },
      {
        path: 'products/new',
        name: 'admin-product-new',
        component: () => import('@/views/admin/AdminProductEdit.vue'),
      },
      {
        path: 'products/:id/edit',
        name: 'admin-product-edit',
        component: () => import('@/views/admin/AdminProductEdit.vue'),
        props: true,
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: () => import('@/views/admin/AdminOrders.vue'),
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('@/views/admin/AdminCategories.vue'),
      },
    ]
  },
  
  // 404 Route
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Wait for auth initialization if it hasn't completed
  if (authStore.loading) {
    // A quick poll or resolution helper. But initialize() is called on app load.
    // We can directly await profile verification if authStore is in loading state
    let checkCount = 0
    while (authStore.loading && checkCount < 10) {
      await new Promise(r => setTimeout(r, 100))
      checkCount++
    }
  }

  const isAuth = authStore.isAuthenticated
  const isAdmin = authStore.isAdmin

  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!isAuth) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else if (!isAdmin) {
      next({ name: 'home' }) // Unauthorized redirect
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuth) {
      next({ name: 'login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isAuth) {
      next({ name: 'home' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router