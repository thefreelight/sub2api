<template>
  <div v-if="homeContent" class="min-h-screen">
    <iframe
      v-if="isHomeContentUrl"
      :src="homeContent.trim()"
      class="h-screen w-full border-0"
      allowfullscreen
    ></iframe>
    <div v-else v-html="homeContent"></div>
  </div>

  <div
    v-else
    class="navto-home min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-950 dark:bg-dark-950 dark:text-white"
    :class="{ 'is-dark': isDark }"
  >
    <header class="home-shell relative z-30 pt-4 sm:pt-6">
      <nav class="home-nav" aria-label="Primary navigation">
        <router-link to="/home" class="brand-link" :aria-label="`${brandName} home`">
          <span class="brand-logo">
            <img
              v-if="siteLogo"
              :src="siteLogo"
              :alt="`${brandName} logo`"
              class="h-full w-full object-contain"
            />
            <span v-else class="brand-glyph" aria-hidden="true"></span>
          </span>
          <span class="brand-name">{{ brandName }}</span>
        </router-link>

        <div class="hidden items-center gap-8 text-sm font-medium text-slate-700 dark:text-dark-200 lg:flex">
          <a href="#product" class="nav-link">{{ landingCopy.product }}</a>
          <a href="#pricing" class="nav-link">{{ landingCopy.pricing }}</a>
          <a v-if="docsHref" :href="docsHref" target="_blank" rel="noopener noreferrer" class="nav-link">{{ landingCopy.docs }}</a>
          <a href="#company" class="nav-link">{{ landingCopy.company }}</a>
        </div>

        <div class="flex items-center gap-2 sm:gap-3">
          <div class="hidden sm:block">
            <LocaleSwitcher />
          </div>

          <button
            type="button"
            class="icon-button"
            :aria-label="isDark ? 'Switch to light theme' : 'Switch to dark theme'"
            @click="toggleTheme"
          >
            <Icon v-if="isDark" name="sun" size="sm" />
            <Icon v-else name="moon" size="sm" />
          </button>

          <router-link
            v-if="!isAuthenticated"
            to="/login"
            class="hidden text-sm font-semibold text-slate-800 transition-colors hover:text-slate-950 dark:text-dark-100 dark:hover:text-white md:inline-flex"
          >
            {{ landingCopy.login }}
          </router-link>

          <router-link :to="primaryPath" class="primary-button">
            <span>{{ primaryLabel }}</span>
            <Icon name="arrowRight" size="sm" :stroke-width="2" />
          </router-link>
        </div>
      </nav>
    </header>

    <main class="home-shell relative z-10 pb-28 pt-12 sm:pb-16 sm:pt-16">
      <section class="hero-grid" aria-labelledby="home-title">
        <div class="hero-copy">
          <p class="eyebrow">{{ landingCopy.eyebrow }}</p>
          <h1 id="home-title">{{ landingCopy.title }}</h1>
          <p class="hero-subtitle">{{ heroSubtitle }}</p>

          <div class="hero-highlights" aria-label="Launch highlights">
            <article v-for="highlight in launchHighlights" :key="highlight.value" class="highlight-card">
              <span>{{ highlight.kicker }}</span>
              <strong>{{ highlight.value }}</strong>
              <p>{{ highlight.description }}</p>
            </article>
          </div>

          <div class="hero-actions">
            <router-link :to="primaryPath" class="hero-primary">
              <span>{{ isAuthenticated ? landingCopy.openDashboard : landingCopy.getStartedFree }}</span>
              <Icon name="arrowRight" size="sm" :stroke-width="2" />
            </router-link>
            <a v-if="docsHref" :href="docsHref" target="_blank" rel="noopener noreferrer" class="hero-secondary">
              <span>{{ landingCopy.viewDocs }}</span>
              <Icon name="externalLink" size="sm" :stroke-width="2" />
            </a>
          </div>
        </div>
      </section>

      <section class="code-panel" aria-label="API request example">
        <div class="code-toolbar">
          <div class="code-tabs" aria-label="Example languages">
            <button
              v-for="tab in codeTabs"
              :key="tab.id"
              type="button"
              class="code-tab"
              :class="{ 'is-active': activeCodeTab === tab.id }"
              :aria-pressed="activeCodeTab === tab.id"
              @click="activeCodeTab = tab.id"
            >
              {{ tab.label }}
            </button>
          </div>
          <span class="status-pill">
            <span aria-hidden="true"></span>
            200 OK
          </span>
        </div>

        <pre class="code-body" :data-language="activeCodeLabel"><code><span
            v-for="(line, index) in highlightedCodeLines"
            :key="`${activeCodeTab}-${index}`"
            class="code-row"
          ><span class="code-line-number">{{ index + 1 }}</span><span class="code-line-source" v-html="line || '&nbsp;'"></span></span></code></pre>
      </section>

      <section class="logo-strip" aria-label="Supported model ecosystems">
        <p>{{ landingCopy.routingLabel }}</p>
        <div>
          <span v-for="logo in routingLogos" :key="logo">{{ logo }}</span>
        </div>
      </section>

      <section id="product" class="feature-grid" aria-label="Product capabilities">
        <article v-for="feature in featureCards" :key="feature.title" class="feature-card">
          <span class="feature-icon">
            <Icon :name="feature.icon" size="sm" :stroke-width="2" />
          </span>
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.description }}</p>
        </article>
      </section>

      <section id="pricing" class="build-band" aria-labelledby="build-title">
        <div>
          <p class="eyebrow">{{ landingCopy.buildEyebrow }}</p>
          <h2 id="build-title">{{ landingCopy.buildTitle }}</h2>
          <p>
            {{ landingCopy.buildDescription }}
          </p>
        </div>
        <router-link :to="primaryPath" class="build-button">
          <span>{{ isAuthenticated ? landingCopy.goConsole : landingCopy.createKey }}</span>
          <Icon name="arrowRight" size="sm" :stroke-width="2" />
        </router-link>
      </section>
    </main>

    <footer id="company" class="home-footer">
      <div class="home-shell footer-inner">
        <p>&copy; {{ currentYear }} {{ brandName }}. All rights reserved.</p>
        <div>
          <a v-if="docsHref" :href="docsHref" target="_blank" rel="noopener noreferrer">{{ landingCopy.docs }}</a>
          <router-link :to="primaryPath">{{ isAuthenticated ? landingCopy.dashboard : landingCopy.login }}</router-link>
        </div>
      </div>
    </footer>

    <nav class="mobile-dock" aria-label="Mobile navigation">
      <router-link to="/home" aria-label="Home">
        <Icon name="home" size="md" />
        <span>{{ landingCopy.mobileHome }}</span>
      </router-link>
      <router-link to="/available-channels" aria-label="Models">
        <Icon name="cube" size="md" />
        <span>{{ landingCopy.mobileModels }}</span>
      </router-link>
      <router-link to="/key-usage" aria-label="Usage">
        <Icon name="chart" size="md" />
        <span>{{ landingCopy.mobileUsage }}</span>
      </router-link>
      <a v-if="docsHref" :href="docsHref" target="_blank" rel="noopener noreferrer" aria-label="Docs">
        <Icon name="document" size="md" />
        <span>{{ landingCopy.docs }}</span>
      </a>
      <router-link :to="primaryPath" aria-label="Account">
        <Icon name="userCircle" size="md" />
        <span>{{ landingCopy.mobileAccount }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore, useAppStore } from '@/stores'
import LocaleSwitcher from '@/components/common/LocaleSwitcher.vue'
import Icon from '@/components/icons/Icon.vue'

type FeatureIcon = 'bolt' | 'sync' | 'shield'
type CodeTabId = 'curl' | 'python' | 'javascript' | 'typescript' | 'go' | 'more'
type CodeTab = {
  id: CodeTabId
  label: string
}
type HighlightPattern = {
  kind: string
  regex: RegExp
}

const { locale } = useI18n()
const authStore = useAuthStore()
const appStore = useAppStore()

const codeTabs: CodeTab[] = [
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go', label: 'Go' },
  { id: 'more', label: 'More' }
]
const activeCodeTab = ref<CodeTabId>('curl')
const activeCodeLabel = computed(() => codeTabs.find((tab) => tab.id === activeCodeTab.value)?.label || 'Code')

const siteName = computed(() => appStore.cachedPublicSettings?.site_name || appStore.siteName || 'Sub2API')
const siteLogo = computed(() => appStore.cachedPublicSettings?.site_logo || appStore.siteLogo || '')
const siteSubtitle = computed(() => appStore.cachedPublicSettings?.site_subtitle || '')
const docUrl = computed(() => appStore.cachedPublicSettings?.doc_url || appStore.docUrl || '')
const apiBaseUrl = computed(() => appStore.cachedPublicSettings?.api_base_url || appStore.apiBaseUrl || '')
const homeContent = computed(() => appStore.cachedPublicSettings?.home_content || '')
const isZh = computed(() => locale.value.startsWith('zh'))
const normalizeBrandName = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed || trimmed === 'Sub2API') return 'NavtoAI API'
  return trimmed.toLowerCase() === 'navtoai api' ? 'NavtoAI API' : trimmed
}

const landingCopy = computed(() => isZh.value
  ? {
      product: '产品',
      pricing: '价格',
      docs: '文档',
      company: '团队',
      login: '登录',
      dashboard: '控制台',
      eyebrow: '统一 AI API 网关',
      title: '一个 API，连接所有 AI 模型',
      openDashboard: '打开控制台',
      getStartedFree: '免费开始',
      viewDocs: '查看文档',
      latestModelKicker: '最新模型',
      latestModelValue: 'GPT-5.5',
      latestModelDesc: '文本、推理和代码任务优先接入。',
      imageModelKicker: '图像生成',
      imageModelValue: 'Image 2',
      imageModelDesc: '已支持 gpt-image-2 接口调用。',
      priceKicker: '价格',
      priceValue: '¥1 = $1',
      priceDesc: '1 元人民币按 1 美元 API 额度抵扣。',
      routingLabel: '覆盖主流模型生态',
      buildEyebrow: '透明计费',
      buildTitle: '1 元人民币充值，对应 1 美元 API 用量额度。',
      buildDescription: '余额、密钥、额度、计费、用户和观测统一在后台完成管理，模型调用按美元额度 1:1 清晰抵扣。',
      goConsole: '进入控制台',
      createKey: '创建 API 密钥',
      mobileHome: '首页',
      mobileModels: '模型',
      mobileUsage: '用量',
      mobileAccount: '账户'
    }
  : {
      product: 'Product',
      pricing: 'Pricing',
      docs: 'Docs',
      company: 'Company',
      login: 'Log in',
      dashboard: 'Dashboard',
      eyebrow: 'Unified API Gateway for AI',
      title: 'One API to connect every AI model',
      openDashboard: 'Open dashboard',
      getStartedFree: 'Get started for free',
      viewDocs: 'View docs',
      latestModelKicker: 'Latest model',
      latestModelValue: 'GPT-5.5',
      latestModelDesc: 'Ready for text, reasoning, and coding workloads.',
      imageModelKicker: 'Image generation',
      imageModelValue: 'Image 2',
      imageModelDesc: 'gpt-image-2 requests are supported.',
      priceKicker: 'Pricing',
      priceValue: 'CNY 1 = USD 1',
      priceDesc: 'Balance converts to API usage credit at 1:1.',
      routingLabel: 'Built for modern model routing',
      buildEyebrow: 'Transparent pricing',
      buildTitle: 'CNY 1 recharge equals USD 1 API usage credit.',
      buildDescription: 'NavtoAI keeps balance, keys, quota, billing, users and observability in one console while usage is deducted against USD credit.',
      goConsole: 'Go to console',
      createKey: 'Create an API key',
      mobileHome: 'Home',
      mobileModels: 'Models',
      mobileUsage: 'Usage',
      mobileAccount: 'Account'
    })

const routingLogos = computed(() => isZh.value
  ? ['GPT-5.5', 'Image 2', 'Claude', 'Gemini', '兼容端点']
  : ['GPT-5.5', 'Image 2', 'Claude', 'Gemini', 'Compatible endpoints'])

const launchHighlights = computed(() => [
  {
    kicker: landingCopy.value.latestModelKicker,
    value: landingCopy.value.latestModelValue,
    description: landingCopy.value.latestModelDesc
  },
  {
    kicker: landingCopy.value.imageModelKicker,
    value: landingCopy.value.imageModelValue,
    description: landingCopy.value.imageModelDesc
  },
  {
    kicker: landingCopy.value.priceKicker,
    value: landingCopy.value.priceValue,
    description: landingCopy.value.priceDesc
  }
])

const featureCards = computed<Array<{ icon: FeatureIcon; title: string; description: string }>>(() => isZh.value
  ? [
      { icon: 'bolt', title: '200+ 模型', description: '通过统一请求格式接入主流模型和兼容端点，减少重复适配。' },
      { icon: 'sync', title: '智能路由', description: '自动调度、故障切换和负载均衡，客户端无需频繁改造。' },
      { icon: 'shield', title: '生产可控', description: '密钥、额度、计费、用户和观测统一在后台完成管理。' }
    ]
  : [
      { icon: 'bolt', title: '200+ Models', description: 'Access leading models and compatible endpoints through one request shape.' },
      { icon: 'sync', title: 'Smart Routing', description: 'Route, fail over and balance traffic without changing every client integration.' },
      { icon: 'shield', title: 'Production Ready', description: 'Manage keys, quota, billing, users and observability from one console.' }
    ])

const brandName = computed(() => {
  return normalizeBrandName(siteName.value)
})

const heroSubtitle = computed(() => {
  const subtitle = siteSubtitle.value.trim()
  const isLegacySubtitle = subtitle === 'AI API Gateway Platform' || subtitle === 'Subscription to API Conversion Platform'
  if (subtitle && !isLegacySubtitle) {
    return subtitle
  }
  if (isZh.value) {
    return 'NavtoAI 将 200+ AI 模型收敛到一个 API 后面，帮助团队更快交付、更低成本运行，并保持模型供应商灵活性。'
  }
  return 'NavtoAI unifies 200+ AI models behind a single API. Ship faster, reduce costs, and stay vendor-flexible.'
})

const displayApiBase = computed(() => {
  const configured = apiBaseUrl.value.trim().replace(/\/$/, '')
  if (configured) {
    return configured
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return 'https://api.navtoai.com'
})

const currentCodeSample = computed(() => {
  const base = displayApiBase.value
  const samples: Record<CodeTabId, string> = {
    curl: `curl ${base}/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-5.5",
    "messages": [
      { "role": "user", "content": "Route this through NavtoAI." }
    ]
  }'`,
    python: `from openai import OpenAI

client = OpenAI(
    api_key="YOUR_API_KEY",
    base_url="${base}/v1",
)

response = client.chat.completions.create(
    model="gpt-5.5",
    messages=[
        {"role": "user", "content": "Route this through NavtoAI."},
    ],
)

print(response.choices[0].message.content)`,
    javascript: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NAVTOAI_API_KEY,
  baseURL: "${base}/v1",
});

const response = await client.chat.completions.create({
  model: "gpt-5.5",
  messages: [
    { role: "user", content: "Route this through NavtoAI." },
  ],
});

console.log(response.choices[0].message.content);`,
    typescript: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.NAVTOAI_API_KEY,
  baseURL: "${base}/v1",
});

const response: OpenAI.Chat.Completions.ChatCompletion =
  await client.chat.completions.create({
    model: "gpt-5.5",
    messages: [
      { role: "user", content: "Route this through NavtoAI." },
    ],
  });

console.log(response.choices[0]?.message?.content);`,
    go: `package main

import (
  "bytes"
  "fmt"
  "net/http"
  "os"
)

func main() {
  body := []byte(\`{
    "model": "gpt-5.5",
    "messages": [
      {"role": "user", "content": "Route this through NavtoAI."}
    ]
  }\`)

  req, _ := http.NewRequest(
    "POST",
    "${base}/v1/chat/completions",
    bytes.NewBuffer(body),
  )
  req.Header.Set("Authorization", "Bearer "+os.Getenv("NAVTOAI_API_KEY"))
  req.Header.Set("Content-Type", "application/json")

  res, _ := http.DefaultClient.Do(req)
  defer res.Body.Close()
  fmt.Println(res.Status)
}`,
    more: isZh.value ? `基础地址
  ${base}/v1

聊天补全
  POST /chat/completions
  model: gpt-5.5

图像生成
  POST /images/generations
  model: gpt-image-2

Responses API
  POST /responses
  model: gpt-5.5

价格
  1 元人民币 = 1 美元 API 用量额度` : `Base URL
  ${base}/v1

Chat completions
  POST /chat/completions
  model: gpt-5.5

Image generation
  POST /images/generations
  model: gpt-image-2

Responses API
  POST /responses
  model: gpt-5.5

Pricing
  CNY 1 = USD 1 API usage credit`
  }

  return samples[activeCodeTab.value]
})

const highlightedCodeLines = computed(() => {
  return currentCodeSample.value.split('\n').map((line) => highlightCodeLine(line, activeCodeTab.value))
})

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function createKeywordPattern(words: string[]) {
  return new RegExp(`\\b(?:${words.join('|')})\\b`, 'y')
}

function getHighlightPatterns(language: CodeTabId): HighlightPattern[] {
  const common: HighlightPattern[] = [
    { kind: 'property', regex: /"[^"\\]*(?:\\.[^"\\]*)*"(?=\s*:)/y },
    { kind: 'string', regex: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`/y },
    { kind: 'url', regex: /https?:\/\/[^\s"'`]+|\/v1\/[^\s"'`]+|\/(?:chat|images|responses)[^\s"'`]*/y },
    { kind: 'number', regex: /\b\d+(?:\.\d+)?\b/y },
    { kind: 'constant', regex: /\b[A-Z][A-Z0-9_]{2,}\b/y }
  ]

  if (language === 'curl' || language === 'more') {
    return [
      { kind: 'comment', regex: /#.*/y },
      { kind: 'keyword', regex: /\b(?:curl|POST|GET|Base URL|Pricing|Responses API|Chat completions|Image generation|基础地址|聊天补全|图像生成|价格)\b/y },
      { kind: 'flag', regex: /-{1,2}[\w-]+/y },
      ...common
    ]
  }

  if (language === 'python') {
    return [
      { kind: 'comment', regex: /#.*/y },
      { kind: 'keyword', regex: createKeywordPattern(['from', 'import', 'client', 'response', 'print']) },
      { kind: 'function', regex: /[A-Za-z_][\w]*(?=\s*\()/y },
      { kind: 'property', regex: /[A-Za-z_][\w]*(?=\s*=)/y },
      ...common
    ]
  }

  if (language === 'go') {
    return [
      { kind: 'comment', regex: /\/\/.*/y },
      { kind: 'keyword', regex: createKeywordPattern(['package', 'import', 'func', 'defer']) },
      { kind: 'type', regex: /\b(?:\[\]byte|string|error)\b/y },
      { kind: 'function', regex: /[A-Za-z_][\w]*(?=\s*\()/y },
      { kind: 'property', regex: /[A-Za-z_][\w]*(?=\s*:=)/y },
      ...common
    ]
  }

  return [
    { kind: 'comment', regex: /\/\/.*/y },
    { kind: 'keyword', regex: createKeywordPattern(['import', 'from', 'const', 'let', 'await', 'new', 'process']) },
    { kind: 'type', regex: /\b(?:OpenAI|ChatCompletion)\b/y },
    { kind: 'function', regex: /[A-Za-z_][\w]*(?=\s*\()/y },
    { kind: 'property', regex: /[A-Za-z_][\w]*(?=\s*:)/y },
    ...common
  ]
}

function highlightCodeLine(line: string, language: CodeTabId) {
  const patterns = getHighlightPatterns(language)
  let output = ''
  let index = 0

  while (index < line.length) {
    let matched = false

    for (const pattern of patterns) {
      pattern.regex.lastIndex = index
      const result = pattern.regex.exec(line)
      if (!result || result.index !== index) {
        continue
      }

      output += `<span class="syntax-${pattern.kind}">${escapeHtml(result[0])}</span>`
      index += result[0].length
      matched = true
      break
    }

    if (!matched) {
      output += escapeHtml(line[index])
      index += 1
    }
  }

  return output
}

const docsHref = computed(() => docUrl.value.trim())

const isHomeContentUrl = computed(() => {
  const content = homeContent.value.trim()
  return content.startsWith('http://') || content.startsWith('https://')
})

const isDark = ref(document.documentElement.classList.contains('dark'))
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const primaryPath = computed(() => {
  if (!isAuthenticated.value) {
    return '/login'
  }
  return isAdmin.value ? '/admin/dashboard' : '/dashboard'
})
const primaryLabel = computed(() => (isAuthenticated.value ? landingCopy.value.dashboard : landingCopy.value.getStartedFree))
const currentYear = computed(() => new Date().getFullYear())

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme')
  const shouldUseDark =
    savedTheme === 'dark' ||
    (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)
  isDark.value = shouldUseDark
  document.documentElement.classList.toggle('dark', shouldUseDark)
}

onMounted(() => {
  initTheme()
  authStore.checkAuth()

  if (!appStore.publicSettingsLoaded) {
    appStore.fetchPublicSettings()
  }
})
</script>

<style scoped>
.navto-home {
  --page: #f5f7fb;
  --panel: rgba(255, 255, 255, 0.86);
  --ink: #09111f;
  --muted: #607086;
  --line: rgba(108, 119, 141, 0.22);
  --accent: #6d5dfc;
  --accent-2: #19b987;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.85), rgba(245, 247, 251, 0.9)),
    repeating-linear-gradient(90deg, rgba(15, 23, 42, 0.035) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(180deg, rgba(15, 23, 42, 0.028) 0 1px, transparent 1px 88px),
    var(--page);
}

.navto-home.is-dark {
  --page: #020617;
  --panel: rgba(15, 23, 42, 0.74);
  --ink: #f8fafc;
  --muted: #94a3b8;
  --line: rgba(148, 163, 184, 0.18);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.6), rgba(2, 6, 23, 0.95)),
    repeating-linear-gradient(90deg, rgba(148, 163, 184, 0.055) 0 1px, transparent 1px 88px),
    repeating-linear-gradient(180deg, rgba(148, 163, 184, 0.045) 0 1px, transparent 1px 88px),
    var(--page);
}

.home-shell {
  width: min(100% - 32px, 1180px);
  margin-inline: auto;
}

.home-nav,
.code-panel,
.build-band {
  border: 1px solid rgba(85, 98, 119, 0.2);
  background: var(--panel);
  box-shadow: 0 24px 80px rgba(30, 41, 59, 0.08);
  backdrop-filter: blur(18px);
}

.home-nav {
  display: flex;
  min-height: 64px;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  padding: 10px 14px 10px 18px;
}

.brand-link,
.hero-actions,
.footer-inner,
.code-toolbar,
.code-tabs,
.logo-strip div,
.mobile-dock,
.primary-button,
.hero-primary,
.hero-secondary,
.build-button {
  display: flex;
  align-items: center;
}

.brand-link {
  min-width: 0;
  gap: 12px;
}

.brand-logo {
  display: grid;
  height: 34px;
  width: 34px;
  flex: 0 0 auto;
  place-items: center;
}

.brand-glyph {
  position: relative;
  display: block;
  height: 26px;
  width: 26px;
  transform: rotate(30deg);
  border-radius: 8px;
  background: linear-gradient(135deg, #7467ff, #9d93ff);
  box-shadow: 0 12px 28px rgba(109, 93, 252, 0.28);
}

.brand-glyph::after {
  position: absolute;
  inset: 7px;
  content: '';
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.68);
}

.brand-name {
  overflow: hidden;
  color: var(--ink);
  font-size: 17px;
  font-weight: 760;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-link {
  color: #334155;
  transition: color 180ms ease, transform 180ms ease;
}

.nav-link:hover {
  color: #08111f;
  transform: translateY(-1px);
}

.icon-button,
.primary-button,
.hero-primary,
.hero-secondary,
.build-button {
  min-height: 38px;
  border-radius: 8px;
  transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
}

.icon-button {
  display: grid;
  width: 38px;
  place-items: center;
  color: #46556b;
}

.icon-button:hover {
  background: rgba(15, 23, 42, 0.06);
  color: var(--ink);
}

.primary-button,
.hero-primary,
.build-button {
  gap: 8px;
  justify-content: center;
  background: #07111f;
  color: #f8fafc;
  font-weight: 720;
  box-shadow: 0 16px 34px rgba(7, 17, 31, 0.18);
}

.primary-button {
  padding: 0 16px;
  font-size: 13px;
}

.primary-button:hover,
.hero-primary:hover,
.build-button:hover {
  transform: translateY(-2px);
  background: #111c2d;
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 900px);
  align-items: center;
  gap: 0;
}

.hero-copy {
  max-width: 860px;
  padding-block: 18px;
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 22px;
  border: 1px solid rgba(109, 93, 252, 0.18);
  border-radius: 8px;
  background: rgba(109, 93, 252, 0.09);
  padding: 6px 10px;
  color: #5d50db;
  font-size: 12px;
  font-weight: 760;
}

.hero-copy h1 {
  max-width: 720px;
  color: var(--ink);
  font-size: 62px;
  font-weight: 780;
  line-height: 0.98;
  overflow-wrap: normal;
  text-wrap: balance;
  word-break: keep-all;
}

.hero-subtitle {
  margin-top: 28px;
  max-width: 560px;
  color: var(--muted);
  font-size: 18px;
  line-height: 1.72;
}

.hero-highlights {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 28px;
  max-width: 760px;
}

.highlight-card {
  min-width: 0;
  border: 1px solid rgba(85, 98, 119, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.68);
  padding: 14px 16px;
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.06);
}

.highlight-card span {
  display: block;
  color: var(--muted);
  font-size: 11px;
  font-weight: 780;
}

.highlight-card strong {
  display: block;
  margin-top: 6px;
  color: var(--ink);
  font-size: 22px;
  font-weight: 820;
  line-height: 1.05;
}

.highlight-card p {
  margin-top: 8px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.52;
}

.hero-actions {
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 32px;
}

.hero-primary {
  min-width: 188px;
  padding: 0 20px;
}

.hero-secondary {
  gap: 8px;
  color: var(--ink);
  font-weight: 700;
}

.hero-secondary:hover {
  color: #5d50db;
  transform: translateY(-1px);
}

.hero-visual {
  display: grid;
  min-height: 460px;
  place-items: center;
}

.model-map {
  position: relative;
  width: min(100%, 460px);
  aspect-ratio: 1;
}

.map-layer,
.map-line,
.provider-node,
.core-cube {
  position: absolute;
}

.map-layer {
  left: 50%;
  top: 50%;
  width: 250px;
  height: 156px;
  border: 1px solid rgba(109, 93, 252, 0.18);
  transform: translate(-50%, -50%) rotate(-28deg) skewX(18deg);
  background: rgba(109, 93, 252, 0.045);
  box-shadow: 0 28px 70px rgba(109, 93, 252, 0.14);
}

.map-layer-a {
  margin-top: -22px;
}

.map-layer-b {
  margin-top: 28px;
  opacity: 0.55;
}

.map-line {
  height: 1px;
  transform-origin: left center;
  background: linear-gradient(90deg, transparent, rgba(109, 93, 252, 0.45), transparent);
}

.line-a {
  left: 72px;
  top: 185px;
  width: 160px;
  transform: rotate(17deg);
}

.line-b {
  right: 68px;
  top: 150px;
  width: 138px;
  transform: rotate(139deg);
}

.line-c {
  left: 210px;
  bottom: 94px;
  width: 138px;
  transform: rotate(-29deg);
}

.line-d {
  left: 98px;
  bottom: 144px;
  width: 180px;
  transform: rotate(-15deg);
}

.provider-node {
  display: grid;
  width: 56px;
  height: 56px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  color: #111827;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 0 20px 44px rgba(30, 41, 59, 0.14);
}

.node-openai {
  left: 56px;
  top: 116px;
  transform: rotate(-11deg);
}

.node-claude {
  left: 24px;
  bottom: 120px;
  transform: rotate(12deg);
}

.node-gemini {
  right: 50px;
  bottom: 118px;
  color: #2563eb;
  transform: rotate(14deg);
}

.node-anti {
  right: 86px;
  top: 74px;
  transform: rotate(5deg);
}

.node-tools {
  right: 162px;
  bottom: 44px;
  color: #475569;
  transform: rotate(-14deg);
}

.core-cube {
  left: 50%;
  top: 50%;
  width: 76px;
  height: 76px;
  transform: translate(-50%, -50%) rotateX(58deg) rotateZ(45deg);
  transform-style: preserve-3d;
}

.cube-face {
  position: absolute;
  inset: 0;
  border-radius: 8px;
}

.cube-front {
  background: linear-gradient(135deg, #6557ff, #8177ff);
  transform: translateZ(38px);
  box-shadow: 0 28px 68px rgba(109, 93, 252, 0.34);
}

.cube-top {
  background: #a99fff;
  transform: rotateX(90deg) translateZ(38px);
}

.cube-side {
  background: #5147dc;
  transform: rotateY(90deg) translateZ(38px);
}

.code-panel {
  margin-top: 18px;
  overflow: hidden;
  border-color: rgba(15, 23, 42, 0.18);
  border-radius: 8px;
  background: #0b1120;
  box-shadow:
    0 28px 80px rgba(15, 23, 42, 0.18),
    0 0 0 1px rgba(255, 255, 255, 0.02) inset;
}

.code-toolbar {
  justify-content: space-between;
  gap: 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(10, 17, 32, 0.98)),
    #0b1120;
  padding: 0 22px;
}

.code-tabs {
  min-width: 0;
  gap: 22px;
  overflow-x: auto;
}

.code-tab {
  position: relative;
  min-height: 58px;
  flex: 0 0 auto;
  color: #8a9ab4;
  font-size: 13px;
  font-weight: 700;
  outline: none;
  transition: color 180ms ease, transform 180ms ease;
}

.code-tab.is-active {
  color: #f8fafc;
}

.code-tab:focus-visible {
  color: #f8fafc;
}

.code-tab:hover {
  color: #cbd5e1;
  transform: translateY(-1px);
}

.code-tab.is-active::after {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 2px;
  content: '';
  background: linear-gradient(90deg, #7c6dff, #38d7ff);
}

.status-pill {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 7px;
  border-radius: 8px;
  background: rgba(30, 209, 144, 0.12);
  padding: 5px 10px;
  color: #7ff0be;
  font-size: 12px;
  font-weight: 800;
}

.status-pill span {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #35e3a1;
  box-shadow: 0 0 14px rgba(53, 227, 161, 0.72);
}

.code-body {
  position: relative;
  margin: 0;
  overflow-x: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.02);
  background:
    radial-gradient(circle at 18% 0%, rgba(109, 93, 252, 0.12), transparent 34%),
    linear-gradient(180deg, #0b1120 0%, #090f1c 100%);
  color: #d6deeb;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 14px;
  line-height: 1.72;
}

.code-body::after {
  position: absolute;
  top: 16px;
  right: 18px;
  content: attr(data-language);
  color: rgba(148, 163, 184, 0.34);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.code-body code {
  display: block;
  min-width: max-content;
  padding: 22px 0 24px;
}

.code-row {
  display: flex;
  min-height: 24px;
  padding: 0 28px 0 0;
  white-space: pre;
}

.code-row:hover {
  background: rgba(125, 211, 252, 0.06);
}

.code-line-number {
  width: 48px;
  flex: 0 0 48px;
  margin-right: 18px;
  border-right: 1px solid rgba(148, 163, 184, 0.14);
  color: #506078;
  text-align: right;
  user-select: none;
}

.code-line-source {
  min-width: 0;
  color: #d6deeb;
  white-space: pre;
}

.code-body :deep(.syntax-keyword) {
  color: #c792ea;
  font-weight: 720;
}

.code-body :deep(.syntax-string) {
  color: #ecc48d;
}

.code-body :deep(.syntax-property) {
  color: #82aaff;
}

.code-body :deep(.syntax-function) {
  color: #7fdbca;
}

.code-body :deep(.syntax-number) {
  color: #f78c6c;
}

.code-body :deep(.syntax-comment) {
  color: #637777;
  font-style: italic;
}

.code-body :deep(.syntax-url) {
  color: #80cbc4;
  text-decoration: underline;
  text-decoration-color: rgba(128, 203, 196, 0.28);
  text-underline-offset: 3px;
}

.code-body :deep(.syntax-flag) {
  color: #ffcb6b;
}

.code-body :deep(.syntax-constant) {
  color: #addb67;
}

.code-body :deep(.syntax-type) {
  color: #ff9cac;
}

.logo-strip {
  justify-content: center;
  gap: 26px;
  margin-top: 34px;
  color: #7a879b;
  text-align: center;
}

.logo-strip p {
  font-size: 11px;
  font-weight: 800;
}

.logo-strip div {
  flex-wrap: wrap;
  justify-content: center;
  gap: 28px;
}

.logo-strip span {
  color: #5f6b7f;
  font-size: 17px;
  font-weight: 780;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: 62px;
}

.feature-card {
  min-height: 170px;
  border-right: 1px solid var(--line);
  padding: 4px 34px 10px;
}

.feature-card:first-child {
  padding-left: 0;
}

.feature-card:last-child {
  border-right: 0;
  padding-right: 0;
}

.feature-icon {
  display: grid;
  width: 34px;
  height: 34px;
  margin-bottom: 18px;
  place-items: center;
  border: 1px solid rgba(109, 93, 252, 0.16);
  border-radius: 8px;
  background: rgba(109, 93, 252, 0.08);
  color: #6d5dfc;
}

.feature-card h2 {
  color: var(--ink);
  font-size: 18px;
  font-weight: 780;
}

.feature-card p {
  margin-top: 12px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.72;
}

.build-band {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 28px;
  margin-top: 34px;
  border-radius: 8px;
  padding: 36px;
}

.build-band h2 {
  max-width: 680px;
  color: var(--ink);
  font-size: 34px;
  font-weight: 780;
  line-height: 1.12;
}

.build-band p:not(.eyebrow) {
  margin-top: 14px;
  max-width: 640px;
  color: var(--muted);
  line-height: 1.72;
}

.build-button {
  min-width: 188px;
  padding: 0 20px;
}

.home-footer {
  border-top: 1px solid var(--line);
  padding: 26px 0;
  color: var(--muted);
}

.footer-inner {
  justify-content: space-between;
  gap: 18px;
  font-size: 14px;
}

.footer-inner div {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-inner a {
  color: inherit;
  transition: color 180ms ease;
}

.footer-inner a:hover {
  color: var(--ink);
}

.mobile-dock {
  position: fixed;
  right: 14px;
  bottom: 14px;
  left: 14px;
  z-index: 40;
  display: none;
  justify-content: space-around;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  padding: 10px 8px;
  box-shadow: 0 20px 54px rgba(15, 23, 42, 0.16);
  backdrop-filter: blur(18px);
}

.mobile-dock a {
  display: grid;
  min-width: 48px;
  place-items: center;
  gap: 3px;
  color: #69778c;
  font-size: 11px;
  font-weight: 700;
}

.mobile-dock a.router-link-active {
  color: #6d5dfc;
}

.navto-home.is-dark .mobile-dock {
  background: rgba(15, 23, 42, 0.9);
}

.navto-home.is-dark .home-nav {
  border-color: rgba(148, 163, 184, 0.2);
  background: rgba(15, 23, 42, 0.86);
}

.navto-home.is-dark .highlight-card {
  border-color: rgba(148, 163, 184, 0.18);
  background: rgba(15, 23, 42, 0.7);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.24);
}

.navto-home.is-dark .nav-link,
.navto-home.is-dark .icon-button {
  color: #cbd5e1;
}

.navto-home.is-dark .code-body {
  color: #cbd5e1;
}

.navto-home.is-dark .provider-node {
  border-color: rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.88);
  color: #f8fafc;
}

.navto-home.is-dark .hero-secondary,
.navto-home.is-dark .feature-card h2,
.navto-home.is-dark .build-band h2,
.navto-home.is-dark .brand-name,
.navto-home.is-dark .highlight-card strong,
.navto-home.is-dark .code-tab.is-active {
  color: #f8fafc;
}

.navto-home.is-dark .icon-button:hover {
  background: rgba(148, 163, 184, 0.12);
}

@media (max-width: 1024px) {
  .hero-grid {
    grid-template-columns: 1fr;
  }

  .model-map {
    width: min(100%, 390px);
  }
}

@media (max-width: 768px) {
  .home-shell {
    width: min(100% - 28px, 1180px);
  }

  .home-nav {
    padding: 10px 12px;
  }

  .brand-name {
    max-width: 150px;
  }

  .hero-copy h1 {
    font-size: 42px;
    line-height: 1.04;
  }

  .hero-subtitle {
    font-size: 16px;
  }

  .hero-highlights {
    grid-template-columns: 1fr;
  }

  .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-primary,
  .hero-secondary {
    width: 100%;
  }

  .hero-secondary {
    justify-content: center;
  }

  .provider-node {
    width: 46px;
    height: 46px;
    font-size: 15px;
  }

  .core-cube {
    width: 58px;
    height: 58px;
  }

  .cube-front {
    transform: translateZ(29px);
  }

  .cube-top {
    transform: rotateX(90deg) translateZ(29px);
  }

  .cube-side {
    transform: rotateY(90deg) translateZ(29px);
  }

  .code-toolbar {
    align-items: flex-start;
    flex-direction: column;
    padding: 14px 18px;
  }

  .code-tab {
    min-height: 34px;
  }

  .code-body {
    padding: 20px 18px;
    font-size: 12px;
  }

  .logo-strip {
    flex-direction: column;
  }

  .feature-grid,
  .build-band {
    grid-template-columns: 1fr;
  }

  .feature-card,
  .feature-card:first-child,
  .feature-card:last-child {
    min-height: auto;
    border-right: 0;
    border-bottom: 1px solid var(--line);
    padding: 24px 0;
  }

  .feature-card:last-child {
    border-bottom: 0;
  }

  .build-band {
    padding: 26px;
  }

  .build-band h2 {
    font-size: 28px;
  }

  .build-button {
    width: 100%;
  }

  .footer-inner {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 639px) {
  .mobile-dock {
    display: flex;
  }
}

@media (max-width: 420px) {
  .primary-button {
    width: 40px;
    padding: 0;
  }

  .primary-button span {
    display: none;
  }

  .hero-copy h1 {
    font-size: 36px;
  }
}
</style>
