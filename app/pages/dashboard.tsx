'use client';

import { CheckCircle2 } from 'lucide-react';

import { BarChart, DoughnutChart } from '../components/charts';
import { LoadingBlock, Metric, Page, Panel } from '../components/ui';
import { useAiQuery, useDashboardQuery, useOverviewQuery } from '../store';

export function DashboardPage() {
  const dashboard = useDashboardQuery(); const overview = useOverviewQuery(); const analysis = useAiQuery();
  if (dashboard.isLoading || overview.isLoading || analysis.isLoading) return <LoadingBlock />;
  const data = dashboard.data ?? { total_assets: 0, critical_assets: 0, open_risks: 0, critical_risks: 0, average_risk_score: 0, compliance_percentage: 0, risks_by_level: {} };
  const security = overview.data; const ai = analysis.data;
  return <Page title="Centro ejecutivo" intro="Postura consolidada, indicadores verificables y análisis inteligente actualizado desde PostgreSQL."><section className="rounded-3xl bg-[#071526] p-7 text-white"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">Análisis: {ai?.mode ?? 'en curso'}</span><h2 className="mt-5 text-3xl font-black">{ai?.posture ?? 'Postura de seguridad'}</h2><p className="mt-3 max-w-4xl leading-7 text-slate-300">{ai?.executive_summary}</p></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Activos registrados" value={data.total_assets} detail={`${data.critical_assets} críticos`} /><Metric label="Riesgos abiertos" value={data.open_risks} detail={`${data.critical_risks} críticos`} /><Metric label="Cumplimiento" value={`${security?.compliance ?? 0}%`} detail="Cinco marcos evaluados" /><Metric label="Probabilidad predictiva" value={`${ai?.attack_probability ?? 0}%`} detail={`Tendencia ${ai?.trend ?? 'sin datos'}`} /></section><section className="grid gap-6 xl:grid-cols-2"><Panel title="Distribución de riesgos"><DoughnutChart title="Riesgos" labels={Object.keys(data.risks_by_level)} values={Object.values(data.risks_by_level)} /></Panel><Panel title="Operación de seguridad"><BarChart title="Registros" labels={['Escaneos','Monitores','Alertas','Eventos','Incidentes','Documentos']} values={[security?.scans ?? 0,security?.monitors ?? 0,security?.open_alerts ?? 0,security?.events ?? 0,security?.open_incidents ?? 0,security?.documents ?? 0]} /></Panel></section><Panel title="Recomendaciones inteligentes"><ul className="grid gap-3 lg:grid-cols-2">{ai?.recommendations.map((item) => <li key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6"><CheckCircle2 className="mt-1 shrink-0 text-cyan-700" size={17} />{item}</li>)}</ul></Panel></Page>;
}
