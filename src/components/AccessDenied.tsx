type AccessDeniedProps = {
  message?: string | null
}

const AccessDenied = ({ message }: AccessDeniedProps) => {
  return (
    <div className="panel">
      <h2>Acces refuse</h2>
      <p>
        {message ??
          "Vous n'avez pas le droit d'acceder a cette fonctionnalite. Veuillez contacter votre administrateur"}
      </p>
    </div>
  )
}

export default AccessDenied
