<script setup>
import { RouterLink } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
</script>

<template>
  <div class="not-found-container animate-fade-in">
    <div class="content-box glass">
      <div class="error-code">404</div>
      <h1 class="heading">Page Not Found</h1>
      <p class="desc">
        The component or system pathway you are trying to access does not exist or has been relocated to another socket.
      </p>
      
      <div class="actions">
        <RouterLink :to="{ name: 'home' }">
          <BaseButton variant="primary">Return Home</BaseButton>
        </RouterLink>
        <RouterLink :to="{ name: 'products' }">
          <BaseButton variant="ghost">Browse Products</BaseButton>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
}

.content-box {
  padding: 48px;
  border-radius: var(--radius-lg);
  max-width: 480px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-lg);
}

.error-code {
  font-size: 80px;
  font-weight: 800;
  line-height: 1;
  background: linear-gradient(135deg, var(--color-accent), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.02em;
}

.heading {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text-primary);
}

.desc {
  margin: 0 0 16px;
  font-size: 14.5px;
  color: var(--color-text-secondary);
  line-height: 1.5;
}

.actions {
  display: flex;
  gap: 16px;
}
</style>
