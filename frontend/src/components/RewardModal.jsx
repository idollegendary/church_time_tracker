import React, { useEffect, useRef, useState } from 'react'
import Button from './Button'
import axios from '../services/api'

function getFocusable(container){
  if(!container) return []
  return Array.from(container.querySelectorAll('a[href],button:not([disabled]),textarea,select,input:not([type=hidden]),[tabindex]:not([tabindex="-1"])'))
}

export default function RewardModal({ open, badges = [], onClose = ()=>{}, onChange = ()=>{}, onDelete = ()=>{} }){
  const modalRef = useRef(null)
  const prevActive = useRef(null)
  const [list, setList] = useState([])
  const [edit, setEdit] = useState(null)

  async function loadAll(){
    try{
      const bRes = await axios.get('/api/badges')
      setList(bRes.data || [])
      onChange && onChange(bRes.data || [])
    }catch(e){ console.error('Failed to load rewards', e) }
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

  function startCreate(){ setEdit({ label: '', emoji: '🏅', color: 'text-warning', isNew: true }) }

  async function saveEdit(){
    if(!edit || !edit.label) return alert('Name required')
    try{
      if(edit.isNew){
        await axios.post('/api/badges', { label: edit.label, emoji: edit.emoji, color: edit.color })
      } else {
        await axios.patch(`/api/badges/${edit.id}`, { label: edit.label, emoji: edit.emoji, color: edit.color })
      }
      await loadAll()
      setEdit(null)
    }catch(e){ console.error(e); alert('Save failed') }
  }

  async function remove(id){
    try{
      await axios.delete(`/api/badges/${id}`)
      await loadAll()
      onDelete && onDelete(id)
      if(edit && edit.id === id) setEdit(null)
    }catch(e){ console.error(e); alert('Delete failed') }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={onClose}></div>
      <div ref={modalRef} role="dialog" aria-modal="true" className="card z-10 max-w-3xl w-full p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">Manage Rewards</div>
            <div className="text-sm muted">Create, edit, or delete rewards. Changes are saved to the server.</div>
          </div>
          <div>
            <Button size="sm" variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium mb-2">Rewards</div>
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
              {(!list || list.length === 0) && <div className="text-sm muted">No rewards yet</div>}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Create / Edit</div>
            <div className="space-y-2 max-w-xl">
              {edit ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-xs block mb-1">Emoji</label>
                    <input className="mt-1 w-full form-control" value={edit.emoji} onChange={e=>setEdit({...edit, emoji: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1">Name</label>
                    <input className="mt-1 w-full form-control" value={edit.label} onChange={e=>setEdit({...edit, label: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-xs block mb-1">Color (class)</label>
                    <select className="mt-1 w-full form-control" value={edit.color} onChange={e=>setEdit({...edit, color: e.target.value})}>
                      <option value="text-warning">Yellow</option>
                      <option value="text-error">Red</option>
                      <option value="text-accent">Blue</option>
                      <option value="text-success">Green</option>
                    </select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={()=>setEdit(null)}>Cancel</Button>
                    <Button size="sm" variant="primary" onClick={saveEdit}>Save</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="primary" onClick={startCreate}>Create New Reward</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
