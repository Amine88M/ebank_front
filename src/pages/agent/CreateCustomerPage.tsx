import { FormEvent, useState } from 'react'
import { createCustomer } from '../../services/CustomerService'

const getErrorMessage = (data: unknown): string => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message
  }
  return 'Erreur lors de la creation du client'
}

const CreateCustomerPage = () => {
  const [identityRef, setIdentityRef] = useState('')
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [mail, setMail] = useState('')
  const [address, setAddress] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage(null)
    try {
      await createCustomer({ identityRef, firstname, lastname, mail, address, birthDate })
      setMessage({ text: 'Client cree avec succes', type: 'success' })
    } catch (error: any) {
      setMessage({ text: getErrorMessage(error?.response?.data), type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="content">
      <h2></h2>
      <form className="form-grid" onSubmit={handleSubmit}>
        <label className="field">
          <span>Numéro d'identité</span>
          <input value={identityRef} onChange={(event) => setIdentityRef(event.target.value)} required />
        </label>
        <label className="field">
          <span>Prénom</span>
          <input value={firstname} onChange={(event) => setFirstname(event.target.value)} required />
        </label>
        <label className="field">
          <span>Nom</span>
          <input value={lastname} onChange={(event) => setLastname(event.target.value)} required />
        </label>
        <label className="field">
          <span>Email</span>
          <input type="email" value={mail} onChange={(event) => setMail(event.target.value)} required />
        </label>
        <label className="field">
          <span>Adresse</span>
          <input value={address} onChange={(event) => setAddress(event.target.value)} required />
        </label>
        <label className="field">
          <span>Date de naissance</span>
          <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} required />
        </label>
        {message && <div className={`alert ${message.type === 'success' ? 'success' : ''}`}>{message.text}</div>}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creation...' : 'Creer'}
        </button>
      </form>
    </section>
  )
}

export default CreateCustomerPage
