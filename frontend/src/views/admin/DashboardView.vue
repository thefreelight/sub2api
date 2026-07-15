<template>
  <AppLayout>
    <div class="admin-dashboard">
      <!-- Loading State -->
      <div v-if="loading" class="dashboard-loading">
        <LoadingSpinner />
      </div>

      <template v-else-if="stats">
        <section class="dashboard-hero">
          <div class="hero-brand">
            <div class="hero-logo">
              <img v-if="siteLogo" :src="siteLogo" :alt="`${brandName} logo`" />
              <span v-else class="hero-glyph" aria-hidden="true"></span>
            </div>
            <div class="min-w-0">
              <p class="eyebrow">{{ dashboardCopy.eyebrow }}</p>
              <h1>{{ brandName }} {{ dashboardCopy.title }}</h1>
              <p>{{ dashboardCopy.description }}</p>
            </div>
          </div>

          <div class="hero-kpis">
            <div>
              <span>{{ dashboardCopy.activeUsers }}</span>
              <strong>{{ formatNumber(stats.active_users) }}</strong>
            </div>
            <div>
              <span>RPM</span>
              <strong>{{ formatTokens(stats.rpm) }}</strong>
            </div>
            <div>
              <span>TPM</span>
              <strong>{{ formatTokens(stats.tpm) }}</strong>
            </div>
          </div>
        </section>

        <section class="metric-grid">
          <article
            v-for="card in coreCards"
            :key="card.key"
            class="metric-card"
            :class="`metric-card-${card.tone}`"
          >
            <span class="metric-icon">
              <Icon :name="card.icon" size="md" :stroke-width="2" />
            </span>
            <div>
              <p>{{ card.label }}</p>
              <strong>{{ card.value }}</strong>
              <span>{{ card.detail }}</span>
            </div>
          </article>
        </section>

        <section class="metric-grid">
          <article
            v-for="card in tokenCards"
            :key="card.key"
            class="metric-card metric-card-wide"
            :class="`metric-card-${card.tone}`"
          >
            <span class="metric-icon">
              <Icon :name="card.icon" size="md" :stroke-width="2" />
            </span>
            <div>
              <p>{{ card.label }}</p>
              <strong>{{ card.value }}</strong>
              <span>{{ card.detail }}</span>
            </div>
          </article>
        </section>

        <!-- Charts Section -->
        <div class="dashboard-section">
          <!-- Date Range Filter -->
          <div class="dashboard-panel dashboard-toolbar">
            <div class="toolbar-left">
              <div class="control-group">
                <span>{{ t('admin.dashboard.timeRange') }}</span>
                <DateRangePicker
                  v-model:start-date="startDate"
                  v-model:end-date="endDate"
                  @change="onDateRangeChange"
                />
              </div>
              <button @click="loadDashboardStats" :disabled="chartsLoading" class="toolbar-button">
                <Icon name="refresh" size="sm" :stroke-width="2" :class="{ 'animate-spin': chartsLoading }" />
                {{ t('common.refresh') }}
              </button>
            </div>
            <div class="control-group">
              <span>{{ t('admin.dashboard.granularity') }}</span>
              <div class="w-28">
                <Select
                  v-model="granularity"
                  :options="granularityOptions"
                  @change="loadChartData"
                />
              </div>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="chart-grid">
            <ModelDistributionChart
              :model-stats="modelStats"
              :enable-ranking-view="true"
              :ranking-items="rankingItems"
              :ranking-total-actual-cost="rankingTotalActualCost"
              :ranking-total-requests="rankingTotalRequests"
              :ranking-total-tokens="rankingTotalTokens"
              :loading="chartsLoading"
              :ranking-loading="rankingLoading"
              :ranking-error="rankingError"
              :start-date="startDate"
              :end-date="endDate"
              @ranking-click="goToUserUsage"
            />
            <TokenUsageTrend :trend-data="trendData" :loading="chartsLoading" />
          </div>

          <!-- User Usage Trend (Full Width) -->
          <div class="dashboard-panel trend-panel">
            <h3>
              {{ t('admin.dashboard.recentUsage') }} <span>Top 12</span>
            </h3>
            <div class="h-64">
              <div v-if="userTrendLoading" class="flex h-full items-center justify-center">
                <LoadingSpinner size="md" />
              </div>
              <Line v-else-if="userTrendChartData" :data="userTrendChartData" :options="lineOptions" />
              <div
                v-else
                class="flex h-full items-center justify-center text-sm text-gray-500 dark:text-gray-400"
              >
                {{ t('admin.dashboard.noDataAvailable') }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { adminAPI } from '@/api/admin'
import type {
  DashboardStats,
  TrendDataPoint,
  ModelStat,
  UserUsageTrendPoint,
  UserSpendingRankingItem
} from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import Icon from '@/components/icons/Icon.vue'
import DateRangePicker from '@/components/common/DateRangePicker.vue'
import Select from '@/components/common/Select.vue'
import ModelDistributionChart from '@/components/charts/ModelDistributionChart.vue'
import TokenUsageTrend from '@/components/charts/TokenUsageTrend.vue'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'vue-chartjs'

const { t, locale } = useI18n()

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
)

const appStore = useAppStore()
const router = useRouter()
const stats = ref<DashboardStats | null>(null)
const loading = ref(false)
const chartsLoading = ref(false)
const userTrendLoading = ref(false)
const rankingLoading = ref(false)
const rankingError = ref(false)

// Chart data
const trendData = ref<TrendDataPoint[]>([])
const modelStats = ref<ModelStat[]>([])
const userTrend = ref<UserUsageTrendPoint[]>([])
const rankingItems = ref<UserSpendingRankingItem[]>([])
const rankingTotalActualCost = ref(0)
const rankingTotalRequests = ref(0)
const rankingTotalTokens = ref(0)
let chartLoadSeq = 0
let usersTrendLoadSeq = 0
let rankingLoadSeq = 0
const rankingLimit = 12
type MetricIcon = 'key' | 'server' | 'chart' | 'userPlus' | 'cube' | 'database' | 'bolt' | 'clock'
type MetricTone = 'violet' | 'teal' | 'green' | 'amber' | 'slate' | 'rose'
type MetricCard = {
  key: string
  icon: MetricIcon
  tone: MetricTone
  label: string
  value: string
  detail: string
}

const isZh = computed(() => locale.value.startsWith('zh'))
const brandName = computed(() => {
  const configured = appStore.siteName?.trim()
  if (!configured || configured === 'Sub2API') return 'NavtoAI API'
  return configured.toLowerCase() === 'navtoai api' ? 'NavtoAI API' : configured
})
const siteLogo = computed(() => appStore.siteLogo || '')
const dashboardCopy = computed(() => isZh.value
  ? {
      eyebrow: '后台控制台',
      title: '运行概览',
      description: '集中查看密钥、账号池、请求量、成本和模型分布，快速判断服务是否健康。',
      activeUsers: '活跃用户',
      healthyAccounts: '正常',
      errorAccounts: '异常',
      total: '累计',
      today: '今日',
      costBreakdown: '实际 / 成本 / 标准',
      response: '平均响应',
      activeApiKeys: '可用密钥'
    }
  : {
      eyebrow: 'Admin Console',
      title: 'Operations Overview',
      description: 'Track keys, account pools, request volume, cost and model distribution from one focused view.',
      activeUsers: 'Active users',
      healthyAccounts: 'Healthy',
      errorAccounts: 'Errors',
      total: 'Total',
      today: 'Today',
      costBreakdown: 'Actual / Account / Standard',
      response: 'Average response',
      activeApiKeys: 'Active keys'
    })

// Helper function to format date in local timezone
const formatLocalDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const getLast24HoursRangeDates = (): { start: string; end: string } => {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end)
  }
}

// Date range
const granularity = ref<'day' | 'hour'>('hour')
const defaultRange = getLast24HoursRangeDates()
const startDate = ref(defaultRange.start)
const endDate = ref(defaultRange.end)

// Granularity options for Select component
const granularityOptions = computed(() => [
  { value: 'day', label: t('admin.dashboard.day') },
  { value: 'hour', label: t('admin.dashboard.hour') }
])

// Dark mode detection
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark')
})

// Chart colors
const chartColors = computed(() => ({
  text: isDarkMode.value ? '#e5e7eb' : '#374151',
  grid: isDarkMode.value ? '#374151' : '#e5e7eb'
}))

// Line chart options (for user trend chart)
const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const
  },
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        color: chartColors.value.text,
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 15,
        font: {
          size: 11
        }
      }
    },
    tooltip: {
      itemSort: (a: any, b: any) => {
        const aValue = typeof a?.raw === 'number' ? a.raw : Number(a?.parsed?.y ?? 0)
        const bValue = typeof b?.raw === 'number' ? b.raw : Number(b?.parsed?.y ?? 0)
        return bValue - aValue
      },
      callbacks: {
        label: (context: any) => {
          return `${context.dataset.label}: ${formatTokens(context.raw)}`
        }
      }
    }
  },
  scales: {
    x: {
      grid: {
        color: chartColors.value.grid
      },
      ticks: {
        color: chartColors.value.text,
        font: {
          size: 10
        }
      }
    },
    y: {
      grid: {
        color: chartColors.value.grid
      },
      ticks: {
        color: chartColors.value.text,
        font: {
          size: 10
        },
        callback: (value: string | number) => formatTokens(Number(value))
      }
    }
  }
}))

// User trend chart data
const userTrendChartData = computed(() => {
  if (!userTrend.value?.length) return null

  const getDisplayName = (point: UserUsageTrendPoint): string => {
    const username = point.username?.trim()
    if (username) {
      return username
    }

    const email = point.email?.trim()
    if (email) {
      return email
    }

    return t('admin.redeem.userPrefix', { id: point.user_id })
  }

  // Group by user_id to avoid merging different users with the same display name
  const userGroups = new Map<number, { name: string; data: Map<string, number> }>()
  const allDates = new Set<string>()

  userTrend.value.forEach((point) => {
    allDates.add(point.date)
    const key = point.user_id
    if (!userGroups.has(key)) {
      userGroups.set(key, { name: getDisplayName(point), data: new Map() })
    }
    userGroups.get(key)!.data.set(point.date, point.tokens)
  })

  const sortedDates = Array.from(allDates).sort()
  const colors = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#f97316',
    '#6366f1',
    '#84cc16',
    '#06b6d4',
    '#a855f7'
  ]

  const datasets = Array.from(userGroups.values()).map((group, idx) => ({
    label: group.name,
    data: sortedDates.map((date) => group.data.get(date) || 0),
    borderColor: colors[idx % colors.length],
    backgroundColor: `${colors[idx % colors.length]}20`,
    fill: false,
    tension: 0.3
  }))

  return {
    labels: sortedDates,
    datasets
  }
})

// Format helpers
const formatTokens = (value: number | undefined): string => {
  if (value === undefined || value === null) return '0'
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`
  }
  return value.toLocaleString()
}

const toFiniteNumber = (value: unknown): number => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : 0
}

const formatNumber = (value: number | null | undefined): string => {
  return toFiniteNumber(value).toLocaleString()
}

const formatCost = (value: number | null | undefined): string => {
  const safeValue = toFiniteNumber(value)
  if (safeValue >= 1000) {
    return (safeValue / 1000).toFixed(2) + 'K'
  } else if (safeValue >= 1) {
    return safeValue.toFixed(2)
  } else if (safeValue >= 0.01) {
    return safeValue.toFixed(3)
  }
  return safeValue.toFixed(4)
}

const formatDuration = (ms: number | undefined | null): string => {
  const duration = ms ?? 0
  if (duration >= 1000) {
    return `${(duration / 1000).toFixed(2)}s`
  }
  return `${Math.round(duration)}ms`
}

const costBreakdown = (actual: number | undefined, account: number | undefined, standard: number | undefined): string => {
  return `${dashboardCopy.value.costBreakdown}: $${formatCost(actual)} / $${formatCost(account)} / $${formatCost(standard)}`
}

const coreCards = computed<MetricCard[]>(() => {
  if (!stats.value) return []
  return [
    {
      key: 'apiKeys',
      icon: 'key',
      tone: 'violet',
      label: t('admin.dashboard.apiKeys'),
      value: formatNumber(stats.value.total_api_keys),
      detail: `${stats.value.active_api_keys} ${dashboardCopy.value.activeApiKeys}`
    },
    {
      key: 'accounts',
      icon: 'server',
      tone: 'teal',
      label: t('admin.dashboard.accounts'),
      value: formatNumber(stats.value.total_accounts),
      detail: `${stats.value.normal_accounts} ${dashboardCopy.value.healthyAccounts}${stats.value.error_accounts > 0 ? ` / ${stats.value.error_accounts} ${dashboardCopy.value.errorAccounts}` : ''}`
    },
    {
      key: 'requests',
      icon: 'chart',
      tone: 'green',
      label: t('admin.dashboard.todayRequests'),
      value: formatNumber(stats.value.today_requests),
      detail: `${dashboardCopy.value.total}: ${formatNumber(stats.value.total_requests)}`
    },
    {
      key: 'users',
      icon: 'userPlus',
      tone: 'amber',
      label: t('admin.dashboard.users'),
      value: `+${formatNumber(stats.value.today_new_users)}`,
      detail: `${dashboardCopy.value.total}: ${formatNumber(stats.value.total_users)}`
    }
  ]
})

const tokenCards = computed<MetricCard[]>(() => {
  if (!stats.value) return []
  return [
    {
      key: 'todayTokens',
      icon: 'cube',
      tone: 'amber',
      label: t('admin.dashboard.todayTokens'),
      value: formatTokens(stats.value.today_tokens),
      detail: costBreakdown(stats.value.today_actual_cost, stats.value.today_account_cost, stats.value.today_cost)
    },
    {
      key: 'totalTokens',
      icon: 'database',
      tone: 'slate',
      label: t('admin.dashboard.totalTokens'),
      value: formatTokens(stats.value.total_tokens),
      detail: costBreakdown(stats.value.total_actual_cost, stats.value.total_account_cost, stats.value.total_cost)
    },
    {
      key: 'performance',
      icon: 'bolt',
      tone: 'violet',
      label: t('admin.dashboard.performance'),
      value: `${formatTokens(stats.value.rpm)} RPM`,
      detail: `${formatTokens(stats.value.tpm)} TPM`
    },
    {
      key: 'response',
      icon: 'clock',
      tone: 'rose',
      label: dashboardCopy.value.response,
      value: formatDuration(stats.value.average_duration_ms),
      detail: `${stats.value.active_users} ${t('admin.dashboard.activeUsers')}`
    }
  ]
})

const goToUserUsage = (item: UserSpendingRankingItem) => {
  void router.push({
    path: '/admin/usage',
    query: {
      user_id: String(item.user_id),
      start_date: startDate.value,
      end_date: endDate.value
    }
  })
}

// Date range change handler
const onDateRangeChange = (range: {
  startDate: string
  endDate: string
  preset: string | null
}) => {
  // Auto-select granularity based on date range
  const start = new Date(range.startDate)
  const end = new Date(range.endDate)
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  // If range is 1 day, use hourly granularity
  if (daysDiff <= 1) {
    granularity.value = 'hour'
  } else {
    granularity.value = 'day'
  }

  loadChartData()
}

// Load data
const loadDashboardSnapshot = async (includeStats: boolean) => {
  const currentSeq = ++chartLoadSeq
  if (includeStats && !stats.value) {
    loading.value = true
  }
  chartsLoading.value = true
  try {
    const response = await adminAPI.dashboard.getSnapshotV2({
      start_date: startDate.value,
      end_date: endDate.value,
      granularity: granularity.value,
      include_stats: includeStats,
      include_trend: true,
      include_model_stats: true,
      include_group_stats: false,
      include_users_trend: false
    })
    if (currentSeq !== chartLoadSeq) return
    if (includeStats && response.stats) {
      stats.value = response.stats
    }
    trendData.value = response.trend || []
    modelStats.value = response.models || []
  } catch (error) {
    if (currentSeq !== chartLoadSeq) return
    appStore.showError(t('admin.dashboard.failedToLoad'))
    console.error('Error loading dashboard snapshot:', error)
  } finally {
    if (currentSeq === chartLoadSeq) {
      loading.value = false
      chartsLoading.value = false
    }
  }
}

const loadUsersTrend = async () => {
  const currentSeq = ++usersTrendLoadSeq
  userTrendLoading.value = true
  try {
    const response = await adminAPI.dashboard.getUserUsageTrend({
      start_date: startDate.value,
      end_date: endDate.value,
      granularity: granularity.value,
      limit: 12
    })
    if (currentSeq !== usersTrendLoadSeq) return
    userTrend.value = response.trend || []
  } catch (error) {
    if (currentSeq !== usersTrendLoadSeq) return
    console.error('Error loading users trend:', error)
    userTrend.value = []
  } finally {
    if (currentSeq === usersTrendLoadSeq) {
      userTrendLoading.value = false
    }
  }
}

const loadUserSpendingRanking = async () => {
  const currentSeq = ++rankingLoadSeq
  rankingLoading.value = true
  rankingError.value = false
  try {
    const response = await adminAPI.dashboard.getUserSpendingRanking({
      start_date: startDate.value,
      end_date: endDate.value,
      limit: rankingLimit
    })
    if (currentSeq !== rankingLoadSeq) return
    rankingItems.value = response.ranking || []
    rankingTotalActualCost.value = response.total_actual_cost || 0
    rankingTotalRequests.value = response.total_requests || 0
    rankingTotalTokens.value = response.total_tokens || 0
  } catch (error) {
    if (currentSeq !== rankingLoadSeq) return
    console.error('Error loading user spending ranking:', error)
    rankingItems.value = []
    rankingTotalActualCost.value = 0
    rankingTotalRequests.value = 0
    rankingTotalTokens.value = 0
    rankingError.value = true
  } finally {
    if (currentSeq === rankingLoadSeq) {
      rankingLoading.value = false
    }
  }
}

const loadDashboardStats = async () => {
  await Promise.all([
    loadDashboardSnapshot(true),
    loadUsersTrend(),
    loadUserSpendingRanking()
  ])
}

const loadChartData = async () => {
  await Promise.all([
    loadDashboardSnapshot(false),
    loadUsersTrend(),
    loadUserSpendingRanking()
  ])
}

onMounted(() => {
  loadDashboardStats()
})
</script>

<style scoped>
.admin-dashboard {
  display: grid;
  gap: 24px;
}

.dashboard-loading {
  display: grid;
  min-height: 320px;
  place-items: center;
}

.dashboard-hero,
.metric-card,
.dashboard-panel {
  border: 1px solid rgba(85, 98, 119, 0.18);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(18px);
}

.dashboard-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 28px;
  padding: 28px;
}

.hero-brand {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 20px;
}

.hero-logo {
  display: grid;
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(85, 98, 119, 0.16);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.1);
}

.hero-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.hero-glyph {
  position: relative;
  display: block;
  width: 40px;
  height: 40px;
  transform: rotate(30deg);
  border-radius: 10px;
  background: linear-gradient(135deg, #7467ff, #9d93ff);
}

.hero-glyph::after {
  position: absolute;
  inset: 11px;
  content: '';
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.7);
}

.eyebrow {
  display: inline-flex;
  margin-bottom: 10px;
  border: 1px solid rgba(109, 93, 252, 0.18);
  border-radius: 8px;
  background: rgba(109, 93, 252, 0.09);
  padding: 5px 9px;
  color: #5d50db;
  font-size: 12px;
  font-weight: 760;
}

.dashboard-hero h1 {
  color: #09111f;
  font-size: 30px;
  font-weight: 800;
  line-height: 1.12;
}

.dashboard-hero p:not(.eyebrow) {
  margin-top: 8px;
  max-width: 760px;
  color: #607086;
  line-height: 1.68;
}

.hero-kpis {
  display: grid;
  min-width: 300px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid rgba(85, 98, 119, 0.14);
  border-radius: 8px;
  background: rgba(248, 250, 252, 0.82);
}

.hero-kpis div {
  padding: 16px 18px;
  border-right: 1px solid rgba(85, 98, 119, 0.12);
}

.hero-kpis div:last-child {
  border-right: 0;
}

.hero-kpis span,
.metric-card p,
.metric-card span,
.control-group span {
  color: #607086;
  font-size: 12px;
  font-weight: 720;
}

.hero-kpis strong {
  display: block;
  margin-top: 6px;
  color: #09111f;
  font-size: 18px;
  font-weight: 820;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-card {
  display: flex;
  min-width: 0;
  min-height: 132px;
  align-items: flex-start;
  gap: 14px;
  padding: 20px;
}

.metric-icon {
  display: grid;
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 8px;
}

.metric-card strong {
  display: block;
  margin-top: 8px;
  color: #09111f;
  font-size: 24px;
  font-weight: 820;
  line-height: 1.1;
}

.metric-card span:not(.metric-icon) {
  display: block;
  margin-top: 8px;
  overflow-wrap: anywhere;
  line-height: 1.45;
}

.metric-card-violet .metric-icon {
  background: rgba(109, 93, 252, 0.1);
  color: #5d50db;
}

.metric-card-teal .metric-icon {
  background: rgba(20, 184, 166, 0.1);
  color: #0f9488;
}

.metric-card-green .metric-icon {
  background: rgba(34, 197, 94, 0.1);
  color: #168a46;
}

.metric-card-amber .metric-icon {
  background: rgba(245, 158, 11, 0.12);
  color: #b36a03;
}

.metric-card-slate .metric-icon {
  background: rgba(71, 85, 105, 0.1);
  color: #475569;
}

.metric-card-rose .metric-icon {
  background: rgba(244, 63, 94, 0.1);
  color: #be123c;
}

.dashboard-section {
  display: grid;
  gap: 20px;
}

.dashboard-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
}

.toolbar-left,
.control-group,
.toolbar-button {
  display: flex;
  align-items: center;
}

.toolbar-left {
  min-width: 0;
  flex-wrap: wrap;
  gap: 12px;
}

.control-group {
  gap: 10px;
}

.toolbar-button {
  min-height: 38px;
  gap: 8px;
  border: 1px solid rgba(85, 98, 119, 0.18);
  border-radius: 8px;
  background: #07111f;
  padding: 0 14px;
  color: #f8fafc;
  font-size: 13px;
  font-weight: 760;
  transition: transform 180ms ease, background 180ms ease;
}

.toolbar-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: #111c2d;
}

.toolbar-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.trend-panel {
  padding: 20px;
}

.trend-panel h3 {
  margin-bottom: 16px;
  color: #09111f;
  font-size: 15px;
  font-weight: 780;
}

.trend-panel h3 span {
  color: #94a3b8;
  font-weight: 700;
}

:global(.dark) .dashboard-hero,
:global(.dark) .metric-card,
:global(.dark) .dashboard-panel {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.82);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.2);
}

:global(.dark) .hero-logo,
:global(.dark) .hero-kpis {
  border-color: rgba(148, 163, 184, 0.16);
  background: rgba(15, 23, 42, 0.72);
}

:global(.dark) .hero-kpis div {
  border-right-color: rgba(148, 163, 184, 0.14);
}

:global(.dark) .dashboard-hero h1,
:global(.dark) .hero-kpis strong,
:global(.dark) .metric-card strong,
:global(.dark) .trend-panel h3 {
  color: #f8fafc;
}

:global(.dark) .dashboard-hero p:not(.eyebrow),
:global(.dark) .hero-kpis span,
:global(.dark) .metric-card p,
:global(.dark) .metric-card span,
:global(.dark) .control-group span {
  color: #94a3b8;
}

@media (max-width: 1180px) {
  .dashboard-hero {
    grid-template-columns: 1fr;
  }

  .hero-kpis {
    min-width: 0;
    width: 100%;
  }

  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard-hero {
    padding: 20px;
  }

  .hero-brand {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-kpis,
  .metric-grid {
    grid-template-columns: 1fr;
  }

  .dashboard-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-left,
  .control-group {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-button {
    justify-content: center;
  }
}
</style>
