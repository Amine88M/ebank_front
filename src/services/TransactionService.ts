import apiClient from '../utils/apiClient'

export type CreateTransactionPayload = {
  ribFrom: string
  ribTo: string
  amount: number
  motif: string
  username: string
}

export type TransactionFilter = {
  rib?: string
  dateFrom?: string
  dateTo?: string
}

export const createTransaction = async (payload: CreateTransactionPayload) => {
  const response = await apiClient.post('/rest/transaction/create', payload)
  return response.data
}

export const fetchTransactions = async (filters: TransactionFilter) => {
  const response = await apiClient.post('/rest/transaction/search-optional', filters)
  return response.data
}

export const fetchMyTransactions = async () => {
  const response = await apiClient.get('/rest/transaction/my-transactions')
  return response.data
}
