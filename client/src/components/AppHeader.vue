<script setup>
const links = [
  { to: '/students', label: 'Students' },
  { to: '/courses', label: 'Courses' },
  { to: '/enrollments', label: 'Enrollments' },
];
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/students" class="brand" aria-label="Student Records home">
        <span class="brand-mark" aria-hidden="true">SR</span>
        <span class="brand-text">
          <strong>Student Records</strong>
          <small>CIS 3339 · Records Office</small>
        </span>
      </RouterLink>

      <nav class="primary-nav" aria-label="Main navigation">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
        >
          {{ link.label }}
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
