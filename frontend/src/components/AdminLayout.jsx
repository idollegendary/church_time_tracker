import React from 'react'

export default function AdminLayout({ title = 'Admin', children, sidebar }){
  return (
    <div className="w-full px-4">
      <div className="flex items-start gap-6">
        <aside className="w-64 hidden lg:block">
          <div className="sticky top-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{title}</h2>
              <p className="text-sm text-muted mt-1">Manage application data and configuration</p>
            </div>
            <nav className="flex flex-col gap-2">{sidebar}</nav>
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
