import React, { useState } from 'react';
import { Play, ChevronRight, ChevronLeft, CheckCircle2, RefreshCw, X, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoGuideWidget = () => {
  const [minimized, setMinimized] = useState(false);
  const {
    demoActive, setDemoActive,
    demoStep, setDemoStep,
    setRole, setActiveTab,
    setSelectedComplaintId,
    submitNewComplaint,
    assignIssue,
    updateStatus,
    resolveComplaint
  } = useApp();

  const DEMO_STEPS = [
    {
      title: "1. Open CivicEye AI Platform",
      role: "citizen",
      tab: "landing",
      instruction: "Welcome to CivicEye AI! Click 'Start Demo Flow' or navigate to 'Report Issue'."
    },
    {
      title: "2. Citizen: Report an Issue",
      role: "citizen",
      tab: "report-issue",
      instruction: "Selecting Pothole image sample preset & Main Road location."
    },
    {
      title: "3. Run AI Issue Analysis",
      role: "citizen",
      tab: "report-issue",
      instruction: "Click 'Analyze & Submit' to trigger multi-stage AI analysis animation."
    },
    {
      title: "4. View AI Analysis Results",
      role: "citizen",
      tab: "report-issue",
      instruction: "Review 94% Confidence, HIGH Severity, 3 Duplicate Reports & Priority Score (87/100)."
    },
    {
      title: "5. Submit Complaint to City System",
      role: "citizen",
      tab: "my-reports",
      action: () => {
        submitNewComplaint({
          category: 'Pothole',
          imageUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
          location: 'Main Road, Near Bus Stop',
          description: 'Large deep pothole causing severe traffic congestion.',
          severity: 'High',
          confidence: 94,
          duplicateCount: 3,
          publicImpact: 'High'
        });
        setActiveTab('my-reports');
      },
      instruction: "Generated Complaint ID: CE-2026-00124 (Status: Submitted)."
    },
    {
      title: "6. Citizen: Open Complaint Tracking",
      role: "citizen",
      tab: "tracking",
      action: () => {
        setSelectedComplaintId('CE-2026-00124');
        setActiveTab('tracking');
      },
      instruction: "Inspect interactive progress timeline & status log."
    },
    {
      title: "7. Switch to Authority Dashboard",
      role: "authority",
      tab: "authority-dashboard",
      action: () => {
        setRole('authority');
        setActiveTab('authority-dashboard');
      },
      instruction: "Authority sees city KPI stats & urgent high-priority issue alerts."
    },
    {
      title: "8. Authority: Issue Management",
      role: "authority",
      tab: "issue-management",
      instruction: "Locate complaint CE-2026-00124 in issue management table."
    },
    {
      title: "9. Inspect Priority Math Breakdown",
      role: "authority",
      tab: "issue-management",
      action: () => {
        setSelectedComplaintId('CE-2026-00124');
      },
      instruction: "View 100-point formula score breakdown (Severity 35 + Reports 20 + Impact 18 + Location 14 = 87/100)."
    },
    {
      title: "10. Assign Road Maintenance Dept",
      role: "authority",
      tab: "issue-management",
      action: () => {
        assignIssue('CE-2026-00124', 'Road Maintenance', 'Alex Miller');
      },
      instruction: "Issue assigned to Road Maintenance & Worker Alex Miller."
    },
    {
      title: "11. Change Status to In Progress",
      role: "authority",
      tab: "issue-management",
      action: () => {
        updateStatus('CE-2026-00124', 'In Progress');
      },
      instruction: "Status updated to IN PROGRESS. Real-time notification sent to citizen."
    },
    {
      title: "12. Switch Back to Citizen View",
      role: "citizen",
      tab: "tracking",
      action: () => {
        setRole('citizen');
        setSelectedComplaintId('CE-2026-00124');
        setActiveTab('tracking');
      },
      instruction: "Citizen sees updated status 'In Progress' & notification in drawer!"
    },
    {
      title: "13. Field Worker Uploads Resolution Photo",
      role: "authority",
      tab: "issue-management",
      action: () => {
        setRole('authority');
        resolveComplaint('CE-2026-00124', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80');
      },
      instruction: "Uploaded after-fix photo & marked status as RESOLVED!"
    },
    {
      title: "14. Citizen Verifies Resolution Evidence",
      role: "citizen",
      tab: "tracking",
      action: () => {
        setRole('citizen');
        setSelectedComplaintId('CE-2026-00124');
        setActiveTab('tracking');
      },
      instruction: "Citizen sees 'RESOLVED' badge & side-by-side Before vs After photo evidence!"
    }
  ];

  const current = DEMO_STEPS[demoStep] || DEMO_STEPS[0];

  const handleNext = () => {
    if (demoStep < DEMO_STEPS.length - 1) {
      const nextIdx = demoStep + 1;
      setDemoStep(nextIdx);
      const nextStep = DEMO_STEPS[nextIdx];
      if (nextStep.role) setRole(nextStep.role);
      if (nextStep.tab) setActiveTab(nextStep.tab);
      if (nextStep.action) nextStep.action();
    }
  };

  const handlePrev = () => {
    if (demoStep > 0) {
      const prevIdx = demoStep - 1;
      setDemoStep(prevIdx);
      const prevStep = DEMO_STEPS[prevIdx];
      if (prevStep.role) setRole(prevStep.role);
      if (prevStep.tab) setActiveTab(prevStep.tab);
    }
  };

  const handleStartDemo = () => {
    setDemoActive(true);
    setDemoStep(0);
    setRole('citizen');
    setActiveTab('landing');
  };

  if (!demoActive) {
    return (
      <button
        onClick={handleStartDemo}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-sky-400/30 group animate-pulse-slow transition"
      >
        <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition transform" />
        <span>Interactive Demo Tour (14 Steps)</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 w-80 md:w-96 glass-dark text-white rounded-2xl p-4 shadow-2xl border border-sky-500/30 backdrop-blur-md animate-fade-in">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400">Demo Tour Controller</h4>
          <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-mono border border-sky-400/20">
            {demoStep + 1} / {DEMO_STEPS.length}
          </span>
        </div>
        <button
          onClick={() => setDemoActive(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <h3 className="font-bold text-sm text-white">{current.title}</h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-800/80 p-2.5 rounded-xl border border-slate-700/50">
          💡 {current.instruction}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={handlePrev}
          disabled={demoStep === 0}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold flex items-center gap-1 border border-slate-700"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <span className="text-[11px] text-slate-400 font-mono">
          Role: <strong className="text-sky-300 uppercase">{current.role}</strong>
        </span>

        {demoStep === DEMO_STEPS.length - 1 ? (
          <button
            onClick={() => { setDemoActive(false); setDemoStep(0); }}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow"
          >
            <CheckCircle2 className="w-4 h-4" /> Finish
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1 shadow-lg shadow-sky-500/30"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
