import { defineStore } from 'pinia';
import { ref } from 'vue';

let nextId = 0;

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);

  function dismiss(id) {
    notifications.value = notifications.value.filter((item) => item.id !== id);
  }

  function notify(message, type = 'success', timeout = 4200) {
    const id = ++nextId;
    notifications.value.push({ id, message, type });

    if (timeout) {
      window.setTimeout(() => dismiss(id), timeout);
    }

    return id;
  }

  const success = (message) => notify(message, 'success');
  const error = (message) => notify(message, 'error', 6000);
  const info = (message) => notify(message, 'info');

  return { notifications, notify, dismiss, success, error, info };
});
