import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/navbar/Navbar';
import { LandingPage } from './components/landing/LandingPage';
import { CitizenDashboard } from './components/citizen/CitizenDashboard';
import { ReportIssue } from './components/citizen/ReportIssue';
import { MyReports } from './components/citizen/MyReports';
import { ComplaintTracking } from './components/citizen/ComplaintTracking';
import { AuthorityDashboard } from './components/authority/AuthorityDashboard';
import { IssueManagement } from './components/authority/IssueManagement';
import { AuthorityAnalytics } from './components/authority/AuthorityAnalytics';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { DemoGuideWidget } from './components/common/DemoGuideWidget';
import { Toast } from './components/common/Toast';
import { Eye, ShieldCheck, Heart } from 'lucide-react';

const MainContent = () => {
  const { activeTab, role } = useApp();
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Top Navbar */}
      <Navbar onOpenNotifications={() => setNotifDrawerOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'landing' && <LandingPage />}
        {activeTab === 'citizen-dashboard' && <CitizenDashboard />}
        {activeTab === 'report-issue' && <ReportIssue />}
        {activeTab === 'my-reports' && <MyReports />}
        {activeTab === 'tracking' && <ComplaintTracking />}
        {activeTab === 'authority-dashboard' && <AuthorityDashboard />}
        {activeTab === 'issue-management' && <IssueManagement />}
        {activeTab === 'authority-analytics' && <AuthorityAnalytics />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">CivicEye AI</div>
              <div>“Report Smarter. Resolve Faster. Build Better Cities.”</div>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <div className="font-semibold text-slate-300">College AI Project Prototype</div>
            <div className="text-[11px] text-slate-500">
              Smart City Public Issue Detection, Priority Scoring & Field Resolution System
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Notifications Drawer */}
      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />

      {/* Floating Interactive Demo Controller */}
      <DemoGuideWidget />

      {/* Global Toast System */}
      <Toast />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
