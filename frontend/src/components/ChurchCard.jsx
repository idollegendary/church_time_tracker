import React from 'react'
import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'

export default function ChurchCard({ church, preachers = [], sessions = [], onEdit = ()=>{}, onDelete = ()=>{} }){
  const numPreachers = preachers.length
  const totalSessions = sessions.length
  const totalSeconds = sessions.reduce((sum, x) => sum + (x.duration_sec || 0), 0)
  const hours = Math.floor(totalSeconds / 3600)
  const mins = Math.floor((totalSeconds % 3600) / 60)

  const shown = preachers.slice(0,4)

  return (
    <Card className="p-0 overflow-hidden card-hero">
      <div className="p-4 flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 text-white text-lg font-semibold">{(church.name||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold truncate">{church.name}</div>
              <div className="text-sm text-muted">{numPreachers} preachers • {totalSessions} sessions</div>
            </div>
            <div className="text-sm text-muted">{hours}h {mins}m</div>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="avatar-stack">
              {shown.map(p => <Avatar key={p.id} src={p.avatar_url} name={p.name} id={p.id} size={40} className="-ml-3" />)}
            </div>
            <div className="ml-auto flex gap-2">
              <Button variant="secondary" size="sm" onClick={()=>onEdit(church)}>Edit</Button>
              <Button variant="danger" size="sm" onClick={()=>onDelete(church.id)}>Delete</Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
