import React, {useState, useEffect} from 'react'
import axios from '../services/api'
import { formatDuration, toDateInput, toTimeInput, formatDateTime } from '../utils/format'
import Button from '../components/Button'
import Card from '../components/Card'
import Skeleton from '../components/Skeleton'

export default function Timer(){
  const [sessionId,setSessionId] = useState(null)
  const [running,setRunning] = useState(false)
  const [created, setCreated] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [churches, setChurches] = useState([])
  const [preachers, setPreachers] = useState([])
  const [loadingMeta, setLoadingMeta] = useState(true)
  const [sel, setSel] = useState({church_id:'', preacher_id:''})
  const [churchMap, setChurchMap] = useState({})
  const [preacherMap, setPreacherMap] = useState({})

  async function createSession(){
    const body = {service_type: 'service', church_id: sel.church_id || undefined, preacher_id: sel.preacher_id || undefined}
    const res = await axios.post('/api/sessions', body)
    setSessionId(res.data.id)
    setCreated(res.data)
  }

  async function fetchMeta(){
    try{
      const c = await axios.get('/api/churches')
      setChurches(c.data)
      const map = {}
      c.data.forEach(x=> map[x.id]=x)
      setChurchMap(map)
      setLoadingMeta(false)
    }catch(e){console.error(e)}
  }

  async function fetchPreachers(churchId){
    try{
      const q = churchId ? `?church_id=${churchId}` : ''
      const p = await axios.get(`/api/preachers${q}`)
      setPreachers(p.data)
      const map = {}
      p.data.forEach(x=> map[x.id]=x)
      setPreacherMap(map)
      setLoadingMeta(false)
    }catch(e){console.error(e)}
  }

  useEffect(()=>{fetchMeta()},[])
  useEffect(()=>{fetchPreachers()},[])

  // --- localStorage persistence helpers ---
  const STORAGE_KEY = 'trecker:timer'

  function saveTimerState(state){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) }catch(e){/* ignore */}
  }

  function clearTimerState(){
    try{ localStorage.removeItem(STORAGE_KEY) }catch(e){}
  }

  async function restoreTimer(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY)
      if(!raw) return
      const st = JSON.parse(raw)
      if(!st || !st.sessionId) return
      // rehydrate selection
      if(st.sel) setSel(st.sel)
      setSessionId(st.sessionId)
      // fetch session to confirm
      const res = await axios.get('/api/sessions', { params: { session_id: st.sessionId } })
      const s = res.data.find(x=> x.id===st.sessionId)
      if(!s){ clearTimerState(); return }
      setCreated(s)
      // compute elapsed
      function safeParseIso(iso){
        if(!iso) return null
        if(/Z$|[+-]\d{2}:?\d{2}$/.test(iso)) return new Date(iso)
        return new Date(iso + 'Z')
      }
      const currentElapsed = s.end_at ? (s.duration_sec || 0) : (s.start_at ? Math.floor((Date.now() - safeParseIso(s.start_at).getTime()) / 1000) : 0)
      setElapsed(currentElapsed)
      // if stored running, resume
      if(st.running && !s.end_at){ setRunning(true) }
    }catch(e){ console.error('restoreTimer', e); clearTimerState() }
  }

  function onChurchChange(e){
    const v = e.target.value
    setSel(s=>({...s,church_id:v,preacher_id:''}))
    fetchPreachers(v)
  }

  function onPreacherChange(e){
    setSel(s=>({...s,preacher_id:e.target.value}))
  }

  // restore persisted timer on mount
  useEffect(()=>{ restoreTimer() }, [])

  async function start(){
    if(!sel.preacher_id){
      alert('Please select a preacher before starting the timer')
      return
    }
    if(!sessionId) await createSession()
    try{
      await axios.post(`/api/sessions/${sessionId}/start`)
      // fetch updated session to get start_at
      const res = await axios.get('/api/sessions', { params: { session_id: sessionId } })
      const s = res.data.find(x=> x.id===sessionId)
      if(s){ setCreated(s); setElapsed(0) }
      setRunning(true)
      // persist running timer state
      saveTimerState({ sessionId, running: true, sel })
    }catch(e){console.error(e)}
  }

  async function stop(){
    if(!sessionId) return
    try{
      await axios.post(`/api/sessions/${sessionId}/stop`)
      const res = await axios.get('/api/sessions', { params: { session_id: sessionId } })
      const s = res.data.find(x=> x.id===sessionId)
      if(s){ setCreated(s); setElapsed(s.duration_sec || 0) }
      setRunning(false)
      // clear persisted timer
      clearTimerState()
    }catch(e){console.error(e)}
  }

  useEffect(()=>{
    let t
    async function refresh(){
      if(!sessionId) return
      try{
        const res = await axios.get(`/api/sessions` , { params: { session_id: sessionId } })
        const s = res.data.find(x=> x.id===sessionId)
        if(s){
          setCreated(s)
          function safeParseIso(iso){ if(!iso) return null; if(/Z$|[+-]\d{2}:?\d{2}$/.test(iso)) return new Date(iso); return new Date(iso + 'Z') }
          setElapsed(s.duration_sec || (s.start_at ? Math.floor((Date.now() - safeParseIso(s.start_at).getTime()) / 1000) : 0))
        }
      }catch(e){console.error(e)}
    }

    if(running){
      t = setInterval(()=>{
        setElapsed(prev=> prev+1)
      }, 1000)
      // keep persisted state in sync while running
      saveTimerState({ sessionId, running: true, sel })
    } else {
      // refresh once when stopped
      refresh()
    }

    return ()=> clearInterval(t)
  }, [running, sessionId])

  return (
    <div className="w-full px-4 space-y-4">
      <div>
        <h3 className="page-header">Live Timer</h3>
        <div className="page-sub">Start and stop sessions quickly</div>
      </div>
      <div className="text-2xl">{running ? <span className="text-green-600 font-medium">Running...</span> : <span className="text-gray-700">Stopped</span>}</div>
      <div className="mt-3">
        <Card>
          <div className="flex gap-3 items-center mb-2 flex-wrap">
          <label className="flex items-center gap-2">Church:
            {loadingMeta ? <div className="w-40"><Skeleton height="h-8" /></div> : (
              <select className="border rounded px-2 py-1" value={sel.church_id} onChange={onChurchChange}><option value="">—</option>{churches.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            )}
          </label>
          <label className="flex items-center gap-2">Preacher:
            {loadingMeta ? <div className="w-40"><Skeleton height="h-8" /></div> : (
              <select className="border rounded px-2 py-1" value={sel.preacher_id} onChange={onPreacherChange}><option value="">—</option>{preachers.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}</select>
            )}
          </label>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant="primary" onClick={start} disabled={running || !sel.preacher_id}>Start</Button>
          <Button variant="danger" onClick={stop} disabled={!running}>Stop</Button>
          {running && <div className="ml-4 text-sm text-gray-600">Elapsed: <span className="font-medium">{formatDuration(elapsed)}</span></div>}
        </div>
        </Card>
      </div>
      <div className="mt-3">
        <Card>
        {created ? (
          <div className="space-y-1">
            <div><strong>Preacher:</strong> {preacherMap[created.preacher_id]?.name || '—'}</div>
            <div><strong>Church:</strong> {churchMap[created.church_id]?.name || '—'}</div>
            <div className="flex gap-4">
              <div><strong>Start:</strong> {created.start_at ? formatDateTime(created.start_at) : '-'}</div>
              <div><strong>End:</strong> {created.end_at ? formatDateTime(created.end_at) : '-'}</div>
            </div>
            <div><strong>Duration:</strong> {created.end_at ? formatDuration(created.duration_sec) : formatDuration(elapsed)}</div>
          </div>
        ) : (
          'No session created yet'
        )}
        </Card>
      </div>
    </div>
  )
}
