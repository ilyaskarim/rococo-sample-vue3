<template>
  <div v-if="password" class="password-strength q-mt-sm">
    <div class="text-caption q-mb-xs">Password strength:</div>

    <!-- Strength bar -->
    <q-linear-progress
      :value="strengthValue"
      :color="strengthColor"
      class="q-mb-sm"
      size="8px"
      rounded
    />

    <!-- Strength label -->
    <div class="text-caption" :style="{ color: strengthColorValue }">
      {{ strengthLabel }}
    </div>

    <!-- Requirements checklist -->
    <div class="q-mt-sm">
      <div class="text-caption q-mb-xs">Requirements:</div>
      <div
        v-for="requirement in requirements"
        :key="requirement.label"
        class="requirement-item text-caption"
        :class="{ 'text-positive': requirement.met, 'text-grey-7': !requirement.met }"
      >
        <q-icon
          :name="requirement.met ? 'check_circle' : 'radio_button_unchecked'"
          size="16px"
          class="q-mr-xs"
        />
        {{ requirement.label }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  password: {
    type: String,
    default: '',
  },
})

// Password strength requirements
const requirements = computed(() => [
  {
    label: 'At least 8 characters',
    met: props.password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    met: /[A-Z]/.test(props.password),
  },
  {
    label: 'Contains lowercase letter',
    met: /[a-z]/.test(props.password),
  },
  {
    label: 'Contains number',
    met: /\d/.test(props.password),
  },
  {
    label: 'Contains special character (!@#$%^&*)',
    met: /[!@#$%^&*(),.?":{}|<>]/.test(props.password),
  },
])

// Calculate strength based on met requirements
const metRequirementsCount = computed(() => {
  return requirements.value.filter((r) => r.met).length
})

// Strength value (0-1)
const strengthValue = computed(() => {
  return metRequirementsCount.value / requirements.value.length
})

// Strength color
const strengthColor = computed(() => {
  if (metRequirementsCount.value <= 2) return 'negative'
  if (metRequirementsCount.value <= 3) return 'warning'
  if (metRequirementsCount.value <= 4) return 'info'
  return 'positive'
})

// Strength color value for text
const strengthColorValue = computed(() => {
  if (metRequirementsCount.value <= 2) return '#C10015'
  if (metRequirementsCount.value <= 3) return '#F2C037'
  if (metRequirementsCount.value <= 4) return '#31CCEC'
  return '#21BA45'
})

// Strength label
const strengthLabel = computed(() => {
  if (metRequirementsCount.value <= 2) return 'Weak'
  if (metRequirementsCount.value <= 3) return 'Fair'
  if (metRequirementsCount.value <= 4) return 'Good'
  return 'Strong'
})
</script>

<style scoped>
.password-strength {
  padding: 8px 0;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
}
</style>
