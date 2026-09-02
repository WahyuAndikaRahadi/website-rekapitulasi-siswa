<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\JenisPelanggaran;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JenisPelanggaranController extends Controller
{
    public function index(): Response
    {
        $tahunAjaran = TahunAjaran::aktif();

        $data = JenisPelanggaran::where('tahun_ajaran_id', $tahunAjaran?->id)
            ->orderBy('kategori')
            ->orderBy('kode')
            ->get();

        return Inertia::render('admin/master/jenis-pelanggaran/index', [
            'jenis_pelanggarans' => $data->map(fn($j) => [
                'id'               => $j->id,
                'kode'             => $j->kode,
                'keterangan'       => $j->keterangan,
                'kategori'         => $j->kategori,
                'tingkat_keparahan'=> $j->tingkat_keparahan,
                'poin'             => $j->poin,
                'is_active'        => $j->is_active,
            ]),
            'tahun_ajaran' => $tahunAjaran ? ['id' => $tahunAjaran->id, 'label' => $tahunAjaran->label] : null,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/master/jenis-pelanggaran/form', [
            'jenis_pelanggaran' => null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tahunAjaran = TahunAjaran::aktif();

        $validated = $request->validate([
            'kode'              => ['required', 'string', 'max:10',
                \Illuminate\Validation\Rule::unique('jenis_pelanggarans')
                    ->where('tahun_ajaran_id', $tahunAjaran?->id)],
            'keterangan'        => ['required', 'string', 'max:255'],
            'kategori'          => ['required', 'in:pelanggaran,kebaikan'],
            'tingkat_keparahan' => ['nullable', 'in:ringan,sedang,berat'],
            'poin'              => ['required', 'integer', 'min:0', 'max:100'],
            'is_active'         => ['boolean'],
        ], [
            'kode.unique'      => 'Kode sudah digunakan pada tahun ajaran ini.',
            'poin.required'    => 'Poin harus diisi.',
            'kode.required'    => 'Kode harus diisi.',
            'keterangan.required' => 'Keterangan harus diisi.',
        ]);

        JenisPelanggaran::create([
            ...$validated,
            'tahun_ajaran_id' => $tahunAjaran->id,
            'tingkat_keparahan' => $validated['kategori'] === 'kebaikan' ? null : ($validated['tingkat_keparahan'] ?? null),
        ]);

        return redirect()->route('admin.jenis-pelanggaran.index')
            ->with('success', 'Jenis berhasil ditambahkan.');
    }

    public function edit(JenisPelanggaran $jenisPelanggaran): Response
    {
        return Inertia::render('admin/master/jenis-pelanggaran/form', [
            'jenis_pelanggaran' => [
                'id'               => $jenisPelanggaran->id,
                'kode'             => $jenisPelanggaran->kode,
                'keterangan'       => $jenisPelanggaran->keterangan,
                'kategori'         => $jenisPelanggaran->kategori,
                'tingkat_keparahan'=> $jenisPelanggaran->tingkat_keparahan,
                'poin'             => $jenisPelanggaran->poin,
                'is_active'        => $jenisPelanggaran->is_active,
            ],
        ]);
    }

    public function update(Request $request, JenisPelanggaran $jenisPelanggaran): RedirectResponse
    {
        $validated = $request->validate([
            'kode'              => ['required', 'string', 'max:10',
                \Illuminate\Validation\Rule::unique('jenis_pelanggarans')
                    ->where('tahun_ajaran_id', $jenisPelanggaran->tahun_ajaran_id)
                    ->ignore($jenisPelanggaran->id)],
            'keterangan'        => ['required', 'string', 'max:255'],
            'kategori'          => ['required', 'in:pelanggaran,kebaikan'],
            'tingkat_keparahan' => ['nullable', 'in:ringan,sedang,berat'],
            'poin'              => ['required', 'integer', 'min:0', 'max:100'],
            'is_active'         => ['boolean'],
        ]);

        $jenisPelanggaran->update([
            ...$validated,
            'tingkat_keparahan' => $validated['kategori'] === 'kebaikan' ? null : ($validated['tingkat_keparahan'] ?? null),
        ]);

        return redirect()->route('admin.jenis-pelanggaran.index')
            ->with('success', 'Jenis berhasil diperbarui.');
    }

    public function destroy(JenisPelanggaran $jenisPelanggaran): RedirectResponse
    {
        // Cek apakah sudah digunakan di laporan
        if ($jenisPelanggaran->laporans()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus — sudah digunakan di laporan. Nonaktifkan saja.');
        }

        $jenisPelanggaran->delete();

        return redirect()->route('admin.jenis-pelanggaran.index')
            ->with('success', 'Jenis berhasil dihapus.');
    }
}
