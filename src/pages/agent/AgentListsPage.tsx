import { FormEvent, useState } from 'react'
import { fetchCustomers } from '../../services/CustomerService'
import { fetchAccounts } from '../../services/BankService'
import { fetchTransactions } from '../../services/TransactionService'

/* ================= HELPERS ================= */

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as any).message)
  }
  return 'Erreur lors du chargement'
}

/* ================= TABLES ================= */

const CustomersTable = ({ customers }: { customers: any[] }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Nom d’utilisateur</th>
        <th>CIN</th>
        <th>Prénom</th>
        <th>Nom</th>
      </tr>
    </thead>
    <tbody>
      {customers.map((c, i) => (
        <tr key={i}>
          <td>{c.username}</td>
          <td>{c.identityRef}</td>
          <td>{c.firstname}</td>
          <td>{c.lastname}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const AccountsTable = ({ accounts }: { accounts: any[] }) => (
  <table className="table">
    <thead>
      <tr>
        <th>RIB</th>
        <th>Solde</th>
        <th>Statut</th>
        <th>Date de création</th>
      </tr>
    </thead>
    <tbody>
      {accounts.map((a, i) => (
        <tr key={i}>
          <td>{a.rib}</td>
          <td>
            {a.amount?.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'MAD',
            })}
          </td>
          <td>{a.accountStatus}</td>
          <td>{new Date(a.createdAt).toLocaleDateString('fr-FR')}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const TransactionsTable = ({ transactions }: { transactions: any[] }) => (
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
      {transactions.map((t, i) => (
        <tr key={i}>
          <td>{t.transactionType}</td>
          <td>
            {t.amount?.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'MAD',
            })}
          </td>
          <td>{t.motif}</td>
          <td>{t.bankAccount?.rib}</td>
          <td>{new Date(t.createdAt).toLocaleDateString('fr-FR')}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

/* ================= PAGE ================= */

const AgentListsPage = () => {
  const [customers, setCustomers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [rib, setRib] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const loadCustomers = async () => {
    setMessage(null)
    try {
      setCustomers(await fetchCustomers())
    } catch (e: any) {
      setMessage(getErrorMessage(e?.response?.data))
    }
  }

  const loadAccounts = async () => {
    setMessage(null)
    try {
      setAccounts(await fetchAccounts())
    } catch (e: any) {
      setMessage(getErrorMessage(e?.response?.data))
    }
  }

  const loadTransactions = async (e: FormEvent) => {
    e.preventDefault()
    setMessage(null)
    try {
      setTransactions(await fetchTransactions({ rib, dateFrom, dateTo }))
    } catch (e: any) {
      setMessage(getErrorMessage(e?.response?.data))
    }
  }

  return (
    <section className="content bordered">
      <h2>Listes & consultations</h2>

      {message && <div className="alert">{message}</div>}

      {/* CLIENTS */}
      <div className="section">
        <div className="section-header">
          <h3>Clients</h3>
          <button onClick={loadCustomers}>Charger</button>
        </div>
        {customers.length > 0 && <CustomersTable customers={customers} />}
      </div>

      {/* COMPTES */}
      <div className="section">
        <div className="section-header">
          <h3>Comptes</h3>
          <button onClick={loadAccounts}>Charger</button>
        </div>
        {accounts.length > 0 && <AccountsTable accounts={accounts} />}
      </div>

      {/* TRANSACTIONS */}
      <div className="section">
        <h3>Transactions filtrées</h3>

        <form className="form-grid" onSubmit={loadTransactions}>
          <label className="field">
            <span>RIB</span>
            <input value={rib} onChange={(e) => setRib(e.target.value)} required />
          </label>

          <label className="field">
            <span>Date début</span>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </label>

          <label className="field">
            <span>Date fin</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </label>

          <button type="submit">Filtrer</button>
        </form>

        {transactions.length > 0 && <TransactionsTable transactions={transactions} />}
      </div>
    </section>
  )
}

export default AgentListsPage
