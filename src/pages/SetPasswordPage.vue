<template>
  <q-page class="flex row flex-center">
    <q-card class="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3 q-pa-xs q-pa-md-sm q-mb-xl">
      <q-card-section>
        <div class="text-h6 text-center">Set password</div>
        <div class="text-subtitle2 text-center">
          Set a password for your account to gain access to your account.
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="full-width">
          <!-- Password -->
          <q-input
            v-model="password"
            type="password"
            label="Password"
            outlined
            class="q-mb-sm"
            :rules="passwordRules"
            :disable="loading"
          />

          <!-- Password Strength Indicator -->
          <PasswordStrength :password="password" />

          <!-- Confirm Password -->
          <q-input
            v-model="passwordConfirm"
            type="password"
            label="Confirm password"
            outlined
            lazy-rules
            :rules="confirmPasswordRules"
            class="q-mb-lg q-mt-md"
            :disable="loading"
          />

          <!-- Set password Button -->
          <q-btn
            label="Set password"
            color="primary"
            type="submit"
            class="full-width"
            :loading="loading"
            :disable="loading"
          />
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>
  
<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import PasswordStrength from '@/components/PasswordStrength.vue'

const route = useRoute()
const authStore = useAuthStore()

const token = route.params.token
const uidb64 = route.params.uidb64

const password = ref('')
const passwordConfirm = ref('')
const loading = ref(false)

// Password validation rules
const passwordRules = [
  (v) => !!v || 'Password is required',
  (v) => v.length >= 8 || 'Password must be at least 8 characters',
]

const confirmPasswordRules = [
  (v) => !!v || 'Please confirm your password',
  (v) => v === password.value || 'Passwords do not match',
]

// Check if password is strong enough (at least 3 requirements met)
const isPasswordStrong = computed(() => {
  if (!password.value) return false

  let strengthCount = 0
  if (password.value.length >= 8) strengthCount++
  if (/[A-Z]/.test(password.value)) strengthCount++
  if (/[a-z]/.test(password.value)) strengthCount++
  if (/\d/.test(password.value)) strengthCount++
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password.value)) strengthCount++

  return strengthCount >= 3
})

// Set password function
async function onSubmit() {
  if (!isPasswordStrong.value) {
    authStore.showErrorNotification('Please use a stronger password (at least 3 requirements met)')
    return
  }

  if (password.value !== passwordConfirm.value) {
    authStore.showErrorNotification('Passwords do not match')
    return
  }

  loading.value = true

  try {
    await authStore.setPassword(token, uidb64, {
      password: password.value,
    })
  } finally {
    loading.value = false
  }
}
</script>
  