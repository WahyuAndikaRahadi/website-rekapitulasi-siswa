<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Stat cards ───────────────────────────────────────────────────
        $menungguVerifikasi  = Laporan::menungguVerifikasi()->count();
        $totalBulanIni       = Laporan::whereMonth('tanggal_kejadian', now()->month)
            ->whereYear('tanggal_kejadian', now()->year)->count();
        $pelanggaranBulanIni = Laporan::pelanggaran()
            ->whereMonth('tanggal_kejadian', now()->month)
            ->whereYear('tanggal_kejadian', now()->year)->count();
        $prestasiBulanIni    = Laporan::prestasi()
            ->whereMonth('tanggal_kejadian', now()->month)
            ->whereYear('tanggal_kejadian', now()->year)->count();

        // ── Tren 6 bulan terakhir ─────────────────────────────────────────
        $tren = [];
        for ($i = 5; $i >= 0; $i--) {
            $bulan = now()->subMonths($i);
            $label = $bulan->format('M') . ' ' . $bulan->format('Y');

            $pelanggaran = Laporan::pelanggaran()
                ->whereMonth('tanggal_kejadian', $bulan->month)
                ->whereYear('tanggal_kejadian', $bulan->year)
                ->count();

            $prestasi = Laporan::prestasi()
                ->whereMonth('tanggal_kejadian', $bulan->month)
                ->whereYear('tanggal_kejadian', $bulan->year)
                ->count();

            $tren[] = [
                'bulan'       => $label,
                'pelanggaran' => $pelanggaran,
                'prestasi'    => $prestasi,
                'kebaikan'    => $prestasi,
            ];
        }

        // ── Semua murid aktif ─────────────────────────────────────────────
        $allMurids = Murid::with(['kelas', 'laporans'])
            ->where('status', 'aktif')
            ->get()
            ->map(fn ($m) => [
                'id'               => $m->id,
                'nama'             => $m->nama,
                'nis'              => $m->nis,
                'no_telp'          => $m->no_telp,
                'kelas'            => $m->kelas?->nama_kelas ?? '-',
                'poin_prestasi'    => $m->poinPrestasi(),
                'poin_pelanggaran' => $m->poinPelanggaran(),
                'kualifikasi'      => $m->kualifikasiPoin(),
                'tahap_pembinaan'  => $m->tahapPembinaan(),
                'skor_resmi'       => $m->poinPrestasi(),
            ]);

        // ── Leaderboard Top 10 Siswa Berprestasi Tertinggi ─────────────────
        $topMurids = $allMurids
            ->sortByDesc('poin_prestasi')
            ->take(10)
            ->values();

        // ── Siswa dengan Pelanggaran Tertinggi (memerlukan intervensi) ──────
        $muridSkorRendah = $allMurids
            ->sortByDesc('poin_pelanggaran')
            ->filter(fn($m) => $m['poin_pelanggaran'] > 0)
            ->take(5)
            ->values();

        // ── Data Semua Kelas ──────────────────────────────────────────────
        $allKelas = Kelas::with(['murids' => fn($q) => $q->where('status', 'aktif'), 'murids.laporans', 'waliKelas'])
            ->get()
            ->map(function ($k) {
                $murids = $k->murids;
                $jumlahMurid = $murids->count();
                $totalPrestasi = $murids->sum(fn ($m) => $m->poinPrestasi());
                $totalPelanggaran = $murids->sum(fn ($m) => $m->poinPelanggaran());
                $rataSkor = $jumlahMurid > 0 ? round($totalPrestasi / $jumlahMurid, 1) : 0;

                return [
                    'id'                => $k->id,
                    'nama_kelas'        => $k->nama_kelas,
                    'tingkat'           => $k->tingkat,
                    'wali_kelas'        => $k->waliKelas?->nama ?? '-',
                    'total_skor'        => $totalPrestasi,
                    'total_prestasi'    => $totalPrestasi,
                    'total_pelanggaran' => $totalPelanggaran,
                    'rata_skor'         => $rataSkor,
                    'jumlah_murid'      => $jumlahMurid,
                ];
            });

        // ── Leaderboard Top 10 Kelas Berprestasi ──────────────────────────
        $topKelas = $allKelas
            ->sortByDesc('total_prestasi')
            ->take(10)
            ->values();

        // Kelas Skor untuk Bar Chart
        $kelasSkor = $allKelas
            ->sortBy('rata_skor')
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'menunggu_verifikasi'   => $menungguVerifikasi,
                'pending'               => $menungguVerifikasi,
                'total_bulan_ini'       => $totalBulanIni,
                'pelanggaran_bulan_ini' => $pelanggaranBulanIni,
                'prestasi_bulan_ini'    => $prestasiBulanIni,
                'kebaikan_bulan_ini'    => $prestasiBulanIni,
            ],
            'tren_laporan'      => $tren,
            'top_murids'        => $topMurids,
            'top_kelas'         => $topKelas,
            'murid_skor_rendah' => $muridSkorRendah,
            'kelas_skor'        => $kelasSkor,
        ]);
    }
}
