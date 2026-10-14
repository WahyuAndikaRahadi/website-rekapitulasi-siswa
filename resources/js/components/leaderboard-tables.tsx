import { Award, Crown, GraduationCap, Medal, School, Sparkles, Trophy, Users } from 'lucide-react';
import React from 'react';

export interface TopMuridItem {
    id: number;
    nama: string;
    nis?: string | null;
    kelas: string;
    poin_prestasi?: number;
    skor_resmi?: number;
}

export interface TopKelasItem {
    id: number;
    nama_kelas: string;
    tingkat?: string;
    wali_kelas?: string;
    total_skor: number;
    total_prestasi?: number;
    rata_skor: number;
    jumlah_murid: number;
}

interface LeaderboardProps {
    topMurids?: TopMuridItem[];
    topKelas?: TopKelasItem[];
}

export function TopMuridLeaderboard({ topMurids = [] }: { topMurids: TopMuridItem[] }) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs">
                            <Trophy className="size-4.5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                                Top 10 Siswa Berprestasi
                            </h3>
                            <p className="text-xs text-slate-500">Siswa dengan akumulasi poin prestasi tertinggi</p>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700 border border-amber-200/50">
                        <Sparkles className="size-3 text-amber-500" />
                        Peringkat Sekolah
                    </span>
                </div>

                {topMurids.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl">
                        <GraduationCap className="size-7 text-slate-300 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-600">Belum ada data prestasi siswa</p>
                        <p className="text-[11px] text-slate-400">Poin prestasi yang dicatat guru akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto">
                        <table className="w-full min-w-[340px] text-xs whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-left">
                                    <th className="pb-2.5 px-2 font-semibold w-12 text-center">Rank</th>
                                    <th className="pb-2.5 px-2 font-semibold">Nama Siswa</th>
                                    <th className="pb-2.5 px-2 font-semibold">Kelas</th>
                                    <th className="pb-2.5 px-2 font-semibold text-right">Poin Prestasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topMurids.map((m, idx) => {
                                    const rank = idx + 1;
                                    const poinValue = m.poin_prestasi ?? m.skor_resmi ?? 0;
                                    let rankBadge = (
                                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                                            {rank}
                                        </span>
                                    );
                                    let rowHighlight = 'hover:bg-slate-50/50';

                                    if (rank === 1) {
                                        rankBadge = (
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-500 text-white font-extrabold text-[11px] shadow-xs ring-2 ring-amber-200">
                                                1
                                            </span>
                                        );
                                        rowHighlight = 'bg-amber-50/30 hover:bg-amber-50/50';
                                    } else if (rank === 2) {
                                        rankBadge = (
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-slate-400 to-slate-500 text-white font-extrabold text-[11px] shadow-xs ring-2 ring-slate-200">
                                                2
                                            </span>
                                        );
                                        rowHighlight = 'bg-slate-50/40 hover:bg-slate-50/70';
                                    } else if (rank === 3) {
                                        rankBadge = (
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-amber-800 text-white font-extrabold text-[11px] shadow-xs ring-2 ring-amber-100">
                                                3
                                            </span>
                                        );
                                        rowHighlight = 'bg-amber-900/5 hover:bg-amber-900/10';
                                    }

                                    return (
                                        <tr key={m.id ?? idx} className={`transition-colors ${rowHighlight}`}>
                                            <td className="py-2 px-2 text-center">{rankBadge}</td>
                                            <td className="py-2 px-2">
                                                <span className="font-semibold text-slate-900 block truncate max-w-44">
                                                    {m.nama}
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 text-slate-500 font-medium">
                                                {m.kelas}
                                            </td>
                                            <td className="py-2 px-2 text-right">
                                                <span className="inline-flex items-center font-extrabold font-mono px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    +{poinValue}
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
        </div>
    );
}

export function TopKelasLeaderboard({ topKelas = [] }: { topKelas: TopKelasItem[] }) {
    return (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 md:p-6 shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-[#1E5FA8] border border-blue-200/60 shadow-2xs">
                            <Medal className="size-4.5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900 leading-tight">
                                Top 10 Kelas Berprestasi
                            </h3>
                            <p className="text-xs text-slate-500">Rombel dengan total poin prestasi akumulasi tertinggi</p>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-[#1E5FA8] border border-blue-200/50">
                        <School className="size-3 text-[#1E5FA8]" />
                        Akumulasi Kelas
                    </span>
                </div>

                {topKelas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl">
                        <School className="size-7 text-slate-300 mb-1.5" />
                        <p className="text-xs font-semibold text-slate-600">Belum ada data skor kelas</p>
                        <p className="text-[11px] text-slate-400">Data poin kelas akan terhitung otomatis.</p>
                    </div>
                ) : (
                    <div className="table-scroll-wrapper w-full max-w-full overflow-x-auto">
                        <table className="w-full min-w-[420px] text-xs whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 text-left">
                                    <th className="pb-2.5 px-2 font-semibold w-12 text-center">Rank</th>
                                    <th className="pb-2.5 px-2 font-semibold">Nama Kelas</th>
                                    <th className="pb-2.5 px-2 font-semibold">Wali Kelas</th>
                                    <th className="pb-2.5 px-2 font-semibold text-center">Rata-rata</th>
                                    <th className="pb-2.5 px-2 font-semibold text-right">Total Poin</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {topKelas.map((k, idx) => {
                                    const rank = idx + 1;
                                    let rankBadge = (
                                        <span className="inline-flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
                                            {rank}
                                        </span>
                                    );
                                    let rowHighlight = 'hover:bg-slate-50/50';

                                    if (rank === 1) {
                                        rankBadge = (
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-[#0B2559] text-white font-extrabold text-[11px] shadow-xs ring-2 ring-blue-200">
                                                1
                                            </span>
                                        );
                                        rowHighlight = 'bg-blue-50/40 hover:bg-blue-50/60';
                                    } else if (rank === 2) {
                                        rankBadge = (
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-white font-extrabold text-[11px] shadow-xs ring-2 ring-sky-200">
                                                2
                                            </span>
                                        );
                                        rowHighlight = 'bg-sky-50/30 hover:bg-sky-50/50';
                                    } else if (rank === 3) {
                                        rankBadge = (
                                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-sky-700 text-white font-extrabold text-[11px] shadow-xs ring-2 ring-cyan-100">
                                                3
                                            </span>
                                        );
                                        rowHighlight = 'bg-cyan-50/20 hover:bg-cyan-50/40';
                                    }

                                    const totalScore = k.total_prestasi ?? k.total_skor ?? 0;

                                    return (
                                        <tr key={k.id ?? idx} className={`transition-colors ${rowHighlight}`}>
                                            <td className="py-2 px-2 text-center">{rankBadge}</td>
                                            <td className="py-2 px-2 font-bold text-slate-900">
                                                {k.nama_kelas}
                                                <span className="text-[10px] text-slate-400 font-normal block">
                                                    {k.jumlah_murid} murid
                                                </span>
                                            </td>
                                            <td className="py-2 px-2 text-slate-500 font-medium truncate max-w-32">
                                                {k.wali_kelas ?? '-'}
                                            </td>
                                            <td className="py-2 px-2 text-center font-mono font-semibold text-slate-700">
                                                {k.rata_skor > 0 ? `+${k.rata_skor}` : k.rata_skor}
                                            </td>
                                            <td className="py-2 px-2 text-right">
                                                <span className="inline-flex items-center font-extrabold font-mono px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                                    +{totalScore}
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
        </div>
    );
}
