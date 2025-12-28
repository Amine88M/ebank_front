import { FormEvent, useEffect, useState } from 'react'
import { createTransaction } from '../../services/TransactionService'
import { fetchAccounts } from '../../services/BankService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors du virement'
}

const ClientTransferPage = () => {
  const [accounts, setAccounts] = useState<unknown[]>([])
  const [ribFrom, setRibFrom] = useState('')
  const [ribTo, setRibTo] = useState('')
  const [amount, setAmount] = useState('')
  const [motif, setMotif] = useState('')
  const [username, setUsername] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await fetchAccounts()
        const list = Array.isArray(data) ? data : []
        setAccounts(list)
        const firstRib = list[0]?.rib ?? ''
        if (firstRib) {
          setRibFrom(firstRib)
        }
      } catch {
        setAccounts([])
      }
    }
    loadAccounts()
  }, [])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      await createTransaction({
        ribFrom,
        ribTo,
        amount: Number(amount),
        motif,
        username
      })
      setMessage('Virement effectue avec succes')
    } catch (error: any) {
      setMessage(getErrorMessage(error?.response?.data))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="content">
      <h2>Nouveau virement</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        {accounts.length > 0 ? (
          <label className="field">
            <span>RIB emetteur</span>
            <select value={ribFrom} onChange={(event) => setRibFrom(event.target.value)}>
              {accounts.map((account) => (
                <option key={(account as any)?.rib ?? ''} value={(account as any)?.rib ?? ''}>
                  {(account as any)?.rib ?? 'Compte'}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="field">
            <span>RIB emetteur</span>
            <input value={ribFrom} onChange={(event) => setRibFrom(event.target.value)} required />
          </label>
        )}
        <label className="field">
          <span>RIB destinataire</span>
          <input value={ribTo} onChange={(event) => setRibTo(event.target.value)} required />
        </label>
        <label className="field">
          <span>Montant</span>
          <input
            type="number"
            value={amount}
            min="0"
            step="0.01"
            onChange={(event) => setAmount(event.target.value)}
            required
          />
        </label>
        <label className="field">
          <span>Motif</span>
          <input value={motif} onChange={(event) => setMotif(event.target.value)} required />
        </label>
        <label className="field">
          <span>Username (requis par backend)</span>
          <input value={username} onChange={(event) => setUsername(event.target.value)} required />
        </label>
        {message && <div className="alert">{message}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'En cours...' : 'Valider'}
        </button>
      </form>
    </section>
  )
}

export default ClientTransferPage
