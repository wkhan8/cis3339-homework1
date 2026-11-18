<script setup>
import { reactive, ref } from 'vue';
import AlertBanner from '@/components/AlertBanner.vue';

const props = defineProps({
  busy: { type: Boolean, default: false },
  serverError: { type: String, default: '' },
});

const emit = defineEmits(['submit']);

const form = reactive({ courseId: '', name: '' });
const errors = reactive({});
const submitted = ref(false);

const idInput = ref(null);
const nameInput = ref(null);

function validateField(field) {
  const value = form[field].trim();
  let message = '';

  if (field === 'courseId') {
    if (!value) message = 'Course ID is required.';
    else if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,19}$/.test(value)) {
      message = 'Use 2–20 letters, numbers, spaces, or hyphens.';
    }
  }

  if (field === 'name') {
    if (!value) message = 'Course name is required.';
    else if (value.length < 2) message = 'Enter at least 2 characters.';
  }

  if (message) errors[field] = message;
  else delete errors[field];

  return !message;
}

function handleInput(field) {
  if (submitted.value || errors[field]) {
    validateField(field);
  }
}

function handleSubmit() {
  submitted.value = true;
  const valid = ['courseId', 'name'].map(validateField).every(Boolean);

  if (!valid) {
    (errors.courseId ? idInput : nameInput).value?.focus();
    return;
  }

  emit('submit', {
    courseId: form.courseId.trim(),
    name: form.name.trim(),
  });
}

function reset() {
  Object.assign(form, { courseId: '', name: '' });
  Object.keys(errors).forEach((key) => delete errors[key]);
  submitted.value = false;
}

defineExpose({ reset, focus: () => idInput.value?.focus() });
</script>

<template>
  <form class="form" novalidate @submit.prevent="handleSubmit">
    <AlertBanner v-if="serverError" :message="serverError" />

    <div class="field">
      <label for="course-id">Course ID</label>
      <input
        id="course-id"
        ref="idInput"
        v-model="form.courseId"
        type="text"
        autocomplete="off"
        placeholder="e.g. CIS 3339"
        :aria-invalid="Boolean(errors.courseId)"
        :aria-describedby="errors.courseId ? 'course-id-error' : 'course-id-hint'"
        @input="handleInput('courseId')"
      />
      <p v-if="errors.courseId" id="course-id-error" class="field-error">
        {{ errors.courseId }}
      </p>
      <p v-else id="course-id-hint" class="field-hint">
        Course IDs are stored in uppercase.
      </p>
    </div>

    <div class="field">
      <label for="course-name">Course name</label>
      <input
        id="course-name"
        ref="nameInput"
        v-model="form.name"
        type="text"
        autocomplete="off"
        placeholder="e.g. Enterprise Applications Development"
        :aria-invalid="Boolean(errors.name)"
        :aria-describedby="errors.name ? 'course-name-error' : undefined"
        @input="handleInput('name')"
      />
      <p v-if="errors.name" id="course-name-error" class="field-error">
        {{ errors.name }}
      </p>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn--primary" :disabled="props.busy">
        <span v-if="props.busy" class="spinner spinner--light" aria-hidden="true"></span>
        {{ props.busy ? 'Saving…' : 'Create course' }}
      </button>
      <button
        type="button"
        class="btn btn--ghost"
        :disabled="props.busy"
        @click="reset"
      >
        Reset
      </button>
    </div>
  </form>
</template>
