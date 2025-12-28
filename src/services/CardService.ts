import apiClient from '../utils/apiClient'

export type CardInfo = {
  id?: number
  maskedNumber?: string
  expiry?: string
  status?: string
  contactlessEnabled?: boolean
  dailyLimit?: number
  monthlyLimit?: number
}

export type CreateCardPayload = {
  customerIdentityRef: string
  maskedNumber?: string
  expiry?: string
  status?: string
  contactlessEnabled?: boolean
  dailyLimit?: number
  monthlyLimit?: number
}

export const fetchMyCard = async () => {
  const response = await apiClient.get('/rest/card/my')
  return response.data as CardInfo
}

export const updateContactless = async (enabled: boolean) => {
  const response = await apiClient.patch('/rest/card/contactless', { enabled })
  return response.data as CardInfo
}

export const updateCardStatus = async (status: string) => {
  const response = await apiClient.patch('/rest/card/status', { status })
  return response.data as CardInfo
}

export const updateCardStatusForCustomer = async (customerIdentityRef: string, status: string) => {
  const response = await apiClient.patch('/rest/card/status-by-customer', { customerIdentityRef, status })
  return response.data as CardInfo
}

export const createCard = async (payload: CreateCardPayload) => {
  const response = await apiClient.post('/rest/card/create', payload)
  return response.data as CardInfo
}
