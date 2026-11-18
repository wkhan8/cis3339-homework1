<script setup>
import AppHeader from '@/components/AppHeader.vue';
import ToastStack from '@/components/ToastStack.vue';
</script>

<template>
  <a class="skip-link" href="#main-content">Skip to content</a>

  <div class="app-shell">
    <AppHeader />

    <main id="main-content" class="app-main" tabindex="-1">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <footer class="app-footer">
      <p>Student Records · CIS 3339</p>
      <p>Vue 3 / Express / MongoDB</p>
    </footer>
  </div>

  <ToastStack />
</template>
