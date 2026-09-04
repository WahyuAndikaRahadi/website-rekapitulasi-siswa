/**
 * Chart.js v4 — registrasi terpusat.
 * Import file ini SEKALI di entry point (resources/js/app.tsx)
 * sebelum komponen chart dipakai, supaya tidak ada error
 * "category is not a registered scale".
 */
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);

// Global defaults — styling sesuai brand SMKN 69
ChartJS.defaults.font.family = "'Instrument Sans', ui-sans-serif, system-ui, sans-serif";
ChartJS.defaults.font.size = 12;
ChartJS.defaults.color = '#64748B'; // --muted-foreground
ChartJS.defaults.borderColor = '#E2E8F0'; // --border
ChartJS.defaults.plugins.legend.labels.usePointStyle = true;
ChartJS.defaults.plugins.legend.labels.pointStyleWidth = 8;
ChartJS.defaults.plugins.tooltip.backgroundColor = '#FFFFFF';
ChartJS.defaults.plugins.tooltip.titleColor = '#0F172A';
ChartJS.defaults.plugins.tooltip.bodyColor = '#64748B';
ChartJS.defaults.plugins.tooltip.borderColor = '#E2E8F0';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;
ChartJS.defaults.plugins.tooltip.padding = 10;
ChartJS.defaults.plugins.tooltip.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)' as never;
