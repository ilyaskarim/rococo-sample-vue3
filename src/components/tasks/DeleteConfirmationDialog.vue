<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card>
      <q-card-section>
        <div class="text-h6">Confirm Delete</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        Are you sure you want to delete this task?
        <div class="text-weight-bold q-mt-sm">{{ task?.title }}</div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="secondary"
          @click="handleCancel"
          :disable="loading"
        />
        <q-btn
          flat
          label="Delete"
          color="negative"
          @click="handleConfirm"
          :loading="loading"
          :disable="loading"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed } from 'vue'

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

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  dialogVisible.value = false
}
</script>
