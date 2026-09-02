export type Row = Record<string, unknown> & { id: number };

export type Session = {
  access_token: string;
  user: { email: string; display_name: string; role: string };
};

export type Dashboard = {
  total_assets: number;
  critical_assets: number;
  open_risks: number;
  critical_risks: number;
  average_risk_score: number;
  compliance_percentage: number;
  risks_by_level: Record<string, number>;
};

export type SecurityOverview = {
  scans: number; monitors: number; services_down: number; open_alerts: number;
  critical_alerts: number; compliance: number; events: number;
  open_incidents: number; documents: number;
};

export type AiAnalysis = {
  mode: string; posture: string; attack_probability: number; trend: string;
  executive_summary: string; recommendations: string[];
};

export type Finding = {
  code: string; title: string; severity: string; evidence: string; recommendation: string;
};

export type Scan = Row & {
  target: string; status: string; risk_score: number; findings_count: number;
  findings: Finding[]; summary: string; started_at?: string; completed_at?: string;
};

export type Compliance = {
  overall_score: number;
  frameworks: Array<{ framework: string; score: number; implemented: number; total: number }>;
  controls: Row[];
};
