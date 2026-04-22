import request from '@/axios'
import type { Agent, AgentListParams, CreateAgentRequest, PaginatedResponse } from '@/types'

export const getAgents = (params: AgentListParams): Promise<PaginatedResponse<Agent>> => {
  return request.get({ url: '/api/agents', params }) as unknown as Promise<PaginatedResponse<Agent>>
}

export const updateAgentStatus = (
  id: string | number,
  status: 'active' | 'inactive'
): Promise<{ id: string | number; status: string }> => {
  return request.put({ url: `/api/agents/${id}/status`, data: { status } }) as unknown as Promise<{
    id: string | number
    status: string
  }>
}

export const createAgent = (data: CreateAgentRequest): Promise<Agent> => {
  return request.post({ url: '/api/agents', data }) as unknown as Promise<Agent>
}
