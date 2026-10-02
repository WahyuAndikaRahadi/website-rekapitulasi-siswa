import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { getViolationPointBadgeInfo } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowUpCircle, CheckCircle2, GraduationCap, Pencil, Trash2, Users, X } from 'lucide-react';
import { useState } from 'react';

interface MuridItem {
    id: number;
    nama: string;
    nis: string | null;
    nisn: string | null;
    no_telp: string | null;
    no_ortu: string | null;
    nama_kelas: string;
    kelas_id: number | null;
    status: 'aktif' | 'alumni';
    poin_pelanggaran?: number;
    poin_prestasi?: number;
}
interface KelasItem { id: number; nama_kelas: string; }

interface Props {
    murids: {
        data: MuridItem[];
        links: { url: string | null; label: string; active: boolean }[];
        from: number; to: number; total: number;
    };
    filters: {
        q?: string;
        kelas_id?: string;
        status?: string;
    };
    status: string;
    kelas_list: KelasItem[];
    total_aktif: number;
    total_alumni: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Kelola Murid', href: '/admin/murid' },
];

interface MuridModalProps {
    title: string;
    form: {
        data: {
            nama: string;
            nis: string;
            nisn: string;
            no_telp: string;
            no_ortu: string;
            kelas_id: string;
        };
        setData: (key: any, value: any) => void;
        errors: Record<string, string | undefined>;
        processing: boolean;
    };
    kelas_list: KelasItem[];
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

function MuridModal({ title, form, kelas_list, onSubmit, onClose }: MuridModalProps) {
    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl border bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <h2 className="text-base font-semibold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                        <X className="size-4" />
                    </button>
                </div>
                <form onSubmit={onSubmit} className="space-y-4">
                    {[
                        { key: 'nama', label: 'Nama Lengkap', required: true, placeholder: 'Nama murid' },
                        { key: 'nis', label: 'NIS', required: false, placeholder: 'Opsional' },
                        { key: 'nisn', label: 'NISN', required: false, placeholder: 'Opsional' },
                        { key: 'no_telp', label: 'No. HP Murid', required: false, placeholder: 'Misal: 08123456789' },
                        { key: 'no_ortu', label: 'No. HP / WA Orang Tua', required: true, placeholder: 'Misal: 08123456789' },
                    ].map((f) => (
                        <div key={f.key} className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                                {f.label} {f.required && <span className="text-rose-500">*</span>}
                            </label>
                            <input
                                type={f.key === 'no_telp' || f.key === 'no_ortu' ? 'tel' : 'text'}
                                required={f.required}
                                value={(form.data as any)[f.key]}
                                onChange={(e) => form.setData(f.key as any, e.target.value)}
                                placeholder={f.placeholder}
                                className="flex h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            />
                            {(form.errors as any)[f.key] && <p className="text-xs text-rose-600">{(form.errors as any)[f.key]}</p>}
                        </div>
                    ))}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">
                            Kelas <span className="text-rose-500">*</span>
                        </label>
                        <select
                            required
                            value={(form.data as any).kelas_id}
                            onChange={(e) => form.setData('kelas_id' as any, e.target.value)}
                            className="flex h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                            <option value="">Pilih kelas</option>
                            {kelas_list.map((k) => (
                                <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                            ))}
                        </select>
                        {form.errors.kelas_id && <p className="text-xs text-rose-600">{form.errors.kelas_id}</p>}
                    </div>
                    <div className="flex gap-2.5 pt-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            className="flex-1 rounded-lg"
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            isLoading={form.processing}
                            loadingText="Menyimpan..."
                            className="flex-1 rounded-lg bg-primary text-primary-foreground"
                        >
                            Simpan
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function MuridIndex({ murids, filters, status, kelas_list, total_aktif, total_alumni }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const [kelasId, setKelasId] = useState(filters.kelas_id ?? '');
    const [currentStatus, setCurrentStatus] = useState(status ?? 'aktif');
    const [editItem, setEditItem] = useState<MuridItem | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [showNaikKelasModal, setShowNaikKelasModal] = useState(false);
    const [isNaikKelasLoading, setIsNaikKelasLoading] = useState(false);

    const applyFilter = (newStatus?: string) => {
        const s = newStatus !== undefined ? newStatus : currentStatus;
        router.get('/admin/murid', {
            q,
            kelas_id: kelasId,
            status: s,
        }, { preserveState: true, replace: true });
    };

    const handleTabChange = (newStatus: string) => {
        setCurrentStatus(newStatus);
        applyFilter(newStatus);
    };

    const resetFilter = () => {
        setQ('');
        setKelasId('');
        router.get('/admin/murid', { status: currentStatus }, { replace: true });
    };

    const createForm = useForm({
        nama: '',
        nis: '',
        nisn: '',
        no_telp: '',
        no_ortu: '',
        kelas_id: kelas_list[0]?.id.toString() ?? '',
    });

    const editForm = useForm({
        nama: '',
        nis: '',
        nisn: '',
        no_telp: '',
        no_ortu: '',
        kelas_id: '',
    });

    const openEdit = (m: MuridItem) => {
        setEditItem(m);
        editForm.setData({
            nama: m.nama,
            nis: m.nis ?? '',
            nisn: m.nisn ?? '',
            no_telp: m.no_telp ?? '',
            no_ortu: m.no_ortu ?? '',
            kelas_id: m.kelas_id?.toString() ?? '',
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/murid', {
            onSuccess: () => {
                createForm.reset();
                setShowCreate(false);
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        editForm.put(`/admin/murid/${editItem!.id}`, {
            onSuccess: () => setEditItem(null),
        });
    };

    const handleDelete = (id: number, nama: string) => {
        if (!confirm(`Hapus data murid "${nama}"?`)) return;
        router.delete(`/admin/murid/${id}`);
    };

    const handleNaikKelas = () => {
        setIsNaikKelasLoading(true);
        router.post('/admin/murid/naik-kelas', {}, {
            onFinish: () => {
                setIsNaikKelasLoading(false);
                setShowNaikKelasModal(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Murid - SMKN 69 Jakarta" />
            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto w-full max-w-full min-w-0">
                {/* Header Title & Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Kelola Data Murid
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Manajemen data siswa aktif SMKN 69 Jakarta, kenaikan kelas massal, dan arsip alumni.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Tombol Naik Kelas Massal */}
                        <button
                            type="button"
                            onClick={() => setShowNaikKelasModal(true)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:from-amber-700 hover:to-orange-700 transition-all cursor-pointer"
                        >
                            <ArrowUpCircle className="size-4" />
                            <span>Naik Kelas Massal</span>
                        </button>

                        <Link
                            href="/admin/murid-import"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                        >
                            Import Excel
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowCreate(true)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs cursor-pointer"
                        >
                            + Tambah Murid
                        </button>
                    </div>
                </div>

                {/* Tabs Siswa Aktif vs Alumni */}
                <div className="flex border-b border-slate-200">
                    <button
                        onClick={() => handleTabChange('aktif')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                            currentStatus === 'aktif'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <Users className="size-4" />
                        <span>Siswa Aktif</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            currentStatus === 'aktif' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {total_aktif}
                        </span>
                    </button>
                    <button
                        onClick={() => handleTabChange('alumni')}
                        className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                            currentStatus === 'alumni'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <GraduationCap className="size-4" />
                        <span>Alumni / Lulusan</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                            currentStatus === 'alumni' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {total_alumni}
                        </span>
                    </button>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                    <div className="space-y-1 flex-1 min-w-[200px]">
                        <label className="text-xs font-semibold text-slate-700">Cari Siswa</label>
                        <input
                            type="text"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
                            placeholder="Ketik nama, NIS, atau NISN..."
                            className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        />
                    </div>
                    {currentStatus === 'aktif' && (
                        <div className="space-y-1 w-52">
                            <label className="text-xs font-semibold text-slate-700">Filter Kelas</label>
                            <select
                                value={kelasId}
                                onChange={(e) => setKelasId(e.target.value)}
                                className="h-9 w-full rounded-lg border border-slate-200 bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                            >
                                <option value="">Semua Kelas</option>
                                {kelas_list.map((k) => (
                                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <button
                        onClick={() => applyFilter()}
                        className="h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                        Terapkan
                    </button>
                    <button
                        onClick={resetFilter}
                        className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Reset
                    </button>
                </div>

                {/* Tabel Data */}
                <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden w-full max-w-full">
                    {murids.data.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title={currentStatus === 'alumni' ? "Belum ada data alumni" : "Tidak ada murid ditemukan"}
                            description={currentStatus === 'alumni' ? "Siswa kelas tingkat akhir yang dinaikkan kelas akan otomatis tercatat sebagai alumni di sini." : "Coba ubah kata kunci pencarian atau tambah data murid baru."}
                        />
                    ) : (
                        <>
                            <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto touch-pan-x">
                                <table className="w-full min-w-[900px] text-sm whitespace-nowrap">
                                    <thead>
                                        <tr className="border-b bg-slate-50/75 text-left">
                                            <th className="px-4 py-3 font-semibold text-slate-700">Nama Lengkap</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700">NIS / NISN</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700">No. HP Siswa</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700">No. HP Orang Tua (WA)</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700">Kelas / Status</th>
                                            <th className="px-4 py-3 font-semibold text-slate-700 text-center">Poin Pelanggaran</th>
                                            <th className="px-4 py-3 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {murids.data.map((m) => {
                                            const badgeInfo = getViolationPointBadgeInfo(m.poin_pelanggaran ?? 0);
                                            return (
                                                <tr
                                                    key={m.id}
                                                    style={badgeInfo.hasViolation ? badgeInfo.rowStyle : undefined}
                                                    className={`transition-colors ${
                                                        badgeInfo.hasViolation ? badgeInfo.rowClassName : 'hover:bg-slate-50/50'
                                                    }`}
                                                >
                                                    <td className="px-4 py-3 font-medium text-slate-900">{m.nama}</td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {m.nis ? <span className="font-mono text-xs">{m.nis}</span> : <span className="italic text-slate-400">—</span>}
                                                        {m.nisn && <span className="ml-1.5 text-xs text-slate-400 font-mono">/ {m.nisn}</span>}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{m.no_telp ?? '—'}</td>
                                                    <td className="px-4 py-3 font-mono text-xs font-semibold">
                                                        {m.no_ortu ? (
                                                            <span className="inline-flex items-center gap-1.5 text-emerald-700">
                                                                <span className="size-1.5 rounded-full bg-emerald-500"></span>
                                                                {m.no_ortu}
                                                            </span>
                                                        ) : (
                                                            <span className="text-rose-500 font-normal italic text-[11px]">Belum diisi</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {m.status === 'alumni' ? (
                                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
                                                                Alumni
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-100">
                                                                {m.nama_kelas}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            style={badgeInfo.style}
                                                            className={`inline-flex items-center justify-center font-bold px-2.5 py-0.5 rounded-full text-xs font-mono border shadow-2xs ${badgeInfo.classNames}`}
                                                        >
                                                            {m.poin_pelanggaran ?? 0}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button
                                                                onClick={() => openEdit(m)}
                                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                                                title="Edit data murid"
                                                            >
                                                                <Pencil className="size-3.5" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(m.id, m.nama)}
                                                                className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                                                title="Hapus data murid"
                                                            >
                                                                <Trash2 className="size-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <Pagination links={murids.links} from={murids.from} to={murids.to} total={murids.total} />
                        </>
                    )}
                </div>
            </div>

            {/* Modal Tambah Murid */}
            {showCreate && (
                <MuridModal
                    title="Tambah Murid Baru"
                    form={createForm}
                    kelas_list={kelas_list}
                    onSubmit={handleCreate}
                    onClose={() => setShowCreate(false)}
                />
            )}

            {/* Modal Edit Murid */}
            {editItem && (
                <MuridModal
                    title="Edit Data Murid"
                    form={editForm as any}
                    kelas_list={kelas_list}
                    onSubmit={handleEdit}
                    onClose={() => setEditItem(null)}
                />
            )}

            {/* Modal Peringatan & Konfirmasi Naik Kelas Massal */}
            {showNaikKelasModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        {/* Header Warning */}
                        <div className="flex items-start gap-3.5">
                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                <AlertTriangle className="size-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Konfirmasi Kenaikan Kelas Massal
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Proses ini akan menaikkan seluruh siswa aktif ke tingkat kelas berikutnya.
                                </p>
                            </div>
                        </div>

                        {/* Penjelasan Detail */}
                        <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-4 space-y-3 text-xs text-slate-700">
                            <p className="font-semibold text-slate-900">
                                Dampak dari proses Kenaikan Kelas:
                            </p>
                            <ul className="space-y-2 text-slate-600">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                                    <span>
                                        <strong>Siswa Tingkat Akhir LULUS (Alumni):</strong> Murid di kelas <strong>XIII SIJA 1 & 2</strong>, <strong>XII TO 1 & 2</strong>, dan <strong>XII TM 1 & 2</strong> akan otomatis berstatus <strong>Alumni</strong> dan nonaktif dari kelas aktif.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-blue-600 mt-0.5" />
                                    <span>
                                        <strong>Siswa Naik Tingkat:</strong>
                                        <br />• X SIJA ➔ XI SIJA ➔ XII SIJA ➔ XIII SIJA
                                        <br />• X TO / TM ➔ XI TO / TM ➔ XII TO / TM
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-amber-600 mt-0.5" />
                                    <span>
                                        <strong>Kelas X Menjadi Kosong:</strong> Seluruh kelas X (X SIJA 1 & 2, X TO 1 & 2, X TM 1 & 2) akan kosong (0 siswa) dan siap diisi oleh peserta didik baru.
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800">
                            <strong>Perhatian:</strong> Pastikan seluruh rekapitulasi penilaian pada periode ini telah selesai diekspor sebelum menjalankan kenaikan kelas massal.
                        </div>

                        {/* Actions Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => setShowNaikKelasModal(false)}
                                disabled={isNaikKelasLoading}
                                className="rounded-xl px-4 text-xs font-semibold"
                            >
                                Batal
                            </Button>
                            <Button
                                type="button"
                                onClick={handleNaikKelas}
                                isLoading={isNaikKelasLoading}
                                loadingText="Memproses Kenaikan Kelas..."
                                className="rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white text-xs font-semibold px-4 shadow-sm"
                            >
                                Ya, Lakukan Naik Kelas Massal
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
