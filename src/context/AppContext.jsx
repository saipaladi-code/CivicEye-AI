import React, { createContext, useContext, useState, useEffect } from 'react';
import { authRequest } from '../utils/authApi';
import { dataRequest } from '../utils/dataApi';
import { workflowRequest } from '../utils/workflowApi';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Saved state from LocalStorage if present
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const role = user?.role || 'citizen';
  const [activeTab, setActiveTab] = useState(() => (
    new URLSearchParams(window.location.search).has('resetToken') ? 'auth-reset' : 'auth-login'
  )); // Public landing, authentication, and protected dashboard tabs
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Interactive Demo Tour Controller state
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    let active = true;
    authRequest('me')
      .then(({ user: authenticatedUser }) => {
        if (active) setUser(authenticatedUser);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setAuthLoading(false);
      });
    return () => { active = false; };
  }, []);

  const logout = async () => {
    await authRequest('logout', {});
    setUser(null);
    setCurrentLocation(null);
    setActiveTab('auth-login');
  };

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const refreshUserData = async () => {
    if (!user) return;
    try {
      const data = await dataRequest('bootstrap');
      setComplaints(data.complaints);
      setNotifications(data.notifications);
      setSelectedComplaintId((currentId) => (
        data.complaints.some((complaint) => complaint.id === currentId)
          ? currentId
          : data.complaints[0]?.id || null
      ));
    } catch (error) {
      setComplaints([]);
      setNotifications([]);
      throw error;
    }
  };

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      setNotifications([]);
      setDataLoading(false);
      return;
    }
    setDataLoading(true);
    refreshUserData()
      .catch((error) => showToast(error.message, 'error'))
      .finally(() => setDataLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!user) return undefined;
    const refresh = () => {
      if (document.visibilityState === 'visible') {
        refreshUserData().catch((error) => showToast(error.message, 'error'));
      }
    };
    const intervalId = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
    };
  }, [user?.id]);

  useEffect(() => {
    if (user && !authLoading && activeTab === 'landing') {
      setActiveTab(
        user.role === 'authority'
          ? 'authority-dashboard'
          : ['worker', 'field_worker'].includes(user.role)
            ? 'worker-dashboard'
            : 'citizen-dashboard'
      );
    }
  }, [user, authLoading, activeTab]);

  // Add new complaint (Citizen action)
  const submitNewComplaint = async (formData) => {
    const { complaint } = await dataRequest('complaints', {
      method: 'POST',
      body: {
        ...formData,
        category: formData.category === 'Auto Detect' ? 'Pothole' : formData.category,
        severity: formData.severity || 'High',
        confidence: formData.confidence || 94,
        publicImpact: formData.publicImpact || 'High',
        location: formData.location || 'Main Road, Near Bus Stop',
        description: formData.description || 'Civic infrastructure issue reported via CivicEye AI citizen app.',
        coordinates: formData.coordinates
      }
    });
    setComplaints((previous) => [complaint, ...previous]);
    setSelectedComplaintId(complaint.id);
    setNotifications((previous) => [{
      id: `local-${Date.now()}`,
      title: 'Complaint Submitted',
      message: `Your complaint ${complaint.id} has been logged & scored by AI (${complaint.priorityScore}/100).`,
      time: 'Just now',
      read: false,
      complaintId: complaint.id
    }, ...previous]);
    return complaint;
  };

  // Assign Issue (Authority action)
  const assignIssue = async (id, assignment) => {
    try {
      const { complaint } = await dataRequest(`complaints/${encodeURIComponent(id)}/assignment`, {
        method: 'PATCH',
        body: assignment
      });
      setComplaints((previous) => previous.map((item) => item.id === id ? complaint : item));
      await refreshUserData();
      showToast(`Complaint ${id} assigned to ${assignment.department} (${assignment.workerName}).`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  // Update Status (Authority action)
  const updateStatus = async (id, newStatus) => {
    try {
      const { complaint } = await dataRequest(`complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status: newStatus }
      });
      setComplaints((previous) => previous.map((item) => item.id === id ? complaint : item));
      await refreshUserData();
      showToast(`Complaint ${id} status set to ${newStatus}.`);
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const runWorkflowAction = async (action, body, successMessage) => {
    try {
      const { complaint } = await workflowRequest(action, body);
      const complaintId = body.complaintId;
      setComplaints((previous) => previous.map((item) => item.id === complaintId ? complaint : item));
      await refreshUserData();
      if (action === 'review' && body.decision === 'approve' && typeof window !== 'undefined' && window.confetti) {
        window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      showToast(successMessage, 'success');
      return complaint;
    } catch (error) {
      showToast(error.message, 'error');
      throw error;
    }
  };

  const startWorkerTask = (id) => runWorkflowAction(
    'start', { complaintId: id }, `Work started on ${id}.`
  );
  const submitWorkerEvidence = (id, note, photos) => runWorkflowAction(
    'submit', { complaintId: id, note, photos }, `Evidence for ${id} submitted for approval.`
  );
  const reviewWorkerEvidence = (id, decision, reason = '') => runWorkflowAction(
    'review', { complaintId: id, decision, reason },
    decision === 'approve' ? `${id} resolved after evidence approval.` : `Evidence for ${id} returned for rework.`
  );

  const markAllNotificationsRead = async () => {
    try {
      await dataRequest('notifications/read-all', { method: 'PATCH', body: {} });
      setNotifications((previous) => previous.map((notification) => ({ ...notification, read: true })));
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

  const currentSelectedComplaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  return (
    <AppContext.Provider value={{
      user, setUser, authLoading, dataLoading, logout,
      role,
      activeTab, setActiveTab,
      complaints,
      selectedComplaintId, setSelectedComplaintId,
      currentSelectedComplaint,
      notifications, markAllNotificationsRead,
      currentLocation, setCurrentLocation,
      toast, showToast,
      submitNewComplaint,
      assignIssue,
      updateStatus,
      startWorkerTask,
      submitWorkerEvidence,
      reviewWorkerEvidence,
      refreshUserData,
      demoActive, setDemoActive,
      demoStep, setDemoStep
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
