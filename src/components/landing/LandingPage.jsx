import React from 'react';
import { Camera, Cpu, Layers, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, MapPin, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const LandingPage = () => {
  const { setActiveTab } = useApp();

  return (
    <div className="space-y-16 pb-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 rounded-3xl mt-4 border border-slate-800 shadow-2xl">
        {/* Background Accent Gradients */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart City Artificial Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              CivicEye AI <br />
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Intelligent Public Issue Detection & Resolution
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              AI-powered civic reporting that helps citizens report problems and helps authorities resolve them faster.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => setActiveTab('auth-signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-extrabold text-base shadow-xl shadow-sky-500/25 flex items-center justify-center gap-3 transition transform hover:-translate-y-0.5"
              >
                <Camera className="w-5 h-5" />
                Create a Citizen Account
              </button>

              <button
                onClick={() => setActiveTab('auth-authority')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base border border-slate-700 flex items-center justify-center gap-3 transition"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                Authority Sign In
              </button>
            </div>
          </div>

          {/* Right Visual Graphic (Smart City AI Scanner) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-sky-500/30 bg-slate-950/80 shadow-2xl p-4">
              
              {/* City Mock Illustration */}
              <div className="relative h-80 rounded-2xl overflow-hidden bg-cover bg-center" style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80')`
              }}>
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />

                {/* AI Laser Scanner Beam */}
                <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-laser shadow-[0_0_15px_#38bdf8]" />

                {/* AI Target Overlay Boxes */}
                <div className="absolute top-12 left-10 p-2 rounded-xl bg-slate-900/90 border border-rose-500/80 shadow-xl text-left animate-pulse">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                    DETECTED: POTHOLE (94%)
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">Priority: 87/100 (HIGH)</div>
                </div>

                <div className="absolute bottom-16 right-8 p-2 rounded-xl bg-slate-900/90 border border-amber-500/80 shadow-xl text-left">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    GARBAGE OVERFLOW (91%)
                  </div>
                  <div className="text-[10px] text-slate-300 font-mono">5 Duplicate Reports</div>
                </div>
              </div>

              {/* Bottom Live Metrics Strip */}
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-extrabold text-sky-400 text-sm">94.2%</div>
                  <div className="text-[10px] text-slate-400">AI Accuracy</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-extrabold text-emerald-400 text-sm">&lt; 24h</div>
                  <div className="text-[10px] text-slate-400">Avg Resolution</div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="font-extrabold text-amber-400 text-sm">1,248</div>
                  <div className="text-[10px] text-slate-400">Issues Resolved</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 4 FEATURE CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">Core Capabilities</h2>
          <h3 className="text-3xl font-extrabold text-slate-900">Built for Modern Smart Governance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">AI Issue Detection</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated computer vision classifies photos of potholes, garbage, streetlights, and drainage issues instantly with high confidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Cpu className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">Smart Prioritization</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Transparent 100-point priority engine calculates urgency based on severity, location factors, public impact, and duplicate report frequency.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">Duplicate Detection</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Smart geospatial grouping merges multiple citizen complaints for the same issue within 200m to eliminate redundant work orders.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-lg text-slate-900">Transparent Tracking</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              End-to-end timeline visibility for citizens with verified before and after photo evidence uploaded by field workers upon completion.
            </p>
          </div>

        </div>
      </section>

      {/* HOW CIVICEYE WORKS (5 STAGES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-10">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold">How CivicEye Works</h3>
            <p className="text-sm text-slate-400">
              5 seamless steps from citizen complaint to verified field resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-sky-500 text-slate-950 font-black text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="font-bold text-sm text-white">Report</h4>
              <p className="text-[11px] text-slate-400">Citizen uploads photo and pin location.</p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-cyan-400 text-slate-950 font-black text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="font-bold text-sm text-white">AI Analyze</h4>
              <p className="text-[11px] text-slate-400">Vision model detects category & severity.</p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="font-bold text-sm text-white">Prioritize</h4>
              <p className="text-[11px] text-slate-400">Engine scores urgency 0 to 100.</p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-indigo-400 text-slate-950 font-black text-sm flex items-center justify-center">
                4
              </div>
              <h4 className="font-bold text-sm text-white">Assign</h4>
              <p className="text-[11px] text-slate-400">Desk dispatches department worker.</p>
            </div>

            {/* Step 5 */}
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center">
                5
              </div>
              <h4 className="font-bold text-sm text-white">Resolve</h4>
              <p className="text-[11px] text-slate-400">After photo verified & citizen notified.</p>
            </div>

          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setActiveTab('auth-signup')}
              className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-bold text-sm hover:underline"
            >
              <span>Create an account to get started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};
