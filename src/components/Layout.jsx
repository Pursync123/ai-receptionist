import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/doctors', label: 'Doctor Manager', icon: Users },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden font-serif">
      {/* ── Blue Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-60 flex flex-col bg-[var(--color-sidebar)] text-white">
        <div className="px-5 py-6">
          <h1 className="text-xl font-bold tracking-tight text-blue-200">
            AI Receptionist
          </h1>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-[var(--color-sidebar-active)] text-white shadow-sm'
                    : 'text-blue-200/80 hover:bg-[var(--color-sidebar-hover)] hover:text-white'
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 text-xs text-blue-300/50">
          © 2026 Pursync
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="flex-1 bg-gray-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
