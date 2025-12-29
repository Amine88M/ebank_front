import { FormEvent, useEffect, useState } from 'react'
import { fetchTransactions } from '../../services/TransactionService'
import type { TransactionFilter } from '../../services/TransactionService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as any).message)
  }
  return 'Erreur lors du chargement'
}

const formatTransactionDate = (value: unknown) => {
  if (!value) return ''
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('fr-FR')
}

const formatAmount = (value: unknown) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const sortTransactions = (list: any[]) =>
  list.sort((a, b) => {
    const dateA = new Date((a as any)?.createdAt ?? 0).getTime()
    const dateB = new Date((b as any)?.createdAt ?? 0).getTime()
    return dateB - dateA
  })

const AgentTransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([])
  const [rib, setRib] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const buildFilters = (): TransactionFilter => {
    const filters: TransactionFilter = {}
    const ribValue = rib.trim()
    if (ribValue) filters.rib = ribValue
    if (dateFrom) filters.dateFrom = dateFrom
    if (dateTo) filters.dateTo = dateTo
    return filters
  }

  const loadAll = async () => {
    setMessage(null)
    try {
      const data = await fetchTransactions({})
      const list = Array.isArray(data) ? data : []
      setTransactions(sortTransactions(list))
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  const handleFilter = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    try {
      const data = await fetchTransactions(buildFilters())
      const list = Array.isArray(data) ? data : []
      setTransactions(sortTransactions(list))
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  const resetFilters = () => {
    setRib('')
    setDateFrom('')
    setDateTo('')
  }

  useEffect(() => {
    loadAll()
  }, [])

  return (
    <section className="content bordered">
      <h2>Transactions</h2>

      {message && <div className="alert">{message}</div>}

      <div className="section">
        <div className="section-header">
          <h3>Historique complet</h3>
          <div className="card-actions">
            <button type="button" onClick={loadAll}>
              Tout afficher
            </button>
            <button type="button" onClick={resetFilters}>
              Reinitialiser filtres
            </button>
          </div>
        </div>

        <form className="form-grid" onSubmit={handleFilter}>
          <label className="field">
            <span>RIB</span>
            <input value={rib} onChange={(e) => setRib(e.target.value)} />
          </label>

          <label className="field">
            <span>Date debut</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>

          <label className="field">
            <span>Date fin</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>

          <button type="submit">Filtrer</button>
        </form>

        <div className="table-wrap">
          {transactions.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Montant</th>
                  <th>Motif</th>
                  <th>RIB</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, index) => (
                  <tr key={index}>
                    <td>{transaction.transactionType}</td>
                    <td>{formatAmount(transaction.amount)}</td>
                    <td>{transaction.motif}</td>
                    <td>{transaction.bankAccount?.rib}</td>
                    <td>{formatTransactionDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Aucun resultat.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default AgentTransactionsPage
