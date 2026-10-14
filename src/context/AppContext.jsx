import React, { createContext, useContext, useState, useEffect } from 'react';
import { authRequest } from '../utils/authApi';
import { dataRequest } from '../utils/dataApi';

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
    if (user && !authLoading && activeTab === 'landing') {
      setActiveTab(user.role === 'authority' ? 'authority-dashboard' : 'citizen-dashboard');
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
        coordinates: formData.coordinates || { lat: 12.9716, lng: 77.5946 }
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
  const assignIssue = async (id, department, worker) => {
    try {
      const { complaint } = await dataRequest(`complaints/${encodeURIComponent(id)}/assignment`, {
        method: 'PATCH',
        body: { department, worker }
      });
      setComplaints((previous) => previous.map((item) => item.id === id ? complaint : item));
      await refreshUserData();
      showToast(`Complaint ${id} assigned to ${department} (${worker}).`);
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

  // Mark as Resolved with Resolution Photo Upload (Worker / Authority action)
  const resolveComplaint = async (id, resolutionImageUrl) => {
    try {
      const { complaint } = await dataRequest(`complaints/${encodeURIComponent(id)}/resolve`, {
        method: 'PATCH',
        body: { resolutionImageUrl }
      });
      setComplaints((previous) => previous.map((item) => item.id === id ? complaint : item));
      await refreshUserData();
      if (typeof window !== 'undefined' && window.confetti) {
        window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      showToast(`Complaint ${id} successfully RESOLVED with photo evidence!`, 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  };

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
