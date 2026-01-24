import React, { useRef, useEffect } from 'react'
import Button from './Button'

function getFocusable(container){
  if(!container) return []
  return Array.from(container.querySelectorAll('a[href],button:not([disabled]),textarea,select,input:not([type=hidden]),[tabindex]:not([tabindex="-1"])'))
}

export default function ConfirmModal({ open, title = 'Are you sure?', description = '', onCancel, onConfirm }){
  const cancelRef = useRef(null)
  const modalRef = useRef(null)
  const prevActive = useRef(null)

  useEffect(()=>{
    function handleKey(e){
      if(e.key === 'Escape'){
        e.preventDefault()
        onCancel()
      }
      if(e.key === 'Tab' && modalRef.current){
        const focusable = getFocusable(modalRef.current)
        if(focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length -1]
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first.focus();
        }
      }
    }

    if(open){
      prevActive.current = document.activeElement
      setTimeout(()=>{
        // focus cancel if present else first focusable
        if(cancelRef.current){ cancelRef.current.focus() }
        else{
          const f = getFocusable(modalRef.current)[0]
          f?.focus()
        }
      }, 10)
      window.addEventListener('keydown', handleKey)
    }

    return ()=>{
      window.removeEventListener('keydown', handleKey)
      // restore focus
      try{ prevActive.current?.focus() }catch(e){}
    }
  },[open, onCancel])

  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" aria-hidden="true" onClick={onCancel}></div>
      <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby={description ? 'confirm-desc' : undefined} tabIndex={-1} className="card z-10 max-w-md w-full p-4">
        <div id="confirm-title" className="font-semibold text-lg mb-2">{title}</div>
        {description ? <div id="confirm-desc" className="text-sm muted mb-4">{description}</div> : null}
        <div className="flex justify-end gap-2">
          <Button ref={cancelRef} variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={onConfirm}>Delete</Button>
        </div>
      </div>
    </div>
  )
}
