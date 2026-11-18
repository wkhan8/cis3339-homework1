<script setup>
import { initials } from '@/utils/format';

defineProps({
  students: { type: Array, default: () => [] },
  deletingId: { type: String, default: '' },
});

defineEmits(['delete']);
</script>

<template>
  <div class="table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th scope="col">Student</th>
          <th scope="col">Student ID</th>
          <th scope="col">Phone</th>
          <th scope="col">ZIP</th>
          <th scope="col" class="align-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="student in students" :key="student._id || student.studentId">
          <td data-label="Student">
            <div class="person">
              <span class="avatar" aria-hidden="true">{{ initials(student.name) }}</span>
              <strong>{{ student.name }}</strong>
            </div>
          </td>
          <td data-label="Student ID">
            <span class="mono">{{ student.studentId }}</span>
          </td>
          <td data-label="Phone">{{ student.phone }}</td>
          <td data-label="ZIP">{{ student.zip }}</td>
          <td data-label="Actions" class="align-right">
            <button
              type="button"
              class="btn btn--danger-ghost btn--sm"
              :disabled="deletingId === student.studentId"
              :aria-label="`Delete ${student.name}`"
              @click="$emit('delete', student)"
            >
              {{ deletingId === student.studentId ? 'Deleting…' : 'Delete' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
