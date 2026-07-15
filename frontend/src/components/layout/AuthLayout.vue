<template>
  <div class="auth-page" :class="{ 'is-dark': isDark }">
    <router-link to="/home" class="auth-brand" :aria-label="`${siteName} home`">
      <span class="auth-logo">
        <img
          v-if="siteLogo"
          :src="siteLogo"
          :alt="`${siteName} logo`"
          class="h-full w-full object-contain"
        />
        <span v-else class="auth-glyph" aria-hidden="true"></span>
      </span>
      <span>{{ siteName }}</span>
    </router-link>

    <main class="auth-shell">
      <section class="auth-hero" aria-hidden="true">
        <p>{{ authCopy.eyebrow }}</p>
        <h1>{{ authCopy.title }}</h1>
        <div class="auth-model-map">
          <span v-for="item in authCopy.chips" :key="item">{{ item }}</span>
        </div>
      </section>

      <section class="auth-panel">
        <div class="mb-8 text-center">
          <div class="mb-4 inline-flex h-12 w-12 items-center justify-center">
            <img
              v-if="siteLogo"
              :src="siteLogo"
              alt=""
              class="h-full w-full object-contain"
            />
            <span v-else class="auth-glyph auth-glyph-large" aria-hidden="true"></span>
          </div>
          <h1 class="auth-title">{{ siteName }}</h1>
          <p class="auth-subtitle">{{ siteSubtitle }}</p>
        </div>

        <div class="auth-card">
          <slot />
        </div>

        <div class="auth-footer">
          <slot name="footer" />
        </div>

        <p class="auth-copy">&copy; {{ currentYear }} {{ siteName }}. All rights reserved.</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores'
import { sanitizeUrl } from '@/utils/url'

const appStore = useAppStore()
const { locale } = useI18n()
const isZh = computed(() => locale.value.startsWith('zh'))

const rawSiteName = computed(() => appStore.siteName || appStore.cachedPublicSettings?.site_name || 'Sub2API')
const normalizeBrandName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed || trimmed === 'Sub2API') return 'NavtoAI API'
  return trimmed.toLowerCase() === 'navtoai api' ? 'NavtoAI API' : trimmed
}
const siteName = computed(() => {
  return normalizeBrandName(rawSiteName.value)
})
const siteLogo = computed(() => sanitizeUrl(appStore.siteLogo || '', { allowRelative: true, allowDataUrl: true }))
const siteSubtitle = computed(() => {
  const subtitle = appStore.cachedPublicSettings?.site_subtitle?.trim()
  const isLegacySubtitle = subtitle === 'AI API Gateway Platform' || subtitle === 'Subscription to API Conversion Platform'
  if (subtitle && !isLegacySubtitle) return subtitle
  return isZh.value ? '统一 AI API 网关平台' : 'Unified AI API Gateway'
})
const authCopy = computed(() => isZh.value
  ? {
      eyebrow: '统一 AI API 网关',
      title: '一个账户，管理所有模型路由。',
      chips: ['统一密钥', '模型路由', '用量计费', '团队管控']
    }
  : {
      eyebrow: 'Unified API Gateway for AI',
      title: 'One account for every model route.',
      chips: ['Keys', 'Routing', 'Usage', 'Control']
    })
const isDark = computed(() => document.documentElement.classList.contains('dark'))
const currentYear = computed(() => new Date().getFullYear())

onMounted(() => {
  appStore.fetchPublicSettings()
})
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(245, 247, 251, 0.96)),
    repeating-linear-gradient(90deg, rgba(15, 23, 42, 0.04) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(180deg, rgba(15, 23, 42, 0.032) 0 1px, transparent 1px 88px),
    #f5f7fb;
  color: #09111f;
}

.auth-brand {
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 20;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(85, 98, 119, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 780;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(16px);
}

.auth-logo {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
}

.auth-glyph {
  position: relative;
  display: block;
  width: 24px;
  height: 24px;
  transform: rotate(30deg);
  border-radius: 7px;
  background: linear-gradient(135deg, #7467ff, #9d93ff);
  box-shadow: 0 10px 24px rgba(109, 93, 252, 0.26);
}

.auth-glyph::after {
  position: absolute;
  inset: 6px;
  content: '';
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.7);
}

.auth-glyph-large {
  width: 44px;
  height: 44px;
  border-radius: 10px;
}

.auth-glyph-large::after {
  inset: 12px;
}

.auth-shell {
  display: flex;
  width: min(100% - 32px, 560px);
  min-height: 100vh;
  margin-inline: auto;
  align-items: center;
  justify-content: center;
  padding: 92px 0 56px;
}

.auth-hero p {
  display: inline-flex;
  margin-bottom: 22px;
  border: 1px solid rgba(109, 93, 252, 0.2);
  border-radius: 8px;
  background: rgba(109, 93, 252, 0.09);
  padding: 6px 10px;
  color: #5d50db;
  font-size: 12px;
  font-weight: 760;
}

.auth-hero {
  display: none;
}

.auth-hero h1 {
  max-width: 540px;
  color: #09111f;
  font-size: 54px;
  font-weight: 780;
  line-height: 1.02;
}

.auth-model-map {
  display: flex;
  flex-wrap: wrap;
  max-width: 470px;
  gap: 12px;
  margin-top: 30px;
}

.auth-model-map span {
  border: 1px solid rgba(85, 98, 119, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  padding: 10px 13px;
  color: #475569;
  font-size: 13px;
  font-weight: 760;
  box-shadow: 0 14px 38px rgba(15, 23, 42, 0.07);
}

.auth-panel {
  width: 100%;
  max-width: 520px;
}

.auth-title {
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
}

.auth-subtitle {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

.auth-card {
  border: 1px solid rgba(85, 98, 119, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.94);
  padding: 32px;
  box-shadow: 0 26px 80px rgba(15, 23, 42, 0.12);
  backdrop-filter: blur(18px);
}

.auth-footer {
  margin-top: 18px;
  color: #64748b;
  text-align: center;
  font-size: 14px;
}

.auth-copy {
  margin-top: 28px;
  color: #94a3b8;
  text-align: center;
  font-size: 12px;
}

:deep(h2) {
  color: #0f172a;
  font-size: 26px;
  font-weight: 800;
}

:deep(.input-label) {
  color: #334155;
  font-weight: 720;
}

:deep(.input) {
  min-height: 48px;
  border-color: rgba(100, 116, 139, 0.28);
  border-radius: 8px;
  background: #f8fafc;
  color: #0f172a;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
}

:deep(.input:focus) {
  border-color: #6d5dfc;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(109, 93, 252, 0.14);
}

:deep(.btn) {
  min-height: 48px;
  border-radius: 8px;
  font-weight: 780;
}

:deep(.btn-primary) {
  background: #07111f !important;
  background-image: none !important;
  color: #f8fafc !important;
  box-shadow: 0 18px 36px rgba(7, 17, 31, 0.18);
}

:deep(.btn-primary:hover) {
  background: #111c2d !important;
}

:deep(a),
:deep(a.text-primary-600),
:deep(a.dark\:text-primary-400) {
  color: #5d50db !important;
  text-decoration: none;
}

:deep(a:hover),
:deep(a.hover\:text-primary-500:hover),
:deep(a.dark\:hover\:text-primary-300:hover) {
  color: #493ec7 !important;
}

.auth-page.is-dark {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.58), rgba(2, 6, 23, 0.96)),
    repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.055) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(180deg, rgba(148, 163, 184, 0.045) 0 1px, transparent 1px 88px),
    #020617;
  color: #f8fafc;
}

.auth-page.is-dark .auth-brand,
.auth-page.is-dark .auth-card,
.auth-page.is-dark .auth-model-map span {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.86);
  color: #f8fafc;
}

.auth-page.is-dark .auth-hero h1,
.auth-page.is-dark .auth-title,
.auth-page.is-dark :deep(h2) {
  color: #f8fafc;
}

.auth-page.is-dark .auth-subtitle,
.auth-page.is-dark :deep(.input-label),
.auth-page.is-dark :deep(.input-hint) {
  color: #cbd5e1;
}

.auth-page.is-dark .auth-footer,
.auth-page.is-dark .auth-copy {
  color: #94a3b8;
}

.auth-page.is-dark :deep(a),
.auth-page.is-dark :deep(a.text-primary-600),
.auth-page.is-dark :deep(a.dark\:text-primary-400) {
  color: #c7d2fe !important;
}

.auth-page.is-dark :deep(a:hover),
.auth-page.is-dark :deep(a.hover\:text-primary-500:hover),
.auth-page.is-dark :deep(a.dark\:hover\:text-primary-300:hover) {
  color: #e0e7ff !important;
}

.auth-page.is-dark :deep(.btn-primary) {
  background: #f8fafc !important;
  background-image: none !important;
  color: #07111f !important;
  box-shadow: 0 18px 36px rgba(248, 250, 252, 0.1);
}

.auth-page.is-dark :deep(.btn-primary:hover) {
  background: #e5e7eb !important;
}

.auth-page.is-dark :deep(.input) {
  border-color: rgba(148, 163, 184, 0.22);
  background: rgba(15, 23, 42, 0.78);
  color: #f8fafc;
}

@media (max-width: 900px) {
  .auth-brand {
    position: static;
    margin: 16px 16px 0;
  }

  .auth-shell {
    min-height: auto;
    padding-top: 34px;
  }
}

@media (max-width: 520px) {
  .auth-shell {
    width: min(100% - 28px, 1120px);
    padding-bottom: 34px;
  }

  .auth-card {
    padding: 24px 18px;
  }
}
</style>
