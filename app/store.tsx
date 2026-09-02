'use client';

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ReactNode, useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';

import type { AiAnalysis, Compliance, Dashboard, Row, Scan, SecurityOverview, Session } from './types';

type AuthState = { token: string | null; user: Session['user'] | null; hydrated: boolean };
const authSlice = createSlice({
  name: 'auth', initialState: { token: null, user: null, hydrated: false } as AuthState,
  reducers: {
    hydrateAuth(state, action: PayloadAction<string | null>) { state.token = action.payload; state.hydrated = true; },
    setSession(state, action: PayloadAction<Session>) { state.token = action.payload.access_token; state.user = action.payload.user; },
    logout(state) { state.token = null; state.user = null; },
  },
});

type UiState = { sidebarOpen: boolean; notice: { kind: 'success' | 'error'; message: string } | null };
const uiSlice = createSlice({
  name: 'ui', initialState: { sidebarOpen: false, notice: null } as UiState,
  reducers: {
    toggleSidebar(state) { state.sidebarOpen = !state.sidebarOpen; },
    closeSidebar(state) { state.sidebarOpen = false; },
    notify(state, action: PayloadAction<UiState['notice']>) { state.notice = action.payload; },
    clearNotice(state) { state.notice = null; },
  },
});

const tags = ['Assets', 'Risks', 'Scans', 'Monitors', 'Alerts', 'Compliance', 'Documents', 'Events', 'Incidents', 'Reports', 'Audit'] as const;
const authenticatedBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders(headers, { getState }) {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (token) headers.set('authorization', `Bearer ${token}`);
    headers.set('content-type', 'application/json');
    return headers;
  },
});

export const platformApi = createApi({
  reducerPath: 'platformApi',
  baseQuery: async (args, api, extraOptions) => {
    const result = await authenticatedBaseQuery(args, api, extraOptions);
    if (result.error?.status === 401 && (api.getState() as { auth: AuthState }).auth.token) api.dispatch(authSlice.actions.logout());
    return result;
  },
  tagTypes: [...tags],
  endpoints: (builder) => ({
    login: builder.mutation<Session | { mfa_required: true; mfa_token: string }, Record<string, unknown>>({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
    verifyMfa: builder.mutation<Session, Record<string, unknown>>({ query: (body) => ({ url: '/auth/mfa/verify-login', method: 'POST', body }) }),
    oauthConfig: builder.query<{ enabled: boolean; authorization_url?: string }, void>({ query: () => '/auth/oauth/config' }),
    oauthCallback: builder.mutation<Session, Record<string, unknown>>({ query: (body) => ({ url: '/auth/oauth/callback', method: 'POST', body }) }),
    dashboard: builder.query<Dashboard, void>({ query: () => '/dashboard', providesTags: ['Assets', 'Risks'] }),
    overview: builder.query<SecurityOverview, void>({ query: () => '/security/overview', providesTags: [...tags] }),
    ai: builder.query<AiAnalysis, void>({ query: () => '/ai/analysis', providesTags: ['Risks', 'Alerts', 'Compliance', 'Events'] }),
    assets: builder.query<Row[], void>({ query: () => '/assets', providesTags: ['Assets'] }),
    createAsset: builder.mutation<Row, Record<string, unknown>>({ query: (body) => ({ url: '/assets', method: 'POST', body }), invalidatesTags: ['Assets'] }),
    deleteAsset: builder.mutation<void, number>({ query: (id) => ({ url: `/assets/${id}`, method: 'DELETE' }), invalidatesTags: ['Assets', 'Risks'] }),
    risks: builder.query<Row[], void>({ query: () => '/risks', providesTags: ['Risks'] }),
    createRisk: builder.mutation<Row, Record<string, unknown>>({ query: (body) => ({ url: '/risks', method: 'POST', body }), invalidatesTags: ['Risks'] }),
    deleteRisk: builder.mutation<void, number>({ query: (id) => ({ url: `/risks/${id}`, method: 'DELETE' }), invalidatesTags: ['Risks'] }),
    scans: builder.query<Scan[], void>({ query: () => '/scans', providesTags: ['Scans'] }),
    runScan: builder.mutation<Scan, Record<string, unknown>>({ query: (body) => ({ url: '/scans', method: 'POST', body }), invalidatesTags: ['Scans', 'Alerts'] }),
    monitors: builder.query<Row[], void>({ query: () => '/monitors', providesTags: ['Monitors'] }),
    createMonitor: builder.mutation<Row, Record<string, unknown>>({ query: (body) => ({ url: '/monitors', method: 'POST', body }), invalidatesTags: ['Monitors', 'Alerts'] }),
    checkMonitor: builder.mutation<Row, number>({ query: (id) => ({ url: `/monitors/${id}/check`, method: 'POST' }), invalidatesTags: ['Monitors', 'Alerts'] }),
    deleteMonitor: builder.mutation<void, number>({ query: (id) => ({ url: `/monitors/${id}`, method: 'DELETE' }), invalidatesTags: ['Monitors'] }),
    alerts: builder.query<Row[], void>({ query: () => '/alerts', providesTags: ['Alerts'] }),
    updateAlert: builder.mutation<Row, { id: number; status: string }>({ query: ({ id, status }) => ({ url: `/alerts/${id}`, method: 'PUT', body: { status } }), invalidatesTags: ['Alerts'] }),
    compliance: builder.query<Compliance, void>({ query: () => '/compliance', providesTags: ['Compliance'] }),
    assessCompliance: builder.mutation<{ evaluated_controls: number; evaluated_at: string }, void>({ query: () => ({ url: '/compliance/automatic-assessment', method: 'POST' }), invalidatesTags: ['Compliance', 'Audit'] }),
    updateControl: builder.mutation<Row, { id: number; status: string }>({ query: ({ id, status }) => ({ url: `/compliance/${id}`, method: 'PUT', body: { status } }), invalidatesTags: ['Compliance'] }),
    documents: builder.query<Row[], void>({ query: () => '/documents', providesTags: ['Documents'] }),
    document: builder.query<Row, number>({ query: (id) => `/documents/${id}`, providesTags: ['Documents'] }),
    createDocument: builder.mutation<Row, Record<string, unknown>>({ query: (body) => ({ url: '/documents', method: 'POST', body }), invalidatesTags: ['Documents', 'Audit'] }),
    deleteDocument: builder.mutation<void, number>({ query: (id) => ({ url: `/documents/${id}`, method: 'DELETE' }), invalidatesTags: ['Documents', 'Audit'] }),
    events: builder.query<Row[], void>({ query: () => '/events', providesTags: ['Events'] }),
    createEvent: builder.mutation<Row, Record<string, unknown>>({ query: (body) => ({ url: '/events', method: 'POST', body }), invalidatesTags: ['Events', 'Alerts'] }),
    incidents: builder.query<Row[], void>({ query: () => '/incidents', providesTags: ['Incidents'] }),
    createIncident: builder.mutation<Row, Record<string, unknown>>({ query: (body) => ({ url: '/incidents', method: 'POST', body }), invalidatesTags: ['Incidents', 'Audit'] }),
    respondIncident: builder.mutation<Row, number>({ query: (id) => ({ url: `/incidents/${id}/respond`, method: 'POST', body: { action_type: 'Activar playbook de contención' } }), invalidatesTags: ['Incidents', 'Audit'] }),
    updateIncident: builder.mutation<Row, { id: number; status: string }>({ query: ({ id, status }) => ({ url: `/incidents/${id}`, method: 'PUT', body: { status } }), invalidatesTags: ['Incidents', 'Audit'] }),
    monthlyReports: builder.query<Row[], void>({ query: () => '/reports/monthly', providesTags: ['Reports'] }),
    auditLogs: builder.query<Row[], void>({ query: () => '/audit-logs', providesTags: ['Audit'] }),
    setupMfa: builder.mutation<{ secret: string; otpauth_uri: string }, void>({ query: () => ({ url: '/auth/mfa/setup', method: 'POST' }) }),
    enableMfa: builder.mutation<void, string>({ query: (code) => ({ url: '/auth/mfa/enable', method: 'POST', body: { code } }) }),
  }),
});

export const store = configureStore({ reducer: { auth: authSlice.reducer, ui: uiSlice.reducer, [platformApi.reducerPath]: platformApi.reducer }, middleware: (getDefault) => getDefault().concat(platformApi.middleware) });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const { setSession, logout, hydrateAuth } = authSlice.actions;
export const { toggleSidebar, closeSidebar, notify, clearNotice } = uiSlice.actions;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

function Hydrate() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(hydrateAuth(sessionStorage.getItem('ciberguate_token')));
    let previous = store.getState().auth.token;
    return store.subscribe(() => { const token = store.getState().auth.token; if (token === previous) return; previous = token; if (token) sessionStorage.setItem('ciberguate_token', token); else sessionStorage.removeItem('ciberguate_token'); });
  }, [dispatch]);
  return null;
}
export function AppStoreProvider({ children }: { children: ReactNode }) { return <Provider store={store}><Hydrate />{children}</Provider>; }

export const {
  useLoginMutation, useVerifyMfaMutation, useOauthConfigQuery, useOauthCallbackMutation,
  useDashboardQuery, useOverviewQuery, useAiQuery,
  useAssetsQuery, useCreateAssetMutation, useDeleteAssetMutation,
  useRisksQuery, useCreateRiskMutation, useDeleteRiskMutation,
  useScansQuery, useRunScanMutation,
  useMonitorsQuery, useCreateMonitorMutation, useCheckMonitorMutation, useDeleteMonitorMutation,
  useAlertsQuery, useUpdateAlertMutation,
  useComplianceQuery, useAssessComplianceMutation, useUpdateControlMutation,
  useDocumentsQuery, useDocumentQuery, useCreateDocumentMutation, useDeleteDocumentMutation,
  useEventsQuery, useCreateEventMutation,
  useIncidentsQuery, useCreateIncidentMutation, useRespondIncidentMutation, useUpdateIncidentMutation,
  useMonthlyReportsQuery, useAuditLogsQuery, useSetupMfaMutation, useEnableMfaMutation,
} = platformApi;
