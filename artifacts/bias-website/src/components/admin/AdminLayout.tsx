import { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useAdminAuth } from '@/lib/admin-auth';

interface NavItem { label: string; href: string; icon: ReactNode }

const navItems: NavItem[] = [
  {
    label: 'لوحة التحكم',
    href: '/admin/dashboard',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    ),
  },
  {
    label: 'العملاء المحتملون',
    href: '/admin/leads',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    ),
  },
  {
    label: 'المدونة',
    href: '/admin/blog',
    icon: (
      <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
    ),
  },
  {
    label: 'البورتفوليو',
    href: '/admin/portfolio',
    icon: (
      <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg>
    ),
  },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAdminAuth();
  const [location] = useLocation();

  return (
    <div className="adm-root">
      {/* Sidebar */}
      <aside className="adm-sidebar">
        {/* Logo */}
        <div className="adm-logo-wrap">
          <Link href="/" className="adm-logo">
            <span className="adm-logo-dot" />
            <span>Bias</span>
            <em>.tech</em>
          </Link>
          <div className="adm-logo-badge">Admin</div>
        </div>

        {/* Nav */}
        <nav className="adm-nav">
          {navItems.map(item => {
            const active = location === item.href || location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`adm-nav-item ${active ? 'active' : ''}`}>
                <span className="adm-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="adm-sidebar-footer">
          {user && (
            <div className="adm-user">
              <div className="adm-user-avatar">
                {user.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="adm-user-info">
                <div className="adm-user-name">{user.name}</div>
                <div className="adm-user-role">{user.role}</div>
              </div>
            </div>
          )}
          <button className="adm-logout" onClick={logout} title="تسجيل الخروج">
            <svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>خروج</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        {children}
      </main>
    </div>
  );
}

export function AdminPageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="adm-page-header">
      <div>
        <h1 className="adm-page-title">{title}</h1>
        {subtitle && <p className="adm-page-sub">{subtitle}</p>}
      </div>
      {action && <div className="adm-page-action">{action}</div>}
    </div>
  );
}
