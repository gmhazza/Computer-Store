<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errors = ref({})

function validate() {
  const errs = {}
  if (!email.value.trim()) {
    errs.email = 'Email address is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errs.email = 'Invalid email address'
  }
  if (!password.value) {
    errs.password = 'Password is required'
  }
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function handleLogin() {
  if (!validate() || loading.value) return
  loading.value = true

  try {
    await authStore.login(email.value, password.value)
    toast.success('Successfully logged in!')
    
    // Redirect to target route if exists, or profile page
    const redirectPath = route.query.redirect || '/'
    router.push(redirectPath)
  } catch (err) {
    console.error(err)
    toast.error(err.message || 'Failed to log in. Please check your credentials.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container animate-scale-in">
    <div class="auth-card glass">
      <div class="auth-header">
        <h1 class="auth-title">Log In</h1>
        <p class="auth-subtitle">Enter your credentials to access your profile and saved builds.</p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <BaseInput
          v-model="email"
          type="email"
          label="Email Address"
          placeholder="email@example.com"
          :error="errors.email"
          :disabled="loading"
        />

        <BaseInput
          v-model="password"
          type="password"
          label="Password"
          placeholder="••••••••"
          :error="errors.password"
          :disabled="loading"
        />

        <BaseButton
          variant="primary"
          size="lg"
          block
          :loading="loading"
          type="submit"
        >
          Sign In
        </BaseButton>
      </form>

      <div class="auth-footer">
        <p>Don't have an account? <RouterLink :to="{ name: 'register' }" class="auth-link">Register here</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 480px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  padding: 36px 30px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
}

.auth-header {
  text-align: center;
  margin-bottom: 28px;
}

.auth-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.auth-subtitle {
  margin: 0;
  font-size: 13px;
  color: var(--color-text-secondary);
  line-height: 1.4;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.auth-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-secondary);
}
.auth-footer p { margin: 0; }
.auth-link {
  color: var(--color-accent);
  font-weight: 600;
  text-decoration: none;
}
.auth-link:hover {
  text-decoration: underline;
}
</style>
