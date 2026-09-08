<template>
  <BaseDialog :show="show" :title="`批量导入 API Key · ${account?.name ?? ''}`" width="normal" @close="emit('close')">
    <p class="mb-3 text-sm text-gray-500">每行一个 API Key，重复值会自动跳过。</p>
    <textarea v-model="text" rows="10" class="input w-full font-mono text-sm" placeholder="sk-...\nsk-..." :disabled="loading" />
    <div v-if="result" class="mt-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-dark-700">
      成功 {{ result.success }} 个，失败 {{ result.failed }} 个
      <div v-if="result.errors.length" class="mt-2 text-red-600">{{ result.errors.join('；') }}</div>
    </div>
    <template #footer>
      <button class="btn btn-secondary" @click="emit('close')">取消</button>
      <button class="btn btn-primary" :disabled="loading || !keys.length" @click="submit">{{ loading ? '导入中…' : '开始导入' }}</button>
    </template>
  </BaseDialog>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseDialog from '@/components/common/BaseDialog.vue'
import type { Account } from '@/types'
import { adminAPI } from '@/api/admin'
const props = defineProps<{ show: boolean; account: Account | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()
const text = ref(''); const loading = ref(false); const result = ref<{success:number;failed:number;errors:string[]}|null>(null)
const keys = computed(() => [...new Set(text.value.split(/[\n,\r]+/).map(v => v.trim()).filter(Boolean))])
watch(() => props.show, v => { if (v) { text.value = ''; result.value = null } })
async function submit() {
  if (!props.account || !keys.value.length) return
  loading.value = true
  try {
    const data = await adminAPI.accounts.importAPIKeys(props.account.id, keys.value)
    result.value = { success: data.success, failed: data.failed, errors: data.results.filter(x => !x.success).map(x => x.error || '导入失败') }
    if (data.success) emit('created')
  } finally { loading.value = false }
}
</script>
