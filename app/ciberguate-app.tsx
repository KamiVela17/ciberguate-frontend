'use client';

import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Shell } from './components/layout';
import { LoginPage, OauthCallbackPage } from './pages/auth';
import { DashboardPage } from './pages/dashboard';
import { DiagnosticsPage } from './pages/diagnostics';
import { CompliancePage, DocumentsPage, IncidentsPage, PlansPage, ReportsPage, SecurityPage, SocPage } from './pages/governance';
import { AlertsPage, AssetsPage, MonitoringPage, RisksPage } from './pages/operations';
import { AppStoreProvider, useAppSelector } from './store';

export default function CiberGuateApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // BrowserRouter y el estado persistido dependen de las API del navegador.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return <LoadingScreen />;
  return <AppStoreProvider><BrowserRouter><AppRoutes /></BrowserRouter></AppStoreProvider>;
}

function AppRoutes() { return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/oauth/callback" element={<OauthCallbackPage />} /><Route path="/*" element={<ProtectedRoutes />} /></Routes>; }
function ProtectedRoutes() {
  const { token, hydrated } = useAppSelector((state) => state.auth);
  if (!hydrated) return <LoadingScreen />;
  if (!token) return <Navigate to="/login" replace />;
  return <Shell><Routes><Route path="/dashboard" element={<DashboardPage />} /><Route path="/assets" element={<AssetsPage />} /><Route path="/risks" element={<RisksPage />} /><Route path="/diagnostics" element={<DiagnosticsPage />} /><Route path="/monitoring" element={<MonitoringPage />} /><Route path="/alerts" element={<AlertsPage />} /><Route path="/compliance" element={<CompliancePage />} /><Route path="/documents" element={<DocumentsPage />} /><Route path="/soc" element={<SocPage />} /><Route path="/incidents" element={<IncidentsPage />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/plans" element={<PlansPage />} /><Route path="/security" element={<SecurityPage />} /><Route path="*" element={<Navigate to="/dashboard" replace />} /></Routes></Shell>;
}
function LoadingScreen() { return <main className="flex min-h-screen items-center justify-center bg-[#071526] text-white"><LoaderCircle className="animate-spin text-cyan-300" /></main>; }
