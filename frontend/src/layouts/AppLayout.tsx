import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { Topbar } from '../components/navigation/Topbar'

export function AppLayout() {
  const [navigationOpen, setNavigationOpen] = useState(false)
  useEffect(() => {
    if (!navigationOpen) return
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setNavigationOpen(false) }
    document.addEventListener('keydown', close)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', close); document.body.style.overflow = '' }
  }, [navigationOpen])
  return (
    <div className="app-shell min-h-screen overflow-x-hidden bg-slate-50">
      <button type="button" aria-label="Cerrar menú" onClick={() => setNavigationOpen(false)} className={`fixed inset-0 z-30 bg-slate-950/55 transition lg:hidden ${navigationOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} />
      <div className="app-navigation"><Sidebar open={navigationOpen} onNavigate={() => setNavigationOpen(false)} /></div>
      <div className="app-content min-h-screen lg:ml-64">
        <div className="app-topbar"><Topbar onOpenNavigation={() => setNavigationOpen(true)} /></div>
        <main className="app-main px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
