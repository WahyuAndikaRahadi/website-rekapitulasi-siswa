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

        $murids = Murid::with('laporans')
            ->where('kelas_id', $kelas->id)
            ->orderBy('nama')
            ->get();

        // Filter laporan per murid
        $filterStatus = $request->get('status', 'semua');
        $filterDari   = $request->get('dari');
        $filterSampai = $request->get('sampai');

        $muridData = $murids->map(function ($murid) use ($filterStatus, $filterDari, $filterSampai) {
            $laporanQuery = Laporan::with('jenisPelanggaran')
                ->where('murid_id', $murid->id);

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
                'skor_resmi'       => $murid->skorResmi(),
                'skor_sementara'   => $murid->skorSementara(),
                'jumlah_laporan'   => $laporans->count(),
                'laporans'         => $laporans->map(fn($l) => [
                    'id'               => $l->id,
                    'tanggal_kejadian' => $l->tanggal_kejadian->format('d/m/Y'),
                    'kategori'         => $l->jenisPelanggaran->kategori,
                    'keterangan'       => $l->jenisPelanggaran->keterangan,
                    'poin_diberikan'   => $l->poin_diberikan,
                    'status'           => $l->status,
                ]),
            ];
        });

        return Inertia::render('guru/rekap-kelas', [
            'kelas'     => ['id' => $kelas->id, 'nama_kelas' => $kelas->nama_kelas],
            'murids'    => $muridData,
            'filters'   => $request->only(['status', 'dari', 'sampai']),
        ]);
    }
}
