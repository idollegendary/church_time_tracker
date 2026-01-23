import React, { useEffect, useRef, useState } from 'react'
import Button from './Button'

function getFocusable(container){
  if(!container) return []
  return Array.from(container.querySelectorAll('a[href],button:not([disabled]),textarea,select,input:not([type=hidden]),[tabindex]:not([tabindex="-1"])'))
}

export default function BadgeModal({ open, badges = [], onClose = ()=>{}, onChange = ()=>{}, onDelete = ()=>{} }){
  const modalRef = useRef(null)
  const prevActive = useRef(null)
  const [list, setList] = useState(badges || [])
  const [edit, setEdit] = useState(null)

  useEffect(()=>{ setList(badges || []) },[badges])

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

  function startCreate(){ setEdit({ id: `b_${Date.now()}`, label: '', emoji: '🏅', color: 'text-yellow-600' }) }

  function saveEdit(){
    if(!edit || !edit.label) return alert('Назва потрібна')
    const next = [...(list||[])]
    const idx = next.findIndex(x=>x.id===edit.id)
    if(idx >= 0) next[idx] = edit
    else next.push(edit)
    setList(next)
    onChange(next)
    setEdit(null)
  }

  function remove(id){
    const next = (list||[]).filter(x=>x.id!==id)
    setList(next)
    onChange(next)
    onDelete(id)
    if(edit && edit.id === id) setEdit(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-30" aria-hidden="true" onClick={onClose}></div>
      <div ref={modalRef} role="dialog" aria-modal="true" className="card z-10 max-w-2xl w-full p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-lg">Керування бейджами</div>
            <div className="text-sm text-muted">Створіть, редагуйте або видаліть бейджі. Зміни збережуться локально.</div>
          </div>
          <div>
            <Button size="sm" variant="secondary" onClick={onClose}>Закрити</Button>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div className="text-sm font-medium mb-2">Створити / редагувати</div>
            <div className="space-y-2">
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
    </div>
  )
}
