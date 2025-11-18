<template>
  <q-page class="flex flex-center">
    <div class="profile-container q-pa-md">
      <q-card class="profile-card" style="min-width: 400px">
        <q-card-section>
          <div class="text-h5">Profile Settings</div>
          <div class="text-subtitle2 text-grey-7">Update your profile information</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-form @submit="onSubmit" class="q-gutter-md">
            <q-input
              v-model="formData.first_name"
              label="First Name"
              outlined
              :rules="[(val) => (val && val.length > 0) || 'First name is required']"
              :disable="loading"
            />

            <q-input
              v-model="formData.last_name"
              label="Last Name"
              outlined
              :rules="[(val) => (val && val.length > 0) || 'Last name is required']"
              :disable="loading"
            />

            <div v-if="errorMessage" class="text-negative q-mb-md">
              {{ errorMessage }}
            </div>

            <div class="row q-gutter-sm justify-end">
              <q-btn
                label="Cancel"
                color="grey-7"
                outline
                @click="onCancel"
                :disable="loading"
              />
              <q-btn
                label="Save Changes"
                type="submit"
                color="primary"
                :loading="loading"
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'stores/auth'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import userService from 'src/services/user.service'

const authStore = useAuthStore()
const router = useRouter()

const formData = ref({
  first_name: '',
  last_name: '',
})

const loading = ref(false)
const errorMessage = ref('')

onMounted(() => {
  // Initialize form with current user data
  if (authStore.user) {
    formData.value.first_name = authStore.user.first_name || ''
    formData.value.last_name = authStore.user.last_name || ''
  }
})

const onSubmit = async () => {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await userService.updateProfile({
      first_name: formData.value.first_name,
      last_name: formData.value.last_name,
    })

    // Update the auth store with the new user data
    if (response.person) {
      authStore.updateUser(response.person)
      Notify.create({
        message: 'Profile updated successfully!',
        color: 'positive',
        position: 'top',
        timeout: 3000,
      })
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Failed to update profile. Please try again.'
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  // Reset form to original values
  if (authStore.user) {
    formData.value.first_name = authStore.user.first_name || ''
    formData.value.last_name = authStore.user.last_name || ''
  }
  errorMessage.value = ''
  router.push('/')
}
</script>

<style scoped>
.profile-container {
  width: 100%;
  max-width: 600px;
}

.profile-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
}
</style>
