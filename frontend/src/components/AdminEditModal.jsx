import React, { useEffect, useState } from 'react'
import Button from './Button'
import Avatar from './Avatar'

export default function AdminEditModal({ open=false, title='Edit', initial={}, fields=[], onClose=()=>{}, onSave=()=>{} }){
  const [state, setState] = useState(initial)

  useEffect(()=>{ setState(initial) }, [initial, open])

  if(!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-xl card rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button aria-label="Close" onClick={onClose} className="p-1 rounded hover:bg-surface focus-ring focus:ring-offset-2">✕</button>
        </div>
        <div className="p-4 space-y-3">
          {fields.map(f=> (
            <div key={f.key}>
              <label className="block text-sm muted mb-1">{f.label}</label>
              {f.key === 'avatar_url' ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="flex-shrink-0">
                    <Avatar src={state.avatar_url} name={state.name} size={64} />
                  </div>
                  <div className="w-full sm:flex-1">
                    <input value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} placeholder="Image URL" className="w-full form-control" />
                  </div>
                </div>
              ) : f.type === 'textarea' ? (
                <textarea value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} className="w-full form-control" />
              ) : f.type === 'select' ? (
                <select value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} className="w-full form-control">
                  <option value="">—</option>
                  {(f.options || []).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              ) : (
                <input value={state[f.key] || ''} onChange={e=>setState(s=>({...s,[f.key]:e.target.value}))} className="w-full form-control" />
              )}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={()=>onSave(state)}>Save</Button>
        </div>
      </div>
    </div>
  )
}
