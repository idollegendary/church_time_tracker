import React, { useState, useEffect } from 'react'
import axios from '../services/api'
import AdminLayout from '../components/AdminLayout'
// AdminTable removed — cards-only layout
import AdminEditModal from '../components/AdminEditModal'
import Button from '../components/Button'
import Card from '../components/Card'
import ConfirmModal from '../components/ConfirmModal'
import ChurchCard from '../components/ChurchCard'
import PreacherCard from '../components/PreacherCard'
import ChurchPreachersModal from '../components/ChurchPreachersModal'

export default function Manage(){
  const [active, setActive] = useState('churches')
  const [churches, setChurches] = useState([])
  const [preachers, setPreachers] = useState([])
  const [churchMap, setChurchMap] = useState({})

  const [editOpen, setEditOpen] = useState(false)
  const [editEntity, setEditEntity] = useState(null)
  const [editType, setEditType] = useState(null)

  const [preacherChurchFilter, setPreacherChurchFilter] = useState('')

  const [churchModalOpen, setChurchModalOpen] = useState(false)
  const [churchModalChurch, setChurchModalChurch] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)
  useEffect(()=>{ fetchChurches(); fetchPreachers(); fetchSessions() }, [])

  const [sessions, setSessions] = useState([])
  const [badges, setBadges] = useState([])
  const [assignments, setAssignments] = useState({})

  useEffect(()=>{ fetchBadgesAndAssignments() }, [])

  async function fetchBadgesAndAssignments(){
    try{
      const [bRes, aRes] = await Promise.all([
        axios.get('/api/badges'),
        axios.get('/api/badges/assignments')
      ])
      setBadges(bRes.data || [])
      setAssignments(aRes.data || {})
    }catch(e){ console.warn('Failed to load badges/assignments', e) }
  }

  async function assignReward(preacherId, badgeId){
    try{
      await axios.post('/api/badges/assign', { preacher_id: preacherId, badge_id: badgeId })
      await fetchBadgesAndAssignments()
    }catch(err){ console.error(err); alert('Assign failed'); throw err }
  }

  async function unassignReward(preacherId, badgeId){
    try{
      await axios.post('/api/badges/unassign', { preacher_id: preacherId, badge_id: badgeId })
      await fetchBadgesAndAssignments()
    }catch(err){
      if(err && err.response && (err.response.status === 404 || err.response.status === 405)){
        try{
          await axios.delete('/api/badges/assign', { data: { preacher_id: preacherId, badge_id: badgeId } })
          await fetchBadgesAndAssignments()
          return
        }catch(inner){
          if(inner && inner.response && inner.response.status === 404){
            try{
              await axios.delete(`/api/badges/assign?preacher_id=${encodeURIComponent(preacherId)}&badge_id=${encodeURIComponent(badgeId)}`)
              await fetchBadgesAndAssignments()
              return
            }catch(last){ console.warn('Unassign failed on all methods', last); alert('Unassign failed'); throw last }
          }
          console.warn('Unassign failed', inner); alert('Unassign failed'); throw inner
        }
      } else {
        console.warn('Unassign failed', err); alert('Unassign failed'); throw err
      }
    }
  }

  async function fetchChurches(){
    try{
      const res = await axios.get('/api/churches')
      setChurches(res.data)
      const map = {}
      res.data.forEach(c=> map[c.id]=c)
      setChurchMap(map)
    }catch(e){ console.error(e) }
  }

  async function fetchPreachers(){
    try{
      const res = await axios.get('/api/preachers')
      setPreachers(res.data)
    }catch(e){ console.error(e) }
  }

  async function fetchSessions(){
    try{
      const res = await axios.get('/api/sessions')
      setSessions(res.data)
    }catch(e){ console.error(e) }
  }

  function openEdit(typeOrEntity, maybeEntity=null){
    // support calls as openEdit(type, entity) and openEdit(entity) from cards
    if(typeof typeOrEntity === 'object' && typeOrEntity !== null){
      const entity = typeOrEntity
      const inferredType = (entity.hasOwnProperty('avatar_url') || entity.hasOwnProperty('church_id')) ? 'preacher' : 'church'
      setEditType(inferredType)
      setEditEntity(entity || {})
      setEditOpen(true)
    } else {
      setEditType(typeOrEntity)
      setEditEntity(maybeEntity || {})
      setEditOpen(true)
    }
  }

  function requestDelete(id){ setToDeleteId(id); setConfirmOpen(true) }

  async function doDelete(id){
    try{
      if(active === 'churches') await axios.delete(`/api/churches/${id}`)
      else await axios.delete(`/api/preachers/${id}`)
      setConfirmOpen(false); setToDeleteId(null); fetchChurches(); fetchPreachers()
    }catch(e){ console.error(e); alert('Delete failed') }
  }

  function openChurchModal(church){
    setChurchModalChurch(church)
    setChurchModalOpen(true)
  }

  async function handleSave(payload){
    try{
      if(editType === 'church'){
        if(payload.id) await axios.patch(`/api/churches/${payload.id}`, { name: payload.name })
        else await axios.post('/api/churches', { name: payload.name })
        fetchChurches()
      } else if(editType === 'preacher'){
        const body = { name: payload.name, church_id: payload.church_id || null, avatar_url: payload.avatar_url || null }
        if(payload.id) await axios.patch(`/api/preachers/${payload.id}`, body)
        else await axios.post('/api/preachers', body)
        fetchPreachers(); fetchChurches()
      }
      setEditOpen(false)
    }catch(e){ console.error(e); alert('Save failed') }
  }

  const filteredPreachers = preacherChurchFilter
    ? preachers.filter(p => String(p.church_id) === String(preacherChurchFilter))
    : preachers

  return (
    <AdminLayout title="Manage">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button onClick={()=>setActive('churches')} className={`px-3 py-2 rounded ${active==='churches'?'bg-primary text-white':''}`}>Churches</button>
          <button onClick={()=>setActive('preachers')} className={`px-3 py-2 rounded ${active==='preachers'?'bg-primary text-white':''}`}>Preachers</button>
        </div>
        <div>
          <Button variant="primary" onClick={()=>openEdit(active==='churches' ? 'church' : 'preacher')}>New {active==='churches' ? 'Church' : 'Preacher'}</Button>
        </div>
      </div>

      {active === 'preachers' ? (
        <div className="mb-4 flex items-center gap-2">
          <label className="text-sm muted">Church filter:</label>
          <select className="form-control" value={preacherChurchFilter} onChange={(e)=>setPreacherChurchFilter(e.target.value)}>
            <option value="">All</option>
            {churches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      ) : null}

      {/* Tables removed: cards-only admin UI below */}

      <AdminEditModal
        open={editOpen}
        title={editType === 'church' ? (editEntity?.id ? 'Edit Church' : 'New Church') : (editEntity?.id ? 'Edit Preacher' : 'New Preacher')}
        initial={editEntity || {}}
        fields={ editType === 'church'
          ? [ { key: 'name', label: 'Name' } ]
          : [
              { key: 'name', label: 'Name' },
              { key: 'church_id', label: 'Church', type: 'select', options: churches.map(c=>({ value: c.id, label: c.name })) },
              { key: 'avatar_url', label: 'Avatar URL' }
            ]
        }
        onClose={()=>setEditOpen(false)}
        onSave={handleSave}
      />

      {active === 'churches' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
          {churches.map(c => {
            const preachersFor = preachers.filter(p=>p.church_id === c.id)
            const sess = sessions.filter(s => s.church_id === c.id)
            return <ChurchCard key={c.id} church={c} preachers={preachersFor} sessions={sess} onEdit={openEdit} onDelete={requestDelete} onOpen={openChurchModal} />
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {filteredPreachers.map(p => {
            const sess = sessions.filter(s => s.preacher_id === p.id)
            return <PreacherCard key={p.id} preacher={p} churchName={churchMap[p.church_id]?.name} sessions={sess} onEdit={openEdit} onDelete={requestDelete} badges={badges} assignments={assignments} isAdmin={true} onAssign={assignReward} onUnassign={unassignReward} />
          })}
        </div>
      )}

      <ChurchPreachersModal
        open={churchModalOpen}
        church={churchModalChurch}
        preachers={churchModalChurch ? preachers.filter(p=>p.church_id === churchModalChurch.id) : []}
        sessions={churchModalChurch ? sessions.filter(s=>s.church_id === churchModalChurch.id) : []}
        onClose={()=>{ setChurchModalOpen(false); setChurchModalChurch(null) }}
      />

    </AdminLayout>
  )
}
