import { FormEvent, useState } from 'react'
import { createCard, updateCardStatusForCustomer } from '../../services/CardService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors du chargement'
}

const AgentCardPage = () => {
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const [cardIdentityRef, setCardIdentityRef] = useState('')
  const [cardDailyLimit, setCardDailyLimit] = useState('')
  const [cardMonthlyLimit, setCardMonthlyLimit] = useState('')
  const [cardContactless, setCardContactless] = useState(true)
  const [isCreatingCard, setIsCreatingCard] = useState(false)

  const [cardStatusIdentityRef, setCardStatusIdentityRef] = useState('')
  const [cardStatus, setCardStatus] = useState('BLOCKED')
  const [isUpdatingCardStatus, setIsUpdatingCardStatus] = useState(false)

  const handleCreateCard = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setIsSuccess(false)
    setIsCreatingCard(true)
    try {
      await createCard({
        customerIdentityRef: cardIdentityRef,
        contactlessEnabled: cardContactless,
        dailyLimit: cardDailyLimit ? Number(cardDailyLimit) : undefined,
        monthlyLimit: cardMonthlyLimit ? Number(cardMonthlyLimit) : undefined
      })
      setMessage('Carte creee avec succes')
      setIsSuccess(true)
      setCardIdentityRef('')
      setCardDailyLimit('')
      setCardMonthlyLimit('')
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    } finally {
      setIsCreatingCard(false)
    }
  }

  const handleUpdateCardStatus = async (event: FormEvent) => {
    event.preventDefault()
    setMessage(null)
    setIsSuccess(false)
    setIsUpdatingCardStatus(true)
    try {
      await updateCardStatusForCustomer(cardStatusIdentityRef, cardStatus)
      setMessage('Statut carte mis a jour')
      setIsSuccess(true)
      setCardStatusIdentityRef('')
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    } finally {
      setIsUpdatingCardStatus(false)
    }
  }

  return (
    <section className="content">
      <h2>Carte</h2>
      {message && <div className={`alert${isSuccess ? ' success' : ''}`}>{message}</div>}

      <div className="section">
        <div className="section-header">
          <h3>Creation carte</h3>
        </div>
        <form className="form-grid" onSubmit={handleCreateCard}>
          <label className="field">
            <span>Identity ref client</span>
            <input
              value={cardIdentityRef}
              onChange={(event) => setCardIdentityRef(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Plafond jour</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cardDailyLimit}
              onChange={(event) => setCardDailyLimit(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Plafond mois</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={cardMonthlyLimit}
              onChange={(event) => setCardMonthlyLimit(event.target.value)}
            />
          </label>
          <label className="field">
            <span>Contactless</span>
            <select
              value={cardContactless ? 'true' : 'false'}
              onChange={(event) => setCardContactless(event.target.value === 'true')}
            >
              <option value="true">Active</option>
              <option value="false">Desactive</option>
            </select>
          </label>
          <button type="submit" disabled={isCreatingCard}>
            {isCreatingCard ? 'Creation...' : 'Creer carte'}
          </button>
        </form>
      </div>

      <div className="section">
        <div className="section-header">
          <h3>Statut carte</h3>
        </div>
        <form className="form-grid" onSubmit={handleUpdateCardStatus}>
          <label className="field">
            <span>Identity ref client</span>
            <input
              value={cardStatusIdentityRef}
              onChange={(event) => setCardStatusIdentityRef(event.target.value)}
              required
            />
          </label>
          <label className="field">
            <span>Statut</span>
            <select value={cardStatus} onChange={(event) => setCardStatus(event.target.value)}>
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
            </select>
          </label>
          <button type="submit" disabled={isUpdatingCardStatus}>
            {isUpdatingCardStatus ? 'Mise a jour...' : 'Mettre a jour'}
          </button>
        </form>
      </div>
    </section>
  )
}

export default AgentCardPage
