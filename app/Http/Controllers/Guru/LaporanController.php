<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreLaporanRequest;
use App\Http\Requests\Guru\UpdateLaporanRequest;
use App\Models\BuktiLaporan;
use App\Models\JenisPelanggaran;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    /**
     * Form buat laporan baru.
     */
    public function create(): Response
    {
        $tahunAjaran = TahunAjaran::aktif();

        $jenisPelanggarans = JenisPelanggaran::aktif()
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->orderBy('kategori')
            ->orderBy('kode')
            ->get(['id', 'kode', 'keterangan', 'kategori', 'poin', 'tingkat_keparahan']);

        return Inertia::render('guru/laporan/buat', [
            'jenis_pelanggarans' => $jenisPelanggarans,
            'tahun_ajaran'       => $tahunAjaran ? ['id' => $tahunAjaran->id, 'label' => $tahunAjaran->label] : null,
        ]);
    }

    /**
     * Simpan laporan baru.
     */
    public function store(StoreLaporanRequest $request): RedirectResponse
    {
        $guru        = $request->user()->guru;
        $tahunAjaran = TahunAjaran::aktif();
        $jenis       = JenisPelanggaran::findOrFail($request->jenis_pelanggaran_id);

        DB::transaction(function () use ($request, $guru, $tahunAjaran, $jenis) {
            $laporan = Laporan::create([
                'guru_id'               => $guru->id,
                'murid_id'              => $request->murid_id,
                'jenis_pelanggaran_id'  => $jenis->id,
                'tanggal_kejadian'      => $request->tanggal_kejadian,
                'keterangan_tambahan'   => $request->keterangan_tambahan,
                'poin_diberikan'        => $jenis->poinEfektif(), // snapshot poin saat laporan dibuat
                'status'                => 'pending',
                'tahun_ajaran_id'       => $tahunAjaran->id,
            ]);

            // Upload bukti foto
            if ($request->hasFile('bukti')) {
                foreach ($request->file('bukti') as $file) {
                    $namaAsli = $file->getClientOriginalName();
                    // Nama file unik — hindari konflik dan tebak nama asli
                    $path = $file->storeAs(
                        'bukti/' . $laporan->id,
                        Str::uuid() . '.' . $file->getClientOriginalExtension(),
                        'public'
                    );

                    BuktiLaporan::create([
                        'laporan_id'  => $laporan->id,
                        'path_file'   => $path,
                        'nama_asli'   => $namaAsli,
                        'uploaded_at' => now(),
                    ]);
                }
            }
        });

        return redirect()->route('guru.laporan.riwayat')
            ->with('success', 'Laporan berhasil disimpan dan menunggu tindak lanjut admin.');
    }

    /**
     * Form edit laporan (hanya selama pending).
     */
    public function edit(Laporan $laporan): Response
    {
        $guru = auth()->user()->guru;

        // Pastikan laporan milik guru ini dan masih pending
        abort_unless($laporan->guru_id === $guru->id && $laporan->isPending(), 403);

        $tahunAjaran = TahunAjaran::aktif();

        $jenisPelanggarans = JenisPelanggaran::aktif()
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->orderBy('kategori')
            ->orderBy('kode')
            ->get(['id', 'kode', 'keterangan', 'kategori', 'poin', 'tingkat_keparahan']);

        $laporan->load(['murid.kelas', 'bukti']);

        return Inertia::render('guru/laporan/edit', [
            'laporan'            => [
                'id'                    => $laporan->id,
                'murid_id'              => $laporan->murid_id,
                'murid'                 => [
                    'id'         => $laporan->murid->id,
                    'nama'       => $laporan->murid->nama,
                    'nis'        => $laporan->murid->nis,
                    'nama_kelas' => $laporan->murid->kelas->nama_kelas,
                ],
                'jenis_pelanggaran_id'  => $laporan->jenis_pelanggaran_id,
                'tanggal_kejadian'      => $laporan->tanggal_kejadian->format('Y-m-d'),
                'keterangan_tambahan'   => $laporan->keterangan_tambahan,
                'bukti'                 => $laporan->bukti->map(fn($b) => [
                    'id'        => $b->id,
                    'nama_asli' => $b->nama_asli,
                    'url'       => $b->url(),
                ]),
            ],
            'jenis_pelanggarans' => $jenisPelanggarans,
        ]);
    }

    /**
     * Update laporan (hanya selama pending).
     */
    public function update(UpdateLaporanRequest $request, Laporan $laporan): RedirectResponse
    {
        $jenis = JenisPelanggaran::findOrFail($request->jenis_pelanggaran_id);

        DB::transaction(function () use ($request, $laporan, $jenis) {
            // Hapus bukti yang diminta
            if ($request->filled('bukti_hapus')) {
                $buktis = BuktiLaporan::whereIn('id', $request->bukti_hapus)
                    ->where('laporan_id', $laporan->id)
                    ->get();

                foreach ($buktis as $bukti) {
                    Storage::disk('public')->delete($bukti->path_file);
                    $bukti->delete();
                }
            }

            // Upload bukti baru
            if ($request->hasFile('bukti')) {
                foreach ($request->file('bukti') as $file) {
                    $path = $file->storeAs(
                        'bukti/' . $laporan->id,
                        Str::uuid() . '.' . $file->getClientOriginalExtension(),
                        'public'
                    );

                    BuktiLaporan::create([
                        'laporan_id'  => $laporan->id,
                        'path_file'   => $path,
                        'nama_asli'   => $file->getClientOriginalName(),
                        'uploaded_at' => now(),
                    ]);
                }
            }

            $laporan->update([
                'murid_id'             => $request->murid_id,
                'jenis_pelanggaran_id' => $jenis->id,
                'tanggal_kejadian'     => $request->tanggal_kejadian,
                'keterangan_tambahan'  => $request->keterangan_tambahan,
                'poin_diberikan'       => $jenis->poinEfektif(),
            ]);
        });

        return redirect()->route('guru.laporan.riwayat')
            ->with('success', 'Laporan berhasil diperbarui.');
    }

    /**
     * Riwayat laporan milik guru yang sedang login.
     */
    public function riwayat(Request $request): Response
    {
        $guru = $request->user()->guru;

        $query = Laporan::with(['murid.kelas', 'jenisPelanggaran'])
            ->where('guru_id', $guru->id)
            ->orderByDesc('tanggal_kejadian');

        // Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('dari')) {
            $query->whereDate('tanggal_kejadian', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->whereDate('tanggal_kejadian', '<=', $request->sampai);
        }

        $laporans = $query->paginate(15)->withQueryString();

        return Inertia::render('guru/laporan/riwayat', [
            'laporans' => $laporans->through(fn($l) => [
                'id'                 => $l->id,
                'tanggal_kejadian'   => $l->tanggal_kejadian->format('d/m/Y'),
                'murid_nama'         => $l->murid->nama,
                'kelas_nama'         => $l->murid->kelas->nama_kelas,
                'jenis_keterangan'   => $l->jenisPelanggaran->keterangan,
                'kategori'           => $l->jenisPelanggaran->kategori,
                'poin_diberikan'     => $l->poin_diberikan,
                'status'             => $l->status,
                'bisa_diedit'        => $l->bisaDieditOlehGuru(),
            ]),
            'filters' => $request->only(['status', 'dari', 'sampai']),
        ]);
    }

    /**
     * JSON endpoint: cari murid (autocomplete).
     */
    public function searchMurid(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2|max:100']);

        $tahunAjaran = TahunAjaran::aktif();

        $murids = Murid::with('kelas')
            ->where('tahun_ajaran_id', $tahunAjaran?->id)
            ->where(function ($query) use ($request) {
                $q = '%' . $request->q . '%';
                $query->where('nama', 'like', $q)
                      ->orWhere('nis', 'like', $q)
                      ->orWhere('nisn', 'like', $q);
            })
            ->limit(20)
            ->get(['id', 'nama', 'nis', 'nisn', 'kelas_id'])
            ->map(fn($m) => [
                'id'         => $m->id,
                'nama'       => $m->nama,
                'nis'        => $m->nis,
                'nama_kelas' => $m->kelas->nama_kelas ?? '—',
            ]);

        return response()->json($murids);
    }
}
