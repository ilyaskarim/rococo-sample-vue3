import axios from 'axios'
import { useAuthStore } from 'stores/auth'
import { Notify } from 'quasar'

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001'

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`
  }

  return config
})

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const authStore = useAuthStore()

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshed = await authStore.refreshToken()
        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${authStore.accessToken}`
          return apiClient(originalRequest)
        }
      } catch (e) {
        console.log(e)
        authStore.logout(false)

        Notify.create({
          message: 'Your session has expired. Please login again.',
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })

        authStore.router?.push('/login')
        return Promise.reject(error)
      }
    }

    // Handle 429 - Rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after']
      if (retryAfter && !originalRequest._retryCount) {
        originalRequest._retryCount = 1
        const delay = parseInt(retryAfter) * 1000
        return new Promise((resolve) => {
          setTimeout(() => resolve(apiClient(originalRequest)), delay)
        })
      }

      // If retry already attempted or no retry-after header, show error
      Notify.create({
        message: 'Too many requests. Please try again later.',
        color: 'negative',
        position: 'top',
        timeout: 5000,
      })
    }

    // Handle 5xx - Server errors with retry
    if (
      error.response?.status >= 500 &&
      (!originalRequest._retryCount || originalRequest._retryCount < 2)
    ) {
      originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
      const delay = Math.pow(2, originalRequest._retryCount) * 1000
      return new Promise((resolve) => {
        setTimeout(() => resolve(apiClient(originalRequest)), delay)
      })
    }

    // If we reach here, all retries failed or error is not retryable
    // Show appropriate error notification based on status code
    if (error.response) {
      const status = error.response.status
      const serverMessage = error.response.data?.message

      if (status === 403) {
        Notify.create({
          message: serverMessage || "You don't have permission to perform this action",
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
      } else if (status === 404) {
        Notify.create({
          message: serverMessage || 'The requested resource was not found',
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
      } else if (status >= 500) {
        // All server error retries failed
        Notify.create({
          message: serverMessage || 'Server error. Please try again later.',
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
      } else if (status >= 400 && status !== 401) {
        // Other 4xx errors (except 401 which is handled above)
        Notify.create({
          message: serverMessage || 'Request failed. Please try again.',
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
      }
    } else if (error.request) {
      // Network error - request was made but no response received
      Notify.create({
        message: 'Network error. Please check your internet connection.',
        color: 'negative',
        position: 'top',
        timeout: 5000,
      })
    } else {
      // Something else went wrong
      Notify.create({
        message: error.message || 'An unexpected error occurred',
        color: 'negative',
        position: 'top',
        timeout: 5000,
      })
    }

    return Promise.reject(error)
  },
)

export default apiClient
