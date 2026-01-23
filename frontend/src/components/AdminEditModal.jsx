import React, { useEffect, useState } from 'react'
import Button from './Button'
import Avatar from './Avatar'

export default function AdminEditModal({ open=false, title='Edit', initial={}, fields=[], onClose=()=>{}, onSave=()=>{} }){
  const [state, setState] = useState(initial)

  useEffect(()=>{ setState(initial) }, [initial, open])

  if(!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl bg-white dark:bg-neutral-900 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface">✕</button>
        </div>
        <div className="p-4 space-y-3">
          {fields.map(f=> (
            <div key={f.key}>
              <label className="block text-sm mb-1">{f.label}</label>
              {f.key === 'avatar_url' ? (
                <div className="flex items-start gap-3">
                  <div>
                    <Avatar src={state.avatar_url} name={state.name} size={64} />
                  </div>
                  <div className="flex-1">
                    <input type="file" accept="image/*" onChange={e=>{
                      const file = e.target.files && e.target.files[0]
                      if(!file) return
                      const reader = new FileReader()
                      reader.onload = ev => setState(s=>({...s, avatar_url: ev.target.result}))
                      reader.readAsDataURL(file)
                    }} className="mb-2" />
                    <input value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} placeholder="or paste image URL" className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
              ) : f.type === 'textarea' ? (
                <textarea value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} className="w-full border rounded px-3 py-2" />
              ) : f.type === 'select' ? (
                <select value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} className="w-full border rounded px-3 py-2">
                  <option value="">—</option>
                  {(f.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} className="w-full border rounded px-3 py-2" />
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={()=>onSave(state)}>Save</Button>
        </div>
      </div>
    </div>
  )
}
