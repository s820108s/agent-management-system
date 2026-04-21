export interface Admin {
  id: number
  username: string
  email: string
}

export interface Agent {
  id: string | number
  name: string
  contactPerson: string
  contactPhone: string
  status: 'active' | 'inactive'
  createdAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: Admin
}

export interface AgentListParams {
  page: number
  pageSize: number
  name?: string
  status?: 'active' | 'inactive' | ''
  sortField?: string
  sortOrder?: 'asc' | 'desc'
}

export interface UpdateAgentStatusRequest {
  status: 'active' | 'inactive'
}
