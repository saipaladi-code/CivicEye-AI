import React from 'react';
import { BarChart2, PieChart, TrendingUp, MapPin, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AuthorityAnalytics = () => {
  const { complaints } = useApp();
  const chartDenominator = Math.max(complaints.length, 1);

  // Compute category breakdown
  const categoryCounts = {
    Pothole: complaints.filter(c => c.category === 'Pothole').length,
    Garbage: complaints.filter(c => c.category === 'Garbage').length,
    Streetlight: complaints.filter(c => c.category === 'Broken Streetlight' || c.category === 'Streetlight').length,
    Water: complaints.filter(c => c.category === 'Water Leakage').length,
    Drainage: complaints.filter(c => c.category === 'Drainage').length
  };

  const statusCounts = {
    Pending: complaints.filter(c => c.status === 'Pending' || c.status === 'Submitted').length,
    InProgress: complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length,
    Resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  const hotSpots = Object.values(complaints.reduce((areas, complaint) => {
    const area = complaint.location.split(',')[0].trim() || 'Unspecified location';
    if (!areas[area]) areas[area] = { area, count: 0, categories: {} };
    areas[area].count += 1;
    areas[area].categories[complaint.category] = (areas[area].categories[complaint.category] || 0) + 1;
    return areas;
  }, {}))
    .map((area) => ({
      ...area,
      topIssue: Object.entries(area.categories).sort((first, second) => second[1] - first[1])[0]?.[0] || 'No reports',
      risk: area.count >= 5 ? 'HIGH' : area.count >= 2 ? 'MEDIUM' : 'LOW'
    }))
    .sort((first, second) => second.count - first.count)
    .slice(0, 4);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Analytics Header */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BarChart2 className="w-4 h-4" />
            Civic Intelligence Analytics
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Municipal Data & Hotspot Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            AI-driven spatial distribution, severity trends, and recurring problem zone analytics.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-slate-900 text-white text-xs font-mono font-bold self-start md:self-auto shadow">
          Live complaint data
        </div>
      </div>

      {/* Visual KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Category Breakdown Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
            <span>Issues by Category</span>
            <PieChart className="w-4 h-4 text-sky-600" />
          </h3>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700">Potholes</span>
                <span className="text-sky-700 font-bold">{categoryCounts.Pothole}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${(categoryCounts.Pothole / chartDenominator) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700">Garbage Overflow</span>
                <span className="text-amber-700 font-bold">{categoryCounts.Garbage}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(categoryCounts.Garbage / chartDenominator) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700">Broken Streetlights</span>
                <span className="text-indigo-700 font-bold">{categoryCounts.Streetlight}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(categoryCounts.Streetlight / chartDenominator) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700">Water & Drainage</span>
                <span className="text-cyan-700 font-bold">{categoryCounts.Water + categoryCounts.Drainage}</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${((categoryCounts.Water + categoryCounts.Drainage) / chartDenominator) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Status Distribution Card */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
            <span>Status Distribution</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </h3>

          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-amber-700 uppercase">Pending Review</div>
                <div className="text-xl font-black text-amber-900">{statusCounts.Pending}</div>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-200/60 px-2.5 py-1 rounded-full">
                {Math.round((statusCounts.Pending / chartDenominator) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-sky-700 uppercase">Active In Progress</div>
                <div className="text-xl font-black text-sky-900">{statusCounts.InProgress}</div>
              </div>
              <span className="text-xs font-bold text-sky-800 bg-sky-200/60 px-2.5 py-1 rounded-full">
                {Math.round((statusCounts.InProgress / chartDenominator) * 100)}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Fully Resolved</div>
                <div className="text-xl font-black text-emerald-900">{statusCounts.Resolved}</div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-200/60 px-2.5 py-1 rounded-full">
                {Math.round((statusCounts.Resolved / chartDenominator) * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* Resolution Efficiency Metric */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase">
            <Sparkles className="w-4 h-4" /> Resolution Overview
          </div>

          <div className="space-y-1">
            <div className="text-4xl font-black text-white">
              {complaints.length ? `${Math.round((statusCounts.Resolved / complaints.length) * 100)}%` : '—'}
            </div>
            <p className="text-xs text-slate-400">Share of CivicEye complaints resolved to date.</p>
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total reports:</span>
              <span className="font-bold text-sky-400">{complaints.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Assigned or in progress:</span>
              <span className="font-bold text-emerald-400">{statusCounts.InProgress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Reports with similar issues:</span>
              <span className="font-bold text-amber-400">{complaints.filter((complaint) => complaint.duplicateCount > 0).length}</span>
            </div>
          </div>
        </div>

      </div>

      {/* RECURRING PROBLEM AREAS HOTSPOT TABLE */}
      <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Recurring Problem Area Hotspots</h2>
          <p className="text-xs text-slate-500">Geospatial zones with high frequency civic infrastructure complaints.</p>
        </div>

        {hotSpots.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Hotspots will appear here as reports are submitted.
          </p>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hotSpots.map((hs) => (
            <div key={hs.area} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-600" />
                  <h4 className="font-extrabold text-sm text-slate-900">{hs.area}</h4>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  hs.risk === 'HIGH' ? 'bg-rose-100 text-rose-800 border border-rose-300' : hs.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}>
                  {hs.risk} RECURRENCE RISK
                </span>
              </div>

              <div className="text-xs text-slate-600">
                Frequent Issues: <strong className="text-slate-900">{hs.topIssue}</strong>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-400">Cumulative Reports:</span>
                <span className="font-extrabold text-sky-700">{hs.count} Logged</span>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

    </div>
  );
};
