<template>
  <div class="relative">
    <!-- Admin: Full version badge with dropdown -->
    <template v-if="isAdmin">
      <button
        @click="toggleDropdown"
        class="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors"
        :class="[
          hasUpdate
            ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-dark-800 dark:text-dark-400 dark:hover:bg-dark-700'
        ]"
        :title="
          hasUpdate
            ? t('version.updateAvailable')
            : customDeployRequired
              ? t('version.customDeployRequired')
              : t('version.upToDate')
        "
      >
        <span v-if="displayBadgeVersion" class="font-medium">{{
          versionLabel(displayBadgeVersion)
        }}</span>
        <span
          v-else
          class="h-3 w-12 animate-pulse rounded bg-gray-200 font-medium dark:bg-dark-600"
        ></span>
        <!-- Update indicator -->
        <span v-if="hasUpdate" class="relative flex h-2 w-2">
          <span
            class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"
          ></span>
          <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
        </span>
      </button>

      <!-- Dropdown -->
      <transition name="dropdown">
        <div
          v-if="dropdownOpen"
          ref="dropdownRef"
          class="absolute left-0 z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-dark-700 dark:bg-dark-800"
        >
          <!-- Header with refresh button -->
          <div
            class="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-dark-700"
          >
            <span class="text-sm font-medium text-gray-700 dark:text-dark-300">{{
              hasUpdate ? t('version.latestVersion') : t('version.currentVersion')
            }}</span>
            <button
              @click="refreshVersion(true)"
              class="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-dark-700 dark:hover:text-dark-200"
              :disabled="loading"
              :title="t('version.refresh')"
            >
              <Icon
                name="refresh"
                size="sm"
                :stroke-width="2"
                :class="{ 'animate-spin': loading }"
              />
            </button>
          </div>

          <div class="p-4">
            <!-- Loading state -->
            <div v-if="loading" class="flex items-center justify-center py-6">
              <svg class="h-6 w-6 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>

            <!-- Content -->
            <template v-else>
              <!-- Version display - centered and prominent -->
              <div class="mb-4 text-center">
                <div class="inline-flex items-center gap-2">
                  <span
                    v-if="primaryVersion"
                    class="text-2xl font-bold text-gray-900 dark:text-white"
                    >{{ versionLabel(primaryVersion) }}</span
                  >
                  <span v-else class="text-2xl font-bold text-gray-400 dark:text-dark-500">--</span>
                  <!-- Show check mark when up to date -->
                  <span
                    v-if="!hasUpdate && !customDeployRequired"
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30"
                  >
                    <svg
                      class="h-3 w-3 text-green-600 dark:text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </span>
                  <span
                    v-else-if="customDeployRequired"
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30"
                  >
                    <Icon
                      name="shield"
                      size="xs"
                      :stroke-width="2"
                      class="text-primary-600 dark:text-primary-400"
                    />
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500 dark:text-dark-400">
                  {{
                    hasUpdate
                      ? t('version.runningVersion') + ': ' + versionLabel(currentVersion)
                      : customDeployRequired
                        ? t('version.customDeployRequired')
                      : t('version.upToDate')
                  }}
                </p>
              </div>

              <!-- Update available: official in-app update is disabled for NavToAI builds -->
              <div v-if="hasUpdate" class="space-y-2">
                <div
                  class="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800/50 dark:bg-amber-900/20"
                >
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50"
                  >
                    <Icon
                      name="externalLink"
                      size="sm"
                      :stroke-width="2"
                      class="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {{ t('version.latestVersion') }}: {{ versionLabel(latestVersion) }}
                    </p>
                    <p class="text-xs text-amber-600/70 dark:text-amber-400/70">
                      {{ t('version.runningVersion') }}: {{ versionLabel(currentVersion) }}
                    </p>
                  </div>
                </div>

                <div
                  class="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800/50 dark:bg-blue-900/20"
                >
                  <svg
                    class="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500 dark:text-blue-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-xs leading-5 text-blue-600 dark:text-blue-400">
                    {{ t('version.customDeployHint') }}
                  </p>
                </div>
              </div>

              <!-- Custom deploy policy -->
              <div v-else-if="customDeployRequired" class="space-y-2">
                <div
                  class="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 p-3 dark:border-primary-800/50 dark:bg-primary-900/20"
                >
                  <div
                    class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/50"
                  >
                    <Icon
                      name="shield"
                      size="sm"
                      :stroke-width="2"
                      class="text-primary-600 dark:text-primary-400"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {{ t('version.customDeployRequired') }}
                    </p>
                    <p class="mt-1 text-xs leading-5 text-primary-600/80 dark:text-primary-400/80">
                      {{ t('version.customDeployHint') }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Up to date -->
              <div
                v-else
                class="flex items-center justify-center gap-2 py-2 text-sm text-gray-500 dark:text-dark-400"
              >
                <Icon name="checkCircle" size="sm" :stroke-width="2" />
                {{ t('version.upToDate') }}
              </div>

              <a
                :href="githubReleaseUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700 dark:border-dark-700 dark:bg-dark-800 dark:text-dark-300 dark:hover:border-primary-800 dark:hover:bg-primary-900/20 dark:hover:text-primary-300"
              >
                <Icon name="externalLink" size="xs" :stroke-width="2" />
                {{ t('version.viewGithubRelease') }}
              </a>
            </template>
          </div>
        </div>
      </transition>
    </template>

    <!-- Non-admin: Simple static version text -->
    <span v-else-if="version" class="text-xs text-gray-500 dark:text-dark-400">
      v{{ version }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import Icon from '@/components/icons/Icon.vue'

const { t } = useI18n()

const props = defineProps<{
  version?: string
}>()

const authStore = useAuthStore()
const appStore = useAppStore()

const isAdmin = computed(() => authStore.isAdmin)

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
let autoRefreshTimer: ReturnType<typeof setInterval> | undefined
const autoRefreshIntervalMs = 20 * 60 * 1000

// Use store's cached version state
const loading = computed(() => appStore.versionLoading)
const currentVersion = computed(() => appStore.currentVersion || props.version || '')
const latestVersion = computed(() => appStore.latestVersion)
const hasUpdate = computed(() => appStore.hasUpdate)
const customDeployRequired = computed(() => appStore.customDeployRequired)
const releaseInfo = computed(() => appStore.releaseInfo)
const displayBadgeVersion = computed(() =>
  hasUpdate.value && latestVersion.value ? latestVersion.value : currentVersion.value
)
const primaryVersion = displayBadgeVersion
const githubReleaseUrl = computed(() => {
  if (releaseInfo.value?.html_url) {
    return releaseInfo.value.html_url
  }

  const version = latestVersion.value || currentVersion.value
  if (!version) {
    return 'https://github.com/Wei-Shaw/sub2api/releases/latest'
  }

  return `https://github.com/Wei-Shaw/sub2api/releases/tag/v${normalizeVersion(version)}`
})

function normalizeVersion(version: string) {
  return version.replace(/^v/i, '')
}

function versionLabel(version: string) {
  const normalized = normalizeVersion(version)
  return normalized ? `v${normalized}` : '--'
}

function toggleDropdown() {
  dropdownOpen.value = !dropdownOpen.value
}

function closeDropdown() {
  dropdownOpen.value = false
}

async function refreshVersion(force = true) {
  if (!isAdmin.value) return

  await appStore.fetchVersion(force)
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Node
  const button = (event.target as Element).closest('button')
  if (dropdownRef.value && !dropdownRef.value.contains(target) && !button?.contains(target)) {
    closeDropdown()
  }
}

onMounted(() => {
  if (isAdmin.value) {
    // Use cached version if available, otherwise fetch
    appStore.fetchVersion(false)
    autoRefreshTimer = setInterval(() => {
      appStore.fetchVersion(true)
    }, autoRefreshIntervalMs)
  }
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer)
  }
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
