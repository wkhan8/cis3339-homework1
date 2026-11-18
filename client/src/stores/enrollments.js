import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/http';
import { getErrorMessage } from '@/utils/errors';

export const useEnrollmentsStore = defineStore('enrollments', () => {
  const roster = ref([]);
  const selectedCourse = ref(null);
  const rosterLoading = ref(false);
  const rosterError = ref('');

  const rosterCount = computed(() => roster.value.length);

  async function fetchRoster(courseId) {
    if (!courseId) {
      roster.value = [];
      selectedCourse.value = null;
      rosterError.value = '';
      return { ok: true };
    }

    rosterLoading.value = true;
    rosterError.value = '';

    try {
      const data = await api.get(
        `/enrollments?courseId=${encodeURIComponent(courseId)}`
      );
      roster.value = Array.isArray(data?.students) ? data.students : [];
      selectedCourse.value = data?.course ?? null;
      return { ok: true };
    } catch (err) {
      roster.value = [];
      selectedCourse.value = null;
      rosterError.value = getErrorMessage(err, 'Unable to load the course roster.');
      return { ok: false, message: rosterError.value };
    } finally {
      rosterLoading.value = false;
    }
  }

  async function enroll(payload) {
    try {
      const data = await api.post('/enrollments', payload);
      return { ok: true, enrollment: data.enrollment };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Unable to create the enrollment.'),
      };
    }
  }

  async function removeEnrollment(id) {
    try {
      await api.delete(`/enrollments/${encodeURIComponent(id)}`);
      roster.value = roster.value.filter((item) => item._id !== id);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Unable to remove the enrollment.'),
      };
    }
  }

  return {
    roster,
    selectedCourse,
    rosterLoading,
    rosterError,
    rosterCount,
    fetchRoster,
    enroll,
    removeEnrollment,
  };
});
