<script setup>
import { formatDate } from '@/utils/format';

defineProps({
  courses: { type: Array, default: () => [] },
  deletingId: { type: String, default: '' },
});

defineEmits(['delete']);
</script>

<template>
  <ul class="course-grid">
    <li
      v-for="course in courses"
      :key="course._id || course.courseId"
      class="course-card"
    >
      <span class="course-code">{{ course.courseId }}</span>
      <h3>{{ course.name }}</h3>
      <p class="course-meta">Added {{ formatDate(course.createdAt) }}</p>
      <button
        type="button"
        class="btn btn--danger-ghost btn--sm"
        :disabled="deletingId === course.courseId"
        :aria-label="`Delete ${course.courseId}`"
        @click="$emit('delete', course)"
      >
        {{ deletingId === course.courseId ? 'Deleting…' : 'Delete' }}
      </button>
    </li>
  </ul>
</template>
