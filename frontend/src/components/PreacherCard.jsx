import React from 'react'
import Card from './Card'
import Avatar from './Avatar'
import Button from './Button'
import { formatDuration } from '../utils/format'

export default function PreacherCard({ preacher, churchName = '-', sessions = [], onEdit = ()=>{}, onDelete = ()=>{} }){
  const totalSessions = sessions.length
  const totalSeconds = sessions.reduce((sum, x) => sum + (x.duration_sec || 0), 0)

  return (
    <Card className="overflow-hidden card-hero h-full">
      <div className="p-4 flex items-start gap-4 h-full">
        <Avatar src={preacher.avatar_url} name={preacher.name} id={preacher.id} size={64} />
        <div className="flex-1 min-w-0 flex flex-col gap-3 h-full">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-lg font-semibold truncate">{preacher.name}</div>
              <div className="text-sm text-muted truncate">{churchName}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted">
            <span className="tabular-nums">Sessions: {totalSessions}</span>
            <span className="tabular-nums">Time: {formatDuration(totalSeconds)}</span>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={()=>onEdit('preacher', preacher)}>Edit</Button>
            <Button variant="danger" size="sm" onClick={()=>onDelete(preacher.id)}>Delete</Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
