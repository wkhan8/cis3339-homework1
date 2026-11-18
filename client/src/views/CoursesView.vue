<script setup>
import { computed, onMounted, ref } from 'vue';
import AlertBanner from '@/components/AlertBanner.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import CourseForm from '@/components/CourseForm.vue';
import CourseList from '@/components/CourseList.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';
import PageHeader from '@/components/PageHeader.vue';
import { useCoursesStore } from '@/stores/courses';
import { useNotificationsStore } from '@/stores/notifications';

const coursesStore = useCoursesStore();
const notifications = useNotificationsStore();

const addForm = ref(null);
const formError = ref('');
const adding = ref(false);
const deletingId = ref('');
const deleteTarget = ref(null);

const deleteMessage = computed(() => {
  if (!deleteTarget.value) return '';
  return `This permanently removes ${deleteTarget.value.courseId} — ${deleteTarget.value.name} and all of its enrollments.`;
});

onMounted(() => coursesStore.fetchCourses());

async function handleAdd(payload) {
  adding.value = true;
  formError.value = '';

  const result = await coursesStore.addCourse(payload);
  adding.value = false;

  if (result.ok) {
    addForm.value?.reset();
    notifications.success(`${result.course.courseId} was added.`);
  } else {
    formError.value = result.message;
    notifications.error(result.message);
  }
}

function askDelete(course) {
  deleteTarget.value = course;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;

  const target = deleteTarget.value;
  deletingId.value = target.courseId;

  const result = await coursesStore.deleteCourse(target.courseId);
  deletingId.value = '';
  deleteTarget.value = null;

  if (result.ok) {
    const extra = result.removedEnrollments
      ? ` and ${result.removedEnrollments} enrollment${result.removedEnrollments === 1 ? '' : 's'}`
      : '';
    notifications.success(`${target.courseId} was deleted${extra}.`);
  } else {
    notifications.error(result.message);
  }
}

function focusAddForm() {
  addForm.value?.focus();
}
</script>

<template>
  <div>
    <PageHeader
      eyebrow="Catalog · 02"
      title="Course catalog"
      description="Maintain the courses on file. Course IDs are unique and stored in uppercase."
    >
      <template #actions>
        <button
          type="button"
          class="btn btn--ghost"
          :disabled="coursesStore.loading"
          @click="coursesStore.fetchCourses()"
        >
          Refresh
        </button>
      </template>
    </PageHeader>

    <div class="split-layout">
      <section class="card" aria-labelledby="add-course-title">
        <div class="card-header">
          <div>
            <h2 id="add-course-title">New course</h2>
            <p>Add a course to the catalog.</p>
          </div>
        </div>

        <CourseForm
          ref="addForm"
          :busy="adding"
          :server-error="formError"
          @submit="handleAdd"
        />
      </section>

      <section class="card" aria-labelledby="course-list-title">
        <div class="card-header">
          <div>
            <h2 id="course-list-title">Catalog</h2>
            <p>All courses currently on file.</p>
          </div>
          <span class="badge">{{ coursesStore.count }} total</span>
        </div>

        <AlertBanner :message="coursesStore.error">
          <template #action>
            <button
              type="button"
              class="btn btn--ghost btn--sm"
              @click="coursesStore.fetchCourses()"
            >
              Try again
            </button>
          </template>
        </AlertBanner>

        <LoadingState
          v-if="coursesStore.loading && !coursesStore.hasLoaded"
          label="Loading courses…"
        />

        <EmptyState
          v-else-if="!coursesStore.courses.length"
          title="No courses yet"
          message="Create your first course with the form on the left."
        >
          <button
            type="button"
            class="btn btn--primary btn--sm"
            @click="focusAddForm"
          >
            Create first course
          </button>
        </EmptyState>

        <CourseList
          v-else
          :courses="coursesStore.courses"
          :deleting-id="deletingId"
          @delete="askDelete"
        />
      </section>
    </div>

    <ConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="`Delete ${deleteTarget?.courseId ?? 'course'}?`"
      :message="deleteMessage"
      confirm-label="Delete course"
      :busy="Boolean(deletingId)"
      @cancel="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
