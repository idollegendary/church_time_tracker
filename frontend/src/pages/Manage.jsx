import React, { useState, useEffect } from 'react'
import axios from '../services/api'
import AdminLayout from '../components/AdminLayout'
import AdminTable from '../components/AdminTable'
import AdminEditModal from '../components/AdminEditModal'
import Button from '../components/Button'
import Card from '../components/Card'
import ConfirmModal from '../components/ConfirmModal'

export default function Manage(){
  const [active, setActive] = useState('churches')
  const [churches, setChurches] = useState([])
  const [preachers, setPreachers] = useState([])
  const [churchMap, setChurchMap] = useState({})

  const [editOpen, setEditOpen] = useState(false)
  const [editEntity, setEditEntity] = useState(null)
  const [editType, setEditType] = useState(null)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [toDeleteId, setToDeleteId] = useState(null)

  useEffect(()=>{ fetchChurches(); fetchPreachers() }, [])

  async function fetchChurches(){
    try{ const res = await axios.get('/api/churches'); setChurches(res.data); const map={}; res.data.forEach(c=>map[c.id]=c); setChurchMap(map) }catch(e){console.error(e)}
  }

  async function fetchPreachers(){
    try{ const res = await axios.get('/api/preachers'); setPreachers(res.data) }catch(e){console.error(e)}
  }

  function openEdit(type, entity=null){ setEditType(type); setEditEntity(entity || {}); setEditOpen(true) }

  function requestDelete(id){ setToDeleteId(id); setConfirmOpen(true) }

  async function doDelete(id){
    try{
      if(active === 'churches') await axios.delete(`/api/churches/${id}`)
      else await axios.delete(`/api/preachers/${id}`)
      setConfirmOpen(false); setToDeleteId(null); fetchChurches(); fetchPreachers()
    }catch(e){ console.error(e); alert('Delete failed') }
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

  const churchCols = [ { key: 'name', title: 'Name' } ]
  const preacherCols = [ { key: 'name', title: 'Name', render: r => r.name }, { key: 'church', title: 'Church', render: r => (churchMap[r.church_id]?.name || '-') } ]

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

      <Card>
        {active === 'churches' ? (
          <AdminTable columns={churchCols} rows={churches} onEdit={(r)=>openEdit('church', r)} onDelete={(id)=>requestDelete(id)} />
        ) : (
          <AdminTable columns={preacherCols} rows={preachers} onEdit={(r)=>openEdit('preacher', r)} onDelete={(id)=>requestDelete(id)} />
        )}
      </Card>

      <AdminEditModal open={editOpen} title={editType === 'church' ? (editEntity?.id ? 'Edit Church' : 'New Church') : (editEntity?.id ? 'Edit Preacher' : 'New Preacher')} initial={editEntity || {}} fields={ editType === 'church' ? [ { key: 'name', label: 'Name' } ] : [ { key: 'name', label: 'Name' }, { key: 'church_id', label: 'Church (id)' }, { key: 'avatar_url', label: 'Avatar URL' } ] } onClose={()=>setEditOpen(false)} onSave={handleSave} />

      <ConfirmModal open={confirmOpen} title="Delete" description="This will remove the item and cannot be undone." onCancel={()=>{ setConfirmOpen(false); setToDeleteId(null) }} onConfirm={()=>doDelete(toDeleteId)} />
    </AdminLayout>
  )
}
