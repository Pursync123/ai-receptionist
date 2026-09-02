import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Users, LogOut, Building2 } from 'lucide-react';

const Layout = ({ children, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/appointments', label: 'Appointments', icon: Calendar },
    { path: '/doctors', label: 'Doctor Manager', icon: Users },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden font-serif">
      {/* ── Blue Sidebar ──────────────────────────────────────────────── */}
      <aside className="w-64 flex flex-col bg-[var(--color-sidebar)] text-white shrink-0">
        <div className="px-5 py-6 flex items-center gap-3 border-b border-blue-800/40">
          <div className="p-2 bg-blue-600/40 border border-blue-400/30 rounded-xl flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white leading-tight">
              Sri Sai Lorven Clinic
            </h1>
            <p className="text-[0.7rem] text-blue-200/70 font-medium">AI Receptionist</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3 py-4">
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

        <div className="p-4 border-t border-blue-800/40">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-200/80 hover:bg-red-500/10 hover:text-red-100 transition-colors cursor-pointer"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ──────────────────────────────────────────────── */}
      <main className="flex-1 bg-gray-50 overflow-y-auto flex flex-col">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-gray-200/80 px-8 py-4 flex justify-between items-center shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <Building2 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 tracking-tight leading-none">
                Sri Sai Lorven Clinic
              </h1>
              <p className="text-xs text-gray-500 font-medium mt-1">Hospital Management & AI Receptionist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live System Active
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-6 w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
