'use client';

import { useMemo, useState } from 'react';
import { Activity, Download, FileClock, RefreshCw, ShieldAlert } from 'lucide-react';

import { DoughnutChart, HorizontalBarChart, LineChart } from '../components/charts';
import { DataTable, LoadingBlock, Metric, Page, Panel } from '../components/ui';
import {
  notify, useAiQuery, useAlertsQuery, useAppDispatch, useAppSelector, useAuditLogsQuery,
  useComplianceQuery, useDashboardQuery, useEventsQuery, useIncidentsQuery,
  useMonitorsQuery, useMonthlyReportsQuery, useOverviewQuery, useRisksQuery, useScansQuery,
} from '../store';
import type { Row } from '../types';

const reportSections = [
  ['resumen', 'Resumen'], ['metricas', 'Métricas'], ['evidencia', 'Evidencia'],
  ['archivo', 'Archivo'], ['auditoria', 'Auditoría'],
] as const;

function dateValue(row: Row, keys: string[]) {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return new Date(value);
  }
  return null;
}

function activitySeries(collections: Array<{ rows: Row[]; dates: string[] }>) {
  const months = Array.from({ length: 6 }, (_, offset) => {
    const date = new Date();
    date.setDate(1); date.setHours(0, 0, 0, 0); date.setMonth(date.getMonth() - (5 - offset));
    return date;
  });
  const keys = months.map((date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  const values = keys.map((key) => collections.reduce((total, collection) => total + collection.rows.filter((row) => {
    const date = dateValue(row, collection.dates);
    return date && `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` === key;
  }).length, 0));
  return { labels: months.map((date) => date.toLocaleDateString('es-GT', { month: 'short', year: '2-digit' })), values };
}

export function ReportsPage() {
  const dashboard = useDashboardQuery(); const overview = useOverviewQuery(); const analysis = useAiQuery();
  const risks = useRisksQuery(); const scans = useScansQuery(); const monitors = useMonitorsQuery();
  const alerts = useAlertsQuery(); const compliance = useComplianceQuery(); const events = useEventsQuery();
  const incidents = useIncidentsQuery(); const reports = useMonthlyReportsQuery(); const audit = useAuditLogsQuery();
  const dispatch = useAppDispatch(); const token = useAppSelector((state) => state.auth.token);
  const [downloading, setDownloading] = useState<string | null>(null);
  const loading = [dashboard, overview, analysis, risks, scans, monitors, alerts, compliance, events, incidents, reports, audit].some((query) => query.isLoading);

  const data = dashboard.data ?? { total_assets: 0, critical_assets: 0, open_risks: 0, critical_risks: 0, average_risk_score: 0, compliance_percentage: 0, risks_by_level: {} };
  const security = overview.data;
  const riskRows = risks.data ?? [];
  const scanRows = useMemo(() => scans.data ?? [], [scans.data]);
  const alertRows = useMemo(() => alerts.data ?? [], [alerts.data]);
  const eventRows = useMemo(() => events.data ?? [], [events.data]);
  const incidentRows = useMemo(() => incidents.data ?? [], [incidents.data]);
  const reportRows = reports.data ?? []; const auditRows = audit.data ?? [];
  const topRisks = [...riskRows].sort((a, b) => Number(b.score ?? 0) - Number(a.score ?? 0)).slice(0, 8);
  const recentScans = scanRows.slice(0, 8);
  const openAlerts = alertRows.filter((row) => row.status !== 'Cerrada').slice(0, 8);
  const openIncidents = incidentRows.filter((row) => row.status !== 'Cerrado').slice(0, 8);
  const trend = useMemo(() => activitySeries([
    { rows: scanRows, dates: ['completed_at', 'createdAt'] }, { rows: alertRows, dates: ['detected_at', 'createdAt'] },
    { rows: eventRows, dates: ['occurred_at', 'createdAt'] }, { rows: incidentRows, dates: ['createdAt'] },
  ]), [scanRows, alertRows, eventRows, incidentRows]);

  async function download(path: string, filename: string) {
    setDownloading(path);
    try {
      const response = await fetch(`/api/v1${path}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('No fue posible generar el informe');
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a'); link.href = url; link.download = filename; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      dispatch(notify({ kind: 'success', message: 'Informe generado y descargado correctamente.' }));
    } catch (error) {
      dispatch(notify({ kind: 'error', message: error instanceof Error ? error.message : 'No fue posible descargar el informe.' }));
    } finally { setDownloading(null); }
  }

  if (loading) return <LoadingBlock />;
  const operationLabels = ['Diagnósticos', 'Monitores', 'Alertas', 'Eventos', 'Incidentes', 'Documentos'];
  const operationValues = [security?.scans ?? 0, security?.monitors ?? 0, security?.open_alerts ?? 0, security?.events ?? 0, security?.open_incidents ?? 0, security?.documents ?? 0];

  return <Page title="Centro de reportería" intro="Vista unificada de postura, operación, cumplimiento y evidencia. Cada indicador tiene su gráfica o detalle verificable.">
    <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur" aria-label="Secciones del centro de reportería">
      {reportSections.map(([id, label]) => <a key={id} href={`#${id}`} className="whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold text-slate-600 hover:bg-cyan-50 hover:text-cyan-800">{label}</a>)}
    </nav>

    <section id="resumen" className="scroll-mt-24 space-y-5">
      <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="rounded-3xl bg-[#071526] p-7 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">Motor: {analysis.data?.mode ?? 'sin análisis'}</span><span className="text-xs text-slate-400">Datos actuales de PostgreSQL</span></div>
          <h3 className="mt-5 text-3xl font-black">{analysis.data?.posture ?? 'Postura sin clasificar'}</h3>
          <p className="mt-3 max-w-3xl leading-7 text-slate-300">{analysis.data?.executive_summary ?? 'Registre evidencia para obtener una lectura ejecutiva.'}</p>
        </article>
        <article className="flex flex-col justify-between rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
          <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-800">Informe ejecutivo</p><h3 className="mt-3 text-2xl font-black text-slate-950">PDF consolidado y legible</h3><p className="mt-2 text-sm leading-6 text-slate-600">Incluye KPIs, gráficas vectoriales, riesgos prioritarios, acciones y metodología.</p></div>
          <button disabled={downloading !== null} onClick={() => void download('/reports/executive.pdf', 'informe-ejecutivo.pdf')} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-cyan-800 px-4 py-3 font-bold text-white disabled:opacity-60">{downloading === '/reports/executive.pdf' ? <RefreshCw className="animate-spin" size={17} /> : <Download size={17} />}Descargar informe ejecutivo</button>
        </article>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Activos" value={data.total_assets} detail={`${data.critical_assets} críticos`} />
        <Metric label="Riesgos abiertos" value={data.open_risks} detail={`${data.critical_risks} críticos`} />
        <Metric label="Cumplimiento" value={`${security?.compliance ?? 0}%`} detail="Promedio de controles" />
        <Metric label="Alertas abiertas" value={security?.open_alerts ?? 0} detail={`${security?.critical_alerts ?? 0} críticas`} />
        <Metric label="Incidentes" value={security?.open_incidents ?? 0} detail="Pendientes de cierre" />
        <Metric label="Servicios caídos" value={security?.services_down ?? 0} detail={`${security?.monitors ?? 0} monitoreados`} />
      </div>
    </section>

    <section id="metricas" className="scroll-mt-24 space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">Análisis visual</p><h3 className="mt-2 text-2xl font-black">Métricas centralizadas</h3></div>
      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <Panel title="Riesgos abiertos por nivel"><DoughnutChart title="Distribución de riesgos" labels={Object.keys(data.risks_by_level)} values={Object.values(data.risks_by_level)} /></Panel>
        <Panel title="Operación de seguridad"><HorizontalBarChart title="Registros operativos" labels={operationLabels} values={operationValues} /></Panel>
        <Panel title="Cumplimiento por marco"><HorizontalBarChart title="Cumplimiento porcentual" labels={(compliance.data?.frameworks ?? []).map((item) => item.framework)} values={(compliance.data?.frameworks ?? []).map((item) => item.score)} maximum={100} /></Panel>
        <Panel title="Actividad de los últimos seis meses"><LineChart title="Ejecuciones y registros" labels={trend.labels} values={trend.values} /></Panel>
      </div>
    </section>

    <section id="evidencia" className="scroll-mt-24 space-y-6">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">Trazabilidad</p><h3 className="mt-2 text-2xl font-black">Evidencia detrás de las métricas</h3></div>
      <Panel title="Riesgos prioritarios" action={<ShieldAlert size={20} className="text-red-600" />}><DataTable rows={topRisks} columns={['title', 'asset_name', 'threat', 'score', 'level', 'status']} labels={['Riesgo', 'Activo', 'Amenaza', 'Puntaje', 'Nivel', 'Estado']} /></Panel>
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Diagnósticos recientes"><DataTable rows={recentScans} columns={['target', 'risk_score', 'findings_count', 'status', 'completed_at']} labels={['Objetivo', 'Riesgo', 'Hallazgos', 'Estado', 'Finalizado']} /></Panel>
        <Panel title="Alertas abiertas"><DataTable rows={openAlerts} columns={['title', 'severity', 'source', 'status', 'detected_at']} labels={['Alerta', 'Severidad', 'Fuente', 'Estado', 'Detectada']} /></Panel>
      </div>
      <Panel title="Incidentes activos" action={<Activity size={20} className="text-cyan-700" />}><DataTable rows={openIncidents} columns={['title', 'severity', 'status', 'assigned_to', 'playbook', 'createdAt']} labels={['Incidente', 'Severidad', 'Estado', 'Responsable', 'Playbook', 'Creado']} /></Panel>
    </section>

    <section id="archivo" className="scroll-mt-24 space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">Histórico</p><h3 className="mt-2 text-2xl font-black">Archivo mensual</h3></div>
      <Panel title="Cortes preservados" action={<FileClock size={20} className="text-cyan-700" />}><DataTable rows={reportRows} columns={['period', 'report_type', 'size_bytes', 'generated_at']} labels={['Periodo', 'Tipo', 'Bytes', 'Generado']} actions={(row) => <button disabled={downloading !== null} className="flex items-center gap-2 font-bold text-cyan-700 disabled:opacity-50" onClick={() => void download(`/reports/monthly/${row.id}.pdf`, `informe-${row.period}.pdf`)}><Download size={16} />Descargar</button>} /></Panel>
    </section>

    <section id="auditoria" className="scroll-mt-24 space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[.16em] text-cyan-700">Control</p><h3 className="mt-2 text-2xl font-black">Bitácora de auditoría</h3><p className="mt-2 text-sm text-slate-500">{auditRows.length} acciones sensibles disponibles para revisión.</p></div>
      <DataTable rows={auditRows} columns={['actor', 'action', 'resource', 'ip_address', 'createdAt']} labels={['Actor', 'Acción', 'Recurso', 'IP', 'Fecha']} />
    </section>
  </Page>;
}
