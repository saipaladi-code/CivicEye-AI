import React from 'react';
import { Bell, CheckCheck, X, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsRead, setSelectedComplaintId, setActiveTab, role } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (complaintId) => {
    if (complaintId) {
      setSelectedComplaintId(complaintId);
      setActiveTab(
        role === 'citizen' ? 'tracking' : ['worker', 'field_worker'].includes(role) ? 'worker-dashboard' : 'issue-management'
      );
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-lg">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Recent updates & system alerts</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No notifications yet.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item.complaintId)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  item.read
                    ? 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    : 'bg-sky-50/70 border-sky-200 text-slate-900 shadow-sm hover:border-sky-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    item.title.includes('Resolved')
                      ? 'bg-emerald-100 text-emerald-600'
                      : item.title.includes('Assigned')
                      ? 'bg-sky-100 text-sky-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.title.includes('Resolved') ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : item.title.includes('Assigned') ? (
                      <Info className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 shrink-0">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                    {item.complaintId && (
                      <span className="inline-block mt-2 text-[11px] font-mono font-bold text-sky-600 bg-sky-100/60 px-2 py-0.5 rounded border border-sky-200">
                        {item.complaintId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
