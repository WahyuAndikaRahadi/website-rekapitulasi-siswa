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
            $laporanQuery = Laporan::with(['guru', 'bukti'])
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
                'id'                     => $murid->id,
                'nama'                   => $murid->nama,
                'nis'                    => $murid->nis,
                'nisn'                   => $murid->nisn,
                'no_telp'                => $murid->no_telp,
                'no_ortu'                => $murid->no_ortu,
                'nama_kelas'             => $kelas->nama_kelas,
                'kelas_id'               => $kelas->id,
                'poin_pelanggaran'       => $murid->poinPelanggaran(),
                'poin_pelanggaran_kotor' => $murid->poinPelanggaranKotor(),
                'poin_prestasi'          => $murid->poinPrestasi(),
                'poin_akumulasi'         => $murid->poinAkumulasi(),
                'kualifikasi'            => $murid->kualifikasiPoin(),
                'tahap_pembinaan'        => $murid->tahapPembinaan(),
                'skor_resmi'             => $murid->skorResmi(),
                'skor_sementara'         => $murid->skorResmi(),
                'jumlah_laporan'         => $laporans->count(),
                'laporans'               => $laporans->map(fn($l) => [
                    'id'                  => $l->id,
                    'tanggal_kejadian'    => $l->tanggal_kejadian->format('d/m/Y'),
                    'guru_nama'           => $l->guru?->nama ?? 'Guru / Pembina',
                    'kategori'            => $l->kategori,
                    'tingkat_keparahan'   => $l->tingkat_keparahan,
                    'keterangan'          => $l->keterangan,
                    'keterangan_tambahan' => $l->keterangan_tambahan,
                    'is_manual'           => $l->is_manual,
                    'poin_diberikan'      => $l->poin_diberikan,
                    'status'              => $l->status,
                    'bukti_urls'          => $l->bukti->map(fn($b) => [
                        'url'       => asset('storage/' . $b->file_path),
                        'nama_asli' => $b->nama_file_asli,
                    ]),
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
