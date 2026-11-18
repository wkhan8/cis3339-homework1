<script setup>
import { reactive, ref } from 'vue';
import AlertBanner from '@/components/AlertBanner.vue';

const props = defineProps({
  busy: { type: Boolean, default: false },
  serverError: { type: String, default: '' },
});

const emit = defineEmits(['submit']);

const form = reactive({
  name: '',
  studentId: '',
  phone: '',
  zip: '',
});

const errors = reactive({});
const submitted = ref(false);

const nameInput = ref(null);
const idInput = ref(null);
const phoneInput = ref(null);
const zipInput = ref(null);

const fieldRefs = {
  name: nameInput,
  studentId: idInput,
  phone: phoneInput,
  zip: zipInput,
};

function validateField(field) {
  const value = form[field].trim();
  let message = '';

  if (field === 'name') {
    if (!value) message = 'Student name is required.';
    else if (value.length < 2) message = 'Enter at least 2 characters.';
  }

  if (field === 'studentId') {
    if (!value) message = 'Student ID is required.';
    else if (!/^[A-Za-z0-9-]{2,20}$/.test(value)) {
      message = 'Use 2–20 letters, numbers, or hyphens.';
    }
  }

  if (field === 'phone') {
    if (!value) message = 'Phone number is required.';
    else if (!/^[0-9+()\-.\s]{7,20}$/.test(value)) {
      message = 'Enter a valid phone number.';
    }
  }

  if (field === 'zip') {
    if (!value) message = 'ZIP code is required.';
    else if (!/^\d{5}(-\d{4})?$/.test(value)) {
      message = 'Enter a 5-digit ZIP code.';
    }
  }

  if (message) errors[field] = message;
  else delete errors[field];

  return !message;
}

function validateAll() {
  return ['name', 'studentId', 'phone', 'zip']
    .map(validateField)
    .every(Boolean);
}

function handleInput(field) {
  if (submitted.value || errors[field]) {
    validateField(field);
  }
}

function handleBlur(field) {
  if (form[field].trim()) {
    validateField(field);
  }
}

function focusFirstError() {
  const field = ['name', 'studentId', 'phone', 'zip'].find(
    (name) => errors[name]
  );
  fieldRefs[field]?.value?.focus();
}

function handleSubmit() {
  submitted.value = true;
  if (!validateAll()) {
    focusFirstError();
    return;
  }

  emit('submit', {
    name: form.name.trim(),
    studentId: form.studentId.trim(),
    phone: form.phone.trim(),
    zip: form.zip.trim(),
  });
}

function reset() {
  Object.assign(form, { name: '', studentId: '', phone: '', zip: '' });
  Object.keys(errors).forEach((key) => delete errors[key]);
  submitted.value = false;
}

defineExpose({ reset, focus: () => nameInput.value?.focus() });
</script>

<template>
  <form class="form" novalidate @submit.prevent="handleSubmit">
    <AlertBanner v-if="serverError" :message="serverError" />

    <div class="form-grid">
      <div class="field field--full">
        <label for="student-name">Full name</label>
        <input
          id="student-name"
          ref="nameInput"
          v-model="form.name"
          type="text"
          autocomplete="name"
          placeholder="e.g. John Smith"
          :aria-invalid="Boolean(errors.name)"
          :aria-describedby="errors.name ? 'student-name-error' : undefined"
          @input="handleInput('name')"
          @blur="handleBlur('name')"
        />
        <p v-if="errors.name" id="student-name-error" class="field-error">
          {{ errors.name }}
        </p>
      </div>

      <div class="field field--full">
        <label for="student-id">Student ID</label>
        <input
          id="student-id"
          ref="idInput"
          v-model="form.studentId"
          type="text"
          autocomplete="off"
          placeholder="e.g. 1001"
          :aria-invalid="Boolean(errors.studentId)"
          :aria-describedby="errors.studentId ? 'student-id-error' : 'student-id-hint'"
          @input="handleInput('studentId')"
          @blur="handleBlur('studentId')"
        />
        <p v-if="errors.studentId" id="student-id-error" class="field-error">
          {{ errors.studentId }}
        </p>
        <p v-else id="student-id-hint" class="field-hint">
          2–20 letters, numbers, or hyphens.
        </p>
      </div>

      <div class="field">
        <label for="student-phone">Phone number</label>
        <input
          id="student-phone"
          ref="phoneInput"
          v-model="form.phone"
          type="tel"
          autocomplete="tel"
          placeholder="e.g. 555-1234"
          :aria-invalid="Boolean(errors.phone)"
          :aria-describedby="errors.phone ? 'student-phone-error' : undefined"
          @input="handleInput('phone')"
          @blur="handleBlur('phone')"
        />
        <p v-if="errors.phone" id="student-phone-error" class="field-error">
          {{ errors.phone }}
        </p>
      </div>

      <div class="field">
        <label for="student-zip">ZIP code</label>
        <input
          id="student-zip"
          ref="zipInput"
          v-model="form.zip"
          type="text"
          inputmode="numeric"
          autocomplete="postal-code"
          placeholder="e.g. 77001"
          :aria-invalid="Boolean(errors.zip)"
          :aria-describedby="errors.zip ? 'student-zip-error' : undefined"
          @input="handleInput('zip')"
          @blur="handleBlur('zip')"
        />
        <p v-if="errors.zip" id="student-zip-error" class="field-error">
          {{ errors.zip }}
        </p>
      </div>
    </div>

    <div class="form-actions">
      <button type="submit" class="btn btn--primary" :disabled="props.busy">
        <span v-if="props.busy" class="spinner spinner--light" aria-hidden="true"></span>
        {{ props.busy ? 'Saving…' : 'Create record' }}
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
