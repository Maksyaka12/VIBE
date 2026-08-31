import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BaseAppHeader } from './BaseAppHeader';
import { BaseAppSidebar } from './BaseAppSidebar';
import Checker from '../Checker';

export function BaseAppView({ RewardsComponent }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getInitialTab = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('claim') || path.includes('checker')) return 'claim';
    return 'hub';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    const current = getInitialTab();
    if (current !== activeTab) {
      setActiveTab(current);
    }
  }, [location.pathname]);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'claim') {
      navigate('/claim', { replace: false });
    } else {
      navigate('/hub', { replace: false });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f8fafc)', color: 'var(--ink, #0f172a)' }}>
      {/* Base App Header */}
      <BaseAppHeader
        onOpenSidebar={() => setIsSidebarOpen(true)}
        activeTab={activeTab}
      />

      {/* Base App Sidebar Drawer */}
      <BaseAppSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />

      {/* View Content: Rewards Hub or Claim Portal */}
      <main style={{ paddingBottom: '60px' }}>
        {activeTab === 'claim' ? (
          <Checker isBaseAppMode={true} />
        ) : (
          RewardsComponent ? <RewardsComponent isBaseAppMode={true} /> : null
        )}
      </main>
    </div>
  );
}
