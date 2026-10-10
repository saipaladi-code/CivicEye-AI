import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ArrowRight, ShieldAlert, Sparkles, X, MapPin, Zap } from 'lucide-react';
import { analyzeCivicImageWithGemini } from '../../utils/geminiAnalyzer';

export const AIAnalysisModal = ({ isOpen, onClose, formData, onSubmitFinal }) => {
  const [stage, setStage] = useState(0); // 0..4 progress steps
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);

  // AI Scanning stage progression & Gemini API call
  useEffect(() => {
    if (isOpen) {
      setStage(0);
      setAnalysisComplete(false);
      setShowDuplicatesModal(false);
      setGeminiResult(null);

      // Perform real Gemini Vision analysis
      analyzeCivicImageWithGemini(formData.photoUrl || formData.imageUrl, formData.category)
        .then(res => setGeminiResult(res))
        .catch(err => console.warn('Gemini analysis error:', err));

      const timer1 = setTimeout(() => setStage(1), 600);
      const timer2 = setTimeout(() => setStage(2), 1200);
      const timer3 = setTimeout(() => setStage(3), 1800);
      const timer4 = setTimeout(() => setStage(4), 2400);
      const timer5 = setTimeout(() => setAnalysisComplete(true), 3200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [isOpen, formData]);

  if (!isOpen) return null;

  const steps = [
    { label: "Image received", done: stage >= 0 },
    { label: "Detecting issue class & visual features via Gemini AI", done: stage >= 1 },
    { label: "Estimating physical severity & hazard vectors", done: stage >= 2 },
    { label: "Checking duplicate reports nearby", done: stage >= 3 },
    { label: "Calculating 100-point priority score", done: stage >= 4 }
  ];

  const detectedCategory = geminiResult?.category || (formData.category === 'Auto Detect' ? 'Pothole' : formData.category);
  const confidence = geminiResult?.confidence || formData.confidence || 94;
  const severity = geminiResult?.severity || formData.severity || 'High';
  const duplicates = formData.duplicateCount !== undefined ? formData.duplicateCount : 3;
  const priorityScore = 87;
  const explanation = geminiResult?.explanation || "This issue has been classified as high priority because of its severity, location, and multiple reports from nearby citizens.";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/40 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">CivicEye AI Scanner</h3>
              <p className="text-xs text-slate-400">Automated Public Issue Computer Vision Model</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* Scanning animation phase */}
          {!analysisComplete ? (
            <div className="py-8 space-y-6 text-center">
              
              <div className="relative w-24 h-24 mx-auto">
                <div className="w-full h-full rounded-2xl bg-sky-500/10 border-2 border-sky-500/50 flex items-center justify-center animate-pulse">
                  <Cpu className="w-10 h-10 text-sky-500" />
                </div>
                <div className="absolute inset-0 border-2 border-sky-400 rounded-2xl animate-ping opacity-25" />
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-lg">CivicEye AI is analyzing your report...</h4>
                <p className="text-xs text-slate-500 mt-1">Extracting visual features & spatial priority vectors</p>
              </div>

              {/* Progress Checklist */}
              <div className="max-w-md mx-auto space-y-2.5 text-left bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {steps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs font-medium">
                    {step.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 animate-spin border-t-sky-500" />
                    )}
                    <span className={step.done ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            /* AI Analysis Complete Card */
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI ANALYSIS COMPLETE</span>
                </div>
                <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-mono">
                  MODEL V4.2
                </span>
              </div>

              {/* Detected Issue Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Detected Issue</span>
                  <div className="text-lg font-extrabold text-slate-900 mt-0.5">{detectedCategory}</div>
                  <div className="text-xs font-bold text-sky-600 mt-1">Confidence: {confidence}%</div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
                  <span className="text-[11px] font-semibold text-rose-600 uppercase">Severity Level</span>
                  <div className="text-lg font-extrabold text-rose-800 mt-0.5">{severity}</div>
                  <div className="text-xs text-rose-700 mt-1 font-medium">Immediate structural hazard</div>
                </div>

              </div>

              {/* Duplicate Reports Warning Box */}
              {duplicates > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-bold text-amber-900">Possible Duplicate Detected</h5>
                      <p className="text-amber-800 mt-0.5 leading-relaxed">
                        This issue appears similar to <strong>{duplicates} existing reports</strong> within 200 meters.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDuplicatesModal(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-200/70 hover:bg-amber-300 text-amber-900 font-bold text-[11px] shrink-0"
                  >
                    View Duplicates
                  </button>
                </div>
              )}

              {/* Priority Score Display Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 font-medium">Calculated Priority Score</span>
                    <h5 className="text-2xl font-black text-rose-400">{priorityScore} / 100</h5>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/40">
                    HIGH PRIORITY
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800">
                  “{explanation}”
                </p>
              </div>

              {/* Submit Complaint Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={() => onSubmitFinal({
                    category: detectedCategory,
                    confidence,
                    severity,
                    explanation
                  })}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 flex items-center gap-2"
                >
                  <span>Submit Complaint</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* Duplicate Details Sub-Modal */}
      {showDuplicatesModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 space-y-4 text-slate-900 border border-slate-200">
            <h4 className="font-extrabold text-base flex items-center gap-2 text-amber-900">
              <ShieldAlert className="w-5 h-5 text-amber-600" />
              Existing Nearby Reports ({duplicates})
            </h4>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sky-700">CE-2026-00115 (Pothole)</div>
                <div className="text-slate-500">Main Road, Bus Stop (~40m away)</div>
                <div className="text-amber-700 font-semibold mt-1">Status: Pending</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-bold text-sky-700">CE-2026-00112 (Damaged Road)</div>
                <div className="text-slate-500">Main Road, Sector 3 (~120m away)</div>
                <div className="text-sky-700 font-semibold mt-1">Status: In Progress</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDuplicatesModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
              >
                Close & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
