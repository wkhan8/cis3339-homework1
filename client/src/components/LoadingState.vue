<script setup>
defineProps({
  label: { type: String, default: 'Loading…' },
});
</script>

<template>
  <div class="loading-state" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <p>{{ label }}</p>
  </div>
</template>
