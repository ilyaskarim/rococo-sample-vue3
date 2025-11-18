<template>
  <div>
    <!-- Filter Tabs -->
    <q-tabs
      :model-value="activeFilter"
      @update:model-value="handleFilterChange"
      dense
      class="text-grey q-mb-md"
      active-color="primary"
      indicator-color="primary"
      align="left"
      narrow-indicator
    >
      <q-tab name="all" label="All Tasks" />
      <q-tab name="incomplete" label="Incomplete" />
      <q-tab name="completed" label="Completed" />
    </q-tabs>

    <!-- Tasks Table -->
    <q-table
      :rows="tasks"
      :columns="columns"
      row-key="entity_id"
      :loading="loading"
      flat
      bordered
      :rows-per-page-options="[10, 25, 50]"
      :pagination="{ rowsPerPage: 10 }"
      class="my-sticky-header-table"

    >
      <!-- Loading slot -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary" />
      </template>

      <!-- No data slot -->
      <template v-slot:no-data>
        <div class="full-width row flex-center text-grey q-gutter-sm q-py-xl">
          <q-icon size="2em" name="task_alt" />
          <span class="text-body1">
            {{ emptyMessage }}
          </span>
        </div>
      </template>

      <!-- Title column with edit link -->
      <template v-slot:body-cell-title="props">
        <q-td :props="props">
          <div
            class="text-primary cursor-pointer"
            @click="handleEdit(props.row)"
          >
            {{ props.row.title }}
          </div>
        </q-td>
      </template>

      <!-- Description with truncation -->
      <template v-slot:body-cell-description="props">
        <q-td :props="props">
          <div class="ellipsis" style="max-width: 200px">
            {{ props.row.description || '-' }}
          </div>
          <q-tooltip v-if="props.row.description">
            {{ props.row.description }}
          </q-tooltip>
        </q-td>
      </template>

      <!-- Due Date with formatting -->
      <template v-slot:body-cell-due_date="props">
        <q-td :props="props">
          <div v-if="props.row.due_date">
            <span
              :class="{
                'text-red': taskStore.isOverdue(props.row.due_date) && !props.row.is_completed,
              }"
            >
              {{ formatDate(props.row.due_date) }}
            </span>
            <q-badge
              v-if="taskStore.isOverdue(props.row.due_date) && !props.row.is_completed"
              color="red"
              label="Overdue"
              class="q-ml-xs"
            />
          </div>
          <span v-else class="text-grey">-</span>
        </q-td>
      </template>

      <!-- Priority with badge -->
      <template v-slot:body-cell-priority="props">
        <q-td :props="props">
          <q-badge :color="getPriorityColor(props.row.priority)">
            {{ capitalizeFirst(props.row.priority) }}
          </q-badge>
        </q-td>
      </template>

      <!-- Status with checkbox -->
      <template v-slot:body-cell-is_completed="props">
        <q-td :props="props">
          <q-checkbox
            :model-value="props.row.is_completed"
            @update:model-value="handleToggleComplete(props.row)"
            color="positive"
            :disable="taskStore.loadingComplete"
          />
        </q-td>
      </template>

      <!-- Actions column -->
      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            dense
            icon="edit"
            color="primary"
            @click="handleEdit(props.row)"
          >
            <q-tooltip>Edit Task</q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            dense
            icon="delete"
            color="negative"
            @click="handleDelete(props.row)"
          >
            <q-tooltip>Delete Task</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { useTaskStore } from 'src/stores/tasks'

const taskStore = useTaskStore()

defineProps({
  tasks: {
    type: Array,
    required: true,
  },
  activeFilter: {
    type: String,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: 'No tasks yet. Create your first task!',
  },
})

const emit = defineEmits(['edit-task', 'delete-task', 'toggle-complete', 'change-filter'])

const columns = [
  {
    name: 'title',
    required: true,
    label: 'Title',
    align: 'left',
    field: 'title',
    sortable: true,
  },
  {
    name: 'description',
    label: 'Description',
    align: 'left',
    field: 'description',
    sortable: false,
  },
  {
    name: 'due_date',
    label: 'Due Date',
    align: 'left',
    field: 'due_date',
    sortable: true,
  },
  {
    name: 'priority',
    label: 'Priority',
    align: 'center',
    field: 'priority',
    sortable: true,
  },
  {
    name: 'is_completed',
    label: 'Completed',
    align: 'center',
    field: 'is_completed',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    align: 'center',
    sortable: false,
  },
]

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getPriorityColor(priority) {
  const colors = {
    low: 'grey',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
  }
  return colors[priority] || 'grey'
}

function capitalizeFirst(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function handleEdit(task) {
  emit('edit-task', task)
}

function handleDelete(task) {
  emit('delete-task', task)
}

function handleToggleComplete(task) {
  emit('toggle-complete', task)
}

function handleFilterChange(value) {
  emit('change-filter', value)
}
</script>

<style scoped>
:deep(.my-sticky-header-table .q-table__middle) {
  max-height: calc(100vh - 250px);
  overflow-y: auto;
}

:deep(.my-sticky-header-table thead) {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: white;
}

:deep(.my-sticky-header-table thead th) {
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 2;
}
</style>
