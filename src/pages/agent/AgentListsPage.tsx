import { useEffect, useMemo, useState } from 'react'
import { fetchCustomers } from '../../services/CustomerService'
import { fetchAccounts } from '../../services/BankService'

/* ================= HELPERS ================= */

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as any).message)
  }
  return 'Erreur lors du chargement'
}

const normalizeSearch = (value: unknown): string =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .trim()

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

/* ================= PAGE ================= */

const AgentListsPage = () => {
  const [customers, setCustomers] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const normalizedQuery = useMemo(() => normalizeSearch(searchQuery), [searchQuery])
  const filteredCustomers = useMemo(() => {
    if (!normalizedQuery) return customers
    return customers.filter((customer) => {
      const fields = [customer?.identityRef, customer?.firstname, customer?.lastname]
      return fields.some((field) => normalizeSearch(field).includes(normalizedQuery))
    })
  }, [customers, normalizedQuery])
  const filteredAccounts = useMemo(() => {
    if (!normalizedQuery) return accounts
    return accounts.filter((account) =>
      normalizeSearch(account?.rib).includes(normalizedQuery),
    )
  }, [accounts, normalizedQuery])

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

  useEffect(() => {
    loadCustomers()
    loadAccounts()
  }, [])

  return (
    <section className="content bordered">
      <h2>Listes & consultations</h2>

      {message && <div className="alert">{message}</div>}

      <input
        type="search"
        placeholder="Chercher par CIN, nom, prénom ou RIB"
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        style={{ width: '100%' }}
      />

      {/* CLIENTS */}
      <div className="section">
        <div className="section-header">
          <h3>Clients</h3>
        </div>
        {filteredCustomers.length > 0 && <CustomersTable customers={filteredCustomers} />}
      </div>

      {/* COMPTES */}
      <div className="section">
        <div className="section-header">
          <h3>Comptes</h3>
        </div>
        {filteredAccounts.length > 0 && <AccountsTable accounts={filteredAccounts} />}
      </div>
    </section>
  )
}

export default AgentListsPage
