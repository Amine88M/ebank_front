import { useEffect, useMemo, useState } from 'react'
import { fetchMyAccounts } from '../../services/BankService'
import { fetchMyCard, updateCardStatus, updateContactless } from '../../services/CardService'
import AuthService from '../../services/AuthService'
import { fetchMyTransactions } from '../../services/TransactionService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors du chargement'
}

const renderTable = (items: unknown, hiddenColumns: string[] = []) => {
  if (!Array.isArray(items)) {
    return <pre className="data-block">{JSON.stringify(items, null, 2)}</pre>
  }
  if (items.length === 0) {
    return <p>Aucun resultat.</p>
  }

  const columns = Object.keys(items[0] ?? {}).filter((column) => !hiddenColumns.includes(column))

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
  const [card, setCard] = useState<Record<string, unknown> | null>(null)
  const [isUpdatingContactless, setIsUpdatingContactless] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchMyAccounts()
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

  useEffect(() => {
    loadCard()
  }, [])

  const selectedAccount = useMemo(() => {
    if (!Array.isArray(accounts)) return null
    return accounts.find((account) => (account as any)?.rib === selectedRib) ?? null
  }, [accounts, selectedRib])

  const loadTransactions = async () => {
    setMessage(null)
    try {
      const data = await fetchMyTransactions()
      const list = Array.isArray(data) ? data.slice(0, 10) : []
      setTransactions(list)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  const loadCard = async () => {
    setMessage(null)
    try {
      const data = await fetchMyCard()
      setCard(data as Record<string, unknown>)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    }
  }

  const handleToggleContactless = async () => {
    if (!card) return
    setIsUpdatingContactless(true)
    setMessage(null)
    try {
      const nextEnabled = !(card as any)?.contactlessEnabled
      const data = await updateContactless(nextEnabled)
      setCard(data as Record<string, unknown>)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    } finally {
      setIsUpdatingContactless(false)
    }
  }

  const handleOpposition = async () => {
    if (!card) return
    setIsUpdatingStatus(true)
    setMessage(null)
    try {
      const data = await updateCardStatus('BLOCKED')
      setCard(data as Record<string, unknown>)
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  useEffect(() => {
    if (selectedRib) {
      loadTransactions()
    }
  }, [selectedRib])

  const cardHolder = AuthService.getUsernameFromToken(AuthService.getToken()) ?? 'Client'
  const cardStatus = String((card as any)?.status ?? '')
  const isBlocked = cardStatus.toUpperCase() === 'BLOCKED'

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
          <h3>Carte</h3>
          <button type="button" onClick={loadCard}>
            Rafraichir
          </button>
        </div>
        {card ? (
          <>
            <div className="bank-card">
              <div className="bank-card__row">
                <div>
                  <div className="bank-card__label">Solde</div>
                  <div className="bank-card__value">{String((selectedAccount as any)?.amount ?? '')}</div>
                </div>
                <div className="bank-card__chip" aria-hidden="true">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="bank-card__row bank-card__row--split">
                <div>
                  <div className="bank-card__label">Titulaire</div>
                  <div className="bank-card__value bank-card__value--small">{cardHolder}</div>
                </div>
                <div>
                  <div className="bank-card__label">Valide</div>
                  <div className="bank-card__value bank-card__value--small">{String((card as any)?.expiry ?? '')}</div>
                </div>
              </div>
              <div className="bank-card__number">{String((card as any)?.maskedNumber ?? '')}</div>
              <div className="bank-card__badge">{isBlocked ? 'OPPOSITION' : 'ACTIVE'}</div>
            </div>
            <div className="summary">
              <div>
                <strong>Statut:</strong> {cardStatus || 'ACTIVE'}
              </div>
              <div>
                <strong>Plafond jour:</strong> {String((card as any)?.dailyLimit ?? '')}
              </div>
              <div>
                <strong>Plafond mois:</strong> {String((card as any)?.monthlyLimit ?? '')}
              </div>
              <div>
                <strong>Contactless:</strong> {String((card as any)?.contactlessEnabled ? 'Active' : 'Desactive')}
              </div>
              <div className="card-actions">
                <button
                  type="button"
                  onClick={handleToggleContactless}
                  disabled={isUpdatingContactless || isBlocked}
                >
                  {(card as any)?.contactlessEnabled ? 'Desactiver contactless' : 'Activer contactless'}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={handleOpposition}
                  disabled={isUpdatingStatus || isBlocked}
                >
                  Mettre en opposition
                </button>
              </div>
            </div>
          </>
        ) : (
          <p>Aucune carte disponible.</p>
        )}
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Dernieres operations</h3>
          <button type="button" onClick={() => selectedRib && loadTransactions()}>
            Rafraichir
          </button>
        </div>
        {renderTable(transactions, ['bankAccount', 'user'])}
      </div>
    </section>
  )
}

export default ClientDashboardPage
