/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from './components/DashboardLayout';
import { OverviewSection } from './components/OverviewSection';
import { MarketForexSection } from './components/MarketForexSection';
import { TechnicalChartsSection } from './components/TechnicalChartsSection';
import { MonetaryPolicySection } from './components/MonetaryPolicySection';
import { PersonalPlanner } from './components/PersonalPlanner';
import { LandingPresentation } from './components/LandingPresentation';
import { IndicatorAlertModal } from './components/IndicatorAlertModal';
import { IndicatorAlertToast } from './components/IndicatorAlertToast';
import { IndicatorData, IndicatorId, MacroPriceAlert } from './types/financial';
import { fetchAllIndicators, DEFAULT_INDICATORS } from './services/api';
import { PrivacyProvider } from './context/PrivacyContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const STORAGE_KEYS = {
  INDICATORS_CACHE: 'valorum_indicators_cache_v1',
  ALERTS_STORAGE: 'valorum_macro_alerts_v1',
  HAS_VISITED: 'valorum_has_visited_v1',
};

const DEFAULT_ALERTS: MacroPriceAlert[] = [
  {
    id: 'alert_usd_ceiling_demo',
    indicatorId: 'usd',
    indicatorCode: 'USD/BRL',
    indicatorName: 'Dólar Comercial',
    type: 'ceiling',
    targetValue: 5.80,
    note: 'Teto de cautela cambial para viagens ou hedge',
    createdAt: '30/10/2026 09:00',
    isActive: true,
    isTriggered: false,
  },
  {
    id: 'alert_ibov_floor_demo',
    indicatorId: 'ibov',
    indicatorCode: 'IBOV',
    indicatorName: 'Ibovespa',
    type: 'floor',
    targetValue: 125000,
    note: 'Piso de suporte técnico na B3',
    createdAt: '30/10/2026 09:00',
    isActive: true,
    isTriggered: false,
  },
];

// Helper to evaluate ceiling (>=) and floor (<=) triggers against current indicator values
const evaluateAlerts = (
  alertsList: MacroPriceAlert[],
  currentIndicators: IndicatorData[]
): MacroPriceAlert[] => {
  return alertsList.map((alert) => {
    if (!alert.isActive) return alert;
    const ind = currentIndicators.find((i) => i.id === alert.indicatorId);
    if (!ind || ind.value <= 0) return alert;

    const isTriggered =
      alert.type === 'ceiling'
        ? ind.value >= alert.targetValue
        : ind.value <= alert.targetValue;

    if (isTriggered && !alert.isTriggered) {
      return {
        ...alert,
        isTriggered: true,
        triggeredAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        triggeredValue: ind.value,
      };
    } else if (isTriggered) {
      return {
        ...alert,
        triggeredValue: ind.value,
      };
    } else {
      return {
        ...alert,
        isTriggered: false,
        triggeredAt: undefined,
        triggeredValue: undefined,
      };
    }
  });
};

function MainDashboard() {
  const { user, remoteAlerts, syncDataToCloud } = useAuth();
  const [indicators, setIndicators] = useState<IndicatorData[]>(DEFAULT_INDICATORS);
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<IndicatorId>('usd');
  
  // Price Alerts State
  const [alerts, setAlerts] = useState<MacroPriceAlert[]>(DEFAULT_ALERTS);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [selectedAlertIndicatorId, setSelectedAlertIndicatorId] = useState<IndicatorId | undefined>(undefined);

  // Tab state - visitors who haven't visited start on 'apresentacao'
  const [activeTab, setActiveTab] = useState<string>(() => {
    const hasVisited = localStorage.getItem(STORAGE_KEYS.HAS_VISITED);
    return hasVisited ? 'visao-geral' : 'apresentacao';
  });

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [liveStatus, setLiveStatus] = useState<'connected' | 'updating' | 'cached'>('updating');

  // Load persisted cache & alerts on mount
  useEffect(() => {
    try {
      const cachedIndicators = localStorage.getItem(STORAGE_KEYS.INDICATORS_CACHE);
      if (cachedIndicators) {
        setIndicators(JSON.parse(cachedIndicators));
      }
      const storedAlerts = localStorage.getItem(STORAGE_KEYS.ALERTS_STORAGE);
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      }
    } catch (e) {
      console.warn('Could not load localStorage items', e);
    }
  }, []);

  // Sync remote alerts when updated in cloud from another device
  useEffect(() => {
    if (remoteAlerts && remoteAlerts.length > 0) {
      setAlerts(remoteAlerts);
    }
  }, [remoteAlerts]);

  // Alert CRUD handlers
  const handleSaveAlert = (newAlert: MacroPriceAlert) => {
    setAlerts((prev) => {
      const filtered = prev.filter((a) => a.id !== newAlert.id);
      const updated = [newAlert, ...filtered];
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS_STORAGE, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist alert', e);
      }
      return updated;
    });
  };

  const handleToggleAlert = (alertId: string) => {
    setAlerts((prev) => {
      const updated = prev.map((a) => (a.id === alertId ? { ...a, isActive: !a.isActive } : a));
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS_STORAGE, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist alert toggle', e);
      }
      return updated;
    });
  };

  const handleDeleteAlert = (alertId: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((a) => a.id !== alertId);
      try {
        localStorage.setItem(STORAGE_KEYS.ALERTS_STORAGE, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist alert deletion', e);
      }
      return updated;
    });
  };

  const handleDismissAlertToast = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, isTriggered: false } : a))
    );
  };

  const handleDismissAllAlertToasts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, isTriggered: false })));
  };

  const handleOpenAlertModalForIndicator = (id?: IndicatorId) => {
    setSelectedAlertIndicatorId(id || selectedIndicatorId);
    setIsAlertModalOpen(true);
  };

  // Main refresh handler for indicators
  const loadData = useCallback(async () => {
    setIsRefreshing(true);
    setLiveStatus('updating');

    try {
      const fetchedIndicators = await fetchAllIndicators();
      setIndicators(fetchedIndicators);
      localStorage.setItem(STORAGE_KEYS.INDICATORS_CACHE, JSON.stringify(fetchedIndicators));

      // Re-evaluate alerts against freshly fetched data
      setAlerts((currentAlerts) => evaluateAlerts(currentAlerts, fetchedIndicators));

      const timeStr = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLastUpdated(timeStr);
      setLiveStatus('connected');
    } catch (err) {
      console.error('Error fetching live data:', err);
      setLiveStatus('cached');
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh interval (every 60s)
  useEffect(() => {
    if (!autoRefreshEnabled) return;
    const interval = setInterval(() => {
      loadData();
    }, 60000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled, loadData]);

  // Navigation handler from landing presentation
  const handleExploreFromPresentation = (targetTab = 'visao-geral') => {
    localStorage.setItem(STORAGE_KEYS.HAS_VISITED, 'true');
    setActiveTab(targetTab);
  };

  // If active tab is presentation, render the dedicated presentation page
  if (activeTab === 'apresentacao') {
    return (
      <LandingPresentation
        indicators={indicators}
        onExplore={handleExploreFromPresentation}
      />
    );
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      lastUpdated={lastUpdated}
      isRefreshing={isRefreshing}
      onRefresh={loadData}
      autoRefreshEnabled={autoRefreshEnabled}
      onToggleAutoRefresh={() => setAutoRefreshEnabled((prev) => !prev)}
      liveStatus={liveStatus}
      alerts={alerts}
      onOpenAlertModal={() => handleOpenAlertModalForIndicator()}
    >
      {activeTab === 'planejador' && (
        <PersonalPlanner indicators={indicators} />
      )}

      {activeTab === 'visao-geral' && (
        <OverviewSection
          indicators={indicators}
          selectedIndicatorId={selectedIndicatorId}
          onSelectIndicator={setSelectedIndicatorId}
          alerts={alerts}
          onOpenAlertModal={handleOpenAlertModalForIndicator}
          onNavigateTab={setActiveTab}
        />
      )}

      {activeTab === 'mercados' && (
        <MarketForexSection indicators={indicators} />
      )}

      {activeTab === 'graficos' && (
        <TechnicalChartsSection
          selectedIndicatorId={selectedIndicatorId}
          onSelectIndicator={setSelectedIndicatorId}
          indicators={indicators}
        />
      )}

      {activeTab === 'monetaria' && (
        <MonetaryPolicySection indicators={indicators} />
      )}

      {/* Visual Floating Toast for Triggered Ceiling / Floor Alerts */}
      <IndicatorAlertToast
        alerts={alerts}
        onDismiss={handleDismissAlertToast}
        onDismissAll={handleDismissAllAlertToasts}
        onOpenAlertModal={(id) => handleOpenAlertModalForIndicator(id)}
      />

      {/* Modal for Creating & Managing Indicators Ceiling / Floor Alerts */}
      <IndicatorAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        indicators={indicators}
        initialIndicatorId={selectedAlertIndicatorId}
        alerts={alerts}
        onSaveAlert={handleSaveAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
      />
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PrivacyProvider>
        <MainDashboard />
      </PrivacyProvider>
    </AuthProvider>
  );
}
