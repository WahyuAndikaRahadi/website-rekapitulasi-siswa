<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KelasController extends Controller
{
    public function index(): Response
    {
        $kelas = Kelas::with(['tahunAjaran', 'waliKelas'])
            ->orderBy('tahun_ajaran_id', 'desc')
            ->orderBy('tingkat')
            ->orderBy('nama_kelas')
            ->get();

        return Inertia::render('admin/kelas/index', [
            'kelas_list'    => $kelas->map(fn($k) => [
                'id'           => $k->id,
                'nama_kelas'   => $k->nama_kelas,
                'tingkat'      => $k->tingkat,
                'tahun_ajaran' => $k->tahunAjaran->label,
                'wali_kelas'   => $k->waliKelas?->nama,
            ]),
            'tahun_ajarans' => TahunAjaran::orderByDesc('label')->get(['id', 'label']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelas'      => ['required', 'string', 'max:50'],
            'tingkat'         => ['required', 'string', 'max:5'],
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
        ], [
            'nama_kelas.required'      => 'Nama kelas harus diisi.',
            'tahun_ajaran_id.required' => 'Tahun ajaran harus dipilih.',
        ]);

        Kelas::create($validated);

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Kelas $kelas): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelas' => ['required', 'string', 'max:50'],
            'tingkat'    => ['required', 'string', 'max:5'],
        ]);

        $kelas->update($validated);

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Kelas $kelas): RedirectResponse
    {
        if ($kelas->murids()->exists()) {
            return back()->with('error', 'Tidak dapat menghapus kelas yang masih memiliki murid.');
        }

        $kelas->delete();

        return back()->with('success', 'Kelas berhasil dihapus.');
    }
}
