import { defineStore } from 'pinia'
import { store } from '../index'
import { ElMessage } from 'element-plus'
import { createAgent as createAgentApi, getAgents, updateAgentStatus } from '@/api/agents'
import type { Agent, AgentListParams, CreateAgentRequest } from '@/types'

interface AgentQueryParams extends AgentListParams {
  page: number
  pageSize: number
  name: string
  status: 'active' | 'inactive' | ''
  sortField: string
  sortOrder: 'asc' | 'desc'
}

interface AgentState {
  list: Agent[]
  total: number
  loading: boolean
  params: AgentQueryParams
}

export const useAgentStore = defineStore('agents', {
  state: (): AgentState => ({
    list: [],
    total: 0,
    loading: false,
    params: {
      page: 1,
      pageSize: 20,
      name: '',
      status: '',
      sortField: 'createdAt',
      sortOrder: 'desc'
    }
  }),
  actions: {
    async fetchAgents() {
      this.loading = true
      try {
        const res = await getAgents(this.params)
        this.list = res.data
        this.total = res.total
      } catch {
        ElMessage.error('載入失敗，請稍後再試')
      } finally {
        this.loading = false
      }
    },
    updateParams(partial: Partial<AgentQueryParams>) {
      const filterSortKeys: (keyof AgentQueryParams)[] = [
        'name',
        'status',
        'sortField',
        'sortOrder'
      ]
      const resetsPage = filterSortKeys.some((k) => k in partial)
      this.params = { ...this.params, ...partial }
      if (resetsPage) {
        this.params.page = 1
      }
    },
    async createAgent(data: CreateAgentRequest) {
      await createAgentApi(data)
      this.updateParams({ page: 1 })
      await this.fetchAgents()
    },
    async toggleStatus(id: string | number, currentStatus: 'active' | 'inactive') {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      try {
        await updateAgentStatus(id, newStatus)
        const idx = this.list.findIndex((a) => a.id === id)
        if (idx !== -1) {
          this.list[idx] = { ...this.list[idx], status: newStatus }
        }
      } catch {
        ElMessage.error('狀態更新失敗，請稍後再試')
      }
    }
  }
})

export const useAgentStoreWithOut = () => {
  return useAgentStore(store)
}
