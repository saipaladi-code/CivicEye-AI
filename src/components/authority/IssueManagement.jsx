import React, { useState } from 'react';
import { Search, Filter, Eye, Layers, Building2, User, ArrowUpDown } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IssueDetailModal } from './IssueDetailModal';

export const IssueManagement = () => {
  const { complaints, selectedComplaintId, setSelectedComplaintId } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);

  const categories = ['All', 'Pothole', 'Garbage', 'Broken Streetlight', 'Water Leakage', 'Drainage', 'Damaged Road'];
  const severities = ['All', 'High', 'Medium', 'Low'];
  const statuses = ['All', 'Submitted', 'Pending', 'In Progress', 'Resolved'];

  const filtered = complaints.filter((item) => {
    const matchesSearch = item.id.toLowerCase().includes(search.toLowerCase()) ||
                          item.category.toLowerCase().includes(search.toLowerCase()) ||
                          item.location.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSeverity = severityFilter === 'All' || item.severity === severityFilter;
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const handleOpenView = (item) => {
    setSelectedIssue(item);
    setSelectedComplaintId(item.id);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Authority Issue Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Filter, triage, assign departments, and track resolution timelines across all municipal reports.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 self-start md:self-auto">
          Total Queue: <strong>{complaints.length} Issues</strong>
        </span>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search ID, area, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>Category: {cat}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
          >
            {severities.map((sev, idx) => (
              <option key={idx} value={sev}>Severity: {sev}</option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
          >
            {statuses.map((st, idx) => (
              <option key={idx} value={st}>Status: {st}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Main Issue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider border-b border-slate-800">
                <th className="p-4">ID</th>
                <th className="p-4">Issue Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Priority Score</th>
                <th className="p-4">Reports</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No issues match the applied filters.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const isHigh = item.priorityScore >= 70;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-mono font-bold text-sky-700">{item.id}</td>
                      <td className="p-4 font-bold text-slate-900">{item.category}</td>
                      <td className="p-4 text-slate-600 max-w-xs truncate">{item.location}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded font-bold text-[11px] ${
                          item.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          isHigh ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {item.priorityScore} / 100
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">{item.duplicateCount + 1}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                          item.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : item.status === 'In Progress'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleOpenView(item)}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-400" /> View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <IssueDetailModal
          complaint={selectedIssue}
          isOpen={!!selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}

    </div>
  );
};
