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
import { useMemberStore } from '@/store/modules/members'
import AddMemberDialog from './components/AddMemberDialog.vue'

const memberStore = useMemberStore()
const dialogVisible = ref(false)

const searchKeyword = ref('')
const searchAgentId = ref<string | number | ''>('')

onMounted(() => {
  memberStore.fetchMembers()
  memberStore.fetchAgentOptions()
})

const handleSearch = () => {
  memberStore.updateParams({ keyword: searchKeyword.value, agentId: searchAgentId.value })
  memberStore.fetchMembers()
}

const handleReset = () => {
  searchKeyword.value = ''
  searchAgentId.value = ''
  memberStore.updateParams({ keyword: '', agentId: '', page: 1 })
  memberStore.fetchMembers()
}

const handlePageChange = (page: number) => {
  memberStore.updateParams({ page })
  memberStore.fetchMembers()
}

const handleSizeChange = (pageSize: number) => {
  memberStore.updateParams({ pageSize, page: 1 })
  memberStore.fetchMembers()
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
          v-model="searchKeyword"
          placeholder="使用者名稱 / Email"
          clearable
          style="width: 220px"
          @keyup.enter="handleSearch"
        />
        <ElSelect v-model="searchAgentId" placeholder="全部代理商" clearable style="width: 160px">
          <ElOption
            v-for="agent in memberStore.agentOptions"
            :key="agent.id"
            :label="agent.name"
            :value="agent.id"
          />
        </ElSelect>
        <ElButton type="primary" @click="handleSearch">搜尋</ElButton>
        <ElButton @click="handleReset">重置</ElButton>
      </div>
      <ElButton type="primary" @click="dialogVisible = true">新增會員</ElButton>
    </div>

    <AddMemberDialog v-model:visible="dialogVisible" />

    <ElTable
      :data="memberStore.list"
      v-loading="memberStore.loading"
      stripe
      border
      style="width: 100%"
    >
      <template #empty>
        <span>暫無資料</span>
      </template>

      <ElTableColumn prop="id" label="會員 ID" width="100" />
      <ElTableColumn prop="username" label="使用者名稱" min-width="140" />
      <ElTableColumn prop="email" label="Email" min-width="200" />
      <ElTableColumn prop="agentName" label="所屬代理商" min-width="140" />
      <ElTableColumn prop="status" label="狀態" width="90">
        <template #default="{ row }">
          <ElTag :type="row.status === 'active' ? 'success' : 'danger'">
            {{ row.status === 'active' ? '啟用' : '停用' }}
          </ElTag>
        </template>
      </ElTableColumn>
      <ElTableColumn prop="createdAt" label="建立時間" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </ElTableColumn>
      <ElTableColumn label="操作" width="80" fixed="right">
        <template #default> — </template>
      </ElTableColumn>
    </ElTable>

    <div class="flex justify-end mt-16px">
      <ElPagination
        v-model:current-page="memberStore.params.page"
        v-model:page-size="memberStore.params.pageSize"
        :total="memberStore.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
