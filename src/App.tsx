import { useEffect, useState } from 'react'
import type { ReactElement } from 'react'
import type { Session } from '@supabase/supabase-js'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminLoginPage from './pages/AdminLoginPage'
import StudentPage from './pages/StudentPage'
import { fetchCurrentSession } from './lib/api'
import { supabase } from './lib/supabase'

type ProtectedAdminRouteProps = {
  session: Session | null
  loading: boolean
  children: ReactElement
}

function ProtectedAdminRoute({
  session,
  loading,
  children,
}: ProtectedAdminRouteProps) {
  if (loading) {
    return (
      <main className="admin-shell">
        <p className="status-line">Verification de la session administrateur...</p>
      </main>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)

  useEffect(() => {
    let active = true

    const initSession = async () => {
      try {
        const currentSession = await fetchCurrentSession()

        if (active) {
          setSession(currentSession)
        }
      } finally {
        if (active) {
          setLoadingSession(false)
        }
      }
    }

    void initSession()

    if (!supabase) {
      return () => {
        active = false
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, updatedSession) => {
      setSession(updatedSession)
      setLoadingSession(false)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentPage />} />
        <Route
          path="/admin/login"
          element={<AdminLoginPage session={session} />}
        />
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute session={session} loading={loadingSession}>
              <AdminDashboardPage />
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
