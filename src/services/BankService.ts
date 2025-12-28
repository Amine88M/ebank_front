import apiClient from '../utils/apiClient'

export type CreateBankAccountPayload = {
  rib: string
  amount: number
  customerIdentityRef: string
}

export const createBankAccount = async (payload: CreateBankAccountPayload) => {
  const response = await apiClient.post('/rest/bank/create', payload)
  return response.data
}

export const fetchAccounts = async () => {
  const response = await apiClient.get('/rest/bank/all')
  return response.data
}
