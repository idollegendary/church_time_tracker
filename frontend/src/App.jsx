import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Sessions from './pages/Sessions'
import Timer from './pages/Timer'
import Dashboard from './pages/Dashboard'
import Manage from './pages/Manage'
import AllSessions from './pages/AllSessions'
import LeaderBoard from './pages/LeaderBoard'
import './index.css'
import Header from './components/Header'
import Login from './pages/Login'
import api from './services/api'

function NavLink({ hash, children }) {
  return (
    <a href={hash} className="mr-4 text-primary hover:underline">
      {children}
    </a>
  )
}

function App() {
  const [hash, setHash] = useState(window.location.hash)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userLoaded, setUserLoaded] = useState(false)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // If token exists but no user object, fetch /api/auth/me to restore user
  useEffect(() => {
    async function restoreUser(){
      try{
        const rawToken = localStorage.getItem('trecker:token')
        const rawUser = localStorage.getItem('trecker:user')
        if(rawToken && !rawUser){
          const res = await api.get('/api/auth/me')
          localStorage.setItem('trecker:user', JSON.stringify(res.data))
        }
      }catch(e){
        localStorage.removeItem('trecker:token')
        localStorage.removeItem('trecker:user')
      }finally{
        setUserLoaded(true)
      }
    }
    restoreUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container-pad font-sans mx-auto" style={{ maxWidth: '1440px' }}>
      <Header />

      <main className="mt-5">
        {hash === '#/timer' && <Timer />}
        {hash === '#/dashboard' && <Dashboard />}
        {hash === '#/manage' && (localStorage.getItem('trecker:token') ? <Manage /> : (window.location.hash = '#/login', null))}
        {hash === '#/all-sessions' && <AllSessions />}
        {hash === '#/leaderboard' && <LeaderBoard />}
        {hash === '#/login' && <Login />}
        {(hash === '' || hash === '#/sessions' || !hash) && <Sessions />}
      </main>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
