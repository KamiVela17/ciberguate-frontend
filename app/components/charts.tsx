'use client';

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);
const colors = ['#0891b2', '#0f172a', '#f59e0b', '#ef4444', '#10b981', '#8b5cf6', '#64748b'];
const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } };

export function DoughnutChart({ labels, values, title }: { labels: string[]; values: number[]; title: string }) { return <div className="h-72" role="img" aria-label={title}><Doughnut options={options} data={{ labels, datasets: [{ label: title, data: values, backgroundColor: colors }] }} /></div>; }
export function BarChart({ labels, values, title }: { labels: string[]; values: number[]; title: string }) { return <div className="h-72" role="img" aria-label={title}><Bar options={{ ...options, scales: { y: { beginAtZero: true } } }} data={{ labels, datasets: [{ label: title, data: values, backgroundColor: colors[0], borderRadius: 8 }] }} /></div>; }
export function LineChart({ labels, values, title }: { labels: string[]; values: number[]; title: string }) { return <div className="h-72" role="img" aria-label={title}><Line options={{ ...options, scales: { y: { beginAtZero: true } } }} data={{ labels, datasets: [{ label: title, data: values, borderColor: colors[0], backgroundColor: '#0891b233', fill: true, tension: .35 }] }} /></div>; }
