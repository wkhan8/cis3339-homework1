import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/http';
import { getErrorMessage } from '@/utils/errors';

export const useStudentsStore = defineStore('students', () => {
  const students = ref([]);
  const loading = ref(false);
  const error = ref('');
  const hasLoaded = ref(false);

  const count = computed(() => students.value.length);

  async function fetchStudents(term = '') {
    loading.value = true;
    error.value = '';

    try {
      const query = term.trim()
        ? `?search=${encodeURIComponent(term.trim())}`
        : '';
      const data = await api.get(`/students${query}`);
      students.value = Array.isArray(data?.students) ? data.students : [];
      hasLoaded.value = true;
      return { ok: true };
    } catch (err) {
      error.value = getErrorMessage(err, 'Unable to load students.');
      return { ok: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function addStudent(payload) {
    try {
      const data = await api.post('/students', payload);
      const created = data.student;
      students.value = [
        ...students.value.filter(
          (student) => student.studentId !== created.studentId
        ),
        created,
      ].sort((a, b) => a.name.localeCompare(b.name));
      hasLoaded.value = true;
      return { ok: true, student: created };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Unable to add the student.'),
      };
    }
  }

  async function deleteStudent(studentId) {
    try {
      const data = await api.delete(
        `/students/${encodeURIComponent(studentId)}`
      );
      students.value = students.value.filter(
        (student) => student.studentId !== studentId
      );
      return {
        ok: true,
        removedEnrollments: data?.removedEnrollments ?? 0,
      };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Unable to delete the student.'),
      };
    }
  }

  return {
    students,
    loading,
    error,
    hasLoaded,
    count,
    fetchStudents,
    addStudent,
    deleteStudent,
  };
});
