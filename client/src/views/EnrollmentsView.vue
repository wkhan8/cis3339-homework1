<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import AlertBanner from '@/components/AlertBanner.vue';
import CourseRoster from '@/components/CourseRoster.vue';
import EnrollmentForm from '@/components/EnrollmentForm.vue';
import PageHeader from '@/components/PageHeader.vue';
import { useCoursesStore } from '@/stores/courses';
import { useEnrollmentsStore } from '@/stores/enrollments';
import { useNotificationsStore } from '@/stores/notifications';
import { useStudentsStore } from '@/stores/students';

const studentsStore = useStudentsStore();
const coursesStore = useCoursesStore();
const enrollmentsStore = useEnrollmentsStore();
const notifications = useNotificationsStore();

const selectedCourseId = ref('');
const formError = ref('');
const enrolling = ref(false);

const loadError = computed(
  () => studentsStore.error || coursesStore.error || ''
);

async function reloadReferenceData() {
  await Promise.all([
    studentsStore.fetchStudents(''),
    coursesStore.fetchCourses(),
  ]);
  if (coursesStore.courses.length && !selectedCourseId.value) {
    selectedCourseId.value = coursesStore.courses[0].courseId;
  }
}

onMounted(async () => {
  await Promise.all([
    studentsStore.fetchStudents(''),
    coursesStore.fetchCourses(),
  ]);

  if (coursesStore.courses.length) {
    selectedCourseId.value = coursesStore.courses[0].courseId;
  }
});

watch(selectedCourseId, (courseId) => {
  enrollmentsStore.fetchRoster(courseId);
});

async function handleEnroll(payload) {
  enrolling.value = true;
  formError.value = '';

  const result = await enrollmentsStore.enroll(payload);
  enrolling.value = false;

  if (result.ok) {
    notifications.success('Student enrolled successfully.');

    if (selectedCourseId.value !== payload.courseId) {
      selectedCourseId.value = payload.courseId;
    } else {
      await enrollmentsStore.fetchRoster(payload.courseId);
    }
  } else {
    formError.value = result.message;
    notifications.error(result.message);
  }
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Rosters · 03"
      title="Enrollment rosters"
      description="Place students in courses and review each course roster."
    >
      <template #actions>
        <span class="badge">{{ studentsStore.count }} students</span>
        <span class="badge">{{ coursesStore.count }} courses</span>
      </template>
    </PageHeader>

    <AlertBanner :message="loadError">
      <template #action>
        <button
          type="button"
          class="btn btn--ghost btn--sm"
          @click="reloadReferenceData"
        >
          Try again
        </button>
      </template>
    </AlertBanner>

    <div class="split-layout">
      <section class="card" aria-labelledby="enroll-student-title">
        <div class="card-header">
          <div>
            <h2 id="enroll-student-title">Enroll a student</h2>
            <p>Selections come from the saved student and course records.</p>
          </div>
        </div>

        <EnrollmentForm
          :students="studentsStore.students"
          :courses="coursesStore.courses"
          :busy="enrolling"
          :server-error="formError"
          @submit="handleEnroll"
        />
      </section>

      <section class="card" aria-labelledby="course-roster-title">
        <div class="card-header">
          <div>
            <h2 id="course-roster-title">Roster</h2>
            <p>Choose a course to list every enrolled student.</p>
          </div>
        </div>

        <div class="field roster-select">
          <label for="roster-course">Course</label>
          <select
            id="roster-course"
            v-model="selectedCourseId"
            :disabled="!coursesStore.courses.length"
          >
            <option value="" disabled>Select a course</option>
            <option
              v-for="course in coursesStore.courses"
              :key="course.courseId"
              :value="course.courseId"
            >
              {{ course.courseId }} — {{ course.name }}
            </option>
          </select>
        </div>

        <CourseRoster
          :course="enrollmentsStore.selectedCourse"
          :students="enrollmentsStore.roster"
          :loading="enrollmentsStore.rosterLoading"
          :error="enrollmentsStore.rosterError"
          @retry="enrollmentsStore.fetchRoster(selectedCourseId)"
        />
      </section>
    </div>
  </div>
</template>
