<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import ToastContainer from '@/components/layout/ToastContainer.vue'
import ChatWidget from '@/components/chat/ChatWidget.vue'

const route = useRoute()
const isAdminLayout = computed(() => route.meta.layout === 'admin')
</script>

<template>
  <div class="app-layout">
    <!-- Public Layout -->
    <template v-if="!isAdminLayout">
      <AppNavbar />
      <main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
      <AppFooter />
      <!-- Floating AI Chatbot Widget -->
      <ChatWidget />
    </template>

    <!-- Admin Layout -->
    <template v-else>
      <div class="admin-container">
        <router-view />
      </div>
    </template>

    <!-- Global Toast Notifications -->
    <ToastContainer />
  </div>
</template>

<style>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 40px 24px;
  box-sizing: border-box;
}

.admin-container {
  min-height: 100vh;
  background: var(--color-bg-primary);
  color: var(--color-text-primary);
}

/* Page transitions defined in main.css, matched here */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
