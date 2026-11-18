import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { api } from '@/api/http';
import { getErrorMessage } from '@/utils/errors';

export const useCoursesStore = defineStore('courses', () => {
  const courses = ref([]);
  const loading = ref(false);
  const error = ref('');
  const hasLoaded = ref(false);

  const count = computed(() => courses.value.length);

  function sortCourses(list) {
    return [...list].sort((a, b) =>
      a.courseId.localeCompare(b.courseId, undefined, { numeric: true })
    );
  }

  async function fetchCourses() {
    loading.value = true;
    error.value = '';

    try {
      const data = await api.get('/courses');
      courses.value = sortCourses(
        Array.isArray(data?.courses) ? data.courses : []
      );
      hasLoaded.value = true;
      return { ok: true };
    } catch (err) {
      error.value = getErrorMessage(err, 'Unable to load courses.');
      return { ok: false, message: error.value };
    } finally {
      loading.value = false;
    }
  }

  async function addCourse(payload) {
    try {
      const data = await api.post('/courses', payload);
      const created = data.course;
      courses.value = sortCourses([
        ...courses.value.filter(
          (course) => course.courseId !== created.courseId
        ),
        created,
      ]);
      hasLoaded.value = true;
      return { ok: true, course: created };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Unable to add the course.'),
      };
    }
  }

  async function deleteCourse(courseId) {
    try {
      const data = await api.delete(
        `/courses/${encodeURIComponent(courseId)}`
      );
      courses.value = courses.value.filter(
        (course) => course.courseId !== courseId
      );
      return {
        ok: true,
        removedEnrollments: data?.removedEnrollments ?? 0,
      };
    } catch (err) {
      return {
        ok: false,
        message: getErrorMessage(err, 'Unable to delete the course.'),
      };
    }
  }

  return {
    courses,
    loading,
    error,
    hasLoaded,
    count,
    fetchCourses,
    addCourse,
    deleteCourse,
  };
});
