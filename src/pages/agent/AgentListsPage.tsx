import { FormEvent, useState } from 'react'
import { fetchCustomers } from '../../services/CustomerService'
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

const AgentListsPage = () => {
  const [customers, setCustomers] = useState<unknown>([])
  const [accounts, setAccounts] = useState<unknown>([])
  const [transactions, setTransactions] = useState<unknown>([])
  const [rib, setRib] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const handleLoadCustomers = async () => {
    setMessage(null)
    try {
      const data = await fetchCustomers()
      setCustomers(data)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  const handleLoadAccounts = async () => {
    setMessage(null)
    try {
      const data = await fetchAccounts()
      setAccounts(data)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  const handleLoadTransactions = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    try {
      const data = await fetchTransactions({ rib, dateFrom, dateTo })
      setTransactions(data)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  return (
    <section className="content">
      <h2>Listes</h2>
      {message && <div className="alert">{message}</div>}

      <div className="section">
        <div className="section-header">
          <h3>Clients</h3>
          <button type="button" onClick={handleLoadCustomers}>
            Charger
          </button>
        </div>
        {renderTable(customers)}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Comptes</h3>
          <button type="button" onClick={handleLoadAccounts}>
            Charger
          </button>
        </div>
        {renderTable(accounts)}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Transactions filtrees</h3>
        </div>
        <form className="form-grid" onSubmit={handleLoadTransactions}>
          <label className="field">
            <span>RIB</span>
            <input value={rib} onChange={(event) => setRib(event.target.value)} required />
          </label>
          <label className="field">
            <span>Date debut</span>
            <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
          </label>
          <label className="field">
            <span>Date fin</span>
            <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
          </label>
          <button type="submit">Filtrer</button>
        </form>
        {renderTable(transactions)}
      </div>
    </section>
  )
}

export default AgentListsPage
