import React, { useState } from 'react'
import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'
import { formatDuration } from '../utils/format'

export default function PreacherCard({ preacher, churchName = '-', sessions = [], onEdit = ()=>{}, onDelete = ()=>{}, badges = [], assignments = {}, isAdmin = false, onAssign = ()=>{}, onUnassign = ()=>{} }){
  const totalSessions = sessions.length
  const totalSeconds = sessions.reduce((sum, x) => sum + (x.duration_sec || 0), 0)
  const [assignTarget, setAssignTarget] = useState(null)
  const [assignChoice, setAssignChoice] = useState('')

  return (
    <Card className="overflow-hidden card-hero h-full">
      <div className="p-4 flex items-start gap-4 h-full">
        <Avatar src={preacher.avatar_url} name={preacher.name} id={preacher.id} size={64} />
        <div className="flex-1 min-w-0 flex flex-col gap-3 h-full">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{preacher.name}</div>
              <div className="text-sm muted truncate">{churchName}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm muted">
            <span className="tabular-nums">Sessions: {totalSessions}</span>
            <span className="tabular-nums">Time: {formatDuration(totalSeconds)}</span>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={()=>onEdit('preacher', preacher)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={()=>onDelete(preacher.id)}>Delete</Button>
          </div>
          {isAdmin && (
            <div className="mt-3">
              {!assignTarget && (
                <div className="mt-2">
                  <Button size="sm" variant="primary" onClick={()=>{ setAssignTarget(preacher.id); setAssignChoice('') }}>Assign Reward</Button>
                </div>
              )}

              {assignTarget === preacher.id && (
                <div className="mt-2 flex items-center gap-2">
                  <select className="form-control w-auto" value={assignChoice} onChange={e=>setAssignChoice(e.target.value)}>
                    <option value="">Choose reward...</option>
                    {(badges||[]).map(b=> <option key={b.id} value={b.id}>{b.emoji} {b.label}</option>)}
                  </select>
                  <Button size="sm" variant="primary" onClick={async (e)=>{ e.stopPropagation(); if(!assignChoice) return alert('Select a reward'); try{ await onAssign(preacher.id, assignChoice); setAssignTarget(null); setAssignChoice('') }catch(err){ console.error(err); alert('Assign failed') } }}>Assign</Button>
                  <Button size="sm" variant="secondary" onClick={(e)=>{ e.stopPropagation(); setAssignTarget(null); setAssignChoice('') }}>Cancel</Button>
                </div>
              )}

              {(assignments[preacher.id] || []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(assignments[preacher.id] || []).map(bid => {
                    const b = (badges || []).find(x=>x.id===bid)
                    if(!b) return null
                    return (
                      <div key={b.id} className={`badge-pill ${b.color}`}>
                        <span className="badge-emoji">{b.emoji}</span> {b.label}
                        <button aria-label="Unassign reward" className="ml-2 text-xs muted focus-ring focus:ring-offset-2 rounded p-1" onClick={(e)=>{ e.stopPropagation(); onUnassign(preacher.id, b.id) }}>×</button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
