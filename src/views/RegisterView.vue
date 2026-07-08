<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref({})

function validate() {
  const errs = {}
  if (!fullName.value.trim()) errs.fullName = 'Full name is required'
  if (!email.value.trim()) {
    errs.email = 'Email address is required'
  } else if (!/\S+@\S+\.\S+/.test(email.value)) {
    errs.email = 'Invalid email address'
  }
  if (!password.value) {
    errs.password = 'Password is required'
  } else if (password.value.length < 6) {
    errs.password = 'Password must be at least 6 characters'
  }
  if (password.value !== confirmPassword.value) {
    errs.confirmPassword = 'Passwords do not match'
  }
  
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function handleRegister() {
  if (!validate() || loading.value) return
  loading.value = true

  try {
    await authStore.register(email.value, password.value, fullName.value)
    toast.success('Registration successful!')
    router.push({ name: 'home' })
  } catch (err) {
    console.error(err)
    toast.error(err.message || 'Failed to register account. Check values.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-container animate-scale-in">
    <div class="auth-card glass">
      <div class="auth-header">
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Register to manage orders and checkout faster.</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <BaseInput
          v-model="fullName"
          label="Full Name"
          placeholder="John Doe"
          :error="errors.fullName"
          :disabled="loading"
        />

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
          placeholder="At least 6 characters"
          :error="errors.password"
          :disabled="loading"
        />

        <BaseInput
          v-model="confirmPassword"
          type="password"
          label="Confirm Password"
          placeholder="Re-enter password"
          :error="errors.confirmPassword"
          :disabled="loading"
        />

        <BaseButton
          variant="primary"
          size="lg"
          block
          :loading="loading"
          type="submit"
        >
          Create Account
        </BaseButton>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <RouterLink :to="{ name: 'login' }" class="auth-link">Log In</RouterLink></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 520px;
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
  gap: 18px;
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
