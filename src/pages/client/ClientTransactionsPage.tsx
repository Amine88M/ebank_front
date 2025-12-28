import { useEffect, useState } from 'react'
import { fetchMyTransactions } from '../../services/TransactionService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors du chargement'
}

const formatTransactionDate = (value: unknown) => {
  if (!value) return ''
  const text = String(value).replace('T', ' ')
  return text.length > 16 ? text.slice(0, 16) : text
}

const formatAmount = (value: unknown) => {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return ''
  return amount.toFixed(2)
}

const ClientTransactionsPage = () => {
  const [transactions, setTransactions] = useState<unknown[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const loadTransactions = async () => {
    setMessage(null)
    try {
      const data = await fetchMyTransactions()
      const list = Array.isArray(data) ? data : []
      list.sort((a, b) => {
        const dateA = new Date((a as any)?.createdAt ?? 0).getTime()
        const dateB = new Date((b as any)?.createdAt ?? 0).getTime()
        return dateB - dateA
      })
      setTransactions(list)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  return (
    <section className="content">
      <h2>Transactions</h2>
      {message && <div className="alert">{message}</div>}

      <div className="section">
        <div className="section-header">
          <h3>Historique complet</h3>
          <button type="button" onClick={loadTransactions}>
            Rafraichir
          </button>
        </div>
        <div className="transaction-list">
          {transactions.length > 0 ? (
            transactions.map((tx, index) => (
              <div key={index} className="transaction-card">
                <div>
                  <div className="transaction-card__type">
                    {String((tx as any)?.transactionType ?? '')}
                  </div>
                  <div className="transaction-card__date">
                    {formatTransactionDate((tx as any)?.createdAt)}
                  </div>
                  <div className="transaction-card__motif">
                    {String((tx as any)?.motif ?? '')}
                  </div>
                </div>
                <div className="transaction-card__amount">
                  {formatAmount((tx as any)?.amount)}
                </div>
              </div>
            ))
          ) : (
            <p>Aucun resultat.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ClientTransactionsPage
