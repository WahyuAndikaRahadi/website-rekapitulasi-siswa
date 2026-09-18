<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KelasController extends Controller
{
    public function index(): Response
    {
        $kelas = Kelas::with(['waliKelas'])
            ->orderBy('tingkat')
            ->orderBy('nama_kelas')
            ->get();

        return Inertia::render('admin/kelas/index', [
            'kelas_list' => $kelas->map(fn($k) => [
                'id'         => $k->id,
                'nama_kelas' => $k->nama_kelas,
                'tingkat'    => $k->tingkat,
                'wali_kelas' => $k->waliKelas?->nama,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelas' => ['required', 'string', 'max:50', 'unique:kelas,nama_kelas'],
            'tingkat'    => ['required', 'string', 'max:5'],
        ], [
            'nama_kelas.required' => 'Nama kelas harus diisi.',
            'nama_kelas.unique'   => 'Nama kelas sudah ada.',
            'tingkat.required'    => 'Tingkat harus dipilih.',
        ]);

        Kelas::create($validated);

        return back()->with('success', 'Kelas berhasil ditambahkan.');
    }

    public function update(Request $request, Kelas $kelas): RedirectResponse
    {
        $validated = $request->validate([
            'nama_kelas' => ['required', 'string', 'max:50', 'unique:kelas,nama_kelas,' . $kelas->id],
            'tingkat'    => ['required', 'string', 'max:5'],
        ], [
            'nama_kelas.required' => 'Nama kelas harus diisi.',
            'nama_kelas.unique'   => 'Nama kelas sudah ada.',
        ]);

        $kelas->update($validated);

        return back()->with('success', 'Kelas berhasil diperbarui.');
    }

    public function destroy(Kelas $kelas): RedirectResponse
    {
        if ($kelas->murids()->where('status', 'aktif')->exists()) {
            return back()->with('error', 'Tidak dapat menghapus kelas yang masih memiliki murid aktif.');
        }

        $kelas->delete();

        return back()->with('success', 'Kelas berhasil dihapus.');
    }
}
