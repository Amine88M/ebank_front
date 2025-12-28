export type Role = 'AGENT_GUICHET' | 'CLIENT'

export type AuthState = {
  token: string | null
  role: Role | null
}

export type LoginResponse = {
  token: string
}
