'use client';

import { FormEvent, ReactNode, useCallback, useEffect, useState } from 'react';
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, BarChart3, BellRing, Boxes, CheckCircle2, ClipboardCheck, Download, FileArchive, Gauge, LockKeyhole, LogOut, Menu, Radar, RefreshCw, ScanSearch, ShieldCheck, Siren, X } from 'lucide-react';

import { api, downloadProtected, downloadReport, getToken, Session, setToken } from './api';

type Row = Record<string, unknown> & { id: number };
type Dashboard = { total_assets: number; critical_assets: number; open_risks: number; critical_risks: number; average_risk_score: number; compliance_percentage: number; risks_by_level: Record<string, number> };
type SecurityOverview = { scans: number; monitors: number; services_down: number; open_alerts: number; critical_alerts: number; compliance: number; events: number; open_incidents: number; documents: number };
type AiAnalysis = { mode: string; posture: string; attack_probability: number; trend: string; executive_summary: string; recommendations: string[] };
type Compliance = { overall_score: number; frameworks: Array<{ framework: string; score: number; implemented: number; total: number }>; controls: Row[] };

const nav = [
  ['/dashboard', 'Centro ejecutivo', Gauge], ['/assets', 'Activos', Boxes], ['/risks', 'Riesgos', AlertTriangle], ['/diagnostics', 'Diagnóstico', ScanSearch],
  ['/monitoring', 'Monitoreo', Activity], ['/alerts', 'Alertas', BellRing], ['/compliance', 'Cumplimiento', ClipboardCheck], ['/documents', 'Documentos', FileArchive],
  ['/soc', 'SOC / SIEM', Radar], ['/incidents', 'Incidentes', Siren], ['/reports', 'Informes', BarChart3], ['/security', 'Seguridad', LockKeyhole],
] as const;

export default function CiberGuateApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // BrowserRouter necesita history/window y se monta únicamente en el cliente.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return <main className="flex min-h-screen items-center justify-center bg-[#071526] text-white"><RefreshCw className="animate-spin text-cyan-300" /></main>;
  return <BrowserRouter><Routes><Route path="/login" element={<Login />} /><Route path="/oauth/callback" element={<OauthCallback />} /><Route path="/*" element={<ProtectedApp />} /></Routes></BrowserRouter>;
}

function ProtectedApp() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Shell><Routes>
    <Route path="/dashboard" element={<DashboardPage />} /><Route path="/assets" element={<AssetsPage />} /><Route path="/risks" element={<RisksPage />} />
    <Route path="/diagnostics" element={<DiagnosticsPage />} /><Route path="/monitoring" element={<MonitoringPage />} /><Route path="/alerts" element={<AlertsPage />} />
    <Route path="/compliance" element={<CompliancePage />} /><Route path="/documents" element={<DocumentsPage />} /><Route path="/soc" element={<SocPage />} />
    <Route path="/incidents" element={<IncidentsPage />} /><Route path="/reports" element={<ReportsPage />} /><Route path="/security" element={<SecurityPage />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes></Shell>;
}

function Login() {
  const navigate = useNavigate(); const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [mfaToken, setMfaToken] = useState(''); const [oauthUrl, setOauthUrl] = useState('');
  useEffect(() => { void api<{ enabled: boolean; authorization_url?: string }>('/auth/oauth/config').then((config) => setOauthUrl(config.authorization_url ?? '')).catch(() => undefined); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = mfaToken
        ? await api<Session>('/auth/mfa/verify-login', { method: 'POST', body: JSON.stringify({ mfa_token: mfaToken, code: values.code }) })
        : await api<Session | { mfa_required: true; mfa_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email: values.email, password: values.password }) });
      if ('mfa_required' in result) { setMfaToken(result.mfa_token); return; }
      setToken(result.access_token); navigate('/dashboard');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Acceso rechazado'); } finally { setBusy(false); }
  }
  return <main className="grid min-h-screen bg-[#061321] lg:grid-cols-[1.15fr_0.85fr]">
    <section className="hidden flex-col justify-between bg-[radial-gradient(circle_at_30%_20%,#0e7490_0%,#061321_55%)] p-16 text-white lg:flex"><div className="flex items-center gap-3 text-xl font-black"><ShieldCheck className="text-cyan-300" />CiberGuate IA</div><div><p className="mb-4 text-sm font-bold uppercase tracking-[.22em] text-cyan-300">Gestión preventiva de riesgos</p><h1 className="max-w-2xl text-5xl font-black leading-tight">Conozca en minutos su postura real de ciberseguridad.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Diagnóstico, cumplimiento, monitoreo, SOC e inteligencia accionable en una sola plataforma.</p></div><p className="text-sm text-slate-400">MVP académico · NIST CSF 2.0 · ISO 27001 · CIS Controls · OWASP · MITRE ATT&amp;CK</p></section>
    <section className="flex items-center justify-center p-6"><form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"><div className="mb-8"><h2 className="text-2xl font-black text-slate-900">{mfaToken ? 'Verificación MFA' : 'Acceso seguro'}</h2><p className="mt-2 text-sm text-slate-500">{mfaToken ? 'Ingrese el código de seis dígitos de su autenticador.' : 'Use sus credenciales institucionales.'}</p></div>{mfaToken ? <Field name="code" label="Código temporal" inputMode="numeric" /> : <><Field name="email" label="Correo electrónico" type="email" /><Field name="password" label="Contraseña" type="password" /></>}{error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button disabled={busy} className="w-full rounded-xl bg-cyan-700 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Verificando…' : 'Ingresar'}</button>{oauthUrl && !mfaToken && <a href={oauthUrl} className="mt-3 block w-full rounded-xl border border-slate-200 py-3 text-center text-sm font-bold text-slate-700">Ingresar con OAuth2 / OIDC</a>}</form></section>
  </main>;
}

function OauthCallback() {
  const navigate = useNavigate(); const location = useLocation(); const [error, setError] = useState('');
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    void api<Session>('/auth/oauth/callback', { method: 'POST', body: JSON.stringify({ code: params.get('code'), state: params.get('state') }) }).then((session) => { setToken(session.access_token); navigate('/dashboard', { replace: true }); }).catch((cause) => setError(cause instanceof Error ? cause.message : 'OAuth2 falló'));
  }, [location.search, navigate]);
  return <main className="flex min-h-screen items-center justify-center bg-[#071526] text-white"><div className="text-center"><RefreshCw className="mx-auto animate-spin text-cyan-300" /><p className="mt-4">Validando identidad federada…</p>{error && <ErrorText text={error} />}</div></main>;
}

function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false); const location = useLocation(); const navigate = useNavigate();
  const title = nav.find(([path]) => path === location.pathname)?.[1] ?? 'CiberGuate IA';
  return <div className="min-h-screen bg-slate-50 text-slate-900"><aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#071526] p-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}><div className="mb-8 flex items-center justify-between"><div className="flex items-center gap-3 text-lg font-black"><ShieldCheck className="text-cyan-300" />CiberGuate IA</div><button className="lg:hidden" onClick={() => setOpen(false)}><X /></button></div><nav className="space-y-1">{nav.map(([path, label, Icon]) => <NavLink key={path} to={path} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-cyan-400 text-[#071526]' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}><Icon size={18} />{label}</NavLink>)}</nav></aside><main className="lg:pl-72"><header className="sticky top-0 z-30 flex h-20 items-center border-b border-slate-200 bg-white/95 px-5 backdrop-blur md:px-8"><button className="mr-3 rounded-lg p-2 lg:hidden" onClick={() => setOpen(true)}><Menu /></button><div><p className="text-xs text-slate-500">Plataforma preventiva</p><h1 className="text-xl font-black">{title}</h1></div><button onClick={() => { setToken(null); navigate('/login'); }} className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"><LogOut size={17} />Salir</button></header><div className="mx-auto max-w-[1550px] p-5 md:p-8">{children}</div></main></div>;
}

function useData<T>(path: string, initial: T) {
  const [data, setData] = useState(initial); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async () => { setLoading(true); try { setData(await api<T>(path)); setError(''); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error'); } finally { setLoading(false); } }, [path]);
  useEffect(() => {
    // La carga asíncrona sincroniza la vista con la API al cambiar de ruta.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]); return { data, loading, error, load, setData };
}

function DashboardPage() {
  const dashboard = useData<Dashboard>('/dashboard', { total_assets: 0, critical_assets: 0, open_risks: 0, critical_risks: 0, average_risk_score: 0, compliance_percentage: 0, risks_by_level: {} });
  const security = useData<SecurityOverview>('/security/overview', { scans: 0, monitors: 0, services_down: 0, open_alerts: 0, critical_alerts: 0, compliance: 0, events: 0, open_incidents: 0, documents: 0 });
  const analysis = useData<AiAnalysis>('/ai/analysis', { mode: '', posture: 'Calculando', attack_probability: 0, trend: '', executive_summary: '', recommendations: [] });
  return <div className="space-y-7"><Hero title="Postura de seguridad en tiempo real" text={analysis.data.executive_summary || 'Analizando exposición, controles y telemetría…'} badge={`Análisis: ${analysis.data.mode || 'en curso'}`} /><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Activos registrados" value={dashboard.data.total_assets} detail={`${dashboard.data.critical_assets} críticos`} /><Metric label="Riesgos abiertos" value={dashboard.data.open_risks} detail={`${dashboard.data.critical_risks} críticos`} /><Metric label="Cumplimiento" value={`${security.data.compliance}%`} detail="Cinco marcos evaluados" /><Metric label="Probabilidad predictiva" value={`${analysis.data.attack_probability}%`} detail={`Tendencia ${analysis.data.trend || 'calculando'}`} /></section><section className="grid gap-6 xl:grid-cols-2"><Panel title="Operación SOC"><div className="grid grid-cols-2 gap-4"><Mini label="Alertas abiertas" value={security.data.open_alerts} /><Mini label="Incidentes abiertos" value={security.data.open_incidents} /><Mini label="Eventos SIEM" value={security.data.events} /><Mini label="Servicios monitoreados" value={security.data.monitors} /></div></Panel><Panel title="Recomendaciones inteligentes"><ul className="space-y-3">{analysis.data.recommendations.map((item) => <li key={item} className="flex gap-3 text-sm leading-6"><CheckCircle2 className="mt-1 shrink-0 text-cyan-700" size={17} />{item}</li>)}</ul></Panel></section></div>;
}

function AssetsPage() { return <CrudPage title="Inventario de activos" intro="Identifique responsables, ubicación y criticidad de cada recurso." path="/assets" columns={['name','asset_type','owner','location','criticality','status']} labels={['Activo','Tipo','Responsable','Ubicación','Criticidad','Estado']} fields={[['name','Nombre'],['asset_type','Tipo'],['owner','Responsable'],['location','Ubicación'],['criticality','Criticidad 1-5']]} defaults={{ status: 'Activo' }} />; }
function RisksPage() {
  const assets = useData<Row[]>('/assets', []);
  return <CrudPage title="Evaluación de riesgos" intro="Priorización automática por probabilidad, impacto y función NIST CSF 2.0." path="/risks" columns={['title','asset_name','threat','nist_function','score','level','status']} labels={['Riesgo','Activo','Amenaza','NIST','Puntaje','Nivel','Estado']} fields={[['title','Título'],['threat','Amenaza'],['likelihood','Probabilidad 1-5'],['impact','Impacto 1-5']]} defaults={{ status: 'Abierto', nist_function: 'IDENTIFY', asset_id: assets.data[0]?.id }} extra={<><Select name="asset_id" label="Activo" options={assets.data.map((item) => [String(item.id), String(item.name)])} /><Select name="nist_function" label="Función NIST" options={['GOVERN','IDENTIFY','PROTECT','DETECT','RESPOND','RECOVER'].map((x) => [x,x])} /></>} />;
}

function DiagnosticsPage() {
  const scans = useData<Row[]>('/scans', []); const assets = useData<Row[]>('/assets', []); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); try { await api('/scans', { method: 'POST', body: JSON.stringify(values) }); await scans.load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error'); } }
  return <Page title="Diagnóstico automático" intro="Comprobación autorizada y no intrusiva de disponibilidad, TLS y controles HTTP alineados con OWASP."><FormCard onSubmit={submit} submit="Ejecutar diagnóstico"><Field name="target" label="URL autorizada" placeholder="https://servicio.gob.gt" /><Select name="asset_id" label="Activo relacionado" options={[['','Sin asociar'] as const,...assets.data.map((item) => [String(item.id),String(item.name)] as const)]} />{error && <ErrorText text={error} />}</FormCard><DataTable rows={scans.data} columns={['target','status','risk_score','findings_count','summary']} labels={['Objetivo','Estado','Riesgo / 100','Hallazgos','Resumen']} /></Page>;
}

function MonitoringPage() {
  const state = useData<Row[]>('/monitors', []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await api('/monitors', { method: 'POST', body: JSON.stringify(values) }); await state.load(); }
  return <Page title="Evaluación continua" intro="Supervise servicios automáticamente y genere alertas inteligentes ante indisponibilidad."><FormCard onSubmit={submit} submit="Crear monitor"><Field name="name" label="Nombre" /><Field name="target" label="URL" placeholder="https://servicio.gob.gt/health" /><Field name="interval_minutes" label="Intervalo (minutos)" type="number" defaultValue="5" /></FormCard><DataTable rows={state.data} columns={['name','target','status','availability_percentage','latency_ms','last_checked_at']} labels={['Monitor','Objetivo','Estado','Disponibilidad %','Latencia ms','Última revisión']} actions={(row) => <button className="text-sm font-bold text-cyan-700" onClick={async () => { await api(`/monitors/${row.id}/check`, { method: 'POST' }); await state.load(); }}>Verificar</button>} /></Page>;
}

function AlertsPage() {
  const state = useData<Row[]>('/alerts', []);
  return <Page title="Alertas inteligentes" intro="Hallazgos correlacionados desde diagnósticos, monitoreo y SIEM."><DataTable rows={state.data} columns={['title','severity','source','status','detected_at','details']} labels={['Alerta','Severidad','Fuente','Estado','Detectada','Detalle']} actions={(row) => row.status !== 'Cerrada' && <button className="text-sm font-bold text-cyan-700" onClick={async () => { await api(`/alerts/${row.id}`, { method: 'PUT', body: JSON.stringify({ status: 'Reconocida' }) }); await state.load(); }}>Reconocer</button>} /></Page>;
}

function CompliancePage() {
  const state = useData<Compliance>('/compliance', { overall_score: 0, frameworks: [], controls: [] });
  return <Page title="Cumplimiento normativo" intro="Evaluación con evidencia para ISO 27001, NIST CSF 2.0, CIS Controls v8, OWASP Top 10 y MITRE ATT&CK."><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{state.data.frameworks.map((item) => <Metric key={item.framework} label={item.framework} value={`${item.score}%`} detail={`${item.implemented}/${item.total} implementados`} />)}</section><DataTable rows={state.data.controls} columns={['framework','code','title','status','score','evidence']} labels={['Marco','Control','Requisito','Estado','Puntaje','Evidencia']} actions={(row) => <select value={String(row.status)} onChange={async (event) => { await api(`/compliance/${row.id}`, { method: 'PUT', body: JSON.stringify({ status: event.target.value }) }); await state.load(); }} className="rounded-lg border px-2 py-1 text-xs"><option>Pendiente</option><option>Parcial</option><option>Implementado</option><option>No aplica</option></select>} /></Page>;
}

function DocumentsPage() {
  const state = useData<Row[]>('/documents', []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await api('/documents', { method: 'POST', body: JSON.stringify(values) }); await state.load(); }
  return <Page title="Gestión documental" intro="Centralice políticas, evidencias y procedimientos utilizados en auditorías."><FormCard onSubmit={submit} submit="Guardar evidencia"><Field name="name" label="Nombre" /><Field name="category" label="Categoría" defaultValue="Evidencia" /><label className="text-sm font-semibold sm:col-span-2">Contenido<textarea name="content" required className={`${inputClass} min-h-24`} /></label></FormCard><DataTable rows={state.data} columns={['name','category','mime_type','size_bytes','uploaded_by','createdAt']} labels={['Documento','Categoría','Tipo','Bytes','Responsable','Fecha']} /></Page>;
}

function SocPage() {
  const state = useData<Row[]>('/events', []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await api('/events', { method: 'POST', body: JSON.stringify(values) }); await state.load(); }
  return <Page title="SOC virtual y SIEM" intro="Consolide telemetría, correlacione severidad y transforme eventos prioritarios en alertas."><FormCard onSubmit={submit} submit="Ingerir evento"><Field name="source" label="Fuente" /><Field name="event_type" label="Tipo de evento" /><Select name="severity" label="Severidad" options={['Informativa','Baja','Media','Alta','Crítica'].map((x) => [x,x])} /><Field name="description" label="Descripción" /></FormCard><DataTable rows={state.data} columns={['source','event_type','severity','description','occurred_at']} labels={['Fuente','Evento','Severidad','Descripción','Ocurrencia']} /></Page>;
}

function IncidentsPage() {
  const state = useData<Row[]>('/incidents', []);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); await api('/incidents', { method: 'POST', body: JSON.stringify(values) }); await state.load(); }
  return <Page title="Gestión y respuesta de incidentes" intro="Asigne responsables, ejecute playbooks y conserve una bitácora auditable."><FormCard onSubmit={submit} submit="Crear incidente"><Field name="title" label="Título" /><Select name="severity" label="Severidad" options={['Baja','Media','Alta','Crítica'].map((x) => [x,x])} /><Field name="assigned_to" label="Responsable" /><Field name="description" label="Descripción" /></FormCard><DataTable rows={state.data} columns={['title','severity','status','assigned_to','playbook','createdAt']} labels={['Incidente','Severidad','Estado','Responsable','Playbook','Creado']} actions={(row) => row.status !== 'Cerrado' && <button className="text-sm font-bold text-cyan-700" onClick={async () => { await api(`/incidents/${row.id}/respond`, { method: 'POST', body: JSON.stringify({ action_type: 'Activar playbook de contención' }) }); await state.load(); }}>Responder</button>} /></Page>;
}

function ReportsPage() { const [error, setError] = useState(''); const reports = useData<Row[]>('/reports/monthly', []); return <Page title="Reportes para auditoría" intro="Genere un informe actualizado y consulte los cortes mensuales producidos automáticamente."><div className="rounded-3xl bg-[#071526] p-8 text-white"><Download size={34} className="text-cyan-300" /><h3 className="mt-5 text-2xl font-black">Informe ejecutivo PDF</h3><p className="mt-2 max-w-2xl text-slate-300">La descarga autenticada incorpora la información vigente de PostgreSQL, priorización NIST y plan de acción.</p><button onClick={() => void downloadReport().catch((cause) => setError(cause.message))} className="mt-6 rounded-xl bg-cyan-400 px-5 py-3 font-bold text-[#071526]">Generar y descargar</button>{error && <ErrorText text={error} />}</div><Panel title="Archivo mensual automático"><DataTable rows={reports.data} columns={['period','report_type','size_bytes','generated_at']} labels={['Periodo','Tipo','Bytes','Generado']} actions={(row) => <button className="text-sm font-bold text-cyan-700" onClick={() => void downloadProtected(`/reports/monthly/${row.id}.pdf`, `informe-${row.period}.pdf`)}>Descargar</button>} /></Panel></Page>; }

function SecurityPage() {
  const [setup, setSetup] = useState<{ secret: string; otpauth_uri: string } | null>(null); const [message, setMessage] = useState('');
  async function enable(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const code = new FormData(event.currentTarget).get('code'); await api('/auth/mfa/enable', { method: 'POST', body: JSON.stringify({ code }) }); setMessage('MFA activado correctamente. Se solicitará en el siguiente acceso.'); }
  return <Page title="Seguridad Zero Trust" intro="Cada solicitud se autentica con JWT, las operaciones quedan auditadas y Kubernetes aplica aislamiento de red."><Panel title="Autenticación multifactor"><p className="mb-4 text-sm text-slate-600">Active códigos TOTP con su aplicación de autenticación.</p>{!setup ? <button className="rounded-xl bg-cyan-700 px-4 py-2 font-bold text-white" onClick={async () => setSetup(await api('/auth/mfa/setup', { method: 'POST' }))}>Configurar MFA</button> : <form onSubmit={enable} className="space-y-4"><p className="break-all rounded-xl bg-slate-100 p-3 font-mono text-xs">{setup.secret}</p><p className="text-xs text-slate-500">Agregue el secreto a Google Authenticator, Microsoft Authenticator, 1Password u otra aplicación TOTP.</p><Field name="code" label="Código de verificación" inputMode="numeric" /><button className="rounded-xl bg-cyan-700 px-4 py-2 font-bold text-white">Confirmar MFA</button></form>}{message && <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p>}</Panel></Page>;
}

function CrudPage({ title, intro, path, columns, labels, fields, defaults = {}, extra }: { title: string; intro: string; path: string; columns: string[]; labels: string[]; fields: string[][]; defaults?: Record<string, unknown>; extra?: ReactNode }) {
  const state = useData<Row[]>(path, []); const [error, setError] = useState('');
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const values = { ...defaults, ...Object.fromEntries(new FormData(event.currentTarget)) }; for (const key of ['criticality','likelihood','impact','asset_id']) if (values[key] !== undefined) values[key] = Number(values[key]); try { await api(path, { method: 'POST', body: JSON.stringify(values) }); event.currentTarget.reset(); await state.load(); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Error'); } }
  return <Page title={title} intro={intro}><FormCard onSubmit={submit} submit="Registrar">{fields.map(([name,label]) => <Field key={name} name={name} label={label} type={/criticidad|probabilidad|impacto/i.test(label) ? 'number' : 'text'} />)}{extra}{error && <ErrorText text={error} />}</FormCard><DataTable rows={state.data} columns={columns} labels={labels} /></Page>;
}

function Page({ title, intro, children }: { title: string; intro: string; children: ReactNode }) { return <div className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-cyan-700">CiberGuate IA</p><h2 className="mt-2 text-3xl font-black">{title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{intro}</p></div>{children}</div>; }
function Hero({ title, text, badge }: { title: string; text: string; badge: string }) { return <section className="rounded-3xl bg-[#071526] p-7 text-white"><span className="rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-bold text-cyan-300">{badge}</span><h2 className="mt-5 text-3xl font-black">{title}</h2><p className="mt-3 max-w-4xl leading-7 text-slate-300">{text}</p></section>; }
function Metric({ label, value, detail }: { label: string; value: ReactNode; detail: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-2 text-xs text-slate-500">{detail}</p></div>; }
function Mini({ label, value }: { label: string; value: ReactNode }) { return <div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>; }
function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="mb-5 text-lg font-black">{title}</h3>{children}</section>; }
function FormCard({ onSubmit, submit, children }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>; submit: string; children: ReactNode }) { return <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2 xl:grid-cols-4">{children}<div className="flex items-end"><button className="w-full rounded-xl bg-cyan-700 px-4 py-3 text-sm font-bold text-white">{submit}</button></div></form>; }
const inputClass = 'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-600';
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="text-sm font-semibold">{label}<input required className={inputClass} {...props} /></label>; }
function Select({ name, label, options }: { name: string; label: string; options: Array<readonly [string,string]> }) { return <label className="text-sm font-semibold">{label}<select name={name} className={inputClass}>{options.map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }
function ErrorText({ text }: { text: string }) { return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{text}</p>; }
function DataTable({ rows, columns, labels, actions }: { rows: Row[]; columns: string[]; labels: string[]; actions?: (row: Row) => ReactNode }) { return <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{labels.map((label) => <th key={label} className="px-4 py-3">{label}</th>)}{actions && <th className="px-4 py-3">Acción</th>}</tr></thead><tbody className="divide-y divide-slate-100">{rows.map((row) => <tr key={row.id}>{columns.map((column) => <td key={column} className="max-w-xs px-4 py-3 text-slate-700">{formatValue(row[column])}</td>)}{actions && <td className="px-4 py-3">{actions(row)}</td>}</tr>)}</tbody></table>{rows.length === 0 && <p className="p-10 text-center text-sm text-slate-500">Aún no hay registros.</p>}</div>; }
function formatValue(value: unknown): ReactNode { if (value === null || value === undefined || value === '') return '—'; if (typeof value === 'boolean') return value ? 'Sí' : 'No'; if (typeof value === 'object') return JSON.stringify(value); const text = String(value); return /^\d{4}-\d{2}-\d{2}T/.test(text) ? new Date(text).toLocaleString('es-GT') : text; }
