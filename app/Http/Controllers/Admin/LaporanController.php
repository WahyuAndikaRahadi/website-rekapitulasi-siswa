<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Guru;
use App\Models\Kelas;
use App\Models\Laporan;
use App\Models\PoinMaster;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LaporanController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Laporan::with(['murid.kelas', 'guru', 'bukti'])
            ->orderByDesc('tanggal_kejadian')
            ->orderByDesc('id');

        // Filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('kategori')) {
            $query->where('kategori', $request->kategori);
        }
        if ($request->filled('kelas_id')) {
            $query->whereHas('murid', fn($q) => $q->where('kelas_id', $request->kelas_id));
        }
        if ($request->filled('guru_id')) {
            $query->where('guru_id', $request->guru_id);
        }
        if ($request->filled('dari')) {
            $query->whereDate('tanggal_kejadian', '>=', $request->dari);
        }
        if ($request->filled('sampai')) {
            $query->whereDate('tanggal_kejadian', '<=', $request->sampai);
        }
        $laporans = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/laporan/index', [
            'laporans' => $laporans->through(fn($l) => [
                'id'                 => $l->id,
                'tanggal_kejadian'   => $l->tanggal_kejadian->format('d/m/Y'),
                'murid_nama'         => $l->murid->nama,
                'murid_nis'          => $l->murid->nis,
                'murid_no_telp'      => $l->murid->no_telp,
                'kelas_nama'         => $l->murid->kelas?->nama_kelas ?? 'Alumni',
                'guru_nama'          => $l->guru->nama,
                'guru_no_telp'       => $l->guru->no_telp,
                'kategori'           => $l->kategori,
                'tingkat_keparahan'  => $l->tingkat_keparahan,
                'keterangan'         => $l->keterangan,
                'keterangan_tambahan'=> $l->keterangan_tambahan,
                'is_manual'          => (bool) $l->is_manual,
                'needs_verification' => $l->needsVerification(),
                'poin_diberikan'     => $l->poin_diberikan,
                'status'             => $l->status,
                'jumlah_bukti'       => $l->bukti->count(),
                'bukti_urls'         => $l->bukti->map(fn($b) => [
                    'url'       => $b->url(),
                    'nama_asli' => $b->nama_asli,
                ])->values()->all(),
            ]),
            'filters'       => $request->only(['status', 'kategori', 'kelas_id', 'guru_id', 'dari', 'sampai']),
            'kelas_list'    => Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas', 'tingkat']),
            'guru_list'     => Guru::orderBy('nama')->get(['id', 'nama']),
            'summary'       => [
                'menunggu_verifikasi' => Laporan::menungguVerifikasi()->count(),
                'baru_dilaporkan'     => Laporan::baruDilaporkan()->count(),
                'pembinaan'           => Laporan::pembinaan()->count(),
                'selesai'             => Laporan::selesai()->count(),
                'total'               => Laporan::count(),
            ],
        ]);
    }

    public function show(Laporan $laporan): Response
    {
        $laporan->load(['murid.kelas', 'guru', 'bukti', 'ditindaklanjutiOleh']);

        return Inertia::render('admin/laporan/show', [
            'laporan' => [
                'id'                  => $laporan->id,
                'tanggal_kejadian'    => $laporan->tanggal_kejadian->format('d/m/Y'),
                'murid'               => [
                    'id'         => $laporan->murid->id,
                    'nama'       => $laporan->murid->nama,
                    'nis'        => $laporan->murid->nis,
                    'nisn'       => $laporan->murid->nisn,
                    'no_telp'    => $laporan->murid->no_telp,
                    'nama_kelas' => $laporan->murid->kelas?->nama_kelas ?? 'Alumni',
                ],
                'guru'                => ['id' => $laporan->guru->id, 'nama' => $laporan->guru->nama, 'no_telp' => $laporan->guru->no_telp],
                'kategori'            => $laporan->kategori,
                'tingkat_keparahan'   => $laporan->tingkat_keparahan,
                'keterangan'          => $laporan->keterangan,
                'is_manual'           => (bool) $laporan->is_manual,
                'needs_verification'  => $laporan->needsVerification(),
                'poin_diberikan'      => $laporan->poin_diberikan,
                'keterangan_tambahan' => $laporan->keterangan_tambahan,
                'status'              => $laporan->status,
                'tindak_lanjut'       => $laporan->tindak_lanjut,
                'ditindaklanjuti_oleh'=> $laporan->ditindaklanjutiOleh?->name,
                'ditindaklanjuti_at'  => $laporan->ditindaklanjuti_at?->format('d/m/Y H:i'),
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
     * Update status laporan secara manual oleh admin.
     */
    public function updateStatus(Request $request, Laporan $laporan): RedirectResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:baru dilaporkan,pembinaan tindak lanjut,selesai,ditolak'],
        ], [
            'status.required' => 'Status harus dipilih.',
            'status.in'       => 'Status tidak valid.',
        ]);

        $laporan->update([
            'status'               => $request->status,
            'ditindaklanjuti_oleh' => $request->user()->id,
            'ditindaklanjuti_at'   => now(),
        ]);

        return back()->with('success', 'Status laporan berhasil diperbarui.');
    }

    /**
     * Verifikasi laporan manual oleh admin.
     */
    public function tindakLanjut(Request $request, Laporan $laporan): RedirectResponse
    {
        $request->validate([
            'status'         => ['required', 'in:baru dilaporkan,pembinaan tindak lanjut,selesai,ditolak,ditindaklanjuti'],
            'tindak_lanjut'  => ['nullable', 'string', 'max:1000'],
            'poin_diberikan' => [
                'required_unless:status,ditolak',
                'nullable',
                'integer',
                'not_in:0',
            ],
        ], [
            'status.required'            => 'Keputusan harus dipilih.',
            'poin_diberikan.required_unless' => 'Poin harus diisi saat laporan disetujui.',
            'poin_diberikan.integer'     => 'Poin harus berupa angka bulat.',
            'poin_diberikan.not_in'      => 'Poin tidak boleh nol.',
        ]);

        $status = $request->status;
        if ($status === 'ditindaklanjuti') {
            $status = 'baru dilaporkan';
        }

        $poin = $status === 'ditolak'
            ? null
            : (int) $request->poin_diberikan;

        $murid = $laporan->murid;
        $poinSebelumnya = $murid ? $murid->poinPelanggaran() : 0;

        $laporan->update([
            'status'               => $status,
            'tindak_lanjut'        => $request->tindak_lanjut,
            'poin_diberikan'       => $poin ?? $laporan->poin_diberikan,
            'ditindaklanjuti_oleh' => $request->user()->id,
            'ditindaklanjuti_at'   => now(),
        ]);

        // Kirim notifikasi WhatsApp ke Orang Tua saat laporan manual diverifikasi dan disetujui
        if ($status !== 'ditolak' && $murid) {
            $whatsAppService = app(\App\Services\WhatsAppService::class);
            $whatsAppService->sendLaporanNotification($murid, $laporan, $poinSebelumnya);
        }

        return redirect()->route('admin.laporan.show', $laporan)
            ->with('success', 'Laporan berhasil diverifikasi dan notifikasi WhatsApp otomatis dikirimkan ke orang tua murid.');
    }
}
