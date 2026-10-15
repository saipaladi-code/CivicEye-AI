import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Eye, Loader2, RefreshCw, ShieldCheck, X } from 'lucide-react';

const request = async (url, options) => {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options?.body ? { 'Content-Type': 'application/json' } : {}),
      ...options?.headers
    }
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }
  if (!response.ok) throw new Error(result.error || 'The application request failed.');
  return result;
};

const displayDate = (value) => value ? new Date(value).toLocaleString() : '—';

const statusClass = (status) => ({
  PENDING_APPROVAL: 'bg-amber-50 text-amber-800 border-amber-200',
  MORE_INFO_REQUIRED: 'bg-sky-50 text-sky-800 border-sky-200',
  APPROVED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  REJECTED: 'bg-rose-50 text-rose-800 border-rose-200'
}[status] || 'bg-slate-50 text-slate-700 border-slate-200');

const statusLabel = (application) => (
  application.applicationStatus === 'MORE_INFO_REQUIRED'
    ? 'More Information Required'
    : application.approvalStatus === 'PENDING_APPROVAL'
      ? 'Pending Approval'
      : application.approvalStatus
);

export const FieldWorkerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [decisionAction, setDecisionAction] = useState('');
  const [decisionMessage, setDecisionMessage] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await request('/api/admin/worker-applications');
      setApplications(result.applications);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const openDetails = async (id) => {
    setError('');
    setDecisionAction('');
    setDecisionMessage('');
    try {
      const result = await request(`/api/admin/worker-applications/${encodeURIComponent(id)}`);
      setSelected(result.application);
    } catch (detailError) {
      setError(detailError.message);
    }
  };

  const decide = async (action) => {
    if (!selected || busy) return;
    if (action !== 'approve' && decisionMessage.trim().length < 3) {
      setError(action === 'reject'
        ? 'Enter a rejection reason before rejecting this application.'
        : 'Enter the information the applicant needs to provide.');
      return;
    }
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const result = await request(`/api/admin/worker-applications/${encodeURIComponent(selected.id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ action, message: decisionMessage })
      });
      setApplications((current) => current.map((application) => (
        application.id === result.application.id ? result.application : application
      )));
      setSelected(null);
      setDecisionAction('');
      setDecisionMessage('');
      setNotice(action === 'approve'
        ? 'Worker application approved.'
        : action === 'reject'
          ? 'Worker application rejected.'
          : 'Information request sent to the applicant.');
    } catch (decisionError) {
      setError(decisionError.message);
    } finally {
      setBusy(false);
    }
  };

  const pendingCount = applications.filter((application) => application.approvalStatus === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6 pb-16">
      <header className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-950 to-emerald-800 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-200">
            <ShieldCheck className="h-4 w-4" /> Municipal Authority
          </p>
          <h1 className="mt-1 text-2xl font-extrabold">Field Worker Applications</h1>
          <p className="mt-2 text-sm text-emerald-100">Review employee details and supporting proof before granting dashboard access.</p>
        </div>
        <button
          type="button"
          onClick={loadApplications}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-white/20 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </header>

      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Awaiting review</span>
        <div className="mt-1 text-2xl font-black text-emerald-900">{pendingCount}</div>
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">{notice}</div>}

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Worker name</th>
                <th className="px-4 py-3">Email and mobile</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Employee ID</th>
                <th className="px-4 py-3">Work location</th>
                <th className="px-4 py-3">Registration date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((application) => (
                <tr key={application.id} className="text-slate-700">
                  <td className="px-4 py-3 font-bold text-slate-900">{application.fullName}</td>
                  <td className="px-4 py-3">
                    <div>{application.email}</div>
                    <div className="mt-1 text-slate-500">{application.mobile || 'No mobile provided'}</div>
                  </td>
                  <td className="px-4 py-3">{application.department}</td>
                  <td className="px-4 py-3 font-mono">{application.employeeId}</td>
                  <td className="px-4 py-3">{application.workLocation}</td>
                  <td className="px-4 py-3">{displayDate(application.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass(application.applicationStatus || application.approvalStatus)}`}>
                      {statusLabel(application)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => openDetails(application.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-2 font-bold text-emerald-800 hover:bg-emerald-50"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && applications.length === 0 && (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-500">No field worker applications have been submitted.</td></tr>
              )}
              {loading && (
                <tr><td colSpan="8" className="px-4 py-12 text-center text-sm text-slate-500">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading applications…
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelected(null);
        }}>
          <section className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl md:p-7" role="dialog" aria-modal="true" aria-labelledby="application-details-title">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Application details</p>
                <h2 id="application-details-title" className="mt-1 text-xl font-extrabold text-slate-900">{selected.fullName}</h2>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100" aria-label="Close application details">
                <X className="h-5 w-5" />
              </button>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ['Email', selected.email],
                ['Mobile', selected.mobile || 'Not provided'],
                ['Department', selected.department],
                ['Employee ID', selected.employeeId],
                ['Work location', selected.workLocation],
                ['Registration date', displayDate(selected.createdAt)]
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-3">
                  <dt className="text-[10px] font-bold uppercase text-slate-500">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-semibold text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
            {selected.profileProof && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="mb-3 text-xs font-bold text-slate-700">Profile photo or employee ID proof</p>
                {selected.profileProof.contentType === 'application/pdf'
                  ? <a className="font-bold text-emerald-800 underline" href={`data:${selected.profileProof.contentType};base64,${selected.profileProof.data}`} download={selected.profileProof.fileName}>{selected.profileProof.fileName}</a>
                  : <img className="max-h-72 rounded-xl border border-slate-200 object-contain" src={`data:${selected.profileProof.contentType};base64,${selected.profileProof.data}`} alt="Worker-submitted identity proof" />}
              </div>
            )}
            {error && <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">{error}</div>}

            {selected.approvalStatus === 'PENDING_APPROVAL' ? (
              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={busy} onClick={() => decide('approve')} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-extrabold text-white hover:bg-emerald-800 disabled:opacity-60">
                    <CheckCircle2 className="h-4 w-4" /> Approve
                  </button>
                  <button type="button" disabled={busy} onClick={() => { setDecisionAction('reject'); setDecisionMessage(''); setError(''); }} className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-extrabold text-rose-700 hover:bg-rose-50 disabled:opacity-60">
                    Reject
                  </button>
                  <button type="button" disabled={busy} onClick={() => { setDecisionAction('request-info'); setDecisionMessage(''); setError(''); }} className="rounded-xl border border-sky-200 px-4 py-2.5 text-xs font-extrabold text-sky-700 hover:bg-sky-50 disabled:opacity-60">
                    Request More Information
                  </button>
                </div>
                {decisionAction && (
                  <form className="mt-4 space-y-3" onSubmit={(event) => { event.preventDefault(); decide(decisionAction); }}>
                    <label className="block text-xs font-bold text-slate-700">
                      {decisionAction === 'reject' ? 'Rejection reason' : 'Message to the applicant'}
                      <textarea
                        value={decisionMessage}
                        onChange={(event) => setDecisionMessage(event.target.value)}
                        maxLength={1000}
                        minLength={3}
                        required
                        rows={3}
                        className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        placeholder={decisionAction === 'reject' ? 'Explain why the application is rejected…' : 'Explain what information is needed…'}
                      />
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
                        {busy ? 'Saving…' : decisionAction === 'reject' ? 'Confirm Rejection' : 'Send Request'}
                      </button>
                      <button type="button" onClick={() => setDecisionAction('')} className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                <strong>Status:</strong> {statusLabel(selected)}
                {selected.adminMessage && <p className="mt-2"><strong>Message:</strong> {selected.adminMessage}</p>}
                {selected.rejectionReason && <p className="mt-2"><strong>Rejection reason:</strong> {selected.rejectionReason}</p>}
                {selected.approvedAt && <p className="mt-2"><strong>Approved:</strong> {displayDate(selected.approvedAt)}</p>}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
