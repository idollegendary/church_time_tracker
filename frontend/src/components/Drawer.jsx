import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Drawer({ open = false, onClose = ()=>{}, children }){
  useEffect(()=>{
    if(open){
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return ()=>{ document.body.style.overflow = '' }
  }, [open])

  const content = (
    <div aria-hidden={!open} className={`fixed inset-0 z-[9999] ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`fixed inset-0 bg-black/60 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`} onClick={onClose} />

      <aside className={`fixed top-0 right-0 h-full w-full sm:w-80 max-w-full bg-surface dark:bg-surface-dark shadow-xl transform transition-transform duration-300 pointer-events-auto ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between border-b border-surface">
          <div className="text-lg font-semibold">Menu</div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-64px)]">
          {children}
        </div>
      </aside>
    </div>
  )

  if (typeof document === 'undefined') return null
  return createPortal(content, document.body)
}
