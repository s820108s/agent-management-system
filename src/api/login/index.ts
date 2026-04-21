import request from '@/axios'
import type { UserLoginType, UserType } from './types'

export interface LoginResponse {
  token: string
  user: UserType
}

export const loginApi = (data: UserLoginType): Promise<LoginResponse> => {
  return request.post({ url: '/api/auth/login', data }) as unknown as Promise<LoginResponse>
}

export const loginOutApi = (): Promise<void> => {
  return Promise.resolve()
}
