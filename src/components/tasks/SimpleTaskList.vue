<template>
  <q-card flat bordered class="bg-grey-1">
    <!-- Task List -->
    <q-list v-if="tasks.length > 0" separator style="height: calc(100vh - 250px); overflow-y: auto;" >
      <q-item
        v-for="task in tasks"
        :key="task.entity_id"
        clickable
        @click="$emit('edit-task', task)"
        :class="{ 'text-grey-6': task.is_completed }"
        class="q-py-sm"
      >
        <q-item-section side>
          <q-checkbox
            :model-value="task.is_completed"
            @update:model-value="$emit('toggle-complete', task)"
            color="positive"
            :disable="loading"
            @click.stop
          />
        </q-item-section>
        <q-item-section>
          <q-item-label :class="{ 'text-strike': task.is_completed }">
            {{ task.title }}
          </q-item-label>
        </q-item-section>
        <q-item-section side class="row items-center q-gutter-sm">
          <!-- Due Date -->
          <div v-if="task.due_date" class="text-caption">
            <span
              :class="{
                'text-red': isOverdue(task.due_date) && !task.is_completed,
                'text-grey-7': !isOverdue(task.due_date) || task.is_completed
              }"
            >
              {{ formatDate(task.due_date) }}
            </span>
          </div>
          <!-- Priority Badge -->
          <q-badge
            v-if="task.priority"
            :color="getPriorityColor(task.priority)"
            class="text-caption"
          >
            {{ capitalizeFirst(task.priority) }}
          </q-badge>
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Empty State -->
    <q-card-section v-else class="text-center text-grey q-py-xl">
      <q-icon name="task_alt" size="3em" class="q-mb-sm" />
      <div class="text-body1">{{ emptyMessage }}</div>
    </q-card-section>

    <!-- Footer -->
    <q-card-section class="row items-center justify-between q-pt-md border-top">
      <div class="text-grey-7 text-body2">
        {{ incompleteCount }} {{ incompleteCount === 1 ? 'item' : 'items' }} left
      </div>
      <div class="row q-gutter-xs">
        <q-btn
          v-for="filter in filters"
          :key="filter.value"
          :label="filter.label"
          flat
          dense
          size="sm"
          :color="activeFilter === filter.value ? 'primary' : 'grey-7'"
          :class="{ 'text-weight-bold': activeFilter === filter.value }"
          @click="$emit('change-filter', filter.value)"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  activeFilter: {
    type: String,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  emptyMessage: {
    type: String,
    default: 'No tasks yet. Create your first task!'
  }
})

defineEmits(['edit-task', 'toggle-complete', 'change-filter'])

const filters = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'incomplete' },
  { label: 'Completed', value: 'completed' }
]

const incompleteCount = computed(() => {
  return props.tasks.filter(t => !t.is_completed).length
})

function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function isOverdue(dueDate) {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
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
</script>

<style scoped>
.text-strike {
  text-decoration: line-through;
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
