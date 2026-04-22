import { defineStore } from 'pinia'
import { store } from '../index'
import { ElMessage } from 'element-plus'
import { getMembers, createMember as createMemberApi, getAgentOptions } from '@/api/members'
import type { Member, MemberListParams, CreateMemberRequest, AgentOption } from '@/types'

interface MemberQueryParams extends MemberListParams {
  page: number
  pageSize: number
  keyword: string
  agentId: string | number | ''
}

interface MemberState {
  list: Member[]
  total: number
  loading: boolean
  params: MemberQueryParams
  agentOptions: AgentOption[]
  agentOptionsLoading: boolean
}

export const useMemberStore = defineStore('members', {
  state: (): MemberState => ({
    list: [],
    total: 0,
    loading: false,
    params: {
      page: 1,
      pageSize: 20,
      keyword: '',
      agentId: ''
    },
    agentOptions: [],
    agentOptionsLoading: false
  }),
  actions: {
    async fetchMembers() {
      this.loading = true
      try {
        const res = await getMembers(this.params)
        this.list = res.data
        this.total = res.total
      } catch {
        ElMessage.error('載入失敗，請稍後再試')
      } finally {
        this.loading = false
      }
    },
    updateParams(partial: Partial<MemberQueryParams>) {
      const filterKeys: (keyof MemberQueryParams)[] = ['keyword', 'agentId']
      const resetsPage = filterKeys.some((k) => k in partial)
      this.params = { ...this.params, ...partial }
      if (resetsPage) {
        this.params.page = 1
      }
    },
    async createMember(data: CreateMemberRequest) {
      await createMemberApi(data)
      this.updateParams({ page: 1 })
      await this.fetchMembers()
    },
    async fetchAgentOptions() {
      this.agentOptionsLoading = true
      try {
        const res = await getAgentOptions()
        this.agentOptions = res.data
      } catch {
        ElMessage.error('代理商選單載入失敗，請稍後再試')
      } finally {
        this.agentOptionsLoading = false
      }
    }
  }
})

export const useMemberStoreWithOut = () => {
  return useMemberStore(store)
}
