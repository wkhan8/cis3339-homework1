<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, default: 'Are you sure?' },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Delete' },
  busy: { type: Boolean, default: false },
});

const emit = defineEmits(['confirm', 'cancel']);

const dialog = ref(null);
const confirmButton = ref(null);
let lastFocused = null;

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      lastFocused = document.activeElement;
      document.body.classList.add('modal-open');
      await nextTick();
      confirmButton.value?.focus();
    } else {
      document.body.classList.remove('modal-open');
      lastFocused?.focus?.();
      lastFocused = null;
    }
  }
);

function handleKeydown(event) {
  if (event.key === 'Escape' && !props.busy) {
    emit('cancel');
    return;
  }

  if (event.key !== 'Tab' || !dialog.value) return;

  const focusable = Array.from(
    dialog.value.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

onBeforeUnmount(() => {
  document.body.classList.remove('modal-open');
});
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="modal-backdrop"
        @click.self="!busy && emit('cancel')"
        @keydown="handleKeydown"
      >
        <div
          ref="dialog"
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
          aria-describedby="confirm-dialog-message"
        >
          <h2 id="confirm-dialog-title">{{ title }}</h2>
          <p id="confirm-dialog-message">{{ message }}</p>

          <div class="modal-actions">
            <button
              type="button"
              class="btn btn--ghost"
              :disabled="busy"
              @click="emit('cancel')"
            >
              Cancel
            </button>
            <button
              ref="confirmButton"
              type="button"
              class="btn btn--danger"
              :disabled="busy"
              @click="emit('confirm')"
            >
              {{ busy ? 'Working…' : confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
