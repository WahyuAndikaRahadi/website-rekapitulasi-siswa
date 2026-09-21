import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    FileText,
    MapPin,
    Plus,
    Printer,
    Search,
    Send,
    Trash2,
    UserCheck,
    X,
} from 'lucide-react';
import React, { useState } from 'react';

interface Kelas {
    id: number;
    nama_kelas: string;
}

interface Murid {
    id: number;
    nama: string;
    nis: string;
    kelas_id: number;
    kelas?: Kelas;
    no_ortu?: string;
    no_telp?: string;
}

interface Guru {
    id: number;
    nama: string;
    nip?: string;
}

interface SuratItem {
    id: number;
    nomor_surat: string;
    nomor_urut: number;
    tahun: number;
    murid_id: number;
    guru_id?: number;
    nama_guru_menemui: string;
    panggilan_ke: number;
    perihal: string;
    tanggal_panggilan: string;
    waktu: string;
    tempat: string;
    tanggal_surat: string;
    keterangan_kasus?: string;
    created_at: string;
    murid?: {
        id: number;
        nama: string;
        nis: string;
        kelas?: {
            id: number;
            nama_kelas: string;
        };
    };
    guru?: {
        id: number;
        nama: string;
    };
}

interface PaginationProps {
    data: SuratItem[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    suratList: PaginationProps;
    muridList: Murid[];
    guruList: Guru[];
    filters: {
        search?: string;
    };
    defaultTempat: string;
    defaultWaktu: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/admin/dashboard' },
    { title: 'Surat Panggilan', href: '/admin/surat-panggilan' },
];

export default function SuratPanggilanIndex({
    suratList,
    muridList = [],
    guruList = [],
    filters = {},
    defaultTempat = 'Ruang BK SMK Negeri 69 Jakarta',
    defaultWaktu = 'Pukul 09.00 WIB',
}: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoadingMuridInfo, setIsLoadingMuridInfo] = useState(false);
    const [muridSearchText, setMuridSearchText] = useState('');

    const [form, setForm] = useState({
        murid_id: '',
        guru_id: '',
        nama_guru_menemui: '',
        panggilan_ke: 1,
        perihal: 'Panggilan I (Satu)',
        tanggal_panggilan: '',
        waktu: defaultWaktu,
        tempat: defaultTempat,
        tanggal_surat: new Date().toISOString().split('T')[0],
        keterangan_kasus: '',
        kirim_wa: true,
    });

    const [selectedMuridInfo, setSelectedMuridInfo] = useState<{
        poin?: number;
        tahap?: string;
        no_hp?: string;
    } | null>(null);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search filter execution
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/admin/surat-panggilan',
            { search: searchTerm },
            { preserveState: true, replace: true }
        );
    };

    // When selecting a student, fetch auto recommendations
    const handleMuridSelect = async (muridIdStr: string) => {
        const mId = Number(muridIdStr);
        setForm((prev) => ({ ...prev, murid_id: muridIdStr }));

        if (!mId) {
            setSelectedMuridInfo(null);
            return;
        }

        setIsLoadingMuridInfo(true);
        try {
            const res = await fetch(`/admin/surat-panggilan/info-murid/${mId}`);
            if (res.ok) {
                const data = await res.json();
                setForm((prev) => ({
                    ...prev,
                    panggilan_ke: data.panggilan_ke || 1,
                    perihal: data.perihal || 'Panggilan I (Satu)',
                }));
                setSelectedMuridInfo({
                    poin: data.poin,
                    tahap: data.tahap,
                    no_hp: data.murid?.no_ortu || data.murid?.no_telp,
                });
            }
        } catch (err) {
            console.error('Gagal mengambil info murid', err);
        } finally {
            setIsLoadingMuridInfo(false);
        }
    };

    const handleGuruSelect = (guruIdStr: string) => {
        const gId = Number(guruIdStr);
        const selected = guruList.find((g) => g.id === gId);
        setForm((prev) => ({
            ...prev,
            guru_id: guruIdStr,
            nama_guru_menemui: selected ? selected.nama : prev.nama_guru_menemui,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        router.post('/admin/surat-panggilan', form, {
            onSuccess: () => {
                setIsModalOpen(false);
                setForm({
                    murid_id: '',
                    guru_id: '',
                    nama_guru_menemui: '',
                    panggilan_ke: 1,
                    perihal: 'Panggilan I (Satu)',
                    tanggal_panggilan: '',
                    waktu: defaultWaktu,
                    tempat: defaultTempat,
                    tanggal_surat: new Date().toISOString().split('T')[0],
                    keterangan_kasus: '',
                    kirim_wa: true,
                });
                setSelectedMuridInfo(null);
            },
            onError: (errs) => {
                setErrors(errs);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleDelete = (surat: SuratItem) => {
        if (confirm(`Apakah Anda yakin ingin menghapus arsip surat ${surat.nomor_surat}?`)) {
            router.delete(`/admin/surat-panggilan/${surat.id}`);
        }
    };

    // Filter murid in select
    const filteredMurids = muridList.filter((m) => {
        const q = muridSearchText.toLowerCase();
        return (
            m.nama.toLowerCase().includes(q) ||
            (m.nis && m.nis.toLowerCase().includes(q)) ||
            (m.kelas && m.kelas.nama_kelas.toLowerCase().includes(q))
        );
    });

    const totalSurat = suratList.total || 0;
    const countSp1 = suratList.data.filter((s) => s.panggilan_ke === 1).length;
    const countSp2 = suratList.data.filter((s) => s.panggilan_ke === 2).length;
    const countSp3 = suratList.data.filter((s) => s.panggilan_ke >= 3).length;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Surat Pemanggilan Orang Tua - SMKN 69 Jakarta" />

            <div className="space-y-6 p-4 md:p-6 max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Surat Pemanggilan Orang Tua
                        </h1>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Penerbitan otomatis, pencetakan PDF resmi (A4), dan integrasi notifikasi WhatsApp ke orang tua siswa.
                        </p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:from-[#081B42] hover:to-[#174D88] transition-all cursor-pointer"
                    >
                        <Plus className="size-4" />
                        <span>Terbitkan Surat Panggilan</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-slate-500">Total Surat Diterbitkan</span>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-slate-900">{totalSurat}</span>
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-semibold">Arsip</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-slate-500">Panggilan I (K-1)</span>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-amber-600">{countSp1}</span>
                            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md font-semibold">Tahap 1</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-slate-500">Panggilan II (K-2)</span>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-orange-600">{countSp2}</span>
                            <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md font-semibold">Tahap 2</span>
                        </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <span className="text-xs font-medium text-slate-500">Panggilan III+ (K-3/4)</span>
                        <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-2xl font-bold text-rose-600">{countSp3}</span>
                            <span className="text-xs text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md font-semibold">Khusus</span>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Search bar */}
                    <div className="border-b border-slate-100 p-4">
                        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nomor surat, nama siswa, atau NIS..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="h-10 rounded-xl bg-slate-100 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                Cari
                            </button>
                        </form>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-700">
                            <thead className="bg-slate-50/75 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3.5">Nomor &amp; Tanggal Surat</th>
                                    <th className="px-5 py-3.5">Siswa &amp; Kelas</th>
                                    <th className="px-5 py-3.5">Perihal</th>
                                    <th className="px-5 py-3.5">Jadwal Pemanggilan</th>
                                    <th className="px-5 py-3.5">Menemui</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {suratList.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                                            <FileText className="mx-auto size-9 text-slate-300 mb-2" />
                                            <p className="font-medium">Belum ada arsip surat pemanggilan.</p>
                                            <p className="text-xs text-slate-400">Klik tombol "Terbitkan Surat Panggilan" untuk membuat surat baru.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    suratList.data.map((surat) => (
                                        <tr key={surat.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-900">{surat.nomor_surat}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="size-3" />
                                                    {surat.tanggal_surat}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900">
                                                    {surat.murid?.nama ?? '-'}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {surat.murid?.kelas?.nama_kelas ?? '-'} • NIS: {surat.murid?.nis ?? '-'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        surat.panggilan_ke === 1
                                                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                            : surat.panggilan_ke === 2
                                                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    {surat.perihal}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-800 flex items-center gap-1.5">
                                                    <Calendar className="size-3.5 text-slate-400" />
                                                    {surat.tanggal_panggilan}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                                                    <Clock className="size-3 text-slate-400" />
                                                    {surat.waktu}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                    <UserCheck className="size-3.5 text-blue-600" />
                                                    {surat.nama_guru_menemui}
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <MapPin className="size-3 text-slate-400" />
                                                    {surat.tempat}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <a
                                                        href={`/admin/surat-panggilan/${surat.id}/pdf`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Cetak / Buka PDF"
                                                        className="inline-flex items-center gap-1 h-8 px-2.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition-colors"
                                                    >
                                                        <Printer className="size-3.5" />
                                                        <span>Cetak</span>
                                                    </a>
                                                    <a
                                                        href={`/admin/surat-panggilan/${surat.id}/download`}
                                                        title="Unduh PDF"
                                                        className="inline-flex items-center justify-center size-8 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                    >
                                                        <Download className="size-3.5" />
                                                    </a>
                                                    <button
                                                        onClick={() => handleDelete(surat)}
                                                        title="Hapus Arsip"
                                                        className="inline-flex items-center justify-center size-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                                                    >
                                                        <Trash2 className="size-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {suratList.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                            <div>
                                Menampilkan halaman {suratList.current_page} dari {suratList.last_page}
                            </div>
                            <div className="flex gap-1">
                                {suratList.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`h-8 px-3 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-[#1E5FA8] text-white'
                                                : link.url
                                                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Terbitkan Surat Panggilan */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto">
                    <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Terbitkan Surat Pemanggilan Orang Tua
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Data otomatis disesuaikan dengan template resmi SMKN 69 Jakarta.
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            {/* Pilih Siswa */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 flex justify-between items-center">
                                    <span>Pilih Siswa / Murid <span className="text-rose-500">*</span></span>
                                    {isLoadingMuridInfo && (
                                        <span className="text-xs text-blue-600 font-normal animate-pulse">
                                            Memuat riwayat pemanggilan...
                                        </span>
                                    )}
                                </label>
                                <select
                                    value={form.murid_id}
                                    onChange={(e) => handleMuridSelect(e.target.value)}
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                >
                                    <option value="">-- Pilih Siswa --</option>
                                    {muridList.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.nama} ({m.kelas?.nama_kelas ?? '-'} • NIS: {m.nis})
                                        </option>
                                    ))}
                                </select>
                                {errors.murid_id && <p className="text-xs text-rose-500">{errors.murid_id}</p>}

                                {/* Selected Student Info Card */}
                                {selectedMuridInfo && (
                                    <div className="mt-2 rounded-xl bg-blue-50/80 border border-blue-100 p-3 text-xs text-slate-700 flex items-center justify-between">
                                        <div>
                                            <span className="font-semibold text-blue-900">Akumulasi Poin: </span>
                                            <span className="font-bold text-rose-600">{selectedMuridInfo.poin} Poin</span>
                                            <span className="mx-2 text-blue-300">|</span>
                                            <span className="text-slate-600">Status: {selectedMuridInfo.tahap}</span>
                                        </div>
                                        <div className="text-blue-800 font-medium">
                                            No. HP: {selectedMuridInfo.no_hp || '(Belum ada nomor HP)'}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Urutan Panggilan & Perihal */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Panggilan Ke <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={form.panggilan_ke}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value) || 1;
                                            setForm((prev) => ({
                                                ...prev,
                                                panggilan_ke: val,
                                            }));
                                        }}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    />
                                    {errors.panggilan_ke && <p className="text-xs text-rose-500">{errors.panggilan_ke}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Perihal Surat <span className="text-slate-400 font-normal">(Otomatis)</span>
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={form.perihal}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-600 cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* Guru yang Menemui */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Pilih Guru BK / Wali Kelas
                                    </label>
                                    <select
                                        value={form.guru_id}
                                        onChange={(e) => handleGuruSelect(e.target.value)}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    >
                                        <option value="">-- Pilih Guru Terdaftar --</option>
                                        {guruList.map((g) => (
                                            <option key={g.id} value={g.id}>
                                                {g.nama} {g.nip ? `(NIP: ${g.nip})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Nama Guru yang Menemui <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Drs. Kiagus Abdurachman"
                                        value={form.nama_guru_menemui}
                                        onChange={(e) => setForm((prev) => ({ ...prev, nama_guru_menemui: e.target.value }))}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    />
                                    {errors.nama_guru_menemui && <p className="text-xs text-rose-500">{errors.nama_guru_menemui}</p>}
                                </div>
                            </div>

                            {/* Jadwal Pemanggilan: Tanggal & Waktu */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Hari &amp; Tanggal Pemanggilan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.tanggal_panggilan}
                                        onChange={(e) => setForm((prev) => ({ ...prev, tanggal_panggilan: e.target.value }))}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    />
                                    {errors.tanggal_panggilan && <p className="text-xs text-rose-500">{errors.tanggal_panggilan}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Waktu Pemanggilan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Contoh: Pukul 09.00 WIB"
                                        value={form.waktu}
                                        onChange={(e) => setForm((prev) => ({ ...prev, waktu: e.target.value }))}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    />
                                    {errors.waktu && <p className="text-xs text-rose-500">{errors.waktu}</p>}
                                </div>
                            </div>

                            {/* Tempat & Tanggal Surat */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Tempat Pemanggilan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={form.tempat}
                                        onChange={(e) => setForm((prev) => ({ ...prev, tempat: e.target.value }))}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    />
                                    {errors.tempat && <p className="text-xs text-rose-500">{errors.tempat}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        Tanggal Surat <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={form.tanggal_surat}
                                        onChange={(e) => setForm((prev) => ({ ...prev, tanggal_surat: e.target.value }))}
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                    />
                                    {errors.tanggal_surat && <p className="text-xs text-rose-500">{errors.tanggal_surat}</p>}
                                </div>
                            </div>

                            {/* Catatan Kasus Internal */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700">
                                    Keterangan / Kasus <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Catatan latar belakang pemanggilan orang tua..."
                                    value={form.keterangan_kasus}
                                    onChange={(e) => setForm((prev) => ({ ...prev, keterangan_kasus: e.target.value }))}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm focus:border-[#1E5FA8] focus:ring-1 focus:ring-[#1E5FA8]"
                                />
                            </div>

                            {/* WhatsApp Notification Checkbox */}
                            <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3.5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                        <Send className="size-4" />
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-emerald-900">
                                            Kirim Notifikasi Surat ke WhatsApp Orang Tua
                                        </span>
                                        <p className="text-[11px] text-emerald-700">
                                            Nomor surat dan jadwal otomatis dikirim ke nomor WhatsApp orang tua/wali murid.
                                        </p>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={form.kirim_wa}
                                    onChange={(e) => setForm((prev) => ({ ...prev, kirim_wa: e.target.checked }))}
                                    className="size-4.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="h-10 rounded-xl px-4 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#0B2559] to-[#1E5FA8] px-5 text-xs font-semibold text-white shadow-xs hover:from-[#081B42] hover:to-[#174D88] transition-all disabled:opacity-50 cursor-pointer"
                                >
                                    <Printer className="size-4" />
                                    <span>{isSubmitting ? 'Memproses...' : 'Terbitkan & Simpan Surat'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
