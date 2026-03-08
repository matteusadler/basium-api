// Shared TypeScript types across apps

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface User {
  id: string
  email: string
  name: string
  role: 'CORRETOR' | 'GERENTE' | 'ADMIN' | 'SUPER_ADMIN'
  companyId: string
  avatarUrl?: string
}

export interface AuthContext {
  userId: string
  companyId: string
  role: string
  email: string
}
