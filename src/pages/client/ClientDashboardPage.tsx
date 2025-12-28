import { useEffect, useMemo, useState } from 'react'
import { fetchAccounts } from '../../services/BankService'
import { fetchTransactions } from '../../services/TransactionService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors du chargement'
}

const renderTable = (items: unknown) => {
  if (!Array.isArray(items)) {
    return <pre className="data-block">{JSON.stringify(items, null, 2)}</pre>
  }
  if (items.length === 0) {
    return <p>Aucun resultat.</p>
  }

  const columns = Object.keys(items[0] ?? {})

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              {columns.map((column) => (
                <td key={column}>{String((item as Record<string, unknown>)[column] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ClientDashboardPage = () => {
  const [accounts, setAccounts] = useState<unknown[]>([])
  const [selectedRib, setSelectedRib] = useState('')
  const [transactions, setTransactions] = useState<unknown[]>([])
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchAccounts()
        const list = Array.isArray(data) ? data : []
        setAccounts(list)
        const rib = list[0]?.rib ?? ''
        if (rib) {
          setSelectedRib(rib)
        }
      } catch (error: any) {
        setMessage(getErrorMessage(error?.response?.data))
      }
    }
    loadAccounts()
  }, [])

  const selectedAccount = useMemo(() => {
    if (!Array.isArray(accounts)) return null
    return accounts.find((account) => (account as any)?.rib === selectedRib) ?? null
  }, [accounts, selectedRib])

  const loadTransactions = async (ribValue: string) => {
    setMessage(null)
    try {
      const data = await fetchTransactions({ rib: ribValue })
      const list = Array.isArray(data) ? data.slice(0, 10) : []
      setTransactions(list)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  useEffect(() => {
    if (selectedRib) {
      loadTransactions(selectedRib)
    }
  }, [selectedRib])

  return (
    <section className="content">
      <h2>Tableau de bord</h2>
      {message && <div className="alert">{message}</div>}

      <div className="section">
        <div className="section-header">
          <h3>Comptes</h3>
        </div>
        {Array.isArray(accounts) && accounts.length > 1 ? (
          <label className="field">
            <span>Selectionner un compte</span>
            <select value={selectedRib} onChange={(event) => setSelectedRib(event.target.value)}>
              {accounts.map((account) => (
                <option key={(account as any)?.rib ?? ''} value={(account as any)?.rib ?? ''}>
                  {(account as any)?.rib ?? 'Compte'}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {selectedAccount ? (
          <div className="summary">
            <div>
              <strong>RIB:</strong> {String((selectedAccount as any)?.rib ?? '')}
            </div>
            <div>
              <strong>Solde:</strong> {String((selectedAccount as any)?.amount ?? '')}
            </div>
          </div>
        ) : (
          <p>Aucun compte disponible.</p>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Dernieres operations</h3>
          <button type="button" onClick={() => selectedRib && loadTransactions(selectedRib)}>
            Rafraichir
          </button>
        </div>
        {renderTable(transactions)}
      </div>
    </section>
  )
}

export default ClientDashboardPage
