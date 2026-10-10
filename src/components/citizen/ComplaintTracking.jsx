import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertCircle, MapPin, Cpu, ShieldAlert, User, Calendar, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ComplaintTracking = () => {
  const { currentSelectedComplaint, setActiveTab } = useApp();
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);

  if (!currentSelectedComplaint) {
    return (
      <div className="p-12 text-center text-slate-400">
        No complaint selected. Please pick a complaint from My Reports.
      </div>
    );
  }

  const c = currentSelectedComplaint;
  const isResolved = c.status === 'Resolved';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Header & Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('my-reports')}
          className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Reports
        </button>

        <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-sky-100 text-sky-800 border border-sky-300">
          ID: {c.id}
        </span>
      </div>

      {/* Main Complaint Overview Card */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                isResolved
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : c.status === 'In Progress'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                STATUS: {c.status.toUpperCase()}
              </span>

              <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold border border-rose-300">
                PRIORITY: {c.priorityScore}/100 ({c.severity} Severity)
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{c.category} Report</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{c.location}</span>
            </p>
          </div>

          {/* Action button if resolved */}
          {isResolved && (
            <button
              onClick={() => setShowEvidenceModal(true)}
              className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <ImageIcon className="w-4 h-4" /> View Resolution Evidence
            </button>
          )}
        </div>

        {/* AI & Department Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">AI Confidence</span>
            <div className="text-lg font-black text-sky-600">{c.confidence}%</div>
            <div className="text-[10px] text-slate-500">Validated by AI engine</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Duplicate Grouping</span>
            <div className="text-lg font-black text-amber-600">{c.duplicateCount} Reports</div>
            <div className="text-[10px] text-slate-500">Grouped within 200m</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Department</span>
            <div className="text-sm font-extrabold text-slate-800 truncate">{c.department || 'Road Maintenance'}</div>
            <div className="text-[10px] text-slate-500">Worker: {c.worker || 'Pending'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Expected Resolution</span>
            <div className="text-sm font-extrabold text-slate-800">{c.expectedResolution || '2026-09-23'}</div>
            <div className="text-[10px] text-emerald-600 font-bold">{isResolved ? 'Resolved on Schedule' : 'Active Target'}</div>
          </div>
        </div>

        {/* Description & Photo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Issue Description</h3>
            <p className="text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed font-medium">
              “{c.description}”
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Original Photo</h3>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-200 border border-slate-200">
              <img src={c.imageUrl} alt="Original Complaint" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

      </div>

      {/* PROGRESS TIMELINE SECTION */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900">Resolution Progress Timeline</h2>

        <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {c.timeline.map((step, idx) => {
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'current';

            return (
              <div key={idx} className="relative flex items-start gap-4">
                
                {/* Status Dot */}
                <div className={`absolute -left-6 top-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-white ${
                  isDone
                    ? 'bg-emerald-500 border-white ring-2 ring-emerald-200'
                    : isCurrent
                    ? 'bg-sky-500 border-white ring-4 ring-sky-100 animate-pulse'
                    : 'bg-slate-100 border-slate-300'
                }`}>
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {isCurrent && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={`font-bold text-sm ${isDone ? 'text-slate-900' : isCurrent ? 'text-sky-700' : 'text-slate-400'}`}>
                      {step.step}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-400">{step.timestamp}</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.note}</p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* BEFORE VS AFTER RESOLUTION EVIDENCE MODAL */}
      {showEvidenceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Verified Proof of Work</span>
                <h3 className="text-xl font-extrabold text-slate-900">Before & After Resolution Evidence</h3>
              </div>
              <button onClick={() => setShowEvidenceModal(false)} className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs">
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-rose-700">
                  <span>BEFORE (Reported Issue)</span>
                  <span>{c.createdDate}</span>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-rose-300 shadow">
                  <img src={c.imageUrl} alt="Before" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
                  <span>AFTER (Resolved Fix)</span>
                  <span>{c.resolvedDate || '2026-09-21'}</span>
                </div>
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-400 shadow">
                  <img src={c.resolutionImageUrl || c.imageUrl} alt="After" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold leading-relaxed">
              ✓ Field Worker <strong>{c.worker || 'Alex Miller'}</strong> from <strong>{c.department || 'Road Maintenance'}</strong> uploaded high-resolution completion evidence. Inspection verified zero active hazards.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
