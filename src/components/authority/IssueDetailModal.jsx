import React, { useState } from 'react';
import { Cpu, ShieldCheck, UserCheck, CheckCircle2, AlertTriangle, X, Upload, MapPin, Sparkles, Building2, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IssueDetailModal = ({ complaint, isOpen, onClose }) => {
  const { assignIssue, updateStatus, resolveComplaint, showToast } = useApp();

  const departments = [
    'Road Maintenance',
    'Sanitation',
    'Electrical',
    'Water Department',
    'Drainage Department'
  ];

  const workersMap = {
    'Road Maintenance': ['Alex Miller', 'Vikram Patel', 'Suresh Gowda'],
    'Sanitation': ['Karan Singh', 'Sunil Gowda', 'Ramesh Rao'],
    'Electrical': ['Rajesh Rao', 'Prakash Iyer', 'Manoj Kumar'],
    'Water Department': ['David Chen', 'Anil Sharma', 'Vijay Roy'],
    'Drainage Department': ['Sanjay Kumar', 'Ganesh Prasad', 'Nitin Sethi']
  };

  const [selectedDept, setSelectedDept] = useState(complaint?.department || 'Road Maintenance');
  const [selectedWorker, setSelectedWorker] = useState(complaint?.worker || 'Alex Miller');
  const [resolutionPhoto, setResolutionPhoto] = useState(complaint?.resolutionImageUrl || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80');

  if (!isOpen || !complaint) return null;

  const c = complaint;
  const bd = c.breakdown || {
    severityPoints: 35,
    reportPoints: 20,
    impactPoints: 18,
    locationPoints: 14
  };

  const handleAssign = (e) => {
    e.preventDefault();
    assignIssue(c.id, selectedDept, selectedWorker);
  };

  const handleStatusChange = (newStatus) => {
    updateStatus(c.id, newStatus);
  };

  const handleMarkResolved = () => {
    resolveComplaint(c.id, resolutionPhoto);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="font-mono font-extrabold text-sm px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              ID: {c.id}
            </span>
            <div>
              <h3 className="font-extrabold text-base">{c.category} Issue Details</h3>
              <p className="text-xs text-slate-400">{c.location}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Top Info & Photo */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            <div className="md:col-span-5">
              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow relative">
                <img src={c.imageUrl} alt="Complaint Photo" className="w-full h-full object-cover" />
                <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur">
                  Original Citizen Upload
                </span>
              </div>
            </div>

            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                  c.priorityScore >= 70 ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  PRIORITY: {c.priorityScore}/100 ({c.severity} Severity)
                </span>

                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
                  AI Confidence: {c.confidence}%
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Description</h4>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-medium">
                  “{c.description}”
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                <span>📍 Duplicate Reports: <strong className="text-slate-900">{c.duplicateCount} nearby</strong></span>
                <span>•</span>
                <span>📅 Reported: <strong className="text-slate-900">{c.createdDate}</strong></span>
              </div>
            </div>

          </div>

          {/* PRIORITY FORMULA BREAKDOWN VISUALIZATION */}
          <div className="p-6 rounded-2xl bg-slate-900 text-white space-y-4 shadow-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-sky-400" />
                <h4 className="font-extrabold text-sm tracking-wide">CivicEye AI 100-Point Priority Model Breakdown</h4>
              </div>
              <span className="text-xs font-black text-rose-400 font-mono">
                Total: {c.priorityScore} / 100
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Severity Weight</span>
                <div className="font-extrabold text-white text-base">{bd.severityPoints} / 40 pt</div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(bd.severityPoints/40)*100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Duplicate Count</span>
                <div className="font-extrabold text-white text-base">{bd.reportPoints} / 25 pt</div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(bd.reportPoints/25)*100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Public Impact</span>
                <div className="font-extrabold text-white text-base">{bd.impactPoints} / 20 pt</div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-400 rounded-full" style={{ width: `${(bd.impactPoints/20)*100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Location Factor</span>
                <div className="font-extrabold text-white text-base">{bd.locationPoints} / 15 pt</div>
                <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${(bd.locationPoints/15)*100}%` }} />
                </div>
              </div>

            </div>
          </div>

          {/* STATUS TRANSITION CONTROLLER */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Change Status Workflow</h4>
            <div className="flex flex-wrap gap-2">
              {['Submitted', 'Verified', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition ${
                    c.status === st
                      ? 'bg-sky-600 text-white shadow'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* DEPARTMENT & WORKER ASSIGNMENT FORM */}
          <form onSubmit={handleAssign} className="p-6 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-sky-600" />
              Assign Department & Field Worker
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Assign Department</label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    const list = workersMap[e.target.value] || [];
                    if (list.length > 0) setSelectedWorker(list[0]);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Assign Worker</label>
                <select
                  value={selectedWorker}
                  onChange={(e) => setSelectedWorker(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  {(workersMap[selectedDept] || []).map((w, idx) => (
                    <option key={idx} value={w}>{w}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Assign Issue & Notify Citizen
              </button>
            </div>
          </form>

          {/* FIELD WORKER RESOLUTION SECTION */}
          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Field Worker Resolution & Evidence Upload
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-600">Upload Resolution / After Photo</label>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-300 relative">
                  <img src={resolutionPhoto} alt="After Resolution" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs text-slate-600">
                  Worker: <strong>{c.worker || 'Alex Miller'}</strong> ({c.department || 'Road Maintenance'})
                </div>

                <button
                  type="button"
                  onClick={handleMarkResolved}
                  className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Mark as Resolved & Publish Evidence
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
