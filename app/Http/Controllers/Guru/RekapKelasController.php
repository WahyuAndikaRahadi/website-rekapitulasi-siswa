<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Models\Laporan;
use App\Models\Murid;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RekapKelasController extends Controller
{
    public function index(Request $request): Response
    {
        $guru = $request->user()->guru;

        // Hanya wali kelas yang boleh akses
        abort_unless($guru && $guru->isWaliKelas(), 403, 'Halaman ini hanya untuk wali kelas.');

        $kelas = $guru->waliKelasKelas;
        abort_unless($kelas, 404, 'Data kelas binaan tidak ditemukan.');

        $murids = Murid::with('laporans')
            ->where('kelas_id', $kelas->id)
            ->orderBy('nama')
            ->get();

        // Filter laporan per murid
        $filterStatus = $request->get('status', 'semua');
        $filterDari   = $request->get('dari');
        $filterSampai = $request->get('sampai');

        $muridData = $murids->map(function ($murid) use ($filterStatus, $filterDari, $filterSampai, $kelas) {
            $laporanQuery = Laporan::where('murid_id', $murid->id);

            if ($filterStatus !== 'semua') {
                $laporanQuery->where('status', $filterStatus);
            }
            if ($filterDari) {
                $laporanQuery->whereDate('tanggal_kejadian', '>=', $filterDari);
            }
            if ($filterSampai) {
                $laporanQuery->whereDate('tanggal_kejadian', '<=', $filterSampai);
            }

            $laporans = $laporanQuery->orderByDesc('tanggal_kejadian')->get();

            return [
                'id'               => $murid->id,
                'nama'             => $murid->nama,
                'nis'              => $murid->nis,
                'nisn'             => $murid->nisn,
                'no_telp'          => $murid->no_telp,
                'nama_kelas'       => $kelas->nama_kelas,
                'kelas_id'         => $kelas->id,
                'poin_pelanggaran' => $murid->poinPelanggaran(),
                'poin_prestasi'    => $murid->poinPrestasi(),
                'kualifikasi'      => $murid->kualifikasiPoin(),
                'tahap_pembinaan'  => $murid->tahapPembinaan(),
                'skor_resmi'       => $murid->skorResmi(),
                'skor_sementara'   => $murid->skorResmi(),
                'jumlah_laporan'   => $laporans->count(),
                'laporans'         => $laporans->map(fn($l) => [
                    'id'                => $l->id,
                    'tanggal_kejadian'  => $l->tanggal_kejadian->format('d/m/Y'),
                    'kategori'          => $l->kategori,
                    'tingkat_keparahan' => $l->tingkat_keparahan,
                    'keterangan'        => $l->keterangan,
                    'is_manual'         => $l->is_manual,
                    'poin_diberikan'    => $l->poin_diberikan,
                    'status'            => $l->status,
                ]),
            ];
        });

        return Inertia::render('guru/rekap-kelas', [
            'kelas'       => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas, 'tingkat' => $kelas->tingkat],
            'murids'      => $muridData,
            'filters'     => $request->only(['status', 'dari', 'sampai']),
            'poin_ranges' => Laporan::POIN_RANGES,
        ]);
    }
}
