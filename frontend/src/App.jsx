import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import Sessions from './pages/Sessions'
import Timer from './pages/Timer'
import Dashboard from './pages/Dashboard'
import Manage from './pages/Manage'
import AllSessions from './pages/AllSessions'
import './index.css'
import ThemeToggle from './components/ThemeToggle'
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
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="m-0 site-title">Trecker Time</h2>
          <nav className="hidden sm:block">
            <NavLink hash="#/sessions">Sessions</NavLink>
            <NavLink hash="#/all-sessions">All Sessions</NavLink>
            <NavLink hash="#/timer">Timer</NavLink>
            <NavLink hash="#/dashboard">Dashboard</NavLink>
            <NavLink hash="#/manage">Manage</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {(() => {
            const raw = localStorage.getItem('trecker:user')
            if (!raw) return <a href="#/login" className="text-sm text-primary mr-3">Login</a>
            try{
              const u = JSON.parse(raw)
              return <div className="flex items-center gap-3"><span className="text-sm text-muted">{u.login}</span><button onClick={()=>{ localStorage.removeItem('trecker:token'); localStorage.removeItem('trecker:user'); window.location.reload() }} className="text-sm text-primary">Logout</button></div>
            }catch(e){
              return <a href="#/login" className="text-sm text-primary mr-3">Login</a>
            }
          })()}
          <button aria-label="Open menu" className="sm:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>setMobileOpen(v=>!v)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
          </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="sm:hidden mt-3 mb-4 p-3 rounded shadow-sm bg-white dark:bg-gray-800 border border-transparent dark:border-neutral-700 transition-colors">
          <nav className="flex flex-col gap-2">
            <a href="#/sessions" onClick={()=>setMobileOpen(false)} className="text-primary">Sessions</a>
            <a href="#/all-sessions" onClick={()=>setMobileOpen(false)} className="text-primary">All Sessions</a>
            <a href="#/timer" onClick={()=>setMobileOpen(false)} className="text-primary">Timer</a>
            <a href="#/dashboard" onClick={()=>setMobileOpen(false)} className="text-primary">Dashboard</a>
            <a href="#/manage" onClick={()=>setMobileOpen(false)} className="text-primary">Manage</a>
            { !localStorage.getItem('trecker:token') ? <a href="#/login" onClick={()=>setMobileOpen(false)} className="text-primary">Login</a> : <a href="#/" onClick={()=>{ localStorage.removeItem('trecker:token'); localStorage.removeItem('trecker:user'); setMobileOpen(false); window.location.reload() }} className="text-primary">Logout</a> }
          </nav>
        </div>
      )}

      <main className="mt-5">
        {hash === '#/timer' && <Timer />}
        {hash === '#/dashboard' && <Dashboard />}
        {hash === '#/manage' && (localStorage.getItem('trecker:token') ? <Manage /> : (window.location.hash = '#/login', null))}
        {hash === '#/all-sessions' && <AllSessions />}
        {hash === '#/login' && <Login />}
        {(hash === '' || hash === '#/sessions' || !hash) && <Sessions />}
      </main>
    </div>
  )
}

const root = createRoot(document.getElementById('root'))
root.render(<App />)
