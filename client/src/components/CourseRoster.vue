<script setup>
import AlertBanner from '@/components/AlertBanner.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';
import { initials } from '@/utils/format';

defineProps({
  course: { type: Object, default: null },
  students: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

defineEmits(['retry']);
</script>

<template>
  <LoadingState v-if="loading" label="Loading roster…" />

  <AlertBanner v-else-if="error" :message="error" type="error">
    <template #action>
      <button type="button" class="btn btn--ghost btn--sm" @click="$emit('retry')">
        Try again
      </button>
    </template>
  </AlertBanner>

  <EmptyState
    v-else-if="!course"
    title="Choose a course"
    message="Select a course above to see which students are enrolled."
  />

  <div v-else>
    <div class="roster-head">
      <div>
        <p class="eyebrow">Roster</p>
        <h3>{{ course.courseId }} · {{ course.name }}</h3>
      </div>
      <span class="badge">
        {{ students.length }} {{ students.length === 1 ? 'student' : 'students' }}
      </span>
    </div>

    <EmptyState
      v-if="!students.length"
      title="No students enrolled"
      message="Use the enrollment form to add the first student to this course."
    />

    <ul v-else class="roster-list">
      <li
        v-for="student in students"
        :key="student._id || student.studentId"
        class="roster-item"
      >
        <span class="avatar" aria-hidden="true">{{ initials(student.name) }}</span>
        <div class="person-info">
          <strong>{{ student.name }}</strong>
          <span>{{ student.studentId }} · {{ student.phone }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>
