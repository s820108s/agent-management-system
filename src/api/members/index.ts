import request from '@/axios'
import type {
  Member,
  MemberListParams,
  CreateMemberRequest,
  AgentOption,
  PaginatedResponse
} from '@/types'

export const getMembers = (params: MemberListParams): Promise<PaginatedResponse<Member>> => {
  return request.get({ url: '/api/members', params }) as unknown as Promise<
    PaginatedResponse<Member>
  >
}

export const createMember = (data: CreateMemberRequest): Promise<Member> => {
  return request.post({ url: '/api/members', data }) as unknown as Promise<Member>
}

export const getAgentOptions = (): Promise<{ data: AgentOption[] }> => {
  return request.get({ url: '/api/agents/all' }) as unknown as Promise<{ data: AgentOption[] }>
}
