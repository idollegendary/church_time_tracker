import React, { useEffect, useRef, useState } from 'react'
import Button from './Button'
import axios from '../services/api'

function getFocusable(container){
  if(!container) return []
  return Array.from(container.querySelectorAll('a[href],button:not([disabled]),textarea,select,input:not([type=hidden]),[tabindex]:not([tabindex="-1"])'))
}

export default function BadgeModal({ open, badges = [], onClose = ()=>{}, onChange = ()=>{}, onDelete = ()=>{} }){
  const modalRef = useRef(null)
  const prevActive = useRef(null)
  const [list, setList] = useState([])
  const [preachers, setPreachers] = useState([])
  const [assignments, setAssignments] = useState({})
  const [edit, setEdit] = useState(null)

  async function loadAll(){
    try{
      const [bRes, pRes, aRes] = await Promise.all([
        axios.get('/api/badges'),
        axios.get('/api/preachers'),
        axios.get('/api/badges/assignments')
      ])
      setList(bRes.data || [])
      setPreachers(pRes.data || [])
      setAssignments(aRes.data || {})
      onChange && onChange(bRes.data || [])
    }catch(e){ console.error('Failed to load badges modal data', e) }
  }

  useEffect(()=>{ if(open) loadAll() },[open])

  useEffect(()=>{
    function handleKey(e){
      if(e.key === 'Escape') onClose()
      if(e.key === 'Tab' && modalRef.current){
        const focusable = getFocusable(modalRef.current)
        if(focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length -1]
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }

    if(open){
      prevActive.current = document.activeElement
      setTimeout(()=>{ modalRef.current?.querySelector('input')?.focus() }, 20)
      window.addEventListener('keydown', handleKey)
    }

    return ()=>{ window.removeEventListener('keydown', handleKey); try{ prevActive.current?.focus() }catch(e){} }
  },[open, onClose])

  if(!open) return null

  function startCreate(){ setEdit({ label: '', emoji: '🏅', color: 'text-yellow-600', isNew: true }) }

  async function saveEdit(){
    if(!edit || !edit.label) return alert('Назва потрібна')
    try{
      if(edit.isNew){
        await axios.post('/api/badges', { label: edit.label, emoji: edit.emoji, color: edit.color })
      } else {
        await axios.patch(`/api/badges/${edit.id}`, { label: edit.label, emoji: edit.emoji, color: edit.color })
      }
      await loadAll()
      setEdit(null)
    }catch(e){ console.error(e); alert('Не вдалося зберегти') }
  }

  async function remove(id){
    try{
      await axios.delete(`/api/badges/${id}`)
      await loadAll()
      onDelete && onDelete(id)
      if(edit && edit.id === id) setEdit(null)
    }catch(e){ console.error(e); alert('Не вдалося видалити') }
  }

  async function assign(preacherId, badgeId){
    try{
      await axios.post('/api/badges/assign', { preacher_id: preacherId, badge_id: badgeId })
      const aRes = await axios.get('/api/badges/assignments')
      setAssignments(aRes.data || {})
    }catch(e){ console.error(e); alert('Assign failed') }
  }

  async function unassign(preacherId, badgeId){
    try{
      await axios.delete(`/api/badges/assign?preacher_id=${encodeURIComponent(preacherId)}&badge_id=${encodeURIComponent(badgeId)}`)
      const aRes = await axios.get('/api/badges/assignments')
      setAssignments(aRes.data || {})
    }catch(e){ console.error(e); alert('Unassign failed') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" aria-hidden="true" onClick={onClose}></div>
      <div ref={modalRef} role="dialog" aria-modal="true" className="card z-10 max-w-3xl w-full p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">Керування бейджами</div>
            <div className="text-sm text-muted">Створіть, редагуйте, призначайте або видаляйте бейджі. Зміни зберігаються на сервері.</div>
          </div>
          <div>
            <Button size="sm" variant="secondary" onClick={onClose}>Закрити</Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Бейджі</div>
            <div className="space-y-2">
              {(list||[]).map(b => (
                <div key={b.id} className="flex items-center justify-between gap-2">
                  <div className={`badge-pill ${b.color}`}> <span className="badge-emoji">{b.emoji}</span> {b.label}</div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={()=>setEdit(b)}>Edit</Button>
                    <Button size="sm" variant="danger" onClick={()=>remove(b.id)}>Delete</Button>
                  </div>
                </div>
              ))}
              {(!list || list.length === 0) && <div className="text-sm text-muted">Бейджів ще немає</div>}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Призначення бейджів</div>
            <div className="space-y-2 max-h-64 overflow-auto">
              {(preachers||[]).map(p => (
                <div key={p.id} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0"><span className="text-sm font-medium">{p.name}</span></div>
                    <div className="text-xs text-muted truncate">{p.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="border rounded px-2 py-1" defaultValue="" onClick={e=>e.stopPropagation()} id={`assign-select-${p.id}`}>
                      <option value="">Вибрати бейдж...</option>
                      {(list||[]).map(b=> <option key={b.id} value={b.id}>{b.emoji} {b.label}</option>)}
                    </select>
                    <Button size="sm" variant="primary" onClick={async ()=>{ const sel = document.getElementById(`assign-select-${p.id}`); if(sel && sel.value){ await assign(p.id, sel.value) } }}>Assign</Button>
                    <div className="flex gap-1">
                      {(assignments[p.id] || []).map(bid => {
                        const b = (list || []).find(x=>x.id===bid)
                        if(!b) return null
                        return (
                          <div key={bid} className={`badge-pill ${b.color}`}>
                            <span className="badge-emoji">{b.emoji}</span>
                            <span className="ml-1">{b.label}</span>
                            <button className="ml-2 text-xs text-muted" onClick={async ()=>{ await unassign(p.id, bid) }}>×</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Створити / редагувати</div>
          <div className="space-y-2 max-w-xl">
            {edit ? (
              <div className="space-y-2">
                <div>
                  <label className="text-xs block mb-1">Emoji</label>
                  <input className="border rounded px-2 py-1 w-full" value={edit.emoji} onChange={e=>setEdit({...edit, emoji: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs block mb-1">Назва</label>
                  <input className="border rounded px-2 py-1 w-full" value={edit.label} onChange={e=>setEdit({...edit, label: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs block mb-1">Колір (клас)</label>
                  <select className="border rounded px-2 py-1 w-full" value={edit.color} onChange={e=>setEdit({...edit, color: e.target.value})}>
                    <option value="text-yellow-600">Yellow</option>
                    <option value="text-red-600">Red</option>
                    <option value="text-blue-600">Blue</option>
                    <option value="text-green-600">Green</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button size="sm" variant="secondary" onClick={()=>setEdit(null)}>Cancel</Button>
                  <Button size="sm" variant="primary" onClick={saveEdit}>Save</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="primary" onClick={startCreate}>Create New Badge</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
