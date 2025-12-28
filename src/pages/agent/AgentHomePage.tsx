import { Link } from 'react-router-dom'

const AgentHomePage = () => {
  return (
    <section className="content">
      <h2>Tableau agent</h2>
      <p>Choisissez une fonctionnalite :</p>
      <div className="card-grid">
        <Link className="card" to="/agent/create-customer">
          <h3>Ajouter un client</h3>
          <p>Creer un nouveau client bancaire.</p>
        </Link>
        <Link className="card" to="/agent/create-account">
          <h3>Nouveau compte</h3>
          <p>Creer un compte bancaire pour un client.</p>
        </Link>
        <Link className="card" to="/agent/lists">
          <h3>Listes</h3>
          <p>Consulter clients, comptes et transactions.</p>
        </Link>
        <Link className="card" to="/agent/card">
          <h3>Carte</h3>
          <p>Creer une carte et gerer l'opposition.</p>
        </Link>
      </div>
    </section>
  )
}

export default AgentHomePage
