<template>
  <q-page class="flex row flex-center">
    <q-dialog v-model="successDialog" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Signup successful</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Account created successfully. Check your email for a verification link and follow the link
          to set a password for your account.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Back to login" color="primary" @click="backToLogin" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-card class="col-11 col-sm-8 col-md-6 col-lg-4 col-xl-3 q-pa-xs q-pa-md-sm q-mb-xl">
      <q-card-section>
        <div class="text-h6 text-center">Create an account</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="onSubmit" class="full-width">
          <!-- First name -->
          <q-input
            v-model="firstName"
            type="text"
            label="First name"
            outlined
            class="q-mb-lg"
            :error="!!firstNameError"
            :error-message="firstNameError"
            @blur="validateFirstName"
            @update:model-value="firstNameError = ''"
            :disable="signupLoading"
            autofocus
          />

          <!-- Last name -->
          <q-input
            v-model="lastName"
            type="text"
            label="Last name"
            outlined
            class="q-mb-lg"
            :error="!!lastNameError"
            :error-message="lastNameError"
            @blur="validateLastName"
            @update:model-value="lastNameError = ''"
            :disable="signupLoading"
          />

          <!-- E-mail address -->
          <q-input
            v-model="emailAddress"
            type="email"
            label="E-mail address"
            outlined
            class="q-mb-xl"
            :error="!!emailError"
            :error-message="emailError"
            @blur="validateEmail"
            @update:model-value="emailError = ''"
            :disable="signupLoading"
          />

          <!-- Signup Button -->
          <q-btn
            label="Create account"
            color="primary"
            type="submit"
            class="full-width"
            :loading="signupLoading"
            :disable="signupLoading"
          />

          <!-- Divider (only show if OAuth is available) -->
          <div v-if="hasOAuthProviders" class="text-center q-my-md">
            <q-separator />
            <span class="text-caption q-px-md">or continue with</span>
            <q-separator />
          </div>

          <!-- OAuth Buttons (only show if providers are configured) -->
          <div v-if="hasOAuthProviders" class="row q-gutter-md">
            <div v-if="hasGoogleProvider" class="col">
              <q-btn
                label="Google"
                icon="img:https://developers.google.com/identity/images/g-logo.png"
                color="white"
                text-color="dark"
                outline
                class="full-width"
                :loading="googleLoading"
                @click="signInWithGoogle"
              />
            </div>
            <div v-if="hasMicrosoftProvider" class="col">
              <q-btn
                label="Microsoft"
                icon="img:https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg"
                color="white"
                text-color="dark"
                outline
                class="full-width"
                :loading="microsoftLoading"
                @click="signInWithMicrosoft"
              />
            </div>
          </div>

          <!-- Signup Link -->
          <div class="text-center q-mt-md">
            <span>Already have an account? </span>
            <router-link to="/login">Log in</router-link>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>
    
<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'stores/auth'
import AuthService from 'src/services/auth.service'

const firstName = ref('')
const lastName = ref('')
const emailAddress = ref('')

const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')

const successDialog = ref(false)
const signupLoading = ref(false)
const googleLoading = ref(false)
const microsoftLoading = ref(false)

const router = useRouter()
const authStore = useAuthStore()

// Check if OAuth providers are configured
const hasGoogleProvider = computed(() => {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_CLIENT_ID.trim() !== ''
})

const hasMicrosoftProvider = computed(() => {
  return import.meta.env.VITE_MICROSOFT_CLIENT_ID && import.meta.env.VITE_MICROSOFT_CLIENT_ID.trim() !== ''
})

const hasOAuthProviders = computed(() => {
  return hasGoogleProvider.value || hasMicrosoftProvider.value
})

// First name validation
function validateFirstName() {
  if (!firstName.value || firstName.value.trim() === '') {
    firstNameError.value = 'First name is required'
    return false
  }

  if (firstName.value.trim().length < 2) {
    firstNameError.value = 'First name must be at least 2 characters'
    return false
  }

  firstNameError.value = ''
  return true
}

// Last name validation
function validateLastName() {
  if (!lastName.value || lastName.value.trim() === '') {
    lastNameError.value = 'Last name is required'
    return false
  }

  if (lastName.value.trim().length < 2) {
    lastNameError.value = 'Last name must be at least 2 characters'
    return false
  }

  lastNameError.value = ''
  return true
}

// Email validation
function validateEmail() {
  if (!emailAddress.value) {
    emailError.value = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailAddress.value)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }

  emailError.value = ''
  return true
}

// Validate all fields
function validateForm() {
  const isFirstNameValid = validateFirstName()
  const isLastNameValid = validateLastName()
  const isEmailValid = validateEmail()
  return isFirstNameValid && isLastNameValid && isEmailValid
}

// Signup function
async function onSubmit() {
  if (!validateForm()) {
    return
  }

  signupLoading.value = true

  try {
    const success = await authStore.signup({
      first_name: firstName.value.trim(),
      last_name: lastName.value.trim(),
      email_address: emailAddress.value.trim(),
    })

    if (success) {
      successDialog.value = true
    }
  } finally {
    signupLoading.value = false
  }
}

function backToLogin() {
  router.push('/login')
}

async function signInWithGoogle() {
  googleLoading.value = true
  try {
    await AuthService.signIn("google", authStore.invitationToken)
  } catch (error) {
    console.error('Google sign-in error:', error)
  } finally {
    googleLoading.value = false
  }
}

async function signInWithMicrosoft() {
  microsoftLoading.value = true
  try {
    await AuthService.signIn("microsoft", authStore.invitationToken)
  } catch (error) {
    console.error('Microsoft sign-in error:', error)
  } finally {
    microsoftLoading.value = false
  }
}
</script>
    