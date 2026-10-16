import React, { useState } from 'react';
import { Camera, MapPin, Upload, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MOCK_PRESET_SAMPLES, MOCK_IMAGES } from '../../data/mockData';
import { AIAnalysisModal } from './AIAnalysisModal';
import { getCurrentLocation } from '../../utils/geolocation';

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

export const ReportIssue = () => {
  const {
    submitNewComplaint, setActiveTab, setSelectedComplaintId, showToast,
    setCurrentLocation
  } = useApp();

  const [selectedPreset, setSelectedPreset] = useState(MOCK_PRESET_SAMPLES[0]);
  const [photoUrl, setPhotoUrl] = useState(MOCK_PRESET_SAMPLES[0].imageUrl);
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [category, setCategory] = useState('Auto Detect');
  const [location, setLocation] = useState('Main Road, Near Bus Stop');
  const [coordinates, setCoordinates] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [description, setDescription] = useState('Large deep pothole causing severe difficulty for two-wheelers and cars during evening traffic.');
  
  const [showAIModal, setShowAIModal] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const categories = [
    'Auto Detect',
    'Pothole',
    'Garbage',
    'Broken Streetlight',
    'Water Leakage',
    'Drainage',
    'Damaged Road',
    'Other'
  ];

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setPhotoUrl(preset.imageUrl);
    setCategory(preset.category);
    setLocation(preset.defaultLocation);
    setCoordinates(null);
    setDescription(preset.defaultDesc);
  };

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Choose a supported image file.', 'error');
      return;
    }
    if (file.size < 1 || file.size > MAX_PHOTO_SIZE_BYTES) {
      showToast('Choose an image that is no larger than 5 MB.', 'error');
      return;
    }

    setIsPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        setIsPhotoLoading(false);
        showToast('The selected photo could not be read. Please try another image.', 'error');
        return;
      }
      setPhotoUrl(reader.result);
      setSelectedPreset({ name: 'Custom Upload', category: 'Auto Detect' });
      setIsPhotoLoading(false);
      showToast('Custom photo uploaded successfully!');
    };
    reader.onerror = () => {
      setIsPhotoLoading(false);
      showToast('The selected photo could not be read. Please try another image.', 'error');
    };
    reader.readAsDataURL(file);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const position = await getCurrentLocation();
      setCoordinates(position);
      setCurrentLocation(position);
      setLocation(`Current location (${position.lat.toFixed(6)}, ${position.lng.toFixed(6)})`);
      showToast('Your current location has been added to the report.');
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAnalyzeClick = (e) => {
    e.preventDefault();
    if (isPhotoLoading) {
      showToast('Please wait for the photo to finish loading.', 'error');
      return;
    }
    if (!coordinates) {
      showToast('Use Current Location to add accurate map coordinates before continuing.', 'error');
      return;
    }
    setShowAIModal(true);
  };

  const handleFinalSubmit = async (geminiData = {}) => {
    setShowAIModal(false);
    
    const finalCategory = geminiData.category || (category === 'Auto Detect' ? selectedPreset.category : category);

    try {
      const newComp = await submitNewComplaint({
        category: finalCategory,
        imageUrl: photoUrl,
        resolutionImageUrl: selectedPreset.resolutionImageUrl || MOCK_IMAGES.pothole_after,
        location,
        description: geminiData.explanation ? `${description} (${geminiData.explanation})` : description,
        severity: geminiData.severity || selectedPreset.severity || 'High',
        confidence: geminiData.confidence || selectedPreset.confidence || 94,
        publicImpact: selectedPreset.publicImpact || 'High',
        coordinates
      });
      setSubmittedComplaint(newComp);
    } catch (error) {
      showToast(error.message || 'We could not save your complaint. Please try again.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Report a Civic Problem</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload a photo of the infrastructure issue. CivicEye AI will automatically classify, check duplicates, and score priority.
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 text-xs font-bold border border-sky-200 flex items-center gap-1.5 self-start md:self-auto">
          <Sparkles className="w-4 h-4 text-sky-500" />
          AI Auto-Detection Active
        </div>
      </div>

      {/* Main Form or Success Card */}
      {!submittedComplaint ? (
        <form onSubmit={handleAnalyzeClick} className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          
          {/* Photo Upload & Preset Selector Bar */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Issue Photo (Upload Custom Photo or Choose Sample)
              </label>

              {/* Dedicated Upload Button */}
              <label
                htmlFor="main-file-upload-input"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center justify-center gap-2 transition shrink-0"
              >
                <Upload className="w-4 h-4" /> Upload Photo from Device
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="main-file-upload-input"
              />
            </div>

            {/* Demo Sample Presets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">Or select a demo sample:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {MOCK_PRESET_SAMPLES.map((preset, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-xl border text-left transition ${
                      selectedPreset.name === preset.name
                        ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/50'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-200 mb-1.5">
                      <img
                        src={preset.imageUrl}
                        alt={preset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = MOCK_IMAGES.pothole_before;
                        }}
                      />
                    </div>
                    <div className="text-[11px] font-bold text-slate-900 truncate">{preset.name}</div>
                    <div className="text-[10px] text-sky-600 font-semibold">{preset.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Preview & Interactive Dropzone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Selected Photo Preview
              </label>
              <label
                htmlFor="main-file-upload-input-2"
                className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Upload Different File
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="main-file-upload-input-2"
              />
            </div>

            <label
              htmlFor="main-file-upload-input-3"
              className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-sky-400/60 hover:border-sky-500 flex items-center justify-center cursor-pointer group shadow-sm transition"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="main-file-upload-input-3"
              />

              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Selected Civic Issue"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = MOCK_IMAGES.pothole_before;
                  }}
                />
              ) : (
                <div className="text-center p-6 text-slate-300">
                  <Camera className="w-12 h-12 mx-auto text-sky-400 mb-2" />
                  <p className="text-sm font-bold">Click here to upload photo from your computer/device</p>
                  <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
              )}

              {/* Always visible overlay button on hover or touch */}
              <div className="absolute bottom-3 right-3 bg-slate-900/90 hover:bg-slate-950 text-white px-4 py-2 rounded-xl text-xs font-bold border border-slate-700 shadow-lg flex items-center gap-2">
                <Upload className="w-4 h-4 text-sky-400" /> Click to Change Photo
              </div>
            </label>
          </div>

          {/* Category Dropdown & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                2. Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-semibold bg-white"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  3. Location
                </label>
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={isLocating}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 disabled:cursor-wait disabled:opacity-60"
                >
                  <MapPin className="w-3.5 h-3.5" /> {isLocating ? 'Finding Location...' : 'Use Current Location'}
                </button>
              </div>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setCoordinates(null);
                }}
                required
                placeholder="e.g. Main Road, Near Bus Stop"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-medium"
              />
              <p className="text-[11px] text-slate-500">
                {coordinates
                  ? 'GPS coordinates will be saved with this report.'
                  : 'Allow location access and use Current Location to place this report accurately on the map.'}
              </p>
            </div>

          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              4. Problem Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the condition, safety risk, or urgency..."
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-medium"
            />
          </div>

          {/* Analyze & Submit Action Button */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              type="submit"
              disabled={isPhotoLoading}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-extrabold text-sm shadow-xl shadow-sky-600/30 flex items-center gap-3 transition transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              {isPhotoLoading ? 'Preparing Photo...' : 'Analyze & Submit Complaint'}
            </button>
          </div>

        </form>
      ) : (
        /* SUCCESS CONFIRMATION SCREEN */
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">Complaint Successfully Submitted!</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Your report has been logged, scored by CivicEye AI, and routed to municipal authorities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 max-w-sm mx-auto text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400">Complaint ID:</span>
              <span className="font-extrabold text-sky-700">{submittedComplaint.id}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-slate-800">{submittedComplaint.category}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-400">Priority Score:</span>
              <span className="font-extrabold text-rose-600">{submittedComplaint.priorityScore}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-amber-600 uppercase">{submittedComplaint.status}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                setSelectedComplaintId(submittedComplaint.id);
                setActiveTab('tracking');
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2"
            >
              Track Complaint Timeline <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setSubmittedComplaint(null)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
            >
              Report Another Issue
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Multi-stage Processing Modal */}
      <AIAnalysisModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        formData={{
          category,
          location,
          description,
          confidence: selectedPreset.confidence,
          severity: selectedPreset.severity,
          duplicateCount: selectedPreset.duplicates,
          publicImpact: selectedPreset.publicImpact
        }}
        onSubmitFinal={handleFinalSubmit}
      />

    </div>
  );
};
