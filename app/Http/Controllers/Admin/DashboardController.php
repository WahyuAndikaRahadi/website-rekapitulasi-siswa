<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $tahunAjaran = TahunAjaran::aktif();

        // ── Stat cards ───────────────────────────────────────────────────
        $pending         = Laporan::pending()
            ->where('tahun_ajaran_id', $tahunAjaran?->id)->count();
        $totalBulanIni   = Laporan::whereMonth('tanggal_kejadian', now()->month)
            ->whereYear('tanggal_kejadian', now()->year)
            ->where('tahun_ajaran_id', $tahunAjaran?->id)->count();
        $pelanggaranBulanIni = Laporan::whereMonth('tanggal_kejadian', now()->month)
            ->whereYear('tanggal_kejadian', now()->year)
            ->whereHas('jenisPelanggaran', fn ($q) => $q->where('kategori', 'pelanggaran'))
            ->where('tahun_ajaran_id', $tahunAjaran?->id)->count();
        $kebaikanBulanIni = Laporan::whereMonth('tanggal_kejadian', now()->month)
            ->whereYear('tanggal_kejadian', now()->year)
            ->whereHas('jenisPelanggaran', fn ($q) => $q->where('kategori', 'kebaikan'))
            ->where('tahun_ajaran_id', $tahunAjaran?->id)->count();

        // ── Tren 6 bulan terakhir ─────────────────────────────────────────
        $tren = [];
        for ($i = 5; $i >= 0; $i--) {
            $bulan = now()->subMonths($i);
            $label = $bulan->translatedFormat('M Y');
            // Laravel Carbon format 'M' menghasilkan nama bulan singkat
            $label = $bulan->format('M') . ' ' . $bulan->format('Y');

            $pelanggaran = Laporan::whereMonth('tanggal_kejadian', $bulan->month)
                ->whereYear('tanggal_kejadian', $bulan->year)
                ->where('tahun_ajaran_id', $tahunAjaran?->id)
                ->whereHas('jenisPelanggaran', fn ($q) => $q->where('kategori', 'pelanggaran'))
                ->count();

            $kebaikan = Laporan::whereMonth('tanggal_kejadian', $bulan->month)
                ->whereYear('tanggal_kejadian', $bulan->year)
                ->where('tahun_ajaran_id', $tahunAjaran?->id)
                ->whereHas('jenisPelanggaran', fn ($q) => $q->where('kategori', 'kebaikan'))
                ->count();

            $tren[] = ['bulan' => $label, 'pelanggaran' => $pelanggaran, 'kebaikan' => $kebaikan];
        }

        // ── Ranking murid skor terendah (bermasalah) ──────────────────────
        $muridSkorRendah = Murid::with('kelas')
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->get()
            ->map(fn ($m) => [
                'nama'       => $m->nama,
                'kelas'      => $m->kelas->nama_kelas,
                'skor_resmi' => $m->skorResmi(),
            ])
            ->sortBy('skor_resmi')
            ->take(5)
            ->values();

        // ── Ranking kelas per rata-rata skor ─────────────────────────────
        $kelasSkor = Kelas::with(['murids'])
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->get()
            ->map(function ($k) {
                $murids = $k->murids;
                if ($murids->isEmpty()) {
                    return ['nama_kelas' => $k->nama_kelas, 'rata_skor' => 0, 'jumlah_murid' => 0];
                }
                $totalSkor = $murids->sum(fn ($m) => $m->skorResmi());
                return [
                    'nama_kelas'   => $k->nama_kelas,
                    'rata_skor'    => round($totalSkor / $murids->count(), 1),
                    'jumlah_murid' => $murids->count(),
                ];
            })
            ->sortBy('rata_skor')
            ->values();

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'pending'              => $pending,
                'total_bulan_ini'      => $totalBulanIni,
                'pelanggaran_bulan_ini'=> $pelanggaranBulanIni,
                'kebaikan_bulan_ini'   => $kebaikanBulanIni,
            ],
            'tren_laporan'      => $tren,
            'murid_skor_rendah' => $muridSkorRendah,
            'kelas_skor'        => $kelasSkor,
            'tahun_ajaran'      => $tahunAjaran ? ['label' => $tahunAjaran->label] : null,
        ]);
    }
}
