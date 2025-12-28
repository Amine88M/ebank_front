import apiClient from '../utils/apiClient'

export type CreateCustomerPayload = {
  identityRef: string
  firstname: string
  lastname: string
  mail: string
  address: string
  birthDate: string
}

export const createCustomer = async (payload: CreateCustomerPayload) => {
  const response = await apiClient.post('/rest/customer/create', payload)
  return response.data
}

export const fetchCustomers = async () => {
  const response = await apiClient.get('/rest/customer/all')
  return response.data
}
