import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import axios from 'src/config/axios'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    currentFilter: 'all', // 'all', 'completed', 'incomplete'
    loadingCreate: false,
    loadingUpdate: false,
    loadingDelete: false,
    loadingComplete: false,
  }),

  getters: {
    filteredTasks: (state) => {
      if (state.currentFilter === 'completed') {
        return state.tasks.filter((t) => t.is_completed === true)
      } else if (state.currentFilter === 'incomplete') {
        return state.tasks.filter((t) => t.is_completed === false)
      }
      return state.tasks
    },

    completedTasks: (state) => state.tasks.filter((t) => t.is_completed === true),

    incompleteTasks: (state) => state.tasks.filter((t) => t.is_completed === false),

    isOverdue: () => (dueDate) => {
      if (!dueDate) return false
      return new Date(dueDate) < new Date()
    },
  },

  actions: {
    setFilter(filter) {
      this.currentFilter = filter
    },

    async fetchTasks(filter = 'all') {
      this.loading = true
      this.currentFilter = filter

      try {
        // Map filter to API parameter
        const statusParam = filter === 'all' ? '' : `?status=${filter}`
        const response = await axios.get(`/task/${statusParam}`)

        if (response.data?.success) {
          this.tasks = response.data.tasks || []
        } else {
          throw new Error(response.data?.message || 'Failed to fetch tasks')
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to load tasks'
        Notify.create({
          message,
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
        this.tasks = []
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData) {
      this.loadingCreate = true

      try {
        const response = await axios.post('/task/', taskData)

        if (response.data?.success) {
          this.tasks.unshift(response.data.task) // Add to beginning of list
          Notify.create({
            message: 'Task created successfully!',
            color: 'positive',
            position: 'top',
            timeout: 3000,
          })
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to create task')
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to create task'
        Notify.create({
          message,
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
        return false
      } finally {
        this.loadingCreate = false
      }
    },

    async updateTask(taskId, taskData) {
      this.loadingUpdate = true

      try {
        const response = await axios.put(`/task/${taskId}`, taskData)

        if (response.data?.success) {
          const index = this.tasks.findIndex((t) => t.entity_id === taskId)
          if (index !== -1) {
            this.tasks[index] = response.data.task
          }
          Notify.create({
            message: 'Task updated successfully!',
            color: 'positive',
            position: 'top',
            timeout: 3000,
          })
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to update task')
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update task'
        Notify.create({
          message,
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
        return false
      } finally {
        this.loadingUpdate = false
      }
    },

    async deleteTask(taskId) {
      this.loadingDelete = true

      try {
        const response = await axios.delete(`/task/${taskId}`)

        if (response.data?.success) {
          this.tasks = this.tasks.filter((t) => t.entity_id !== taskId)
          Notify.create({
            message: 'Task deleted successfully!',
            color: 'positive',
            position: 'top',
            timeout: 3000,
          })
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to delete task')
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to delete task'
        Notify.create({
          message,
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
        return false
      } finally {
        this.loadingDelete = false
      }
    },

    async markComplete(taskId, isCompleted = true) {
      this.loadingComplete = true

      try {
        let response
        if (isCompleted) {
          // Mark as complete
          response = await axios.patch(`/task/${taskId}/complete`)
        } else {
          // Mark as incomplete - update is_completed to false
          response = await axios.put(`/task/${taskId}`, { is_completed: false })
        }

        if (response.data?.success) {
          const index = this.tasks.findIndex((t) => t.entity_id === taskId)
          if (index !== -1) {
            this.tasks[index] = response.data.task
          }
          Notify.create({
            message: isCompleted ? 'Task marked as complete!' : 'Task marked as incomplete!',
            color: 'positive',
            position: 'top',
            timeout: 3000,
          })
          return true
        } else {
          throw new Error(response.data?.message || 'Failed to update task status')
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Failed to update task status'
        Notify.create({
          message,
          color: 'negative',
          position: 'top',
          timeout: 5000,
        })
        return false
      } finally {
        this.loadingComplete = false
      }
    },
  },
})
