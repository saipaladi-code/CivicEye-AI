import React, { useMemo, useState } from 'react';
import {
  AlertCircle, CalendarDays, Camera, CheckCircle2, Clock3, FileText,
  MapPin, RefreshCw, Send, Wrench
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { uploadWorkerEvidence } from '../../utils/workflowApi';

const formatDate = (value) => value
  ? new Date(value).toLocaleString()
  : 'Not set';

export const WorkerDashboard = () => {
  const {
    complaints, user, dataLoading, refreshUserData, startWorkerTask,
    submitWorkerEvidence, selectedComplaintId, setSelectedComplaintId
  } = useApp();
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const tasks = useMemo(
    () => [...complaints].sort((a, b) => (
      new Date(b.createdAt || b.createdDate) - new Date(a.createdAt || a.createdDate)
    )),
    [complaints]
  );
  const selectedTask = tasks.find((task) => task.id === selectedId) ||
    tasks.find((task) => task.id === selectedComplaintId) || tasks[0];
  const counts = [
    { label: 'Assigned', count: tasks.filter((task) => task.workerTaskStatus === 'Assigned').length, icon: FileText, className: 'text-sky-600' },
    { label: 'In progress', count: tasks.filter((task) => task.workerTaskStatus === 'In Progress').length, icon: Wrench, className: 'text-amber-600' },
    { label: 'Evidence submitted', count: tasks.filter((task) => task.workerTaskStatus === 'Evidence Submitted').length, icon: Camera, className: 'text-violet-600' },
    { label: 'Approved', count: tasks.filter((task) => task.workerTaskStatus === 'Approved').length, icon: CheckCircle2, className: 'text-emerald-600' }
  ];

  const handleStart = async () => {
    if (!selectedTask) return;
    setBusy(true);
    setError('');
    try {
      await startWorkerTask(selectedTask.id);
      await refreshUserData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedTask || busy) return;
    if (!files.length) {
      setError('Choose at least one completion photo.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const uploaded = await Promise.all(files.map((file) => (
        uploadWorkerEvidence(file, selectedTask.id)
      )));
      await submitWorkerEvidence(selectedTask.id, note, uploaded);
      setNote('');
      setFiles([]);
      event.currentTarget.reset();
      await refreshUserData();
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusy(false);
    }
  };

  const status = selectedTask?.workerTaskStatus || selectedTask?.status || 'Assigned';
  const canStart = ['Assigned', 'Rework Required'].includes(status);
  const canSubmit = ['In Progress', 'Rework Required'].includes(status);

  return (
    <div className="space-y-6 pb-16">
      <header className="rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-800 p-6 text-white shadow-xl md:flex md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Field Operations</p>
          <h1 className="mt-1 text-2xl font-extrabold">My Assigned Tasks</h1>
          <p className="mt-2 text-sm text-emerald-100">Welcome, {user?.fullName}. Review your assignments and submit genuine completion evidence.</p>
        </div>
        <button
          type="button"
          onClick={() => refreshUserData().catch((refreshError) => setError(refreshError.message))}
          disabled={dataLoading}
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-white/20 disabled:opacity-60 md:mt-0"
        >
          <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} /> Refresh tasks
        </button>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {counts.map(({ label, count, icon: Icon, className }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{label}</span>
              <Icon className={`h-4 w-4 ${className}`} />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{count}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.5fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900">Task history</h2>
              <p className="mt-1 text-xs text-slate-500">Current and previous assignments</p>
            </div>
            <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">{tasks.length}</span>
          </div>
          <div className="space-y-2">
            {tasks.map((task) => (
              <button
                type="button"
                key={task.id}
                onClick={() => { setSelectedId(task.id); setSelectedComplaintId(task.id); }}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  (selectedTask?.id === task.id)
                    ? 'border-emerald-300 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-600">{task.id}</span>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-slate-600">{task.workerTaskStatus || task.status}</span>
                </div>
                <div className="mt-2 text-sm font-extrabold text-slate-900">{task.category}</div>
                <div className="mt-1 truncate text-xs text-slate-500">{task.location}</div>
              </button>
            ))}
            {!tasks.length && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No tasks have been assigned to your account yet.</p>}
          </div>
        </section>

        {selectedTask ? (
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700">{selectedTask.id}</span>
                <h2 className="mt-1 text-xl font-extrabold text-slate-900">{selectedTask.category}</h2>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-800">{status}</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <h3 className="text-xs font-bold uppercase text-slate-500">Task details</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">{selectedTask.description}</p>
                <p className="mt-3 flex items-start gap-2 text-xs text-slate-600"><MapPin className="h-4 w-4 shrink-0 text-emerald-700" />{selectedTask.location}</p>
              </div>
              <div className="space-y-3 rounded-2xl bg-slate-50 p-4 text-xs text-slate-700">
                <p><strong>Severity:</strong> {selectedTask.severity}</p>
                <p><strong>Department:</strong> {selectedTask.department || user?.department || 'Not specified'}</p>
                <p className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0" /><span><strong>Deadline:</strong> {selectedTask.assignmentDeadline ? formatDate(selectedTask.assignmentDeadline) : 'No deadline'}</span></p>
                <p className="flex gap-2"><Clock3 className="h-4 w-4 shrink-0" /><span><strong>Assigned:</strong> {formatDate(selectedTask.assignedAt)}</span></p>
                {selectedTask.assignmentInstructions && <p><strong>Instructions:</strong> {selectedTask.assignmentInstructions}</p>}
              </div>
            </div>

            {selectedTask.imageUrl && (
              <div>
                <h3 className="mb-2 text-xs font-bold uppercase text-slate-500">Original complaint photo</h3>
                <img src={selectedTask.imageUrl} alt="Original complaint" className="max-h-64 w-full rounded-2xl border border-slate-200 object-cover" />
              </div>
            )}

            {selectedTask.evidenceSubmissions?.map((submission) => (
              <div key={submission.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap justify-between gap-2 text-xs">
                  <strong>{submission.status} · {formatDate(submission.submittedAt)}</strong>
                  {submission.rejectionReason && <span className="font-semibold text-rose-700">Rework reason: {submission.rejectionReason}</span>}
                </div>
                <p className="mt-2 text-sm text-slate-700">{submission.note}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {submission.photos.map((photo) => <img key={photo.id} src={photo.url} alt="Submitted task evidence" className="aspect-video w-full rounded-xl object-cover" />)}
                </div>
              </div>
            ))}

            {error && <p role="alert" className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}

            {canStart && (
              <button type="button" disabled={busy} onClick={handleStart} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:opacity-60">
                <Wrench className="h-4 w-4" /> {status === 'Rework Required' ? 'Start Rework' : 'Start Work'}
              </button>
            )}

            {canSubmit && (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <h3 className="font-extrabold text-emerald-950">Submit completion evidence</h3>
                <label className="block text-xs font-bold text-slate-700">
                  Completion photos (JPEG, PNG, or WebP; up to 5 photos, 5 MB each)
                  <input
                    className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-2 text-xs"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={(event) => setFiles(Array.from(event.target.files || []).slice(0, 5))}
                  />
                </label>
                {files.length > 0 && <p className="text-xs text-slate-600">{files.length} photo{files.length === 1 ? '' : 's'} selected.</p>}
                <label className="block text-xs font-bold text-slate-700">
                  Completion note
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} minLength={3} maxLength={2000} required rows={3} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-sm font-normal" placeholder="Describe the work completed and any remaining concerns." />
                </label>
                <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-800 disabled:opacity-60">
                  <Send className="h-4 w-4" /> {busy ? 'Uploading and submitting…' : 'Submit for approval'}
                </button>
              </form>
            )}

            {status === 'Evidence Submitted' && <p className="rounded-xl bg-violet-50 p-4 text-sm font-semibold text-violet-800">Your evidence is waiting for municipal authority review.</p>}
            {status === 'Approved' && <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Evidence approved. This complaint has been resolved.</p>}
          </section>
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">Assigned tasks and their details will appear here.</div>
        )}
      </div>
    </div>
  );
};
