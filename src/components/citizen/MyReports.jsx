import React, { useState } from 'react';
import { Search, Filter, ArrowRight, MapPin, Calendar, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MyReports = () => {
  const { complaints, setSelectedComplaintId, setActiveTab } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = complaints.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleTrackClick = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('tracking');
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">My Reported Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            View history of all submitted civic reports, AI priority scores, and live status progress.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('report-issue')}
          className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow self-start md:self-auto"
        >
          + Report New Problem
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, issue, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
              <th className="p-4">Complaint ID</th>
              <th className="p-4">Issue Photo & Category</th>
              <th className="p-4">Location</th>
              <th className="p-4">AI Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date Reported</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-xs font-medium">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No complaints match your search criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isHigh = item.priorityScore >= 70;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-mono font-bold text-sky-700">{item.id}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.category} className="w-12 h-10 rounded-lg object-cover bg-slate-200 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">{item.category}</div>
                          <div className="text-[11px] text-slate-400">Conf: {item.confidence}%</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{item.location}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isHigh ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {item.priorityScore} / 100 ({isHigh ? 'High' : 'Med'})
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        item.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.status === 'In Progress'
                          ? 'bg-sky-100 text-sky-800 border-sky-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{item.createdDate}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleTrackClick(item.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] inline-flex items-center gap-1 transition"
                      >
                        Track <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => handleTrackClick(item.id)}
            className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-sky-700 text-xs">{item.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-sky-100 text-sky-800 border-sky-300'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <img src={item.imageUrl} alt={item.category} className="w-16 h-14 rounded-xl object-cover bg-slate-200 shrink-0" />
              <div>
                <h4 className="font-bold text-sm text-slate-900">{item.category}</h4>
                <p className="text-xs text-slate-500">{item.location}</p>
                <div className="text-[11px] font-bold text-rose-600 mt-1">Priority: {item.priorityScore}/100</div>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
