'use client';

import { BarChart3, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { DoughnutChart, HorizontalBarChart } from '../components/charts';
import { LoadingBlock, Metric, Page, Panel } from '../components/ui';
import { useAiQuery, useDashboardQuery, useOverviewQuery } from '../store';

export function DashboardPage() {
  const dashboard = useDashboardQuery(); const overview = useOverviewQuery(); const analysis = useAiQuery();
  if (dashboard.isLoading || overview.isLoading || analysis.isLoading) return <LoadingBlock />;
  const data = dashboard.data ?? { total_assets: 0, critical_assets: 0, open_risks: 0, critical_risks: 0, average_risk_score: 0, compliance_percentage: 0, risks_by_level: {} };
  const security = overview.data; const ai = analysis.data;
  const operationLabels = ['Diagnósticos', 'Monitores', 'Alertas', 'Eventos', 'Incidentes', 'Documentos'];
  const operationValues = [security?.scans ?? 0, security?.monitors ?? 0, security?.open_alerts ?? 0, security?.events ?? 0, security?.open_incidents ?? 0, security?.documents ?? 0];

  return <Page title="Dashboard general" intro="Postura consolidada y accesos directos a toda la evidencia almacenada en la plataforma.">
    <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
      <article className="rounded-3xl bg-[#071526] p-7 text-white shadow-lg">
        <span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">Análisis: {ai?.mode ?? 'en curso'}</span>
        <h2 className="mt-5 text-3xl font-black">{ai?.posture ?? 'Postura de seguridad'}</h2>
        <p className="mt-3 max-w-4xl leading-7 text-slate-300">{ai?.executive_summary}</p>
      </article>
      <Link to="/reports" className="group flex flex-col justify-between rounded-3xl border border-cyan-200 bg-cyan-50 p-6 transition hover:-translate-y-1 hover:shadow-lg">
        <div><BarChart3 className="text-cyan-800" /><h3 className="mt-5 text-2xl font-black">Centro de reportería</h3><p className="mt-2 text-sm leading-6 text-slate-600">Gráficas, hallazgos, riesgos, incidentes, auditoría y PDF ejecutivo en un solo lugar.</p></div>
        <span className="mt-6 flex items-center gap-2 font-bold text-cyan-800">Abrir reportería <ChevronRight size={18} className="transition group-hover:translate-x-1" /></span>
      </Link>
    </section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Metric label="Activos" value={data.total_assets} detail={`${data.critical_assets} críticos`} />
      <Metric label="Riesgos abiertos" value={data.open_risks} detail={`${data.critical_risks} críticos`} />
      <Metric label="Cumplimiento" value={`${security?.compliance ?? 0}%`} detail="Controles evaluados" />
      <Metric label="Alertas" value={security?.open_alerts ?? 0} detail={`${security?.critical_alerts ?? 0} críticas`} />
      <Metric label="Incidentes" value={security?.open_incidents ?? 0} detail="Abiertos" />
      <Metric label="Servicios caídos" value={security?.services_down ?? 0} detail={`${security?.monitors ?? 0} monitoreados`} />
    </section>
    <section className="grid min-w-0 gap-6 xl:grid-cols-2">
      <Panel title="Distribución de riesgos"><DoughnutChart title="Riesgos abiertos" labels={Object.keys(data.risks_by_level)} values={Object.values(data.risks_by_level)} /></Panel>
      <Panel title="Operación de seguridad"><HorizontalBarChart title="Registros" labels={operationLabels} values={operationValues} /></Panel>
    </section>
    <Panel title="Recomendaciones inteligentes">
      <ul className="grid gap-3 lg:grid-cols-2">{ai?.recommendations.map((item) => <li key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm leading-6"><CheckCircle2 className="mt-1 shrink-0 text-cyan-700" size={17} />{item}</li>)}</ul>
    </Panel>
  </Page>;
}
