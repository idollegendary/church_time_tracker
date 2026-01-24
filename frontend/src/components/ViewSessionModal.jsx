import React from 'react'
import Button from './Button'
import Avatar from './Avatar'
import { formatDateTime, formatDuration } from '../utils/format'

export default function ViewSessionModal({ open, session, preacher, church, onClose }){
  if(!open || !session) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div role="dialog" aria-modal="true" className="relative card w-full max-w-md p-6">
        <Button aria-label="Close" className="absolute right-3 top-3 muted hover:text-text-light dark:hover:text-text-dark" variant="ghost" size="sm" onClick={onClose}>✕</Button>
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={preacher?.avatar_url} name={preacher?.name} id={preacher?.id} size={56} />
          <div>
            <div className="text-lg font-semibold">{preacher?.name || '—'}</div>
            <div className="text-sm muted">{church?.name || ''}</div>
          </div>
        </div>

        <div className="text-sm muted mb-2">When</div>
        <div className="mb-3">{session.start_at ? formatDateTime(session.start_at) : '—'} — {session.end_at ? formatDateTime(session.end_at) : '—'}</div>

        <div className="text-sm muted mb-2">Duration</div>
        <div className="mb-3 font-medium">{formatDuration(session.duration_sec)}</div>

        <div className="text-sm muted mb-2">Notes</div>
        <div className="mb-4 whitespace-pre-wrap">{session.notes || '—'}</div>

        <div className="flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}
