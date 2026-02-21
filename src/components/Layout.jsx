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
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        backgroundColor: 'var(--bg-surface)', 
        borderRight: '1px solid var(--border-color)',
        padding: 'var(--spacing-lg)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold', 
          color: 'var(--primary)', 
          marginBottom: 'var(--spacing-xl)',
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px' 
        }}>
          AI Receptionist
        </h1>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: 'var(--radius)',
                  textDecoration: 'none',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                  fontWeight: isActive ? 500 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--spacing-xl)', overflowY: 'auto' }}>
         <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            {children}
         </div>
      </main>
    </div>
  );
};

export default Layout;
