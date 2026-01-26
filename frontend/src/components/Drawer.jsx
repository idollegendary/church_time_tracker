import React, { useEffect } from 'react'

export default function Drawer({ open = false, onClose = ()=>{}, children }){
  useEffect(()=>{
    if(open){
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return ()=>{ document.body.style.overflow = '' }
  }, [open])

  return (
    <div aria-hidden={!open} className={`fixed inset-0 z-50 pointer-events-none ${open ? 'opacity-100' : 'opacity-0'}`}>
      <div className={`fixed inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0'}`} onClick={onClose} />

      <aside className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white dark:bg-neutral-900 shadow-xl transform transition-transform duration-300 pointer-events-auto ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 flex items-center justify-between border-b border-surface">
          <div className="text-lg font-semibold">Menu</div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-surface">
            ✕
          </button>
        </div>
        <div className="p-4 overflow-auto">
          {children}
        </div>
      </aside>
    </div>
  )
}
