<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $guru = $request->user()->guru;
        $tahunAjaran = TahunAjaran::aktif();

        $stats = [
            'total_laporan'   => Laporan::where('guru_id', $guru?->id)->count(),
            'pending'         => Laporan::where('guru_id', $guru?->id)->where('status', 'pending')->count(),
            'ditindaklanjuti' => Laporan::where('guru_id', $guru?->id)->where('status', 'ditindaklanjuti')->count(),
        ];

        $laporanTerbaru = Laporan::with(['murid.kelas'])
            ->where('guru_id', $guru?->id)
            ->orderByDesc('tanggal_kejadian')
            ->limit(5)
            ->get()
            ->map(fn($l) => [
                'id'                 => $l->id,
                'tanggal_kejadian'   => $l->tanggal_kejadian->format('d/m/Y'),
                'murid_nama'         => $l->murid->nama,
                'kelas_nama'         => $l->murid->kelas->nama_kelas,
                'kategori'           => $l->kategori,
                'tingkat_keparahan'  => $l->tingkat_keparahan,
                'keterangan'         => $l->keterangan,
                'poin_diberikan'     => $l->poin_diberikan,
                'status'             => $l->status,
                'bisa_diedit'        => $l->bisaDieditOlehGuru(),
            ]);

        // ── Leaderboard Top 10 Siswa Poin Tertinggi ────────────────────────
        $topMurids = Murid::with(['kelas', 'laporans'])
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->get()
            ->map(fn ($m) => [
                'id'         => $m->id,
                'nama'       => $m->nama,
                'nis'        => $m->nis,
                'kelas'      => $m->kelas?->nama_kelas ?? '-',
                'skor_resmi' => $m->skorResmi(),
            ])
            ->sortByDesc('skor_resmi')
            ->take(10)
            ->values();

        // ── Leaderboard Top 10 Kelas Poin Tertinggi ────────────────────────
        $topKelas = Kelas::with(['murids.laporans', 'waliKelas'])
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->get()
            ->map(function ($k) {
                $murids = $k->murids;
                $jumlahMurid = $murids->count();
                $totalSkor = $murids->sum(fn ($m) => $m->skorResmi());
                $rataSkor = $jumlahMurid > 0 ? round($totalSkor / $jumlahMurid, 1) : 0;

                return [
                    'id'           => $k->id,
                    'nama_kelas'   => $k->nama_kelas,
                    'tingkat'      => $k->tingkat,
                    'wali_kelas'   => $k->waliKelas?->nama ?? '-',
                    'total_skor'   => $totalSkor,
                    'rata_skor'    => $rataSkor,
                    'jumlah_murid' => $jumlahMurid,
                ];
            })
            ->sortByDesc('total_skor')
            ->take(10)
            ->values();

        return Inertia::render('guru/dashboard', [
            'stats'            => $stats,
            'laporan_terbaru'  => $laporanTerbaru,
            'top_murids'       => $topMurids,
            'top_kelas'        => $topKelas,
            'tahun_ajaran'     => $tahunAjaran ? ['label' => $tahunAjaran->label] : null,
        ]);
    }
}
