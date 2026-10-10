import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_COMPLAINTS, MOCK_NOTIFICATIONS } from '../data/mockData';
import { calculatePriorityScore } from '../utils/priorityEngine';
import { checkForDuplicates } from '../utils/duplicateChecker';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Saved state from LocalStorage if present
  const [role, setRole] = useState(() => localStorage.getItem('civiceye_role') || 'citizen');
  const [activeTab, setActiveTab] = useState('landing'); // landing, citizen-dashboard, report-issue, my-reports, tracking, authority-dashboard, issue-management, authority-analytics
  const [complaints, setComplaints] = useState(() => {
    const saved = localStorage.getItem('civiceye_complaints');
    return saved ? JSON.parse(saved) : INITIAL_COMPLAINTS;
  });
  const [selectedComplaintId, setSelectedComplaintId] = useState('CE-2026-00124');
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [toast, setToast] = useState(null);
  
  // Interactive Demo Tour Controller state
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('civiceye_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('civiceye_complaints', JSON.stringify(complaints));
  }, [complaints]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Add new complaint (Citizen action)
  const submitNewComplaint = (formData) => {
    const newId = `CE-2026-00${125 + complaints.length + 1}`;
    
    // Perform AI calculations
    const dupCheck = checkForDuplicates(formData.category, formData.location, complaints);
    const dupCount = formData.duplicateCount !== undefined ? formData.duplicateCount : dupCheck.count;
    
    const priorityCalc = calculatePriorityScore({
      severity: formData.severity || 'High',
      duplicateCount: dupCount,
      publicImpact: formData.publicImpact || 'High',
      isHighTraffic: true
    });

    const nowStr = new Date().toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const newComplaint = {
      id: newId,
      citizenName: formData.citizenName || 'User Citizen',
      category: formData.category === 'Auto Detect' ? 'Pothole' : formData.category,
      imageUrl: formData.imageUrl,
      resolutionImageUrl: formData.resolutionImageUrl || null,
      location: formData.location || 'Main Road, Near Bus Stop',
      coordinates: formData.coordinates || { lat: 12.9716, lng: 77.5946 },
      description: formData.description || 'Civic infrastructure issue reported via CivicEye AI citizen app.',
      severity: formData.severity || 'High',
      confidence: formData.confidence || 94,
      duplicateCount: dupCount,
      priorityScore: priorityCalc.total,
      status: 'Submitted',
      department: 'Road Maintenance',
      worker: 'Unassigned',
      createdDate: nowStr,
      expectedResolution: '2026-09-24',
      resolvedDate: null,
      publicImpact: formData.publicImpact || 'High',
      isHighTraffic: true,
      breakdown: priorityCalc.breakdown,
      timeline: [
        { step: 'Report Submitted', status: 'completed', timestamp: nowStr, note: 'Complaint created' },
        { step: 'AI Verified', status: 'completed', timestamp: nowStr, note: `Detected: ${formData.category} (${formData.confidence || 94}%)` },
        { step: 'Priority Generated', status: 'completed', timestamp: nowStr, note: `Score: ${priorityCalc.total}/100 (${priorityCalc.level})` },
        { step: 'Assigned', status: 'upcoming', timestamp: '-', note: 'Pending department dispatch' },
        { step: 'In Progress', status: 'upcoming', timestamp: '-', note: '-' },
        { step: 'Resolved', status: 'upcoming', timestamp: '-', note: '-' }
      ]
    };

    setComplaints(prev => [newComplaint, ...prev]);
    setSelectedComplaintId(newId);

    // Add notification
    const newNotif = {
      id: `n-${Date.now()}`,
      title: 'Complaint Submitted',
      message: `Your complaint ${newId} has been logged & scored by AI (${priorityCalc.total}/100).`,
      time: 'Just now',
      read: false,
      complaintId: newId
    };
    setNotifications(prev => [newNotif, ...prev]);

    return newComplaint;
  };

  // Assign Issue (Authority action)
  const assignIssue = (id, department, worker) => {
    setComplaints(prev => prev.map(item => {
      if (item.id === id) {
        const nowStr = new Date().toLocaleString();
        const updatedTimeline = item.timeline.map(t => {
          if (t.step.includes('Assigned') || t.step === 'Assigned') {
            return { ...t, status: 'completed', timestamp: nowStr, note: `Assigned to ${department} (${worker})` };
          }
          if (t.step === 'In Progress') {
            return { ...t, status: 'current', timestamp: nowStr, note: 'Work crew assigned' };
          }
          return t;
        });

        return {
          ...item,
          status: 'Assigned',
          department,
          worker,
          timeline: updatedTimeline
        };
      }
      return item;
    }));

    // Notification to citizen
    const newNotif = {
      id: `n-${Date.now()}`,
      title: 'Complaint Assigned',
      message: `Your complaint ${id} has been assigned to ${department} (${worker}).`,
      time: 'Just now',
      read: false,
      complaintId: id
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Complaint ${id} assigned to ${department} (${worker}).`);
  };

  // Update Status (Authority action)
  const updateStatus = (id, newStatus) => {
    setComplaints(prev => prev.map(item => {
      if (item.id === id) {
        const nowStr = new Date().toLocaleString();
        const updatedTimeline = item.timeline.map(t => {
          if (t.step.toLowerCase() === newStatus.toLowerCase()) {
            return { ...t, status: 'completed', timestamp: nowStr, note: `Status updated to ${newStatus}` };
          }
          if (newStatus === 'In Progress' && t.step === 'In Progress') {
            return { ...t, status: 'current', timestamp: nowStr, note: 'Fix work actively in progress' };
          }
          return t;
        });

        return {
          ...item,
          status: newStatus,
          timeline: updatedTimeline
        };
      }
      return item;
    }));

    const newNotif = {
      id: `n-${Date.now()}`,
      title: 'Status Updated',
      message: `Complaint ${id} status updated to: ${newStatus.toUpperCase()}.`,
      time: 'Just now',
      read: false,
      complaintId: id
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Complaint ${id} status set to ${newStatus}.`);
  };

  // Mark as Resolved with Resolution Photo Upload (Worker / Authority action)
  const resolveComplaint = (id, resolutionPhotoUrl) => {
    const nowStr = new Date().toLocaleString();
    
    setComplaints(prev => prev.map(item => {
      if (item.id === id) {
        const updatedTimeline = item.timeline.map(t => ({
          ...t,
          status: 'completed',
          timestamp: t.timestamp === '-' ? nowStr : t.timestamp
        }));

        return {
          ...item,
          status: 'Resolved',
          resolvedDate: nowStr,
          resolutionImageUrl: resolutionPhotoUrl || item.resolutionImageUrl,
          timeline: updatedTimeline
        };
      }
      return item;
    }));

    // Trigger confetti celebration if window.confetti available
    if (typeof window !== 'undefined' && window.confetti) {
      window.confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    const newNotif = {
      id: `n-${Date.now()}`,
      title: 'Issue Resolved! 🎉',
      message: `Your complaint ${id} has been fully resolved with verified after-fix evidence.`,
      time: 'Just now',
      read: false,
      complaintId: id
    };
    setNotifications(prev => [newNotif, ...prev]);
    showToast(`Complaint ${id} successfully RESOLVED with photo evidence!`, 'success');
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const currentSelectedComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  return (
    <AppContext.Provider value={{
      role, setRole,
      activeTab, setActiveTab,
      complaints, setComplaints,
      selectedComplaintId, setSelectedComplaintId,
      currentSelectedComplaint,
      notifications, markAllNotificationsRead,
      toast, showToast,
      submitNewComplaint,
      assignIssue,
      updateStatus,
      resolveComplaint,
      demoActive, setDemoActive,
      demoStep, setDemoStep
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
