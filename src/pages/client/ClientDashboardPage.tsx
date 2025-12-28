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
  const sortedTransactions = Array.isArray(transactions)
    ? [...transactions].sort((a, b) => {
        const dateA = new Date((a as any)?.createdAt ?? 0).getTime()
        const dateB = new Date((b as any)?.createdAt ?? 0).getTime()
        return dateB - dateA
      })
    : []
  const recentTransactions = sortedTransactions.slice(0, 5)
  const activitySource = Array.isArray(transactions) ? transactions.slice(0, 7) : []
  const activityAmounts = activitySource.map((tx) => Number((tx as any)?.amount ?? 0))
  const maxActivity = Math.max(1, ...activityAmounts)
  const activityValues =
    activitySource.length > 0
      ? activityAmounts.map((amount) => Math.round((amount / maxActivity) * 70) + 20)
      : [32, 48, 62, 38, 74, 52, 44]
  const activityLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  return (
    <section className="dashboard-shell">
      <div className="dashboard-top">
        <div>
          <h2>Overview</h2>
          <p>Bienvenue, {cardHolder}. Voici vos informations principales.</p>
        </div>
        <div className="dashboard-search">
          <input type="search" placeholder="Rechercher..." aria-label="Rechercher" />
        </div>
      </div>

      {message && <div className="alert">{message}</div>}

      <div className="dashboard-grid">
        <div className="dashboard-card dashboard-card--span-2">
          <div className="dashboard-card__header">
            <h3>My Cards</h3>
            <button type="button" onClick={loadCard}>
              Rafraichir
            </button>
          </div>
          {card ? (
            <div className="dashboard-cards">
              <div className="bank-card bank-card--primary">
                <div className="bank-card__row">
                  <div>
                    <div className="bank-card__label">Solde</div>
                    <div className="bank-card__value">
                      {String((selectedAccount as any)?.amount ?? '')}
                    </div>
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
                    <div className="bank-card__value bank-card__value--small">
                      {String((card as any)?.expiry ?? '')}
                    </div>
                  </div>
                </div>
                <div className="bank-card__number">{String((card as any)?.maskedNumber ?? '')}</div>
                <div className="bank-card__badge">{isBlocked ? 'OPPOSITION' : 'ACTIVE'}</div>
              </div>
              <div className="mini-cards">
                <div className="mini-card">
                  <div className="mini-card__title">Carte secondaire</div>
                  <div className="mini-card__number">{String((card as any)?.maskedNumber ?? '')}</div>
                  <div className="mini-card__meta">Plafond jour: {String((card as any)?.dailyLimit ?? '')}</div>
                </div>
                <div className="mini-card mini-card--light">
                  <div className="mini-card__title">Statut</div>
                  <div className="mini-card__number">{cardStatus || 'ACTIVE'}</div>
                  <div className="mini-card__meta">
                    Contactless: {String((card as any)?.contactlessEnabled ? 'Active' : 'Desactive')}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Aucune carte disponible.</p>
          )}
          {card ? (
            <div className="card-controls">
              <div className="card-controls__item">
                <span>Plafond mois</span>
                <strong>{String((card as any)?.monthlyLimit ?? '')}</strong>
              </div>
              <div className="card-controls__item">
                <span>RIB</span>
                <strong>{String((selectedAccount as any)?.rib ?? '')}</strong>
              </div>
              <div className="card-controls__actions">
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
          ) : null}
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h3>Recent Transactions</h3>
            <button type="button" onClick={() => selectedRib && loadTransactions()}>
              Rafraichir
            </button>
          </div>
          <div className="transaction-list">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx, index) => (
                <div key={index} className="transaction-card">
                  <div>
                    <div className="transaction-card__type">
                      {String((tx as any)?.transactionType ?? '')}
                    </div>
                    <div className="transaction-card__date">
                      {formatTransactionDate((tx as any)?.createdAt)}
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

        <div className="dashboard-card dashboard-card--span-2">
          <div className="dashboard-card__header">
            <h3>Weekly Activity</h3>
            <span className="dashboard-chip">Solde courant</span>
          </div>
          <div className="activity-chart">
            {activityValues.map((value, index) => (
              <div key={index} className="activity-bar">
                <div className="activity-bar__fill" style={{ height: `${value}%` }}></div>
                <span>{activityLabels[index % activityLabels.length]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card__header">
            <h3>Account Summary</h3>
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
            <div className="account-summary">
              <div>
                <span>RIB</span>
                <strong>{String((selectedAccount as any)?.rib ?? '')}</strong>
              </div>
              <div>
                <span>Solde</span>
                <strong>{String((selectedAccount as any)?.amount ?? '')}</strong>
              </div>
              <div>
                <span>Statut</span>
                <strong>{isBlocked ? 'Carte bloquee' : 'Active'}</strong>
              </div>
            </div>
          ) : (
            <p>Aucun compte disponible.</p>
          )}
        </div>
      </div>
    </section>
  )
}

export default ClientDashboardPage
