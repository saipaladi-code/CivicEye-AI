import React, { useState } from 'react';
import { FileText, Clock, AlertCircle, CheckCircle2, MapPin, ArrowRight, PlusCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InteractiveMap } from '../common/InteractiveMap';
import { getCurrentLocation } from '../../utils/geolocation';

export const CitizenDashboard = () => {
  const {
    complaints, setActiveTab, setSelectedComplaintId,
    currentLocation, setCurrentLocation, showToast
  } = useApp();
  const [isLocating, setIsLocating] = useState(false);

  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending' || c.status === 'Submitted').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  const handleSelectComplaint = (id) => {
    setSelectedComplaintId(id);
    setActiveTab('tracking');
  };

  const handleLocateMe = async () => {
    setIsLocating(true);
    try {
      setCurrentLocation(await getCurrentLocation());
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Citizen Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Track civic issues, report new problems, and view resolution progress across your city.</p>
        </div>
        <button
          onClick={() => setActiveTab('report-issue')}
          className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 shrink-0 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Report New Issue
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Reports</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-400 font-medium">Logged in CivicEye</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-amber-200/80 bg-amber-50/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Pending</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-800">{pending}</div>
          <div className="text-[11px] text-amber-600 font-medium">Awaiting assignment</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-sky-200/80 bg-sky-50/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700">In Progress</span>
            <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-sky-800">{inProgress}</div>
          <div className="text-[11px] text-sky-600 font-medium">Work crews active</div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 bg-emerald-50/20 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Resolved</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-800">{resolved}</div>
          <div className="text-[11px] text-emerald-600 font-medium">Verified fixed</div>
        </div>

      </div>

      {/* Interactive Map Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">City Issue Map</h2>
            <p className="text-xs text-slate-500">Live spatial view of reported issues and AI priority markers.</p>
          </div>
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="text-xs font-semibold text-sky-700 bg-sky-50 px-3 py-2 rounded-full border border-sky-200 hover:bg-sky-100 disabled:cursor-wait disabled:opacity-60"
          >
            {isLocating ? 'Finding Location...' : currentLocation ? 'Refresh My Location' : 'Show My Location'}
          </button>
        </div>

        <InteractiveMap
          complaints={complaints}
          onSelectComplaint={handleSelectComplaint}
          currentLocation={currentLocation}
          height="360px"
        />
      </div>

      {/* Recent Reports List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Recent Reports</h2>
          <button
            onClick={() => setActiveTab('my-reports')}
            className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1"
          >
            View All Reports <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {complaints.slice(0, 3).map((item) => {
            const isHigh = item.priorityScore >= 70;
            return (
              <div
                key={item.id}
                onClick={() => handleSelectComplaint(item.id)}
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 hover:bg-white transition cursor-pointer space-y-3 group shadow-sm"
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 relative">
                  <img src={item.imageUrl} alt={item.category} className="w-full h-full object-cover group-hover:scale-105 transition" />
                  <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow border ${
                    item.status === 'Resolved'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : item.status === 'In Progress'
                      ? 'bg-sky-500 text-white border-sky-400'
                      : 'bg-amber-500 text-white border-amber-400'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-sky-700">{item.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      isHigh ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      Priority: {item.priorityScore}/100
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 truncate">{item.category} - {item.location}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
