<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AlertBanner from '@/components/AlertBanner.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';
import PageHeader from '@/components/PageHeader.vue';
import StudentForm from '@/components/StudentForm.vue';
import StudentTable from '@/components/StudentTable.vue';
import { useNotificationsStore } from '@/stores/notifications';
import { useStudentsStore } from '@/stores/students';

const studentsStore = useStudentsStore();
const notifications = useNotificationsStore();

const searchTerm = ref('');
const addForm = ref(null);
const formError = ref('');
const adding = ref(false);
const deletingId = ref('');
const deleteTarget = ref(null);

let searchTimer = null;

const showingResults = computed(() => searchTerm.value.trim().length > 0);

const deleteMessage = computed(() => {
  if (!deleteTarget.value) return '';
  return `This permanently removes ${deleteTarget.value.name} (${deleteTarget.value.studentId}) and any course enrollments for this student.`;
});

async function loadStudents(term = searchTerm.value) {
  await studentsStore.fetchStudents(term);
}

onMounted(() => loadStudents(''));

watch(searchTerm, (value) => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => loadStudents(value), 300);
});

onBeforeUnmount(() => window.clearTimeout(searchTimer));

async function handleAdd(payload) {
  adding.value = true;
  formError.value = '';

  const result = await studentsStore.addStudent(payload);
  adding.value = false;

  if (result.ok) {
    addForm.value?.reset();
    notifications.success(`${result.student.name} was added to the directory.`);

    if (searchTerm.value) {
      searchTerm.value = '';
    }
  } else {
    formError.value = result.message;
    notifications.error(result.message);
  }
}

function askDelete(student) {
  deleteTarget.value = student;
}

async function confirmDelete() {
  if (!deleteTarget.value) return;

  const target = deleteTarget.value;
  deletingId.value = target.studentId;

  const result = await studentsStore.deleteStudent(target.studentId);
  deletingId.value = '';
  deleteTarget.value = null;

  if (result.ok) {
    const extra = result.removedEnrollments
      ? ` and ${result.removedEnrollments} enrollment${result.removedEnrollments === 1 ? '' : 's'}`
      : '';
    notifications.success(`${target.name} was deleted${extra}.`);
    if (searchTerm.value) {
      await loadStudents(searchTerm.value);
    }
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
      eyebrow="Register · 01"
      title="Student register"
      description="Add and maintain student records. Removing a student also clears their course enrollments."
    >
      <template #actions>
        <button
          type="button"
          class="btn btn--ghost"
          :disabled="studentsStore.loading"
          @click="loadStudents()"
        >
          Refresh
        </button>
      </template>
    </PageHeader>

    <div class="split-layout">
      <section class="card" aria-labelledby="add-student-title">
        <div class="card-header">
          <div>
            <h2 id="add-student-title">New student</h2>
            <p>Create a student record.</p>
          </div>
        </div>

        <StudentForm
          ref="addForm"
          :busy="adding"
          :server-error="formError"
          @submit="handleAdd"
        />
      </section>

      <section class="card" aria-labelledby="student-directory-title">
        <div class="card-header">
          <div>
            <h2 id="student-directory-title">Directory</h2>
            <p>Search by name or student ID.</p>
          </div>
          <span class="badge">
            {{ studentsStore.count }} {{ showingResults ? 'found' : 'total' }}
          </span>
        </div>

        <div class="search-bar">
          <svg
            viewBox="0 0 24 24"
            width="17"
            height="17"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <label class="sr-only" for="student-search">Search students</label>
          <input
            id="student-search"
            v-model="searchTerm"
            type="search"
            placeholder="Search students…"
            autocomplete="off"
          />
          <button
            v-if="searchTerm"
            type="button"
            class="search-clear"
            aria-label="Clear search"
            @click="searchTerm = ''"
          >
            ×
          </button>
        </div>

        <AlertBanner :message="studentsStore.error">
          <template #action>
            <button
              type="button"
              class="btn btn--ghost btn--sm"
              @click="loadStudents()"
            >
              Try again
            </button>
          </template>
        </AlertBanner>

        <LoadingState
          v-if="studentsStore.loading && !studentsStore.hasLoaded"
          label="Loading students…"
        />

        <EmptyState
          v-else-if="!studentsStore.students.length"
          :title="showingResults ? 'No matching students' : 'No students yet'"
          :message="
            showingResults
              ? 'Try a different name or student ID.'
              : 'Create your first record with the form on the left.'
          "
        >
          <button
            v-if="!showingResults"
            type="button"
            class="btn btn--primary btn--sm"
            @click="focusAddForm"
          >
            Create first record
          </button>
        </EmptyState>

        <StudentTable
          v-else
          :students="studentsStore.students"
          :deleting-id="deletingId"
          @delete="askDelete"
        />
      </section>
    </div>

    <ConfirmDialog
      :open="Boolean(deleteTarget)"
      :title="`Delete ${deleteTarget?.name ?? 'student'}?`"
      :message="deleteMessage"
      confirm-label="Delete student"
      :busy="Boolean(deletingId)"
      @cancel="deleteTarget = null"
      @confirm="confirmDelete"
    />
  </div>
</template>
