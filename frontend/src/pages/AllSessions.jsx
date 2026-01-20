import React, {useEffect, useState} from 'react'
import axios from '../services/api'
import { formatDuration, formatDateTime } from '../utils/format'
import SessionEditorModal from '../components/SessionEditorModal'
import ViewSessionModal from '../components/ViewSessionModal'
import ConfirmModal from '../components/ConfirmModal'
import Card from '../components/Card'
import Avatar from '../components/Avatar'
import Button from '../components/Button'

export default function AllSessions(){
  const [sessions,setSessions] = useState([])
  const [churches,setChurches] = useState([])
  const [preachers,setPreachers] = useState([])
  const [filters, setFilters] = useState({church_id: '', preacher_id: '', from: '', to: ''})
  const [sortBy, setSortBy] = useState('start_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [editingSession, setEditingSession] = useState(null)
  const [creating, setCreating] = useState(false)
  const [viewSession, setViewSession] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)

  useEffect(()=>{ fetchMeta(); fetchSessions() }, [])

  async function fetchMeta(){
    try{
      const c = await axios.get('/api/churches')
      setChurches(c.data)
      const p = await axios.get('/api/preachers')
      setPreachers(p.data)
    }catch(e){console.error(e)}
  }

  async function fetchPreachers(churchId){
    try{
      const q = churchId ? `?church_id=${churchId}` : ''
      const res = await axios.get(`/api/preachers${q}`)
      setPreachers(res.data)
    }catch(e){console.error(e)}
  }

  async function fetchSessions(){
    try{
      const params = {}
      if(filters.church_id) params.church_id = filters.church_id
      if(filters.preacher_id) params.preacher_id = filters.preacher_id
      if(filters.from) params.date_from = filters.from
      if(filters.to) params.date_to = filters.to
      const res = await axios.get('/api/sessions', { params })
      let items = res.data || []
      // server should filter by date, but keep client-side fallback
      if(filters.from){ const fromT = new Date(filters.from).getTime(); items = items.filter(s=> new Date(s.start_at || s.created_at).getTime() >= fromT) }
      if(filters.to){ const toT = new Date(filters.to).getTime(); items = items.filter(s=> new Date(s.start_at || s.created_at).getTime() <= toT) }
      // sorting
      items.sort((a,b)=>{
        let av = (sortBy === 'duration_sec') ? (a.duration_sec||0) : new Date(a.start_at||a.created_at).getTime()
        let bv = (sortBy === 'duration_sec') ? (b.duration_sec||0) : new Date(b.start_at||b.created_at).getTime()
        return sortOrder === 'asc' ? av - bv : bv - av
      })
      setSessions(items)
    }catch(e){console.error(e)}
  }

  async function handleDeleteSession(id){
    if(!id) return
    try{
      await axios.delete(`/api/sessions/${id}`)
      setConfirmOpen(false)
      setToDeleteId(null)
      fetchSessions()
    }catch(e){ console.error(e); alert('Delete failed') }
  }

  const totalPages = Math.max(1, Math.ceil(sessions.length / pageSize))
  const pageItems = sessions.slice((page-1)*pageSize, page*pageSize)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">All Sessions</h3>
        <div>
          <Button variant="primary" size="sm" onClick={()=>{ setCreating(true); setEditingSession(null) }}>New Session</Button>
        </div>
      </div>

      <div className="card flex gap-3 items-center flex-wrap">
        <label className="flex items-center gap-2">Church:
          <select className="border rounded px-2 py-1" value={filters.church_id} onChange={e=> { const v = e.target.value; setFilters(f=> ({...f, church_id: v, preacher_id: ''})); fetchPreachers(v); }}>
            <option value="">— all —</option>
            {churches.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-2">Preacher:
          <select className="border rounded px-2 py-1" value={filters.preacher_id} onChange={e=> setFilters(f=> ({...f, preacher_id: e.target.value}))}>
            <option value="">— all —</option>
            {preachers.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </label>

        <label className="flex items-center gap-2">From:
          <input type="date" className="border rounded px-2 py-1" value={filters.from} onChange={e=> setFilters(f=> ({...f, from: e.target.value}))} />
        </label>
        <label className="flex items-center gap-2">To:
          <input type="date" className="border rounded px-2 py-1" value={filters.to} onChange={e=> setFilters(f=> ({...f, to: e.target.value}))} />
        </label>

        <label className="flex items-center gap-2">Sort:
          <select className="border rounded px-2 py-1" value={sortBy} onChange={e=> setSortBy(e.target.value)}>
            <option value="start_at">Start time</option>
            <option value="duration_sec">Duration</option>
          </select>
        </label>
        <label className="flex items-center gap-2">Order:
          <select className="border rounded px-2 py-1" value={sortOrder} onChange={e=> setSortOrder(e.target.value)}>
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </label>

        <label className="flex items-center gap-2">Page size:
          <select className="border rounded px-2 py-1" value={pageSize} onChange={e=> { setPageSize(parseInt(e.target.value,10)); setPage(1) }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </label>

        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="primary" onClick={fetchSessions}>Apply</Button>
          <Button size="sm" variant="secondary" onClick={()=>{ setFilters({church_id:'',preacher_id:'', from:'', to:''}); fetchSessions(); }}>Clear</Button>
        </div>
      </div>

      <Card className="overflow-x-auto">
        <div className="hidden md:block mt-3">
          <div className="grid grid-cols-12 gap-3 items-center font-medium text-sm text-muted py-2 px-2 border-b">
            <div className="col-span-1"></div>
            <div className="col-span-1">#</div>
            <div className="col-span-3">Preacher</div>
            <div className="col-span-3">Church</div>
            <div className="col-span-2">When</div>
            <div className="col-span-2">Duration</div>
          </div>

          {pageItems.map((s,i)=> (
            <div key={s.id} className="grid grid-cols-12 gap-3 items-center py-3 px-2 border-b cursor-pointer" onClick={()=>setViewSession(s)}>
              <div className="col-span-1 text-sm">
                <Avatar src={preachers.find(p=>p.id===s.preacher_id)?.avatar_url} name={preachers.find(p=>p.id===s.preacher_id)?.name} id={s.preacher_id} size={36} />
              </div>
              <div className="col-span-1 text-sm">{(page-1)*pageSize + i + 1}</div>
              <div className="col-span-3 flex items-center gap-3">
                <div>
                  <div className="font-medium">{preachers.find(p=>p.id===s.preacher_id)?.name || '—'}</div>
                  <div className="text-xs text-muted truncate max-w-xs">{s.notes ? s.notes : ''}</div>
                </div>
              </div>
              <div className="col-span-3 text-sm">{churches.find(c=>c.id===s.church_id)?.name || '—'}</div>
              <div className="col-span-2 text-sm">{s.start_at ? formatDateTime(s.start_at) : '-'}</div>
              <div className="col-span-2 text-sm font-semibold">{formatDuration(s.duration_sec)}</div>
            </div>
          ))}
        </div>

        <div className="md:hidden mt-3 space-y-3">
          {pageItems.map(s => (
              <div key={s.id} className="card p-3 card-hover cursor-pointer" onClick={()=>setViewSession(s)}>
                <div className="flex items-start gap-3">
                  <Avatar src={preachers.find(p=>p.id===s.preacher_id)?.avatar_url} name={preachers.find(p=>p.id===s.preacher_id)?.name} id={s.preacher_id} size={48} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{preachers.find(p=>p.id===s.preacher_id)?.name || '—'}</div>
                        <div className="text-xs text-muted">{churches.find(c=>c.id===s.church_id)?.name || '—'}</div>
                      </div>
                      <div className="text-sm font-medium">{formatDuration(s.duration_sec)}</div>
                    </div>

                    <div className="mt-2 text-sm text-muted">
                      <div>{s.start_at ? formatDateTime(s.start_at) : '-' } — {s.end_at ? formatDateTime(s.end_at) : '-'}</div>
                      {s.notes ? <div className="mt-2 text-sm text-muted truncate">{s.notes}</div> : null}
                    </div>
                  </div>
                </div>
              </div>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted">Page {page} / {totalPages}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={()=> setPage(p => Math.max(1, p-1))}>Prev</Button>
          <Button size="sm" variant="secondary" onClick={()=> setPage(p => Math.min(totalPages, p+1))}>Next</Button>
        </div>
      </div>

      <ConfirmModal open={confirmOpen} title="Delete session" description="This will permanently delete the session. Are you sure?" onCancel={()=>{ setConfirmOpen(false); setToDeleteId(null) }} onConfirm={async ()=>{ await handleDeleteSession(toDeleteId) }} />

      <SessionEditorModal
        session={creating ? null : editingSession}
        preachers={preachers}
        churches={churches}
        defaultPreacherId={filters.preacher_id}
        defaultChurchId={filters.church_id}
        open={creating || !!editingSession}
        onClose={()=>{ setEditingSession(null); setCreating(false) }}
        onSave={async (body)=>{
          try{
            if(creating){
              await axios.post(`/api/sessions`, body)
              setCreating(false)
            } else {
              await axios.patch(`/api/sessions/${editingSession.id}`, body)
              setEditingSession(null)
            }
            fetchSessions()
          }
          catch(e){ console.error(e); alert('Save failed') }
        }}
      />
      <ViewSessionModal open={!!viewSession} session={viewSession} preacher={preachers.find(p=>p.id===viewSession?.preacher_id)} church={churches.find(c=>c.id===viewSession?.church_id)} onClose={()=>setViewSession(null)} />
    </div>
  )
}
