<template>
  <q-form @submit.prevent="handleSubmit" class="q-gutter-md">
    <!-- Title Field -->
    <q-input
      v-model="formData.title"
      label="Title *"
      outlined
      :autofocus="true"
      :error="!!titleError"
      :error-message="titleError"
      @blur="validateTitle"
      @update:model-value="titleError = ''"
      :disable="loading"
      maxlength="255"
      counter
    />

    <!-- Description Field -->
    <q-input
      v-model="formData.description"
      label="Description"
      outlined
      type="textarea"
      rows="3"
      :disable="loading"
    />

    <!-- Due Date Field -->
    <q-input
      v-model="formData.due_date"
      label="Due Date"
      outlined
      :disable="loading"
    >
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-date v-model="formData.due_date" mask="YYYY-MM-DD HH:mm:ss">
              <div class="row items-center justify-end">
                <q-btn v-close-popup label="Close" color="primary" flat />
              </div>
            </q-date>
          </q-popup-proxy>
        </q-icon>
      </template>
      <template v-slot:append v-if="formData.due_date">
        <q-icon
          name="close"
          @click.stop="formData.due_date = null"
          class="cursor-pointer"
        />
      </template>
    </q-input>

    <!-- Priority Field -->
    <q-select
      v-model="formData.priority"
      :options="priorityOptions"
      label="Priority"
      outlined
      emit-value
      map-options
      :disable="loading"
    />

    <!-- Form Actions -->
    <div class="row q-gutter-sm justify-end">
      <q-btn
        label="Cancel"
        color="secondary"
        flat
        @click="handleCancel"
        :disable="loading"
      />
      <q-btn
        :label="mode === 'create' ? 'Create Task' : 'Update Task'"
        type="submit"
        color="primary"
        :loading="loading"
        :disable="loading"
      />
    </div>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  mode: {
    type: String,
    required: true,
    validator: (value) => ['create', 'edit'].includes(value),
  },
  initialTask: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
]

const formData = ref({
  title: '',
  description: '',
  due_date: null,
  priority: 'medium',
})

const titleError = ref('')

// Initialize form data if editing
if (props.mode === 'edit' && props.initialTask) {
  formData.value = {
    title: props.initialTask.title || '',
    description: props.initialTask.description || '',
    due_date: props.initialTask.due_date
      ? props.initialTask.due_date.split('T')[0] + ' 00:00:00'
      : null,
    priority: props.initialTask.priority || 'medium',
  }
}

// Watch for changes to initialTask (if editing)
watch(
  () => props.initialTask,
  (newTask) => {
    if (props.mode === 'edit' && newTask) {
      formData.value = {
        title: newTask.title || '',
        description: newTask.description || '',
        due_date: newTask.due_date ? newTask.due_date.split('T')[0] + ' 00:00:00' : null,
        priority: newTask.priority || 'medium',
      }
    }
  }
)

function validateTitle() {
  if (!formData.value.title || !formData.value.title.trim()) {
    titleError.value = 'Title is required'
    return false
  }
  if (formData.value.title.length > 255) {
    titleError.value = 'Title must be 255 characters or less'
    return false
  }
  titleError.value = ''
  return true
}

function handleSubmit() {
  if (!validateTitle()) return

  // Prepare data for submission
  const submitData = {
    title: formData.value.title.trim(),
    description: formData.value.description?.trim() || null,
    due_date: formData.value.due_date
      ? new Date(formData.value.due_date).toISOString()
      : null,
    priority: formData.value.priority,
  }

  emit('submit', submitData)
}

function handleCancel() {
  // Reset form if creating
  if (props.mode === 'create') {
    formData.value = {
      title: '',
      description: '',
      due_date: null,
      priority: 'medium',
    }
    titleError.value = ''
  }
  emit('cancel')
}

// Expose reset method for parent component
defineExpose({
  resetForm: () => {
    formData.value = {
      title: '',
      description: '',
      due_date: null,
      priority: 'medium',
    }
    titleError.value = ''
  },
})
</script>
