import { Outlet } from 'react-router-dom'
import { Sidebar } from '../components/navigation/Sidebar'
import { Topbar } from '../components/navigation/Topbar'

export function AppLayout() {
  return (
    <div className="app-shell min-h-screen bg-slate-50">
      <div className="app-navigation"><Sidebar /></div>
      <div className="app-content ml-64 min-h-screen">
        <div className="app-topbar"><Topbar /></div>
        <main className="app-main px-8 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
