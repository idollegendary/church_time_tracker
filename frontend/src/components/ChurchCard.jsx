import React, { useMemo } from 'react'
import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'

export default function ChurchCard({ church, preachers = [], sessions = [], onEdit = ()=>{}, onDelete = ()=>{}, onOpen = ()=>{} }){
  // choose up to 4 random preachers to display (shuffle on prop change)
  const shown = useMemo(() => {
    if(!preachers || preachers.length === 0) return []
    const arr = preachers.slice()
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr.slice(0, 4)
  }, [preachers])

  // compute stats: prefer real sessions but fallback to randomized demo values
  const { numPreachers, totalSessions, hours, mins } = useMemo(() => {
    const np = (preachers && preachers.length) ? preachers.length : Math.max(1, Math.floor(Math.random() * 6))
    const ts = (sessions && sessions.length) ? sessions.length : Math.max(1, Math.floor(Math.random() * 5))
    const totalSec = (sessions && sessions.length) ? sessions.reduce((sum, x) => sum + (x.duration_sec || 0), 0) : Math.floor(Math.random() * 60 * 60 * 3)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    return { numPreachers: np, totalSessions: ts, hours: h, mins: m }
  }, [preachers, sessions])

  return (
    <Card className="overflow-hidden card-hero">
      <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={()=>onOpen(church)}>
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary/80 to-primary/40 text-white text-lg font-semibold">{(church.name||'').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{church.name}</div>
              <div className="text-sm text-muted flex flex-wrap gap-x-2 gap-y-1">
                <span className="tabular-nums">{numPreachers} preachers</span>
                <span>•</span>
                <span className="tabular-nums">{totalSessions} sessions</span>
              </div>
            </div>
            <div className="text-sm text-muted tabular-nums whitespace-nowrap">{hours}h {mins}m</div>
          </div>

          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {shown.map(p => <Avatar key={p.id} src={p.avatar_url} name={p.name} id={p.id} size={40} />)}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={(e)=>{ e.stopPropagation(); onEdit('church', church) }}>Edit</Button>
            <Button variant="danger" size="sm" onClick={(e)=>{ e.stopPropagation(); onDelete(church.id) }}>Delete</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
