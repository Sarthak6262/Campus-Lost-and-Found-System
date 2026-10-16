import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  PackagePlus,
  PackageSearch,
  Search,
  Shield,
  ShieldAlert,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';

interface SidebarProps {
  mode: 'student' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mode, isOpen = false, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/items', label: 'Browse Items', icon: <Search className="w-4 h-4" /> },
    { to: '/items/report-lost', label: 'Report Lost Item', icon: <PackageSearch className="w-4 h-4" /> },
    { to: '/items/report-found', label: 'Report Found Item', icon: <PackagePlus className="w-4 h-4" /> },
    { to: '/student/items', label: 'My Item Reports', icon: <FolderOpen className="w-4 h-4" /> },
    { to: '/claims', label: 'My Claims', icon: <FileCheck2 className="w-4 h-4" /> },
    { to: '/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/items', label: 'Item Inventory', icon: <FolderOpen className="w-4 h-4" /> },
    { to: '/admin/claims', label: 'Claim Reviews', icon: <ShieldAlert className="w-4 h-4" /> },
    { to: '/items', label: 'Public Marketplace', icon: <Search className="w-4 h-4" /> },
    { to: '/profile', label: 'Admin Profile', icon: <User className="w-4 h-4" /> },
  ];

  const links = mode === 'admin' ? adminLinks : studentLinks;

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/80">
      {/* Brand Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
              mode === 'admin' ? 'bg-slate-900' : 'bg-brand-600 shadow-brand-500/20'
            }`}
          >
            {mode === 'admin' ? <Shield className="w-5 h-5 text-amber-400" /> : <Compass className="w-5 h-5" />}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">
              CAMPUSFIND
            </h2>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              {mode === 'admin' ? 'Admin Portal' : 'Student Space'}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            end={link.to === '/items' || link.to === '/student/dashboard' || link.to === '/admin/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition ${
                isActive
                  ? mode === 'admin'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-brand-50 text-brand-700 font-semibold shadow-xs border border-brand-100'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200 shrink-0">
            {user ? getInitials(user.name) : 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email || ''}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-100 hover:border-rose-200 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0 overflow-hidden z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />
          {/* Slide-out container */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white shadow-xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
