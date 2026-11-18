<script setup>
import { useNotificationsStore } from '@/stores/notifications';

const notificationsStore = useNotificationsStore();

const iconFor = (type) => {
  if (type === 'success') return '✓';
  if (type === 'error') return '!';
  return 'i';
};
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="notification in notificationsStore.notifications"
        :key="notification.id"
        class="toast"
        :class="`toast--${notification.type}`"
        role="status"
      >
        <span class="toast-icon" aria-hidden="true">
          {{ iconFor(notification.type) }}
        </span>
        <p>{{ notification.message }}</p>
        <button
          type="button"
          class="toast-dismiss"
          aria-label="Dismiss notification"
          @click="notificationsStore.dismiss(notification.id)"
        >
          ×
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
