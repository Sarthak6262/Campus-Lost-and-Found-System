import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  FileCheck2,
  LogOut,
  Menu,
  Search,
  Shield,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { getInitials } from '../../utils/formatters';

interface NavbarProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, showMenuButton = false }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left section: Hamburger (for layouts) & Brand */}
          <div className="flex items-center gap-3">
            {showMenuButton && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden transition"
                aria-label="Toggle navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg text-slate-900 tracking-tight leading-none group-hover:text-brand-600 transition">
                  CAMPUSFIND
                </span>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  Lost & Found Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/items"
              className="text-sm font-medium text-slate-600 hover:text-brand-600 transition flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>Browse Items</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/student/dashboard"
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/claims"
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-4 h-4 text-slate-400" />
                  <span>My Claims</span>
                </Link>
                <Link
                  to="/items/report-lost"
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition"
                >
                  Report Lost
                </Link>
                <Link
                  to="/items/report-found"
                  className="text-sm font-medium text-slate-600 hover:text-brand-600 transition"
                >
                  Report Found
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1 shadow-xs"
                  >
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>Admin Portal</span>
                  </Link>
                )}
              </>
            ) : null}
          </nav>

          {/* Right Section: Auth buttons / User profile dropdown */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center border border-brand-200">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-slate-800 leading-tight line-clamp-1">
                      {user.name}
                    </p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1">
                        <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                          {user.role} &bull; {user.student_id}
                        </span>
                      </div>
                    </div>

                    <Link
                      to="/student/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <Compass className="w-4 h-4 text-slate-400" />
                      Student Dashboard
                    </Link>

                    <Link
                      to="/claims"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <FileCheck2 className="w-4 h-4 text-slate-400" />
                      My Claims
                    </Link>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      My Profile
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-purple-700 hover:bg-purple-50 transition"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            )}

            {/* Mobile menu toggle for unauthenticated or public links */}
            {!showMenuButton && (
              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                aria-label="Toggle mobile menu"
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Public) */}
      {!showMenuButton && mobileNavOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/items"
            onClick={() => setMobileNavOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            Browse Lost & Found
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                Dashboard
              </Link>
              <Link
                to="/claims"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                My Claims
              </Link>
              <Link
                to="/items/report-lost"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                Report Lost Item
              </Link>
              <Link
                to="/items/report-found"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                Report Found Item
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileNavOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                Profile
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileNavOpen(false)}
                  className="block py-2 text-sm font-medium text-purple-700"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileNavOpen(false);
                  handleLogout();
                }}
                className="w-full text-left py-2 text-sm font-medium text-rose-600"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate('/login');
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                className="w-full justify-center"
                onClick={() => {
                  setMobileNavOpen(false);
                  navigate('/register');
                }}
              >
                Register
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
