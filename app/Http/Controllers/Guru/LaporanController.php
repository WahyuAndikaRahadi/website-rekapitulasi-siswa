<?php

namespace App\Http\Controllers\Guru;

use App\Http\Controllers\Controller;
use App\Http\Requests\Guru\StoreLaporanRequest;
use App\Http\Requests\Guru\UpdateLaporanRequest;
use App\Models\BuktiLaporan;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\Murid;
use App\Models\PoinMaster;
use App\Models\TahunAjaran;
use App\Jobs\SendWhatsAppRekapJob;
use App\Services\WhatsAppService;
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
     * Halaman buat laporan baru — menampilkan tabel murid dengan search & filter serta modal.
     */
    public function create(Request $request): Response
    {
        $kelasList = Kelas::orderBy('nama_kelas')
            ->get(['id', 'nama_kelas', 'tingkat']);

        // Ekstrak daftar jurusan unik dari nama_kelas (misal: "X SIJA 1" -> "SIJA")
        $jurusanList = $kelasList->map(function ($k) {
            $parts = explode(' ', trim($k->nama_kelas));
            return count($parts) >= 2 ? $parts[1] : null;
        })->filter()->unique()->values()->sort()->values();

        $query = Murid::with('kelas')
            ->where('status', 'aktif')
            ->orderBy('kelas_id')
            ->orderBy('nama');

        // Filter: Tingkat
        if ($request->filled('tingkat')) {
            $query->whereHas('kelas', fn($q) => $q->where('tingkat', $request->tingkat));
        }

        // Filter: Jurusan (berdasarkan pola nama_kelas)
        if ($request->filled('jurusan')) {
            $jurusan = $request->jurusan;
            $query->whereHas('kelas', fn($q) => $q->where('nama_kelas', 'like', "% {$jurusan} %")->orWhere('nama_kelas', 'like', "% {$jurusan}"));
        }

        // Filter: Kelas spesifik
        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }

        // Search bar: Nama, NIS, NISN
        if ($request->filled('q')) {
            $q = '%' . $request->q . '%';
            $query->where(function ($query) use ($q) {
                $query->where('nama', 'like', $q)
                      ->orWhere('nis', 'like', $q)
                      ->orWhere('nisn', 'like', $q);
            });
        }

        $murids = $query->paginate(15)->withQueryString();

        return Inertia::render('guru/laporan/buat', [
            'murids' => $murids->through(fn($m) => [
                'id'               => $m->id,
                'nama'             => $m->nama,
                'nis'              => $m->nis,
                'nisn'             => $m->nisn,
                'no_telp'          => $m->no_telp,
                'no_ortu'          => $m->no_ortu,
                'kelas_id'         => $m->kelas_id,
                'nama_kelas'       => $m->kelas?->nama_kelas ?? '—',
                'tingkat'          => $m->kelas?->tingkat ?? '',
                'poin_pelanggaran' => $m->poinPelanggaran(),
                'poin_prestasi'    => $m->poinPrestasi(),
                'kualifikasi'      => $m->kualifikasiPoin(),
                'tahap_pembinaan'  => $m->tahapPembinaan(),
                // backward compatibility fields
                'skor_resmi'       => $m->skorResmi(),
                'skor_sementara'   => $m->skorResmi(),
            ]),
            'filters'      => $request->only(['q', 'tingkat', 'jurusan', 'kelas_id']),
            'tingkat_list' => ['X', 'XI', 'XII', 'XIII'],
            'jurusan_list' => $jurusanList,
            'kelas_list'   => $kelasList,
            'poin_ranges'  => Laporan::POIN_RANGES,
            'poin_masters' => PoinMaster::active()->get(['id', 'kategori', 'nama', 'poin']),
        ]);
    }

    /**
     * Simpan laporan baru.
     */
    public function store(StoreLaporanRequest $request, WhatsAppService $whatsAppService): RedirectResponse
    {
        $guru        = $request->user()->guru;
        $isManual    = (bool) $request->input('is_manual', false);
        $status      = $isManual ? 'menunggu verifikasi' : 'baru dilaporkan';

        $murid = Murid::findOrFail($request->murid_id);
        $poinSebelumnya = $murid->poinPelanggaran();
        $createdLaporan = null;

        DB::transaction(function () use ($request, $guru, $isManual, $status, &$createdLaporan) {
            $createdLaporan = Laporan::create([
                'guru_id'             => $guru->id,
                'murid_id'            => $request->murid_id,
                'kategori'            => $request->kategori,
                'tingkat_keparahan'   => $request->tingkat_keparahan ?? 'ringan',
                'keterangan'          => $request->keterangan,
                'tanggal_kejadian'    => $request->tanggal_kejadian,
                'keterangan_tambahan' => $request->keterangan_tambahan,
                'is_manual'           => $isManual,
                'poin_diberikan'      => $request->poin_diberikan,
                'status'              => $status,
            ]);

            // Upload bukti foto
            if ($request->hasFile('bukti')) {
                foreach ($request->file('bukti') as $file) {
                    $namaAsli = $file->getClientOriginalName();
                    $path = $file->storeAs(
                        'bukti/' . $createdLaporan->id,
                        Str::uuid() . '.' . $file->getClientOriginalExtension(),
                        'public'
                    );

                    BuktiLaporan::create([
                        'laporan_id'  => $createdLaporan->id,
                        'path_file'   => $path,
                        'nama_asli'   => $namaAsli,
                        'uploaded_at' => now(),
                    ]);
                }
            }
        });

        // Kirim notifikasi WhatsApp ke Orang Tua setiap kali laporan dibuat (pelanggaran kecil/besar maupun prestasi)
        if (!$isManual && $createdLaporan) {
            $whatsAppService->sendLaporanNotification($murid, $createdLaporan, $poinSebelumnya);
        }

        $message = $isManual
            ? 'Catatan laporan manual berhasil disimpan dan menunggu verifikasi admin.'
            : 'Catatan laporan berhasil disimpan dan notifikasi WhatsApp otomatis dikirimkan ke orang tua murid.';

        return back()->with('success', $message);
    }

    /**
     * Form edit laporan (selama masih bisa diedit oleh guru).
     */
    public function edit(Laporan $laporan): Response
    {
        $guru = auth()->user()->guru;

        // Pastikan laporan milik guru ini dan masih bisa diedit
        abort_unless($laporan->guru_id === $guru->id && $laporan->bisaDieditOlehGuru(), 403);

        $laporan->load(['murid.kelas', 'bukti']);

        return Inertia::render('guru/laporan/edit', [
            'laporan' => [
                'id'                  => $laporan->id,
                'murid_id'            => $laporan->murid_id,
                'murid'               => [
                    'id'         => $laporan->murid->id,
                    'nama'       => $laporan->murid->nama,
                    'nis'        => $laporan->murid->nis,
                    'no_telp'    => $laporan->murid->no_telp,
                    'nama_kelas' => $laporan->murid->kelas->nama_kelas,
                ],
                'kategori'            => $laporan->kategori,
                'tingkat_keparahan'   => $laporan->tingkat_keparahan,
                'keterangan'          => $laporan->keterangan,
                'is_manual'           => $laporan->is_manual,
                'poin_diberikan'      => $laporan->poin_diberikan,
                'status'              => $laporan->status,
                'tanggal_kejadian'    => $laporan->tanggal_kejadian->format('Y-m-d'),
                'keterangan_tambahan' => $laporan->keterangan_tambahan,
                'bukti'               => $laporan->bukti->map(fn($b) => [
                    'id'        => $b->id,
                    'nama_asli' => $b->nama_asli,
                    'url'       => $b->url(),
                ]),
            ],
            'poin_ranges'  => Laporan::POIN_RANGES,
            'poin_masters' => PoinMaster::active()->get(['id', 'kategori', 'nama', 'poin']),
        ]);
    }

    /**
     * Update laporan (selama masih bisa diedit).
     */
    public function update(UpdateLaporanRequest $request, Laporan $laporan): RedirectResponse
    {
        DB::transaction(function () use ($request, $laporan) {
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

            $isManual = $request->has('is_manual') ? (bool) $request->input('is_manual') : $laporan->is_manual;
            $status = $isManual ? ($laporan->status === 'baru dilaporkan' ? 'baru dilaporkan' : 'menunggu verifikasi') : 'baru dilaporkan';

            $laporan->update([
                'murid_id'            => $request->murid_id,
                'kategori'            => $request->kategori,
                'tingkat_keparahan'   => $request->tingkat_keparahan ?? 'ringan',
                'keterangan'          => $request->keterangan,
                'is_manual'           => $isManual,
                'tanggal_kejadian'    => $request->tanggal_kejadian,
                'keterangan_tambahan' => $request->keterangan_tambahan,
                'poin_diberikan'      => $request->poin_diberikan,
                'status'              => $status,
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

        $query = Laporan::with(['murid.kelas'])
            ->where('guru_id', $guru->id)
            ->orderByDesc('tanggal_kejadian');

        // Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
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
                'murid_no_telp'      => $l->murid->no_telp,
                'kelas_nama'         => $l->murid->kelas->nama_kelas,
                'kategori'           => $l->kategori,
                'tingkat_keparahan'  => $l->tingkat_keparahan,
                'keterangan'         => $l->keterangan,
                'is_manual'          => $l->is_manual,
                'poin_diberikan'     => $l->poin_diberikan,
                'status'             => $l->status,
                'bisa_diedit'        => $l->bisaDieditOlehGuru(),
            ]),
            'filters' => $request->only(['status', 'kategori', 'dari', 'sampai']),
        ]);
    }

    /**
     * JSON endpoint: cari murid (autocomplete).
     */
    public function searchMurid(Request $request): JsonResponse
    {
        $request->validate(['q' => 'required|string|min:2|max:100']);

        $murids = Murid::with('kelas')
            ->where('status', 'aktif')
            ->where(function ($query) use ($request) {
                $q = '%' . $request->q . '%';
                $query->where('nama', 'like', $q)
                      ->orWhere('nis', 'like', $q)
                      ->orWhere('nisn', 'like', $q);
            })
            ->limit(20)
            ->get(['id', 'nama', 'nis', 'nisn', 'no_telp', 'no_ortu', 'kelas_id'])
            ->map(fn($m) => [
                'id'         => $m->id,
                'nama'       => $m->nama,
                'nis'        => $m->nis,
                'nisn'       => $m->nisn,
                'no_telp'    => $m->no_telp,
                'no_ortu'    => $m->no_ortu,
                'nama_kelas' => $m->kelas->nama_kelas ?? '—',
                'tingkat'    => $m->kelas->tingkat ?? '',
            ]);

        return response()->json($murids);
    }
}
