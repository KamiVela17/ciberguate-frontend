'use client';

import {
  ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend,
  LinearScale, LineElement, PointElement, Tooltip, type ChartOptions,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import type { ReactNode } from 'react';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

const colors = ['#0891b2', '#0f172a', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#64748b'];
const legend = { position: 'bottom' as const, labels: { boxWidth: 12, boxHeight: 12, padding: 18, usePointStyle: true } };
const grid = { color: '#e2e8f0', drawTicks: false };
const ticks = { color: '#64748b', padding: 8, font: { size: 11 } };

function ChartFrame({ title, children, compact = false }: { title: string; children: ReactNode; compact?: boolean }) {
  return <div className={`relative w-full min-w-0 ${compact ? 'h-64' : 'h-80'}`} role="img" aria-label={title}>{children}</div>;
}

export function DoughnutChart({ labels, values, title, compact }: { labels: string[]; values: number[]; title: string; compact?: boolean }) {
  const options: ChartOptions<'doughnut'> = {
    responsive: true, maintainAspectRatio: false, cutout: '64%', layout: { padding: 8 },
    plugins: { legend, tooltip: { callbacks: { label: (context) => `${context.label}: ${context.formattedValue}` } } },
  };
  return <ChartFrame title={title} compact={compact}><Doughnut options={options} data={{ labels, datasets: [{ label: title, data: values, backgroundColor: colors, borderColor: '#ffffff', borderWidth: 3, hoverOffset: 5 }] }} /></ChartFrame>;
}

export function BarChart({ labels, values, title, maximum }: { labels: string[]; values: number[]; title: string; maximum?: number }) {
  const options: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false, layout: { padding: { top: 8 } },
    plugins: { legend },
    scales: { x: { grid: { display: false }, ticks }, y: { beginAtZero: true, suggestedMax: maximum, grid, ticks, border: { display: false } } },
  };
  return <ChartFrame title={title}><Bar options={options} data={{ labels, datasets: [{ label: title, data: values, backgroundColor: '#0891b2', hoverBackgroundColor: '#0e7490', borderRadius: 7, maxBarThickness: 46 }] }} /></ChartFrame>;
}

export function HorizontalBarChart({ labels, values, title, maximum }: { labels: string[]; values: number[]; title: string; maximum?: number }) {
  const options: ChartOptions<'bar'> = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false, layout: { padding: { right: 12 } },
    plugins: { legend },
    scales: { x: { beginAtZero: true, suggestedMax: maximum, grid, ticks, border: { display: false } }, y: { grid: { display: false }, ticks } },
  };
  return <ChartFrame title={title}><Bar options={options} data={{ labels, datasets: [{ label: title, data: values, backgroundColor: colors, hoverBackgroundColor: colors, borderRadius: 7, maxBarThickness: 34 }] }} /></ChartFrame>;
}

export function LineChart({ labels, values, title }: { labels: string[]; values: number[]; title: string }) {
  const options: ChartOptions<'line'> = {
    responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: 'index' },
    plugins: { legend },
    scales: { x: { grid: { display: false }, ticks }, y: { beginAtZero: true, grid, ticks, border: { display: false } } },
  };
  return <ChartFrame title={title}><Line options={options} data={{ labels, datasets: [{ label: title, data: values, borderColor: '#0891b2', backgroundColor: '#0891b226', pointBackgroundColor: '#0891b2', pointRadius: 4, pointHoverRadius: 6, borderWidth: 3, fill: true, tension: .32 }] }} /></ChartFrame>;
}
