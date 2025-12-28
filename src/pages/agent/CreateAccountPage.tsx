import { FormEvent, useState } from 'react'
import { createBankAccount } from '../../services/BankService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors de la creation du compte'
}

const CreateAccountPage = () => {
  const [rib, setRib] = useState('')
  const [amount, setAmount] = useState('')
  const [customerIdentityRef, setCustomerIdentityRef] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      await createBankAccount({
        rib,
        amount: Number(amount),
        customerIdentityRef
      })
      setMessage({ text: 'Compte cree avec succes', type: 'success' })
    } catch (error: any) {
      setMessage({ text: getErrorMessage(error?.response?.data), type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="content">
      <h2>Nouveau compte bancaire</h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>RIB</span>
          <input value={rib} onChange={(event) => setRib(event.target.value)} required />
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
          <span>Identite client</span>
          <input
            value={customerIdentityRef}
            onChange={(event) => setCustomerIdentityRef(event.target.value)}
            required
          />
        </label>
        {message && <div className={`alert ${message.type === 'success' ? 'success' : ''}`}>{message.text}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creation...' : 'Creer'}
        </button>
      </form>
    </section>
  )
}

export default CreateAccountPage
