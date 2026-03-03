import { AuthProvider, useAuth } from './context/AuthContext'
import { NavProvider, useNav }   from './context/NavContext'
import { Layout }      from './components/Layout'
import { LoginPage }   from './pages/LoginPage'
import { HomePage }    from './pages/HomePage'
import { FinancePage } from './pages/FinancePage'
import { PomodoroPage }from './pages/PomodoroPage'
import { HabitsPage }  from './pages/HabitsPage'
import { LinksPage }   from './pages/LinksPage'

function Pages() {
  const { page } = useNav()
  return (
    <>
      {page === 'home'     && <HomePage />}
      {page === 'finance'  && <FinancePage />}
      {page === 'pomodoro' && <PomodoroPage />}
      {page === 'habits'   && <HabitsPage />}
      {page === 'links'    && <LinksPage />}
    </>
  )
}

function App() {
  const { user } = useAuth()
  if (!user) return <LoginPage />
  return (
    <NavProvider>
      <Layout><Pages /></Layout>
    </NavProvider>
  )
}

export default function Root() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
