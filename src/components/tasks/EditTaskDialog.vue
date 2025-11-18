<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section>
        <div class="text-h6">Edit Task</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <TaskForm
          mode="edit"
          :initial-task="task"
          :loading="loading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'
import TaskForm from './TaskForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  task: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'cancel'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleSubmit = (taskData) => {
  emit('submit', taskData)
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}
</script>
