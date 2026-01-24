import React, { useState, useEffect, useRef } from 'react'
import { toDateInput, toTimeInput, combineDateTime, formatDateTime } from '../utils/format'
import Button from './Button'

export default function SessionEditorModal({ session, open, onClose, onSave, preachers = [], churches = [], defaultPreacherId = '', defaultChurchId = '' }){
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [preacherId, setPreacherId] = useState('')
  const [churchId, setChurchId] = useState('')
  const [serviceType, setServiceType] = useState('service')
  const firstRef = useRef(null)
  const wrapperRef = useRef(null)
  const prevActiveRef = useRef(null)

  useEffect(()=>{
    if(session){
      setStartDate(toDateInput(session.start_at))
      setStartTime(toTimeInput(session.start_at))
      setEndDate(toDateInput(session.end_at))
      setEndTime(toTimeInput(session.end_at))
      setNotes(session.notes || '')
      setPreacherId(session.preacher_id || '')
      setChurchId(session.church_id || '')
      setServiceType(session.service_type || 'service')
    }
    else {
      // defaults when creating
      setPreacherId(defaultPreacherId || '')
      setChurchId(defaultChurchId || '')
      setServiceType('service')
      setNotes('')
      setStartDate('')
      setStartTime('')
      setEndDate('')
      setEndTime('')
    }
  },[session])

  useEffect(()=>{
    if(open){
      // focus first input slightly after open
      setTimeout(()=> firstRef.current?.focus(), 50)
    }
  },[open])

  useEffect(()=>{
    // handle Escape, Ctrl/Cmd+Enter and trap Tab inside modal
    const modalRef = wrapperRef.current

    function getFocusable(container){
      if(!container) return []
      return Array.from(container.querySelectorAll('a[href],button:not([disabled]),textarea,select,input:not([type=hidden]),[tabindex]:not([tabindex="-1"])'))
    }

    function onKey(e){
      if(e.key === 'Escape'){
        e.preventDefault()
        onClose()
        return
      }
      if((e.ctrlKey || e.metaKey) && e.key === 'Enter'){
        e.preventDefault()
        handleSave()
        return
      }
      if(e.key === 'Tab' && modalRef){
        const focusable = getFocusable(modalRef)
        if(focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length -1]
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus() }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus() }
      }
    }

    if(open){
      prevActiveRef.current = document.activeElement
      window.addEventListener('keydown', onKey)
    }

    return ()=>{
      window.removeEventListener('keydown', onKey)
      // restore focus
      try{ prevActiveRef.current?.focus() }catch(e){}
    }
  },[open])

  if(!open) return null

  function handleSave(){
    const startIso = combineDateTime(startDate, startTime)
    const endIso = combineDateTime(endDate, endTime)
    if(startIso && endIso && new Date(endIso) < new Date(startIso)){
      alert('End must be after start')
      return
    }
    const body = {}
    if(startIso) body.start_at = startIso
    if(endIso) body.end_at = endIso
    body.notes = notes || null
    if(preacherId) body.preacher_id = preacherId
    if(churchId) body.church_id = churchId
    if(serviceType) body.service_type = serviceType
    onSave(body)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={onClose} />
      <div ref={wrapperRef} role="dialog" aria-modal="true" aria-labelledby="session-editor-title" tabIndex={-1} className="relative card w-full max-w-lg p-6 transform transition-all duration-150 ease-out scale-100">
        <Button aria-label="Close" className="absolute right-3 top-3 muted hover:text-text-light dark:hover:text-text-dark" variant="ghost" size="sm" onClick={onClose}>✕</Button>
        <h3 id="session-editor-title" className="text-lg font-semibold mb-3">Edit Session</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
              <label className="block text-sm muted">Church</label>
            <select className="mt-1 w-full form-control" value={churchId} onChange={e=>{ setChurchId(e.target.value); }}>
              <option value="">-- none --</option>
              {churches.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
              <label className="block text-sm muted">Preacher</label>
            <select className="mt-1 w-full form-control" value={preacherId} onChange={e=>setPreacherId(e.target.value)}>
              <option value="">-- none --</option>
              {preachers.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm muted">Start date</label>
            <input ref={firstRef} type="date" className="mt-1 w-full form-control" value={startDate} onChange={e=>setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm muted">Start time</label>
            <input type="time" step="1" className="mt-1 w-full form-control" value={startTime} onChange={e=>setStartTime(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm muted">End date</label>
            <input type="date" className="mt-1 w-full form-control" value={endDate} onChange={e=>setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm muted">End time</label>
            <input type="time" step="1" className="mt-1 w-full form-control" value={endTime} onChange={e=>setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm muted">Notes</label>
          <textarea className="w-full mt-1 form-control" rows="3" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>

        <div className="mt-3">
          <label className="block text-sm muted">Service type</label>
          <select className="mt-1 w-full form-control" value={serviceType} onChange={e=>setServiceType(e.target.value)}>
            <option value="service">Service</option>
            <option value="meeting">Meeting</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="success" size="sm" onClick={handleSave}>Save</Button>
        </div>

        <div className="mt-3 text-sm muted">
          <div>Current start: {session?.start_at ? formatDateTime(session.start_at) : '—'}</div>
          <div>Current end: {session?.end_at ? formatDateTime(session.end_at) : '—'}</div>
        </div>
      </div>
    </div>
  )
}
