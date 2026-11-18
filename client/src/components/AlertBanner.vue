<script setup>
defineProps({
  message: { type: String, default: '' },
  type: { type: String, default: 'error' },
});
</script>

<template>
  <div v-if="message" class="alert" :class="`alert--${type}`" role="alert">
    <p>{{ message }}</p>
    <slot name="action" />
  </div>
</template>
