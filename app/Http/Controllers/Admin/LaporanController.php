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
            ->orderByDesc('tanggal_kejadian');

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
        if ($request->filled('tahun_ajaran_id')) {
            $query->where('tahun_ajaran_id', $request->tahun_ajaran_id);
        } else {
            $aktif = TahunAjaran::aktif();
            if ($aktif) {
                $query->where('tahun_ajaran_id', $aktif->id);
            }
        }

        $laporans = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/laporan/index', [
            'laporans' => $laporans->through(fn($l) => [
                'id'                => $l->id,
                'tanggal_kejadian'  => $l->tanggal_kejadian->format('d/m/Y'),
                'murid_nama'        => $l->murid->nama,
                'kelas_nama'        => $l->murid->kelas->nama_kelas,
                'guru_nama'         => $l->guru->nama,
                'kategori'          => $l->kategori,
                'tingkat_keparahan' => $l->tingkat_keparahan,
                'keterangan'        => $l->keterangan,
                'poin_diberikan'    => $l->poin_diberikan,
                'status'            => $l->status,
                'jumlah_bukti'      => $l->bukti->count(),
            ]),
            'filters'       => $request->only(['status', 'kategori', 'kelas_id', 'guru_id', 'dari', 'sampai', 'tahun_ajaran_id']),
            'kelas_list'    => Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas']),
            'guru_list'     => Guru::orderBy('nama')->get(['id', 'nama']),
            'tahun_ajarans' => TahunAjaran::orderByDesc('label')->get(['id', 'label']),
            'summary'       => [
                'pending'         => Laporan::pending()->count(),
                'ditindaklanjuti' => Laporan::ditindaklanjuti()->count(),
                'ditolak'         => Laporan::ditolak()->count(),
            ],
        ]);
    }

    public function show(Laporan $laporan): Response
    {
        $laporan->load(['murid.kelas', 'guru', 'bukti', 'ditindaklanjutiOleh', 'tahunAjaran']);

        return Inertia::render('admin/laporan/show', [
            'laporan' => [
                'id'                    => $laporan->id,
                'tanggal_kejadian'      => $laporan->tanggal_kejadian->format('d/m/Y'),
                'murid'                 => [
                    'id'         => $laporan->murid->id,
                    'nama'       => $laporan->murid->nama,
                    'nis'        => $laporan->murid->nis,
                    'nisn'       => $laporan->murid->nisn,
                    'nama_kelas' => $laporan->murid->kelas->nama_kelas,
                ],
                'guru'                  => ['id' => $laporan->guru->id, 'nama' => $laporan->guru->nama],
                'kategori'              => $laporan->kategori,
                'tingkat_keparahan'     => $laporan->tingkat_keparahan,
                'keterangan'            => $laporan->keterangan,
                'poin_diberikan'        => $laporan->poin_diberikan,
                'keterangan_tambahan'   => $laporan->keterangan_tambahan,
                'status'                => $laporan->status,
                'tindak_lanjut'         => $laporan->tindak_lanjut,
                'ditindaklanjuti_oleh'  => $laporan->ditindaklanjutiOleh?->name,
                'ditindaklanjuti_at'    => $laporan->ditindaklanjuti_at?->format('d/m/Y H:i'),
                'tahun_ajaran'          => $laporan->tahunAjaran->label,
                'bukti'                 => $laporan->bukti->map(fn($b) => [
                    'id'        => $b->id,
                    'nama_asli' => $b->nama_asli,
                    'url'       => $b->url(),
                ]),
            ],
            'poin_ranges'  => Laporan::POIN_RANGES,
            'poin_masters' => PoinMaster::active()->get(['id', 'kategori', 'nama', 'poin']),
        ]);
    }

    public function tindakLanjut(Request $request, Laporan $laporan): RedirectResponse
    {
        $request->validate([
            'status'          => ['required', 'in:ditindaklanjuti,ditolak'],
            'tindak_lanjut'   => ['required', 'string', 'max:1000'],
            'poin_diberikan'  => [
                'required_if:status,ditindaklanjuti',
                'nullable',
                'integer',
                'not_in:0',
            ],
        ], [
            'status.required'                    => 'Status harus dipilih.',
            'tindak_lanjut.required'             => 'Catatan tindak lanjut harus diisi.',
            'poin_diberikan.required_if'         => 'Poin harus diisi saat laporan disetujui.',
            'poin_diberikan.integer'             => 'Poin harus berupa angka bulat.',
            'poin_diberikan.not_in'              => 'Poin tidak boleh nol.',
        ]);

        $poin = $request->status === 'ditindaklanjuti'
            ? (int) $request->poin_diberikan
            : null;

        $laporan->update([
            'status'               => $request->status,
            'tindak_lanjut'        => $request->tindak_lanjut,
            'poin_diberikan'       => $poin,
            'ditindaklanjuti_oleh' => $request->user()->id,
            'ditindaklanjuti_at'   => now(),
        ]);

        return redirect()->route('admin.laporan.show', $laporan)
            ->with('success', 'Laporan berhasil ditindaklanjuti.');
    }
}
