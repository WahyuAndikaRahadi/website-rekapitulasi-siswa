import { TopKelasItem, TopKelasLeaderboard, TopMuridItem, TopMuridLeaderboard } from '@/components/leaderboard-tables';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    BarChart3,
    Calendar,
    CheckCircle2,
    Clock,
    HeartHandshake,
    ShieldAlert,
    TrendingDown,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/admin/dashboard' }];

interface TrenItem {
    bulan: string;
    pelanggaran: number;
    kebaikan: number;
}

interface MuridSkor {
    nama: string;
    kelas: string;
    skor_resmi: number;
}

interface KelasSkor {
    nama_kelas: string;
    rata_skor: number;
    jumlah_murid: number;
}

interface Props {
    stats: {
        pending: number;
        total_bulan_ini: number;
        pelanggaran_bulan_ini: number;
        kebaikan_bulan_ini: number;
    };
    tren_laporan: TrenItem[];
    top_murids: TopMuridItem[];
    top_kelas: TopKelasItem[];
    murid_skor_rendah: MuridSkor[];
    kelas_skor: KelasSkor[];
    tahun_ajaran: { label: string } | null;
}

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
        default: 'bg-[#1E5FA8]/15 text-[#1E5FA8]',
        warning: 'bg-[#F5B700]/15 text-[#D97706]',
        destructive: 'bg-[#D6293E]/15 text-[#D6293E]',
        success: 'bg-[#2E8B57]/15 text-[#2E8B57]',
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
                className="group block rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-[#1E5FA8]/50 hover:shadow-sm"
            >
                {cardContent}
            </Link>
        );
    }

    return <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs">{cardContent}</div>;
}

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
    const emptyTren = !tren_laporan || tren_laporan.length === 0 || tren_laporan.every((t) => t.pelanggaran === 0 && t.kebaikan === 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard Admin - SMKN 69 Jakarta" />
            <div className="space-y-6 p-6 md:p-6">
                {/* Greeting & Info */}
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
                        <div className="inline-flex items-center gap-2 self-start rounded-full border border-blue-200/60 bg-blue-50/70 px-3.5 py-1.5 text-xs font-semibold text-[#0B2559] shadow-2xs">
                            <Calendar className="size-3.5 text-[#1E5FA8]" />
                            <span>Tahun Ajaran {tahun_ajaran.label}</span>
                        </div>
                    )}
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Laporan Pending"
                        value={stats?.pending ?? 0}
                        icon={Clock}
                        variant="warning"
                        description="Menunggu tindak lanjut admin"
                        href="/admin/laporan?status=pending"
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
                        label="Kebaikan Bulan Ini"
                        value={stats?.kebaikan_bulan_ini ?? 0}
                        icon={HeartHandshake}
                        variant="success"
                    />
                </div>

                {/* ── LEADERBOARD SECTION (TOP 10 STUDENTS & TOP 10 CLASSES) ── */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <TopMuridLeaderboard topMurids={top_murids} />
                    <TopKelasLeaderboard topKelas={top_kelas} />
                </div>

                {/* Chart tren laporan */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-bold text-slate-900">Tren Laporan 6 Bulan Terakhir</h2>
                            <p className="text-xs text-muted-foreground">Komparasi jumlah peristiwa pelanggaran dan apresiasi kebaikan</p>
                        </div>
                    </div>

                    {emptyTren ? (
                        <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/50 py-12 text-center">
                            <div className="mb-3 rounded-full bg-slate-100 p-3 text-muted-foreground">
                                <BarChart3 className="size-6" />
                            </div>
                            <p className="text-sm font-medium text-foreground">Belum ada data laporan</p>
                            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
                                Laporan pelanggaran atau kebaikan yang dibuat oleh guru akan ditampilkan di grafik ini.
                            </p>
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart
                                data={tren_laporan}
                                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} allowDecimals={false} axisLine={{ stroke: '#E2E8F0' }} />
                                <Tooltip
                                    contentStyle={{
                                        fontSize: 12,
                                        borderRadius: 8,
                                        border: '1px solid #E2E8F0',
                                        backgroundColor: '#FFFFFF',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    }}
                                    cursor={{ fill: 'rgba(30, 95, 168, 0.06)' }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                                    iconType="circle"
                                />
                                <Bar
                                    dataKey="pelanggaran"
                                    name="Pelanggaran"
                                    fill="#D6293E"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="kebaikan"
                                    name="Kebaikan"
                                    fill="#2E8B57"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Murid skor terendah */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-slate-900">Siswa Butuh Pembinaan Khusus</h2>
                            <p className="text-xs text-muted-foreground">Daftar siswa dengan akumulasi skor terendah untuk tindak lanjut konseling/BK</p>
                        </div>

                        {murid_skor_rendah.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/50 py-8 text-center">
                                <div className="mb-2 rounded-full bg-emerald-50 p-2.5 text-[#2E8B57]">
                                    <CheckCircle2 className="size-5 text-[#2E8B57]" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Kondisi Kedisiplinan Aman</p>
                                <p className="text-xs text-muted-foreground">Tidak ada siswa yang berada pada batas skor kritis.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-left text-slate-400">
                                            <th className="pb-2.5 px-2 font-semibold">Nama Siswa</th>
                                            <th className="pb-2.5 px-2 font-semibold">Kelas</th>
                                            <th className="pb-2.5 px-2 text-right font-semibold">Skor</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {murid_skor_rendah.map((m, i) => (
                                            <tr key={i} className="hover:bg-slate-50/50">
                                                <td className="py-2.5 px-2 font-semibold text-slate-900">{m.nama}</td>
                                                <td className="py-2.5 px-2 text-slate-500 font-medium">{m.kelas}</td>
                                                <td className={`py-2.5 px-2 text-right font-mono font-bold ${m.skor_resmi < 0 ? 'text-[#D6293E]' : m.skor_resmi > 0 ? 'text-[#2E8B57]' : 'text-slate-500'}`}>
                                                    {m.skor_resmi >= 0 ? `+${m.skor_resmi}` : m.skor_resmi}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Ranking kelas per rata-rata skor */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                        <div className="mb-4">
                            <h2 className="text-base font-bold text-slate-900">Distribusi Rata-rata Skor per Kelas</h2>
                            <p className="text-xs text-muted-foreground">Sebaran nilai rata-rata kedisiplinan per rombel</p>
                        </div>

                        {kelas_skor.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50/50 py-8 text-center">
                                <div className="mb-2 rounded-full bg-slate-100 p-2.5 text-muted-foreground">
                                    <Users className="size-5" />
                                </div>
                                <p className="text-sm font-medium text-foreground">Belum ada data kelas</p>
                                <p className="text-xs text-muted-foreground">Data rekap rata-rata kelas belum tersedia.</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={Math.max(kelas_skor.length * 36 + 20, 160)}>
                                <BarChart
                                    layout="vertical"
                                    data={kelas_skor}
                                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals axisLine={{ stroke: '#E2E8F0' }} />
                                    <YAxis
                                        dataKey="nama_kelas"
                                        type="category"
                                        tick={{ fontSize: 11, fill: '#0F172A', fontWeight: 500 }}
                                        width={85}
                                        axisLine={{ stroke: '#E2E8F0' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            fontSize: 12,
                                            borderRadius: 8,
                                            border: '1px solid #E2E8F0',
                                            backgroundColor: '#FFFFFF',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                        }}
                                        formatter={(val: number) => [
                                            val >= 0 ? `+${val}` : val,
                                            'Rata-rata Skor',
                                        ]}
                                    />
                                    <Bar dataKey="rata_skor" name="Rata-rata Skor" radius={[0, 4, 4, 0]}>
                                        {kelas_skor.map((entry, index) => (
                                            <Cell
                                                key={index}
                                                fill={entry.rata_skor < 0 ? '#D6293E' : entry.rata_skor > 0 ? '#1E5FA8' : '#64748B'}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
