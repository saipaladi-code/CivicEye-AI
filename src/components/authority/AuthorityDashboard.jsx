import React from 'react';
import { ShieldCheck, AlertOctagon, Clock, CheckCircle2, TrendingUp, ArrowRight, Eye, Layers, ClipboardCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';

export const AuthorityDashboard = () => {
  const { complaints, setActiveTab, setSelectedComplaintId } = useApp();

  const urgentIssues = complaints.filter(c => c.priorityScore >= 70);
  const pendingCount = complaints.filter((complaint) => ['Submitted', 'Verified'].includes(complaint.status)).length;
  const inProgressCount = complaints.filter((complaint) => ['Assigned', 'In Progress', 'Evidence Submitted', 'Rework Required'].includes(complaint.status)).length;
  const resolvedCount = complaints.filter((complaint) => complaint.status === 'Resolved').length;

  const handleOpenIssue = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('issue-management');
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Authority Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 md:p-8 rounded-3xl text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Authority Desk & Municipal Command Center
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">CivicEye AI Authority Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1">Real-time AI issue triage, department dispatch, priority queues, and resolution verification.</p>
        </div>

        <div className="flex flex-wrap gap-2 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('field-worker-applications')}
            className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2"
          >
            <ClipboardCheck className="w-4 h-4" /> Field Worker Applications
          </button>
          <button
            onClick={() => setActiveTab('issue-management')}
            className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Layers className="w-4 h-4" /> Manage Issue Queue
          </button>
        </div>
      </div>

      {/* Authority Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Issues</span>
          <div className="text-3xl font-black text-slate-900">{complaints.length}</div>
          <div className="text-[10px] text-slate-500 font-medium">Loaded complaints</div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-rose-600 uppercase">High Priority</span>
          <div className="text-3xl font-black text-rose-700">{urgentIssues.length}</div>
          <div className="text-[10px] text-rose-600 font-bold">Score &ge; 70 (Urgent)</div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-amber-700 uppercase">Pending</span>
          <div className="text-3xl font-black text-amber-800">{pendingCount}</div>
          <div className="text-[10px] text-amber-700 font-medium">Awaiting dispatch</div>
        </div>

        <div className="p-5 rounded-2xl bg-sky-50/60 border border-sky-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-sky-700 uppercase">In Progress</span>
          <div className="text-3xl font-black text-sky-800">{inProgressCount}</div>
          <div className="text-[10px] text-sky-700 font-medium">Crews deployed</div>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Resolved</span>
          <div className="text-3xl font-black text-emerald-800">{resolvedCount}</div>
          <div className="text-[10px] text-emerald-700 font-bold">Verified fixes</div>
        </div>

      </div>

      {/* Interactive Map Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Municipal Spatial Issue Map</h2>
            <p className="text-xs text-slate-500">Live geospatial markers grouped by AI priority scores & issue categories.</p>
          </div>
          <button
            onClick={() => setActiveTab('authority-analytics')}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
          >
            Analytics & Hotspots <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <InteractiveMap
          complaints={complaints}
          onSelectComplaint={handleOpenIssue}
          height="420px"
        />
      </div>

      {/* Urgent High-Priority Issues Feed */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            <h2 className="text-lg font-extrabold text-slate-900">Urgent High-Priority Action Queue</h2>
          </div>
          <button
            onClick={() => setActiveTab('issue-management')}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
          >
            View Full Queue ({complaints.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {urgentIssues.slice(0, 4).map((item, idx) => (
            <div
              key={item.id}
              onClick={() => handleOpenIssue(item.id)}
              className="p-4 rounded-2xl border border-rose-200 bg-rose-50/20 hover:bg-white hover:border-rose-300 transition cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow">
                  {item.priorityScore}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-800">{item.id}</span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
                      HIGH PRIORITY
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">({item.duplicateCount} duplicate reports)</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 mt-0.5">{item.category} — {item.location}</h3>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  item.status === 'In Progress' ? 'bg-sky-100 text-sky-800 border-sky-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {item.status}
                </span>

                <button className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow">
                  <Eye className="w-3.5 h-3.5" /> Inspect & Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
