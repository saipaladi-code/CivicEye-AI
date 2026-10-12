import React, { useState } from 'react';
import {
  ArrowRight, BarChart2, Bell, CheckCircle2, Eye, FileText, LayoutDashboard,
  LogOut, Menu, PlusCircle, ShieldAlert, UserRound, X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar = ({ onOpenNotifications }) => {
  const {
    user, role, activeTab, setActiveTab, notifications, logout, showToast
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const citizenNav = [
    { id: 'citizen-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report-issue', label: 'Report issue', icon: PlusCircle },
    { id: 'my-reports', label: 'My reports', icon: FileText },
    { id: 'tracking', label: 'Tracking', icon: CheckCircle2 }
  ];
  const authorityNav = [
    { id: 'authority-dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'issue-management', label: 'Manage issues', icon: ShieldAlert },
    { id: 'authority-analytics', label: 'Analytics', icon: BarChart2 }
  ];
  const navigation = user ? (role === 'authority' ? authorityNav : citizenNav) : [];

  const handleLogout = async () => {
    try {
      await logout();
      showToast('You have been securely signed out.', 'success');
    } catch (error) {
      showToast(error.message || 'Sign out failed. Please try again.', 'error');
    }
  };

  const renderLinks = (mobile = false) => navigation.map((item) => {
    const Icon = item.icon;
    const selected = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          setActiveTab(item.id);
          setMobileMenuOpen(false);
        }}
        className={`${mobile ? 'w-full justify-start px-4 py-2.5' : 'px-3 py-2'} inline-flex items-center gap-2 rounded-xl text-xs font-semibold transition ${
          selected
            ? 'bg-emerald-50 text-emerald-800'
            : 'text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-800'
        }`}
      >
        <Icon className="h-4 w-4" />
        {item.label}
      </button>
    );
  });

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-950/10 bg-white/95 text-slate-800 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setActiveTab(user ? (role === 'authority' ? 'authority-dashboard' : 'citizen-dashboard') : 'landing')}
          className="flex shrink-0 items-center gap-3 rounded-lg text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          aria-label="CivicEye AI home"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-800 text-white shadow-md shadow-emerald-900/15">
            <Eye className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-base font-extrabold tracking-tight text-emerald-950">CivicEye AI</span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-[.12em] text-emerald-800/60 sm:block">Intelligent civic platform</span>
          </span>
        </button>

        {user && (
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {renderLinks()}
          </nav>
        )}

        <div className="flex shrink-0 items-center gap-2">
          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 sm:flex">
                <UserRound className="h-4 w-4" />
                {user.fullName}
                <span className="rounded-md bg-white px-1.5 py-1 text-[9px] uppercase tracking-wide text-emerald-700">{role}</span>
              </span>
              <button
                type="button"
                onClick={onOpenNotifications}
                className="relative rounded-xl p-2.5 text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800"
                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-rose-500" />}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-2 rounded-xl border border-emerald-900/10 px-3 py-2 text-xs font-bold text-emerald-900 transition hover:bg-emerald-50 sm:inline-flex"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-xl p-2 text-slate-600 transition hover:bg-emerald-50 lg:hidden"
                aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('auth-login')}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              Sign in <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {user && mobileMenuOpen && (
        <div className="space-y-1 border-t border-emerald-950/10 bg-white px-4 py-3 lg:hidden">
          <div className="px-4 pb-2 text-xs font-semibold text-slate-500 sm:hidden">
            {user.fullName} · {role}
          </div>
          {renderLinks(true)}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex w-full items-center gap-2 rounded-xl px-4 py-2.5 text-left text-xs font-semibold text-emerald-900 hover:bg-emerald-50 sm:hidden"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      )}
    </header>
  );
};
