import React, {useEffect, useState} from 'react'
import axios from '../services/api'
import { formatDuration, toDateInput, toTimeInput, combineDateTime, formatDateTime } from '../utils/format'
import SessionEditorModal from '../components/SessionEditorModal'
import ConfirmModal from '../components/ConfirmModal'
import Card from '../components/Card'
import Avatar from '../components/Avatar'
import Button from '../components/Button'
import Skeleton from '../components/Skeleton'

export default function Sessions(){
  const [sessions,setSessions] = useState(null) // null = loading
  const [churches,setChurches] = useState([])
  const [preachers,setPreachers] = useState([])
  const [filters, setFilters] = useState({church_id: '', preacher_id: ''})
  const [churchMap, setChurchMap] = useState({})
  const [preacherMap, setPreacherMap] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [creating, setCreating] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)

  async function handleDeleteSession(id){
    if(!id){ alert('No session selected'); return }
    try{
      await axios.delete(`/api/sessions/${id}`)
      setConfirmOpen(false)
      setToDeleteId(null)
      fetchSessions()
    }catch(e){
      console.error(e)
      const msg = e?.response?.data?.detail || e.message || 'Delete failed'
      alert(msg)
    }
  }
  useEffect(()=>{fetchMeta(); fetchPreachers(); fetchSessions();},[])

  async function fetchMeta(){
    try{
      const c = await axios.get('/api/churches')
      setChurches(c.data)
      const map = {}
      c.data.forEach(x=> map[x.id]=x)
      setChurchMap(map)
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
    }catch(e){console.error(e)}
  }

  async function fetchSessions(){
    try{
      setSessions(null)
      const params = {}
      if(filters.church_id) params.church_id = filters.church_id
      if(filters.preacher_id) params.preacher_id = filters.preacher_id
      const res = await axios.get('/api/sessions', { params })
      setSessions(res.data)
    }catch(e){console.error(e); setSessions([])}
  }

  function onChurchChange(e){
    const v = e.target.value
    setFilters(f => ({...f, church_id: v, preacher_id: ''}))
    fetchPreachers(v)
  }

  function onPreacherChange(e){
    const v = e.target.value
    setFilters(f => ({...f, preacher_id: v}))
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Sessions</h3>
      <div className="card flex gap-3 items-center flex-wrap">
        <label className="flex items-center gap-2">Church:
          <select className="border rounded px-2 py-1" value={filters.church_id} onChange={onChurchChange}>
            <option value="">— all —</option>
            {churches.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2">Preacher:
          <select className="border rounded px-2 py-1" value={filters.preacher_id} onChange={onPreacherChange}>
            <option value="">— all —</option>
            {preachers.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        <Button variant="primary" size="sm" onClick={fetchSessions}>Apply</Button>
        <Button variant="secondary" size="sm" onClick={()=>{setFilters({church_id:'',preacher_id:''}); setPreachers([]); fetchSessions()}}>Clear</Button>
        <div className="ml-auto">
          <Button variant="primary" size="sm" onClick={()=>{ setCreating(true); setEditingSession(null); setEditingId(null) }}>New Session</Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        {/* Desktop: nicer card-grid layout */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
          {sessions === null ? (
            Array.from({length:6}).map((_,i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full skeleton" />
                  <div className="flex-1">
                    <div className="w-32 h-4 skeleton mb-2" />
                    <div className="w-20 h-3 skeleton mb-3" />
                    <div className="w-full h-12 skeleton" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            sessions.map(s => (
              <div key={s.id} className="card p-4 card-hover">
                <div className="flex items-start gap-3">
                  <Avatar src={preacherMap[s.preacher_id]?.avatar_url} name={preacherMap[s.preacher_id]?.name} id={s.preacher_id} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{preacherMap[s.preacher_id]?.name || '—'}</div>
                        <div className="text-xs text-muted truncate">{churchMap[s.church_id]?.name || '—'}</div>
                      </div>
                      <div className="text-sm font-semibold text-primary flex-shrink-0 text-right max-w-[8rem] truncate">{formatDuration(s.duration_sec)}</div>
                    </div>

                    <div className="mt-2 text-sm text-muted">
                      <div>{s.start_at ? formatDateTime(s.start_at) : '-'}</div>
                      <div className="mt-1 text-xs text-muted">{s.end_at ? formatDateTime(s.end_at) : '-'}</div>
                    </div>

                    {s.notes ? <div className="mt-3 text-sm text-muted line-clamp-3 break-words">{s.notes}</div> : null}

                    <div className="mt-3 flex items-center gap-2">
                      <Button variant="secondary" size="sm" onClick={()=>{ setEditingId(s.id); setEditingSession(s) }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={()=>{ setToDeleteId(s.id); setConfirmOpen(true) }}>Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden mt-3 space-y-3">
          {sessions === null ? (
            Array.from({length:4}).map((_,i) => (
              <div key={i} className="card p-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full skeleton" />
                  <div className="flex-1">
                    <div className="w-32 h-4 skeleton mb-2" />
                    <div className="w-full h-12 skeleton" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            sessions.map(s => (
              <div key={s.id} className="card p-3 card-hover">
                <div className="flex items-start gap-3">
                  <Avatar src={preacherMap[s.preacher_id]?.avatar_url} name={preacherMap[s.preacher_id]?.name} id={s.preacher_id} size={48} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{preacherMap[s.preacher_id]?.name || '—'}</div>
                        <div className="text-xs text-gray-500 truncate">{churchMap[s.church_id]?.name || '—'}</div>
                      </div>
                      <div className="text-sm font-medium flex-shrink-0 max-w-[6rem] text-right truncate">{formatDuration(s.duration_sec)}</div>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <div>{s.start_at ? formatDateTime(s.start_at) : '-' } — {s.end_at ? formatDateTime(s.end_at) : '-'}</div>
                      {s.notes ? <div className="mt-2 text-sm text-gray-700 line-clamp-3 break-words">{s.notes}</div> : null}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button variant="secondary" size="sm" onClick={()=>{ setEditingId(s.id); setEditingSession(s) }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={()=>{ setToDeleteId(s.id); setConfirmOpen(true) }}>Delete</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      <ConfirmModal open={confirmOpen} title="Delete session" description="This will permanently delete the session. Are you sure?" onCancel={()=>{ setConfirmOpen(false); setToDeleteId(null) }} onConfirm={async ()=>{ await handleDeleteSession(toDeleteId) }} />
      <SessionEditorModal
        session={creating ? null : editingSession}
        preachers={preachers}
        churches={churches}
        defaultPreacherId={filters.preacher_id}
        defaultChurchId={filters.church_id}
        open={creating || !!editingSession}
        onClose={()=>{ setEditingSession(null); setEditingId(null); setCreating(false) }}
        onSave={async (body)=>{
          try{
            if(creating){
              await axios.post(`/api/sessions`, body)
              setCreating(false)
            } else {
              await axios.patch(`/api/sessions/${editingSession.id}`, body)
              setEditingSession(null)
              setEditingId(null)
            }
            fetchSessions()
          }
          catch(e){ console.error(e); alert('Save failed') }
        }}
      />
    </div>
  )
}
