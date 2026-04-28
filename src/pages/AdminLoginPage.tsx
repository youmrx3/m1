import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { signInAdmin } from '../lib/api'
import { isSupabaseConfigured } from '../lib/supabase'

type AdminLoginPageProps = {
  session: Session | null
}

function AdminLoginPage({ session }: AdminLoginPageProps) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (session) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!isSupabaseConfigured) {
      setError(
        'Configuration Supabase manquante. Ajoutez les variables d environnement avant connexion.',
      )
      return
    }

    setLoading(true)

    try {
      await signInAdmin(email, password)
      navigate('/admin', { replace: true })
    } catch (authError) {
      const details = authError instanceof Error ? authError.message : ''
      setError(`Connexion impossible. ${details}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="admin-shell">
      <section className="admin-login-card reveal">
        <p className="eyebrow">Espace enseignant</p>
        <h1>Connexion administrateur</h1>
        <p className="section-text">
          Connectez-vous avec le compte admin Supabase pour gerer les groupes et les datasets.
        </p>

        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              placeholder="enseignant@universite.fr"
            />
          </label>

          <label>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              placeholder="********"
            />
          </label>

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>

        {error ? <p className="status-line error">{error}</p> : null}
      </section>
    </main>
  )
}

export default AdminLoginPage
