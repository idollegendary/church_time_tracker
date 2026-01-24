import React, { useMemo } from 'react'
import Avatar from './Avatar'
import Button from './Button'
import { formatDuration } from '../utils/format'

export default function ChurchPreachersModal({ open = false, church = null, preachers = [], sessions = [], onClose = ()=>{} }){
  const rows = useMemo(() => {
    return preachers.map(p => {
      const ps = sessions.filter(s => s.preacher_id === p.id)
      const totalSec = ps.reduce((sum, x) => sum + (x.duration_sec || 0), 0)
      return { preacher: p, sessionsCount: ps.length, totalSec }
    })
  }, [preachers, sessions])

  if(!open || !church) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4">
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="relative z-10 w-full max-w-2xl card rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{church.name}</h3>
            <div className="text-sm muted">Preachers</div>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface">✕</button>
        </div>
        <div className="p-4 space-y-3">
          {rows.length === 0 ? (
            <div className="text-sm muted">No preachers yet</div>
          ) : (
            rows.map(({ preacher, sessionsCount, totalSec }) => (
              <div key={preacher.id} className="flex items-center gap-3">
                <Avatar src={preacher.avatar_url} name={preacher.name} id={preacher.id} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{preacher.name}</div>
                  <div className="text-xs muted">Sessions: {sessionsCount}</div>
                </div>
                <div className="text-sm muted flex-shrink-0">{formatDuration(totalSec)}</div>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t flex justify-end">
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
