<template>
  <q-page padding>
    <!-- Page Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-md">
        <div class="text-h4">My Tasks</div>
        <q-btn-toggle
          v-model="viewMode"
          toggle-color="primary"
          :options="[
            { label: 'Simple', value: 'simple', icon: 'checklist' },
            { label: 'Detailed', value: 'detailed', icon: 'table_chart' }
          ]"
          size="sm"
          dense
          unelevated
        />
      </div>
      <q-btn
        label="Add Task"
        icon="add"
        color="primary"
        @click="showCreateDialog = true"
      />
    </div>

    <!-- Quick Task Creation Input - Only shown in Simple View -->
    <q-input
      v-if="viewMode === 'simple'"
      v-model="quickTaskTitle"
      placeholder="What needs to be done?"
      outlined
      dense
      class="q-mb-md"
      :disable="taskStore.loadingCreate"
      @keyup.enter="handleQuickCreate"
      clearable
    >
      <template v-slot:prepend>
        <q-icon name="add_task" />
      </template>
    </q-input>

    <!-- Simple View -->
    <SimpleTaskList
      v-if="viewMode === 'simple'"
      :tasks="taskStore.filteredTasks"
      :active-filter="activeFilter"
      :loading="taskStore.loading || taskStore.loadingComplete"
      :empty-message="getEmptyStateMessage()"
      @edit-task="openEditDialog"
      @toggle-complete="toggleComplete"
      @change-filter="changeFilter"
      class="q-mb-md"
    />

    <!-- Detailed View -->
    <DetailedTaskTable
      v-if="viewMode === 'detailed'"
      :tasks="taskStore.filteredTasks"
      :active-filter="activeFilter"
      :loading="taskStore.loading"
      :empty-message="getEmptyStateMessage()"
      @edit-task="openEditDialog"
      @delete-task="confirmDelete"
      @toggle-complete="toggleComplete"
      @change-filter="changeFilter"
    />

    <!-- Create Task Dialog -->
    <CreateTaskDialog v-model="showCreateDialog" />

    <!-- Edit Task Dialog -->
    <EditTaskDialog
      v-model="showEditDialog"
      :task="editingTask"
      :loading="taskStore.loadingUpdate"
      @submit="handleEdit"
      @cancel="showEditDialog = false"
    />

    <!-- Delete Confirmation Dialog -->
    <DeleteConfirmationDialog
      v-model="showDeleteDialog"
      :task="deletingTask"
      :loading="taskStore.loadingDelete"
      @confirm="handleDelete"
      @cancel="showDeleteDialog = false"
    />
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from 'src/stores/tasks'
import CreateTaskDialog from 'src/components/tasks/CreateTaskDialog.vue'
import EditTaskDialog from 'src/components/tasks/EditTaskDialog.vue'
import DeleteConfirmationDialog from 'src/components/tasks/DeleteConfirmationDialog.vue'
import DetailedTaskTable from 'src/components/tasks/DetailedTaskTable.vue'
import SimpleTaskList from 'src/components/tasks/SimpleTaskList.vue'
import localStorageService from 'src/services/localStorage.service'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

const viewMode = ref('detailed') // 'simple' | 'detailed'
const activeFilter = ref('all')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const editingTask = ref(null)
const deletingTask = ref(null)
const quickTaskTitle = ref('')

// Initialize filter from URL query params
onMounted(async () => {
  // Load saved view mode from localStorage
  const savedViewMode = localStorageService.getItem('tasks_view_mode')
  if (savedViewMode && ['simple', 'detailed'].includes(savedViewMode)) {
    viewMode.value = savedViewMode
  }

  const filterParam = route.query.status || 'all'
  activeFilter.value = ['all', 'completed', 'incomplete'].includes(filterParam)
    ? filterParam
    : 'all'

  await taskStore.fetchTasks(activeFilter.value)
})

// Watch for URL changes (browser back/forward)
watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus && newStatus !== activeFilter.value) {
      activeFilter.value = newStatus
      taskStore.fetchTasks(newStatus)
    }
  }
)

// Watch viewMode to persist changes to localStorage
watch(viewMode, (newMode) => {
  localStorageService.setItem('tasks_view_mode', newMode)
})

function changeFilter(filter) {
  activeFilter.value = filter
  taskStore.setFilter(filter)

  // Update URL query params
  router.push({ query: { status: filter } })
}

function openEditDialog(task) {
  editingTask.value = { ...task }
  showEditDialog.value = true
}

async function handleEdit(taskData) {
  const success = await taskStore.updateTask(editingTask.value.entity_id, taskData)
  if (success) {
    showEditDialog.value = false
    editingTask.value = null
  }
}

function confirmDelete(task) {
  deletingTask.value = task
  showDeleteDialog.value = true
}

async function handleDelete() {
  const success = await taskStore.deleteTask(deletingTask.value.entity_id)
  if (success) {
    showDeleteDialog.value = false
    deletingTask.value = null
  }
}

async function toggleComplete(task) {
  await taskStore.markComplete(task.entity_id, !task.is_completed)
}

function getEmptyStateMessage() {
  if (activeFilter.value === 'completed') {
    return 'No completed tasks found.'
  } else if (activeFilter.value === 'incomplete') {
    return 'No incomplete tasks found. Great job!'
  }
  return 'No tasks yet. Create your first task!'
}

async function handleQuickCreate() {
  const title = quickTaskTitle.value?.trim()
  if (!title) {
    return
  }

  const taskData = {
    title: title,
    priority: 'medium',
  }

  const success = await taskStore.createTask(taskData)
  if (success) {
    quickTaskTitle.value = ''
    changeFilter('all')
  }
}
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.cursor-pointer:hover {
  text-decoration: underline;
}
</style>
