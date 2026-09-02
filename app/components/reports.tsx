'use client';

import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { ComponentProps, ReactElement } from 'react';

import type { Finding, Row, Scan } from '../types';

const styles = StyleSheet.create({ page: { padding: 36, fontSize: 9, color: '#172033' }, header: { backgroundColor: '#071526', color: '#fff', padding: 18, marginBottom: 18 }, title: { fontSize: 20, fontWeight: 700 }, subtitle: { fontSize: 9, marginTop: 5, color: '#a5f3fc' }, section: { marginBottom: 14 }, heading: { fontSize: 12, fontWeight: 700, color: '#0e7490', marginBottom: 7 }, row: { borderBottom: '1 solid #dbe4ee', paddingVertical: 6 }, label: { fontWeight: 700 }, finding: { border: '1 solid #dbe4ee', padding: 9, marginBottom: 7 }, footer: { position: 'absolute', bottom: 20, left: 36, right: 36, color: '#64748b', fontSize: 7 } });

function Header({ title }: { title: string }) { return <View style={styles.header}><Text style={styles.title}>CiberGuate IA</Text><Text style={styles.subtitle}>{title} · Evidencia generada {new Date().toLocaleString('es-GT')}</Text></View>; }
function Footer() { return <Text style={styles.footer} fixed>Documento generado por CiberGuate IA. La evidencia debe ser revisada por un profesional autorizado.</Text>; }

function DataReport({ title, summary, rows }: { title: string; summary: string; rows: Row[] }) { return <Document><Page size="A4" style={styles.page}><Header title={title} /><View style={styles.section}><Text style={styles.heading}>Resumen de ejecución</Text><Text>{summary}</Text><Text>Registros incluidos: {rows.length}</Text></View><View><Text style={styles.heading}>Evidencia</Text>{rows.map((row) => <View key={row.id} style={styles.row}><Text>{Object.entries(row).filter(([,value]) => typeof value !== 'object').slice(0, 8).map(([key,value]) => `${key}: ${String(value ?? '—')}`).join('  |  ')}</Text></View>)}</View><Footer /></Page></Document>; }
function DiagnosticReport({ scan }: { scan: Scan }) { return <Document><Page size="A4" style={styles.page}><Header title="Informe de diagnóstico de seguridad" /><View style={styles.section}><Text style={styles.heading}>Resultado</Text><Text><Text style={styles.label}>Objetivo: </Text>{scan.target}</Text><Text><Text style={styles.label}>Estado: </Text>{scan.status}</Text><Text><Text style={styles.label}>Riesgo: </Text>{scan.risk_score}/100</Text><Text><Text style={styles.label}>Hallazgos: </Text>{scan.findings_count}</Text><Text><Text style={styles.label}>Resumen: </Text>{scan.summary}</Text></View><View><Text style={styles.heading}>Hallazgos y recomendaciones</Text>{scan.findings.map((finding: Finding, index) => <View key={`${finding.code}-${index}`} style={styles.finding}><Text style={styles.label}>{index + 1}. [{finding.severity}] {finding.title}</Text><Text>Evidencia: {finding.evidence}</Text><Text>Recomendación: {finding.recommendation}</Text></View>)}</View><Footer /></Page></Document>; }

async function save(document: ReactElement, filename: string) { const blob = await pdf(document as ReactElement<ComponentProps<typeof Document>>).toBlob(); const link = window.document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000); }
export const downloadDataReport = (title: string, summary: string, rows: Row[]) => save(<DataReport title={title} summary={summary} rows={rows} />, `${slug(title)}-${new Date().toISOString().slice(0,10)}.pdf`);
export const downloadDiagnosticReport = (scan: Scan) => save(<DiagnosticReport scan={scan} />, `diagnostico-${slug(scan.target)}.pdf`);
function slug(value: string) { return value.toLowerCase().replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60); }
