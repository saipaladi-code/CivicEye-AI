import React, { useEffect, useState } from 'react';
import { Cpu, ShieldCheck, UserCheck, CheckCircle2, AlertTriangle, X, MapPin, Building2, Send, CalendarDays } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { workflowRequest } from '../../utils/workflowApi';

export const IssueDetailModal = ({ complaint, isOpen, onClose }) => {
  const { assignIssue, updateStatus, reviewWorkerEvidence, showToast } = useApp();

  const departments = [
    'Road Maintenance',
    'Sanitation',
    'Electrical',
    'Water Department',
    'Drainage Department'
  ];

  const [selectedDept, setSelectedDept] = useState(complaint?.department || 'Road Maintenance');
  const [selectedWorker, setSelectedWorker] = useState(complaint?.assignedWorkerId || '');
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [instructions, setInstructions] = useState(complaint?.assignmentInstructions || '');
  const [deadline, setDeadline] = useState(complaint?.assignmentDeadline ? new Date(complaint.assignmentDeadline).toISOString().slice(0, 10) : '');
  const [rejectionReason, setRejectionReason] = useState('');
  const pendingSubmission = [...(complaint?.evidenceSubmissions || [])].reverse().find((submission) => submission.status === 'Submitted');
  const eligibleWorkers = workers.filter((worker) => worker.department === selectedDept);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    setSelectedDept(complaint?.department || 'Road Maintenance');
    setSelectedWorker(complaint?.assignedWorkerId || '');
    setInstructions(complaint?.assignmentInstructions || '');
    setDeadline(complaint?.assignmentDeadline ? new Date(complaint.assignmentDeadline).toISOString().slice(0, 10) : '');
    setRejectionReason('');
    setWorkersLoading(true);
    workflowRequest('workers')
      .then(({ workers: eligibleWorkers }) => {
        if (!active) return;
        setWorkers(eligibleWorkers);
        const matchingWorker = eligibleWorkers.find((worker) => worker.id === complaint?.assignedWorkerId) ||
          eligibleWorkers.find((worker) => worker.department === (complaint?.department || 'Road Maintenance'));
        setSelectedWorker(matchingWorker?.id || '');
      })
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => { if (active) setWorkersLoading(false); });
    return () => { active = false; };
  }, [isOpen, complaint?.id]);

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
    const worker = workers.find((item) => item.id === selectedWorker);
    if (!worker) {
      showToast('Select an eligible field worker before assigning this complaint.', 'error');
      return;
    }
    assignIssue(c.id, {
      department: selectedDept,
      workerId: worker.id,
      workerName: worker.fullName,
      instructions,
      deadline
    });
  };

  const handleStatusChange = (newStatus) => {
    updateStatus(c.id, newStatus);
  };

  const handleReview = (decision) => {
    if (decision === 'reject' && rejectionReason.trim().length < 3) {
      showToast('Enter a rejection reason before returning this task.', 'error');
      return;
    }
    reviewWorkerEvidence(c.id, decision, rejectionReason);
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
                    const nextWorker = workers.find((worker) => worker.department === e.target.value);
                    setSelectedWorker(nextWorker?.id || '');
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
                  disabled={workersLoading || !eligibleWorkers.length}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                >
                  {eligibleWorkers.map((worker) => (
                    <option key={worker.id} value={worker.id}>{worker.fullName} — {worker.department || 'No department'}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className="block space-y-1 text-xs font-bold text-slate-600">
              Assignment instructions
              <textarea value={instructions} onChange={(event) => setInstructions(event.target.value)} maxLength={1000} rows={2} className="w-full rounded-xl border border-slate-300 bg-white p-3 font-normal" placeholder="Optional instructions for the field worker" />
            </label>
            <label className="block space-y-1 text-xs font-bold text-slate-600">
              <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Deadline (optional)</span>
              <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-normal" />
            </label>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={workersLoading || !eligibleWorkers.length}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Assign Issue & Notify Citizen
              </button>
            </div>
          </form>

          <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-4">
            <h4 className="font-extrabold text-sm text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Field Worker Resolution & Evidence Review
            </h4>

            <div className="text-xs text-slate-600">
              Assigned worker: <strong>{c.worker || 'Not assigned'}</strong> ({c.department || 'Department not set'}) · Status: <strong>{c.workerTaskStatus || c.status}</strong>
            </div>
            {pendingSubmission ? (
              <div className="space-y-4 rounded-2xl border border-emerald-200 bg-white p-4">
                <div className="text-xs text-slate-600">
                  <strong>{pendingSubmission.workerName}</strong> submitted on {new Date(pendingSubmission.submittedAt).toLocaleString()}
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{pendingSubmission.note}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {pendingSubmission.photos.map((photo) => (
                    <img key={photo.id} src={photo.url} alt="Field worker completion evidence" className="aspect-video w-full rounded-xl border border-slate-200 object-cover" />
                  ))}
                </div>
                <label className="block space-y-1 text-xs font-bold text-slate-600">
                  Rejection reason (required to reject)
                  <textarea value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} maxLength={1000} rows={2} className="w-full rounded-xl border border-slate-300 p-3 font-normal" />
                </label>
                <div className="flex flex-wrap justify-end gap-3">
                  <button type="button" onClick={() => handleReview('reject')} className="rounded-xl border border-rose-300 bg-rose-50 px-5 py-3 text-xs font-extrabold text-rose-800 hover:bg-rose-100">Reject Evidence</button>
                  <button type="button" onClick={() => handleReview('approve')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-xs font-extrabold text-white hover:bg-emerald-800"><CheckCircle2 className="h-4 w-4" /> Approve Evidence & Resolve</button>
                </div>
              </div>
            ) : <p className="rounded-xl bg-white p-4 text-xs text-slate-600">No evidence is currently awaiting review. Worker-submitted evidence will appear here.</p>}

            {c.approvedEvidence?.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="text-xs font-bold text-emerald-800">Approved · {new Date(submission.submittedAt).toLocaleString()}</p>
                <p className="mt-2 text-sm text-slate-700">{submission.note}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {submission.photos.map((photo) => <img key={photo.id} src={photo.url} alt="Approved completion evidence" className="aspect-video w-full rounded-xl object-cover" />)}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
};
