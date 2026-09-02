'use client';

import { ReactNode, useEffect } from 'react';
import { Activity, AlertTriangle, BarChart3, BellRing, Boxes, ClipboardCheck, Crown, FileArchive, Gauge, LockKeyhole, LogOut, Menu, Radar, ScanSearch, ShieldCheck, Siren, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { clearNotice, closeSidebar, logout, toggleSidebar, useAppDispatch, useAppSelector } from '../store';

export const navigation = [
  ['/dashboard', 'Centro ejecutivo', Gauge], ['/assets', 'Activos', Boxes], ['/risks', 'Riesgos', AlertTriangle], ['/diagnostics', 'Diagnóstico', ScanSearch],
  ['/monitoring', 'Monitoreo', Activity], ['/alerts', 'Alertas', BellRing], ['/compliance', 'Cumplimiento', ClipboardCheck], ['/documents', 'Documentos', FileArchive],
  ['/soc', 'SOC / SIEM', Radar], ['/incidents', 'Incidentes', Siren], ['/reports', 'Centro de reportería', BarChart3], ['/plans', 'Planes', Crown], ['/security', 'Seguridad', LockKeyhole],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch(); const location = useLocation(); const navigate = useNavigate();
  const open = useAppSelector((state) => state.ui.sidebarOpen); const notice = useAppSelector((state) => state.ui.notice);
  const title = navigation.find(([path]) => path === location.pathname)?.[1] ?? 'CiberGuate IA';
  useEffect(() => { if (!notice) return; const timer = setTimeout(() => dispatch(clearNotice()), 4500); return () => clearTimeout(timer); }, [dispatch, notice]);
  return <div className="min-h-screen bg-slate-50 text-slate-900"><aside className={`fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto bg-[#071526] p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3 text-lg font-black"><ShieldCheck className="text-cyan-300" />CiberGuate IA</div><button aria-label="Cerrar menú" className="lg:hidden" onClick={() => dispatch(closeSidebar())}><X /></button></div><nav className="space-y-1">{navigation.map(([path, label, Icon]) => <NavLink key={path} to={path} onClick={() => dispatch(closeSidebar())} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-cyan-400 text-[#071526]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</NavLink>)}</nav></aside><main className="lg:pl-72"><header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8"><button aria-label="Abrir menú" className="mr-3 rounded-lg p-2 lg:hidden" onClick={() => dispatch(toggleSidebar())}><Menu /></button><div><p className="text-xs text-slate-500">Plataforma preventiva</p><h1 className="text-xl font-black">{title}</h1></div><button onClick={() => { dispatch(logout()); navigate('/login'); }} className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><LogOut size={17} />Salir</button></header>{notice && <div className={`fixed right-5 top-24 z-[70] max-w-sm rounded-xl px-5 py-3 text-sm font-bold text-white shadow-xl ${notice.kind === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>{notice.message}</div>}<div className="mx-auto max-w-[1550px] p-5 md:p-8">{children}</div></main></div>;
}
