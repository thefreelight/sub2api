<template>
  <div class="app-shell min-h-screen">
    <!-- Background Decoration -->
    <div class="app-grid-bg pointer-events-none fixed inset-0"></div>

    <!-- Sidebar -->
    <AppSidebar />

    <!-- Main Content Area -->
    <div
      class="relative min-h-screen transition-all duration-300"
      :class="[sidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64']"
    >
      <!-- Header -->
      <AppHeader />

      <!-- Main Content -->
      <main class="app-main p-4 md:p-6 lg:p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/styles/onboarding.css'
import { computed, onMounted } from 'vue'
import { useAppStore } from '@/stores'
import { useAuthStore } from '@/stores/auth'
import { useOnboardingTour } from '@/composables/useOnboardingTour'
import { useOnboardingStore } from '@/stores/onboarding'
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'

const appStore = useAppStore()
const authStore = useAuthStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
const isAdmin = computed(() => authStore.user?.role === 'admin')

const { replayTour } = useOnboardingTour({
  storageKey: isAdmin.value ? 'admin_guide' : 'user_guide',
  autoStart: true
})

const onboardingStore = useOnboardingStore()

onMounted(() => {
  onboardingStore.setReplayCallback(replayTour)
})

defineExpose({ replayTour })
</script>

<style scoped>
.app-shell {
  color: #09111f;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 247, 251, 0.96)),
    #f5f7fb;
}

.app-grid-bg {
  background:
    repeating-linear-gradient(90deg, rgba(15, 23, 42, 0.035) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(180deg, rgba(15, 23, 42, 0.028) 0 1px, transparent 1px 88px);
}

.app-main {
  position: relative;
  z-index: 1;
}

:global(.dark) .app-shell {
  color: #f8fafc;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.58), rgba(2, 6, 23, 0.96)),
    #020617;
}

:global(.dark) .app-grid-bg {
  background:
    repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.055) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(180deg, rgba(148, 163, 184, 0.045) 0 1px, transparent 1px 88px);
}
</style>
