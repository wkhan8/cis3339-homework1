<script setup>
import { reactive, ref } from 'vue';
import AlertBanner from '@/components/AlertBanner.vue';

const props = defineProps({
  students: { type: Array, default: () => [] },
  courses: { type: Array, default: () => [] },
  busy: { type: Boolean, default: false },
  serverError: { type: String, default: '' },
});

const emit = defineEmits(['submit']);

const form = reactive({ studentId: '', courseId: '' });
const errors = reactive({});
const studentSelect = ref(null);
const courseSelect = ref(null);

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key]);

  if (!form.studentId) errors.studentId = 'Select a student.';
  if (!form.courseId) errors.courseId = 'Select a course.';

  return Object.keys(errors).length === 0;
}

function clearError(field) {
  if (errors[field]) delete errors[field];
}

function handleSubmit() {
  if (!validate()) {
    (errors.studentId ? studentSelect : courseSelect).value?.focus();
    return;
  }

  emit('submit', {
    studentId: form.studentId,
    courseId: form.courseId,
  });
}

function reset() {
  form.studentId = '';
  form.courseId = '';
  Object.keys(errors).forEach((key) => delete errors[key]);
}

defineExpose({ reset });
</script>

<template>
  <form class="form" novalidate @submit.prevent="handleSubmit">
    <AlertBanner v-if="serverError" :message="serverError" />

    <div class="field">
      <label for="enrollment-student">Student</label>
      <select
        id="enrollment-student"
        ref="studentSelect"
        v-model="form.studentId"
        :disabled="!students.length || props.busy"
        :aria-invalid="Boolean(errors.studentId)"
        :aria-describedby="errors.studentId ? 'enrollment-student-error' : undefined"
        @change="clearError('studentId')"
      >
        <option value="" disabled>Select a student</option>
        <option
          v-for="student in students"
          :key="student.studentId"
          :value="student.studentId"
        >
          {{ student.name }} ({{ student.studentId }})
        </option>
      </select>
      <p v-if="errors.studentId" id="enrollment-student-error" class="field-error">
        {{ errors.studentId }}
      </p>
      <p v-if="!students.length" class="field-hint">
        No students yet.
        <RouterLink to="/students">Add a student first</RouterLink>.
      </p>
    </div>

    <div class="field">
      <label for="enrollment-course">Course</label>
      <select
        id="enrollment-course"
        ref="courseSelect"
        v-model="form.courseId"
        :disabled="!courses.length || props.busy"
        :aria-invalid="Boolean(errors.courseId)"
        :aria-describedby="errors.courseId ? 'enrollment-course-error' : undefined"
        @change="clearError('courseId')"
      >
        <option value="" disabled>Select a course</option>
        <option
          v-for="course in courses"
          :key="course.courseId"
          :value="course.courseId"
        >
          {{ course.courseId }} — {{ course.name }}
        </option>
      </select>
      <p v-if="errors.courseId" id="enrollment-course-error" class="field-error">
        {{ errors.courseId }}
      </p>
      <p v-if="!courses.length" class="field-hint">
        No courses yet.
        <RouterLink to="/courses">Add a course first</RouterLink>.
      </p>
    </div>

    <div class="form-actions">
      <button
        type="submit"
        class="btn btn--primary"
        :disabled="props.busy || !students.length || !courses.length"
      >
        <span v-if="props.busy" class="spinner spinner--light" aria-hidden="true"></span>
        {{ props.busy ? 'Enrolling…' : 'Enroll' }}
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
