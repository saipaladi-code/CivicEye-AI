import React, { useState } from 'react';
import { Eye, Bell, UserCheck, ShieldCheck, Menu, X, LayoutDashboard, FileText, CheckCircle2, BarChart2, PlusCircle, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Navbar = ({ onOpenNotifications }) => {
  const { role, setRole, activeTab, setActiveTab, notifications } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const citizenNav = [
    { id: 'landing', label: 'Home' },
    { id: 'citizen-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'report-issue', label: 'Report Issue', icon: PlusCircle },
    { id: 'my-reports', label: 'My Reports', icon: FileText },
    { id: 'tracking', label: 'Complaint Tracking', icon: CheckCircle2 }
  ];

  const authorityNav = [
    { id: 'authority-dashboard', label: 'Authority Overview', icon: LayoutDashboard },
    { id: 'issue-management', label: 'Issues Management', icon: ShieldAlert },
    { id: 'authority-analytics', label: 'Analytics', icon: BarChart2 }
  ];

  const currentNav = role === 'citizen' ? citizenNav : authorityNav;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 text-white backdrop-blur-md shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Tagline */}
          <div
            onClick={() => setActiveTab(role === 'citizen' ? 'landing' : 'authority-dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition transform">
              <Eye className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-sky-100 to-sky-400 bg-clip-text text-transparent">
                  CivicEye AI
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full border ${
                  role === 'authority'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                }`}>
                  {role}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Intelligent Civic Detection Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {currentNav.map((link) => {
              const Icon = link.icon;
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            
            {/* Demo Role Switcher Button */}
            <div className="bg-slate-800 p-1 rounded-xl border border-slate-700/60 flex items-center gap-1 text-xs font-medium">
              <button
                onClick={() => {
                  setRole('citizen');
                  setActiveTab('citizen-dashboard');
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  role === 'citizen'
                    ? 'bg-sky-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Citizen</span>
              </button>

              <button
                onClick={() => {
                  setRole('authority');
                  setActiveTab('authority-dashboard');
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                  role === 'authority'
                    ? 'bg-amber-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Authority</span>
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {currentNav.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition ${
                  isActive
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {Icon && <Icon className="w-4 h-4 text-sky-400" />}
                <span>{link.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
