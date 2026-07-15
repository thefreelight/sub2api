<template>
  <AppLayout>
    <div class="user-dashboard space-y-6">
      <div v-if="loading" class="flex items-center justify-center py-12"><LoadingSpinner /></div>
      <template v-else-if="stats">
        <UserDashboardStats :stats="stats" :balance="user?.balance || 0" :is-simple="authStore.isSimpleMode" />
        <UserDashboardCharts v-model:startDate="startDate" v-model:endDate="endDate" v-model:granularity="granularity" :loading="loadingCharts" :trend="trendData" :models="modelStats" @dateRangeChange="loadCharts" @granularityChange="loadCharts" @refresh="refreshAll" />
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div class="lg:col-span-2"><UserDashboardRecentUsage :data="recentUsage" :loading="loadingUsage" /></div>
          <div class="lg:col-span-1"><UserDashboardQuickActions /></div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'; import { useAuthStore } from '@/stores/auth'; import { usageAPI, type UserDashboardStats as UserStatsType } from '@/api/usage'
import AppLayout from '@/components/layout/AppLayout.vue'; import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import UserDashboardStats from '@/components/user/dashboard/UserDashboardStats.vue'; import UserDashboardCharts from '@/components/user/dashboard/UserDashboardCharts.vue'
import UserDashboardRecentUsage from '@/components/user/dashboard/UserDashboardRecentUsage.vue'; import UserDashboardQuickActions from '@/components/user/dashboard/UserDashboardQuickActions.vue'
import type { UsageLog, TrendDataPoint, ModelStat } from '@/types'

const authStore = useAuthStore(); const user = computed(() => authStore.user)
const stats = ref<UserStatsType | null>(null); const loading = ref(false); const loadingUsage = ref(false); const loadingCharts = ref(false)
const trendData = ref<TrendDataPoint[]>([]); const modelStats = ref<ModelStat[]>([]); const recentUsage = ref<UsageLog[]>([])

const formatLD = (d: Date) => d.toISOString().split('T')[0]
const startDate = ref(formatLD(new Date(Date.now() - 6 * 86400000))); const endDate = ref(formatLD(new Date())); const granularity = ref('day')

const loadStats = async () => { loading.value = true; try { await authStore.refreshUser(); stats.value = await usageAPI.getDashboardStats() } catch (error) { console.error('Failed to load dashboard stats:', error) } finally { loading.value = false } }
const loadCharts = async () => { loadingCharts.value = true; try { const res = await Promise.all([usageAPI.getDashboardTrend({ start_date: startDate.value, end_date: endDate.value, granularity: granularity.value as any }), usageAPI.getDashboardModels({ start_date: startDate.value, end_date: endDate.value })]); trendData.value = res[0].trend || []; modelStats.value = res[1].models || [] } catch (error) { console.error('Failed to load charts:', error) } finally { loadingCharts.value = false } }
const loadRecent = async () => { loadingUsage.value = true; try { const res = await usageAPI.getByDateRange(startDate.value, endDate.value); recentUsage.value = res.items.slice(0, 5) } catch (error) { console.error('Failed to load recent usage:', error) } finally { loadingUsage.value = false } }
const refreshAll = () => { loadStats(); loadCharts(); loadRecent() }

onMounted(() => { refreshAll() })
</script>

<style scoped>
.user-dashboard {
  --dash-card-bg: #ffffff;
  --dash-card-border: rgba(85, 98, 119, 0.16);
  --dash-card-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
  --dash-muted-bg: #f8fafc;
  --dash-muted-bg-hover: #f1f5f9;
}

.user-dashboard :deep(.card) {
  overflow: hidden;
  border: 1px solid var(--dash-card-border);
  border-radius: 8px;
  background: var(--dash-card-bg);
  box-shadow: var(--dash-card-shadow);
}

.user-dashboard :deep(.badge) {
  border-radius: 8px;
}

.user-dashboard :deep(.rounded-xl) {
  border-radius: 8px;
}

.user-dashboard :deep(.bg-gray-50) {
  background-color: var(--dash-muted-bg);
}

.user-dashboard :deep(.hover\:bg-gray-100:hover) {
  background-color: var(--dash-muted-bg-hover);
}

:global(html.dark) .user-dashboard {
  --dash-card-bg: #0f172a;
  --dash-card-border: rgba(148, 163, 184, 0.18);
  --dash-card-shadow: 0 24px 60px rgba(0, 0, 0, 0.24);
  --dash-muted-bg: #111c2d;
  --dash-muted-bg-hover: #162235;
}

:global(html.dark) .user-dashboard :deep(.card) {
  background: var(--dash-card-bg);
}

:global(html.dark) .user-dashboard :deep(.dark\:bg-dark-800\/50) {
  background-color: var(--dash-muted-bg);
}

:global(html.dark) .user-dashboard :deep(.dark\:hover\:bg-dark-800:hover) {
  background-color: var(--dash-muted-bg-hover);
}

:global(html.dark) .user-dashboard :deep(.dark\:border-dark-700) {
  border-color: rgba(148, 163, 184, 0.16);
}

@media (max-width: 640px) {
  .user-dashboard {
    margin-inline: -2px;
  }
}
</style>
