<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 400px; max-width: 600px">
      <q-card-section>
        <div class="text-h6">Create New Task</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <TaskForm
          ref="taskFormRef"
          mode="create"
          :loading="taskStore.loadingCreate"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTaskStore } from 'src/stores/tasks'
import TaskForm from './TaskForm.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['update:modelValue'])

const taskStore = useTaskStore()
const taskFormRef = ref(null)

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

async function handleSubmit(taskData) {
  const success = await taskStore.createTask(taskData)
  if (success) {
    // Reset form and close dialog
    if (taskFormRef.value) {
      taskFormRef.value.resetForm()
    }
    dialogVisible.value = false
  }
}

function handleCancel() {
  dialogVisible.value = false
}
</script>
