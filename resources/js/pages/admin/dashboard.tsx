import { TopKelasItem, TopKelasLeaderboard, TopMuridItem, TopMuridLeaderboard } from '@/components/leaderboard-tables';
import AppLayout from '@/layouts/app-layout';
import { getViolationPointBadgeInfo } from '@/lib/utils';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    HeartHandshake,
    ShieldAlert,
    Users,
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

// ─── Types ────────────────────────────────────────────────────────────────────

interface TrenItem {
    bulan: string;
    pelanggaran: number;
    prestasi?: number;
    kebaikan?: number;
}

interface MuridSkor {
    nama: string;
    kelas: string;
    poin_pelanggaran?: number;
    poin_prestasi?: number;
    tahap_pembinaan?: string;
    skor_resmi?: number;
}

interface KelasSkor {
    nama_kelas: string;
    rata_skor: number;
    jumlah_murid: number;
}

interface Props {
    stats: {
        menunggu_verifikasi?: number;
        pending?: number;
        total_bulan_ini: number;
        pelanggaran_bulan_ini: number;
        prestasi_bulan_ini?: number;
        kebaikan_bulan_ini?: number;
    };
    tren_laporan: TrenItem[];
    top_murids: TopMuridItem[];
    top_kelas: TopKelasItem[];
    murid_skor_rendah: MuridSkor[];
    kelas_skor: KelasSkor[];
    tahun_ajaran: { label: string } | null;
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    variant = 'default',
    description,
    href,
}: {
    label: string;
    value: number | string;
    icon: React.ElementType;
    variant?: 'default' | 'warning' | 'destructive' | 'success';
    description?: string;
    href?: string;
}) {
    const iconStyles = {
        default: 'bg-primary-light/15 text-primary-light',
        warning: 'bg-warning/15 text-amber-600',
        destructive: 'bg-destructive/10 text-destructive',
        success: 'bg-success/10 text-success',
    };

    const cardContent = (
        <div className="flex items-start justify-between">
            <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
                <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            <div className={`rounded-xl p-3 ${iconStyles[variant]}`}>
                <Icon className="size-5" />
            </div>
        </div>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="group block rounded-2xl border border-border bg-card p-5 shadow-xs transition-all hover:border-primary-light/50 hover:shadow-sm"
            >
                {cardContent}
            </Link>
        );
    }

    return <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">{cardContent}</div>;
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl bg-muted/30 py-12 text-center">
            <div className="mb-3 rounded-full bg-muted p-3 text-muted-foreground">
                <Icon className="size-6" />
            </div>
            <p className="text-sm font-medium text-foreground">{title}</p>
            {description && (
                <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-relaxed">{description}</p>
            )}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboard({
    stats,
    tren_laporan = [],
    top_murids = [],
    top_kelas = [],
    murid_skor_rendah = [],
    kelas_skor = [],
    tahun_ajaran,
}: Props) {
    const { auth } = usePage<SharedData>().props;

    const emptyTren =
        !tren_laporan ||
        tren_laporan.length === 0 ||
        tren_laporan.every((t) => t.pelanggaran === 0 && (t.prestasi ?? t.kebaikan ?? 0) === 0);

    // ── Chart data: Tren Laporan ───────────────────────────────────────────────
    const trenChartData = {
        labels: tren_laporan.map((t) => t.bulan),
        datasets: [
            {
                label: 'Pelanggaran',
                data: tren_laporan.map((t) => t.pelanggaran),
                borderColor: '#D6293E',
                backgroundColor: 'rgba(214, 41, 62, 0.08)',
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#D6293E',
                pointRadius: 4,
                pointHoverRadius: 6,
            },
            {
                label: 'Prestasi',
                data: tren_laporan.map((t) => t.prestasi ?? t.kebaikan ?? 0),
                borderColor: '#2E8B57',
                backgroundColor: 'rgba(46, 139, 87, 0.08)',
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#2E8B57',
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const trenChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                align: 'end' as const,
                labels: { padding: 16, boxWidth: 8, boxHeight: 8 },
            },
            tooltip: {
                mode: 'index' as const,
                intersect: false,
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { color: '#E2E8F0' },
                ticks: { color: '#64748B' },
            },
            y: {
                beginAtZero: true,
                grid: { color: '#F1F5F9' },
                border: { color: '#E2E8F0', dash: [4, 4] },
                ticks: { color: '#64748B', precision: 0 },
            },
        },
        interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    };

    // ── Chart data: Rata-rata Skor per Kelas ──────────────────────────────────
    const kelasChartData = {
        labels: kelas_skor.map((k) => k.nama_kelas),
        datasets: [
            {
                label: 'Rata-rata Poin Prestasi',
                data: kelas_skor.map((k) => k.rata_skor),
                backgroundColor: kelas_skor.map((k) =>
                    k.rata_skor < 0 ? 'rgba(214,41,62,0.75)' : k.rata_skor > 0 ? 'rgba(30,95,168,0.75)' : 'rgba(100,116,139,0.5)',
                ),
                borderColor: kelas_skor.map((k) =>
                    k.rata_skor < 0 ? '#D6293E' : k.rata_skor > 0 ? '#1E5FA8' : '#64748B',
                ),
                borderWidth: 1.5,
                borderRadius: 4,
            },
        ],
    };

    const kelasChartOptions = {
        indexAxis: 'y' as const,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx: { parsed: { x: number } }) => {
                        const val = ctx.parsed.x;
                        return ` Rata-rata: +${val}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: { color: '#F1F5F9' },
                border: { color: '#E2E8F0', dash: [4, 4] },
                ticks: { color: '#64748B', precision: 0 },
            },
            y: {
                grid: { display: false },
                border: { color: '#E2E8F0' },
                ticks: { color: '#0F172A', font: { weight: 500 as const } },
            },
        },
    };

    const kelasChartHeight = Math.max(kelas_skor.length * 40 + 20, 160);

    const pendingCount = stats.menunggu_verifikasi ?? stats.pending ?? 0;
    const prestasiCount = stats.prestasi_bulan_ini ?? stats.kebaikan_bulan_ini ?? 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - SMKN 69 Jakarta" />
            <div className="space-y-6 p-6">
                {/* Greeting */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Selamat Datang, {auth.user?.name}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Monitoring statistik kedisiplinan dan apresiasi siswa SMKN 69 Jakarta
                        </p>
                    </div>
                    {tahun_ajaran && (
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/60 bg-blue-50/70 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-2xs">
                            <Calendar className="size-3.5 text-primary-light" />
                            <span>Tahun Ajaran {tahun_ajaran.label}</span>
                        </div>
                    )}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Menunggu Verifikasi"
                        value={pendingCount}
                        icon={Clock}
                        variant="warning"
                        description="Laporan manual butuh verifikasi admin"
                        href="/admin/laporan?status=menunggu+verifikasi"
                    />
                    <StatCard
                        label="Total Laporan Bulan Ini"
                        value={stats?.total_bulan_ini ?? 0}
                        icon={BarChart3}
                        variant="default"
                        href="/admin/laporan"
                    />
                    <StatCard
                        label="Pelanggaran Bulan Ini"
                        value={stats?.pelanggaran_bulan_ini ?? 0}
                        icon={ShieldAlert}
                        variant="destructive"
                    />
                    <StatCard
                        label="Prestasi Bulan Ini"
                        value={prestasiCount}
                        icon={HeartHandshake}
                        variant="success"
                    />
                </div>

                {/* Leaderboard */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TopMuridLeaderboard topMurids={top_murids} />
                    <TopKelasLeaderboard topKelas={top_kelas} />
                </div>

                {/* Chart: Tren Laporan */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                    <div className="mb-5">
                        <h2 className="text-base font-bold text-foreground">Tren Laporan 6 Bulan Terakhir</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Komparasi jumlah peristiwa pelanggaran dan apresiasi prestasi siswa
                        </p>
                    </div>

                    {emptyTren ? (
                        <EmptyState
                            icon={BarChart3}
                            title="Belum ada data laporan"
                            description="Laporan pelanggaran atau prestasi yang dibuat guru akan ditampilkan di grafik ini."
                        />
                    ) : (
                        <div style={{ height: 260 }}>
                            <Line data={trenChartData} options={trenChartOptions} />
                        </div>
                    )}
                </div>

                {/* Bottom row */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Siswa Pelanggaran Tertinggi */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-foreground">Siswa Butuh Pembinaan Khusus</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                Siswa dengan akumulasi poin pelanggaran aktif tertinggi
                            </p>
                        </div>

                        {murid_skor_rendah.length === 0 ? (
                            <EmptyState
                                icon={CheckCircle2}
                                title="Kondisi Kedisiplinan Aman"
                                description="Tidak ada siswa dengan catatan pelanggaran aktif."
                            />
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-border text-left">
                                            <th className="pb-2.5 px-2 font-semibold text-muted-foreground">Nama Siswa</th>
                                            <th className="pb-2.5 px-2 font-semibold text-muted-foreground">No. Telepon</th>
                                            <th className="pb-2.5 px-2 font-semibold text-muted-foreground">Kelas</th>
                                            <th className="pb-2.5 px-2 font-semibold text-muted-foreground">Tahap Pembinaan</th>
                                            <th className="pb-2.5 px-2 text-right font-semibold text-muted-foreground">Poin Pelanggaran</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {murid_skor_rendah.map((m, i) => {
                                            const poinP = m.poin_pelanggaran ?? Math.abs(m.skor_resmi ?? 0);
                                            const badgeInfo = getViolationPointBadgeInfo(poinP);
                                            return (
                                                <tr
                                                    key={i}
                                                    style={badgeInfo.hasViolation ? badgeInfo.rowStyle : undefined}
                                                    className={`transition-colors ${
                                                        badgeInfo.hasViolation ? badgeInfo.rowClassName : 'hover:bg-muted/30'
                                                    }`}
                                                >
                                                    <td className="py-2.5 px-2 font-semibold text-foreground">{m.nama}</td>
                                                    <td className="py-2.5 px-2 font-mono text-foreground font-semibold">{m.no_telp ?? '—'}</td>
                                                    <td className="py-2.5 px-2 text-muted-foreground font-medium">{m.kelas}</td>
                                                    <td className="py-2.5 px-2 text-muted-foreground font-medium">
                                                        <span
                                                            style={badgeInfo.style}
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold border shadow-2xs ${badgeInfo.classNames}`}
                                                        >
                                                            {m.tahap_pembinaan ?? badgeInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-2.5 px-2 text-right font-mono font-bold">
                                                        <span
                                                            style={badgeInfo.style}
                                                            className={`inline-flex items-center justify-center font-bold px-2 py-0.5 rounded-full text-xs font-mono border shadow-2xs ${badgeInfo.classNames}`}
                                                        >
                                                            {poinP}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Rata-rata skor per kelas */}
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-foreground">Distribusi Rata-rata Poin Prestasi per Kelas</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Sebaran nilai rata-rata prestasi per rombel</p>
                        </div>

                        {kelas_skor.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="Belum ada data kelas"
                                description="Data rekap rata-rata kelas belum tersedia."
                            />
                        ) : (
                            <div style={{ height: kelasChartHeight }}>
                                <Bar data={kelasChartData} options={kelasChartOptions} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
