import React, { useState } from 'react'
import api from '../services/api'
import Button from '../components/Button'

export default function Login(){
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e){
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      const res = await api.post('/api/auth/login', { login, password })
      const token = res.data.access_token
      if(token){
        localStorage.setItem('trecker:token', JSON.stringify(token))
        localStorage.setItem('trecker:user', JSON.stringify(res.data.user))
        window.location.hash = '#/dashboard'
      }
    }catch(e){ setError(e?.response?.data?.detail || 'Login failed') }
    finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h3 className="text-xl font-semibold mb-4">Login</h3>
      <form onSubmit={handleLogin} className="space-y-3">
        <div>
          <label className="block text-sm muted">Login</label>
          <input className="w-full form-control" value={login} onChange={e=>setLogin(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm muted">Password</label>
          <input type="password" className="w-full form-control" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex justify-end">
          <Button variant="primary" type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign in'}</Button>
        </div>
      </form>
    </div>
  )
}
