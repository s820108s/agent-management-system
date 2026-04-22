<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  ElTable,
  ElTableColumn,
  ElPagination,
  ElInput,
  ElSelect,
  ElOption,
  ElButton,
  ElTag
} from 'element-plus'
import { useAgentStore } from '@/store/modules/agents'
import type { Agent } from '@/types'
import AddAgentDialog from './components/AddAgentDialog.vue'

const agentStore = useAgentStore()
const dialogVisible = ref(false)

const searchName = ref('')
const searchStatus = ref<'active' | 'inactive' | ''>('')
const toggleLoadingMap = ref<Record<string | number, boolean>>({})

onMounted(() => {
  agentStore.fetchAgents()
})

const handleSearch = () => {
  agentStore.updateParams({ name: searchName.value, status: searchStatus.value })
  agentStore.fetchAgents()
}

const handleReset = () => {
  searchName.value = ''
  searchStatus.value = ''
  agentStore.updateParams({ name: '', status: '', page: 1 })
  agentStore.fetchAgents()
}

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (!prop || !order) return
  const sortOrder = order === 'ascending' ? 'asc' : 'desc'
  agentStore.updateParams({ sortField: prop, sortOrder })
  agentStore.fetchAgents()
}

const handlePageChange = (page: number) => {
  agentStore.updateParams({ page })
  agentStore.fetchAgents()
}

const handleSizeChange = (pageSize: number) => {
  agentStore.updateParams({ pageSize, page: 1 })
  agentStore.fetchAgents()
}

const handleToggleStatus = async (row: Agent) => {
  toggleLoadingMap.value[row.id] = true
  try {
    await agentStore.toggleStatus(row.id, row.status)
  } finally {
    toggleLoadingMap.value[row.id] = false
  }
}

const formatDate = (iso: string) => {
  return new Date(iso).toLocaleString('zh-TW')
}
</script>

<template>
  <div class="p-20px">
    <div class="flex items-center justify-between mb-16px">
      <div class="flex items-center gap-10px">
        <ElInput
          v-model="searchName"
          placeholder="代理商名稱"
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        />
        <ElSelect v-model="searchStatus" placeholder="全部狀態" clearable style="width: 140px">
          <ElOption label="全部" value="" />
          <ElOption label="啟用" value="active" />
          <ElOption label="停用" value="inactive" />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">搜尋</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>
      <ElButton type="primary" @click="dialogVisible = true">新增代理商</ElButton>
    </div>

    <AddAgentDialog v-model:visible="dialogVisible" />

    <ElTable
      :data="agentStore.list"
      v-loading="agentStore.loading"
      stripe
      border
      style="width: 100%"
      @sort-change="handleSortChange"
    >
      <template #empty>
        <span>暫無資料</span>
      </template>

      <ElTableColumn prop="id" label="代理商 ID" width="120" sortable="custom" />
      <ElTableColumn prop="name" label="代理商名稱" min-width="150" sortable="custom" />
      <ElTableColumn prop="contactPerson" label="聯絡人" width="120" sortable="custom" />
      <ElTableColumn prop="contactPhone" label="聯絡電話" width="150" sortable="custom" />
      <ElTableColumn prop="status" label="狀態" width="100" sortable="custom">
        <template #default="{ row }">
          <ElTag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '啟用' : '停用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdAt" label="建立時間" width="180" sortable="custom">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <ElButton
            size="small"
            :type="row.status === 'active' ? 'warning' : 'success'"
            :loading="toggleLoadingMap[row.id]"
            :disabled="toggleLoadingMap[row.id]"
            @click="handleToggleStatus(row)"
          >
            {{ row.status === 'active' ? '停用' : '啟用' }}
          </ElButton>
        </template>
      </ElTableColumn>
    </ElTable>

    <div class="flex justify-end mt-16px">
      <ElPagination
        v-model:current-page="agentStore.params.page"
        v-model:page-size="agentStore.params.pageSize"
        :total="agentStore.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
