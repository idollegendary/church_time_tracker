import React, { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import Drawer from './Drawer'

function NavLink({ href, children, onClick }){
  return (
    <a href={href} onClick={onClick} className="mr-4 text-primary hover:underline">
      {children}
    </a>
  )
}

export default function Header(){
  const [mobileOpen, setMobileOpen] = useState(false)

  const raw = typeof window !== 'undefined' ? localStorage.getItem('trecker:user') : null

  let user = null
  try{ user = raw ? JSON.parse(raw) : null }catch(e){ user = null }

  return (
    <header className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <h2 className="m-0 site-title">Trecker Time</h2>
        <nav className="hidden sm:block">
          <NavLink href="#/sessions">Sessions</NavLink>
          <NavLink href="#/all-sessions">All Sessions</NavLink>
          <NavLink href="#/timer">Timer</NavLink>
          <NavLink href="#/dashboard">Dashboard</NavLink>
          <NavLink href="#/manage">Manage</NavLink>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        { !user ? (
          <a href="#/login" className="hidden sm:inline-block text-sm text-primary mr-3">Login</a>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-muted">{user.login}</span>
            <button onClick={()=>{ localStorage.removeItem('trecker:token'); localStorage.removeItem('trecker:user'); window.location.reload() }} className="text-sm text-primary">Logout</button>
          </div>
        ) }

        <button aria-label="Open menu" className="sm:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800" onClick={()=>setMobileOpen(v=>!v)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
        </button>
      </div>

      <Drawer open={mobileOpen} onClose={()=>setMobileOpen(false)}>
        <nav className="flex flex-col gap-3">
          <a href="#/sessions" onClick={()=>setMobileOpen(false)} className="text-primary">Sessions</a>
          <a href="#/all-sessions" onClick={()=>setMobileOpen(false)} className="text-primary">All Sessions</a>
          <a href="#/timer" onClick={()=>setMobileOpen(false)} className="text-primary">Timer</a>
          <a href="#/dashboard" onClick={()=>setMobileOpen(false)} className="text-primary">Dashboard</a>
          <a href="#/manage" onClick={()=>setMobileOpen(false)} className="text-primary">Manage</a>
          { !localStorage.getItem('trecker:token') ? <a href="#/login" onClick={()=>setMobileOpen(false)} className="text-primary">Login</a> : <a href="#/" onClick={()=>{ localStorage.removeItem('trecker:token'); localStorage.removeItem('trecker:user'); setMobileOpen(false); window.location.reload() }} className="text-primary">Logout</a> }
        </nav>
      </Drawer>
    </header>
  )
}
