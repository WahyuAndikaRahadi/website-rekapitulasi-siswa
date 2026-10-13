<?php

namespace App\Http\Controllers\Admin;

use App\Exports\KelasExport;
use App\Exports\LaporanExport;
use App\Exports\MuridExport;
use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/export/index', [
            'kelas_list' => Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas']),
            'counts'     => [
                'laporan' => Laporan::count(),
                'murid'   => Murid::count(),
                'kelas'   => Kelas::count(),
            ],
        ]);
    }

    /**
     * Mengambil pratinjau data yang akan diekspor sesuai filter
     */
    public function previewData(Request $request): JsonResponse
    {
        $type = $request->query('type', 'laporan');

        if ($type === 'laporan') {
            $kelasId  = $request->query('kelas_id');
            $kategori = $request->query('kategori');
            $dari     = $request->query('dari');
            $sampai   = $request->query('sampai');

            $query = Laporan::with(['murid.kelas', 'guru'])
                ->when($kelasId, fn($q) => $q->whereHas('murid', fn($mq) => $mq->where('kelas_id', $kelasId)))
                ->when($dari, fn($q) => $q->whereDate('tanggal_kejadian', '>=', $dari))
                ->when($sampai, fn($q) => $q->whereDate('tanggal_kejadian', '<=', $sampai))
                ->when($kategori, function ($q) use ($kategori) {
                    if ($kategori === 'prestasi') {
                        $q->whereIn('kategori', ['prestasi', 'kebaikan']);
                    } else {
                        $q->where('kategori', $kategori);
                    }
                })
                ->orderBy('tanggal_kejadian', 'desc');

            $total = $query->count();
            $items = $query->limit(10)->get()->map(function ($l) {
                return [
                    'id'               => $l->id,
                    'tanggal'          => $l->tanggal_kejadian ? \Carbon\Carbon::parse($l->tanggal_kejadian)->format('d/m/Y') : '-',
                    'nama_murid'       => $l->murid->nama ?? '-',
                    'kelas'            => $l->murid->kelas->nama_kelas ?? '-',
                    'pelapor'          => $l->guru->nama ?? '-',
                    'kategori'         => $l->kategori,
                    'keterangan'       => $l->keterangan,
                    'tingkat'          => $l->tingkat_keparahan,
                    'poin'             => $l->poin_diberikan,
                    'status'           => $l->status,
                ];
            });

            return response()->json([
                'total'   => $total,
                'preview' => $items,
            ]);
        }

        if ($type === 'murid') {
            $kelasId = $request->query('kelas_id');
            $status  = $request->query('status', 'aktif');

            $query = Murid::with(['kelas', 'laporans'])
                ->when($status && $status !== 'semua', fn($q) => $q->where('status', $status))
                ->when($kelasId, fn($q) => $q->where('kelas_id', $kelasId));

            $total = $query->count();
            $items = $query->limit(10)->get()->map(function ($m) {
                $prestasi = $m->poinPrestasi();
                $pelanggaran = $m->poinPelanggaran();
                return [
                    'id'               => $m->id,
                    'nama'             => $m->nama,
                    'nis'              => $m->nis ?? '-',
                    'kelas'            => $m->kelas?->nama_kelas ?? '-',
                    'status'           => ucfirst($m->status ?? 'aktif'),
                    'poin_prestasi'    => $prestasi,
                    'poin_pelanggaran' => $pelanggaran,
                    'skor_bersih'      => $prestasi - $pelanggaran,
                    'kualifikasi'      => $m->kualifikasiPoin(),
                    'tahap_pembinaan'  => $m->tahapPembinaan(),
                ];
            });

            return response()->json([
                'total'   => $total,
                'preview' => $items,
            ]);
        }

        if ($type === 'kelas') {
            $kelasId = $request->query('kelas_id');

            $query = Kelas::with(['murids.laporans', 'waliKelas'])
                ->when($kelasId, fn($q) => $q->where('id', $kelasId));

            $total = $query->count();
            $items = $query->limit(10)->get()->map(function ($k) {
                $murids = $k->murids;
                $jumlahMurid = $murids->count();
                $totalSkor = $murids->sum(fn ($m) => $m->skorResmi());
                $rataSkor = $jumlahMurid > 0 ? round($totalSkor / $jumlahMurid, 1) : 0;

                return [
                    'id'           => $k->id,
                    'nama_kelas'   => $k->nama_kelas,
                    'tingkat'      => $k->tingkat,
                    'wali_kelas'   => $k->waliKelas?->nama ?? '-',
                    'jumlah_murid' => $jumlahMurid,
                    'total_skor'   => $totalSkor,
                    'rata_skor'    => $rataSkor,
                ];
            });

            return response()->json([
                'total'   => $total,
                'preview' => $items,
            ]);
        }

        return response()->json(['total' => 0, 'preview' => []]);
    }

    public function exportLaporan(Request $request)
    {
        $request->validate([
            'kelas_id'        => ['nullable', 'exists:kelas,id'],
            'guru_id'         => ['nullable', 'exists:gurus,id'],
            'status'          => ['nullable', 'string'],
            'dari'            => ['nullable', 'date'],
            'sampai'          => ['nullable', 'date', 'after_or_equal:dari'],
            'kategori'        => ['nullable', 'in:pelanggaran,prestasi'],
            'tahun_ajaran_id' => ['nullable', 'exists:tahun_ajarans,id'],
        ], [
            'sampai.after_or_equal' => 'Tanggal akhir harus sama dengan atau setelah tanggal awal.',
            'dari.date'             => 'Format tanggal awal tidak valid.',
            'sampai.date'           => 'Format tanggal akhir tidak valid.',
            'kategori.in'           => 'Kategori laporan yang dipilih tidak valid.',
            'kelas_id.exists'       => 'Kelas yang dipilih tidak ditemukan.',
        ]);

        $kategoriLabel = $request->kategori ? '-' . $request->kategori : '';
        $filename = 'laporan' . $kategoriLabel . '-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new LaporanExport(
            $request->tahun_ajaran_id ? (int) $request->tahun_ajaran_id : null,
            $request->kelas_id ? (int) $request->kelas_id : null,
            $request->dari,
            $request->sampai,
            $request->kategori,
            $request->guru_id ? (int) $request->guru_id : null,
            $request->status,
        ), $filename);
    }

    public function exportMurid(Request $request)
    {
        $request->validate([
            'kelas_id' => ['nullable', 'exists:kelas,id'],
            'status'   => ['nullable', 'in:aktif,alumni,semua'],
        ], [
            'kelas_id.exists' => 'Kelas yang dipilih tidak ditemukan.',
            'status.in'       => 'Pilihan status siswa tidak valid.',
        ]);

        $status = $request->status;
        if ($status === 'semua' || empty($status)) {
            $status = null;
        }

        $filename = 'murid-skor-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new MuridExport(
            $request->kelas_id ? (int) $request->kelas_id : null,
            $status,
        ), $filename);
    }

    public function exportKelas(Request $request)
    {
        $request->validate([
            'kelas_id' => ['nullable', 'exists:kelas,id'],
        ], [
            'kelas_id.exists' => 'Kelas yang dipilih tidak ditemukan.',
        ]);

        $filename = 'kelas-akumulasi-skor-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new KelasExport(
            $request->kelas_id ? (int) $request->kelas_id : null,
        ), $filename);
    }
}

