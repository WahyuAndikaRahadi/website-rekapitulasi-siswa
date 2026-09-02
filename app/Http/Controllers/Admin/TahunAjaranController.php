<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TahunAjaranController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/tahun-ajaran/index', [
            'tahun_ajarans' => TahunAjaran::orderByDesc('label')->get()->map(fn($t) => [
                'id'        => $t->id,
                'label'     => $t->label,
                'is_active' => $t->is_active,
            ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'label' => ['required', 'string', 'max:20', 'unique:tahun_ajarans,label'],
        ], [
            'label.required' => 'Label tahun ajaran harus diisi (contoh: 2026-2027).',
            'label.unique'   => 'Tahun ajaran ini sudah ada.',
        ]);

        TahunAjaran::create(['label' => $request->label, 'is_active' => false]);

        return back()->with('success', 'Tahun ajaran berhasil ditambahkan.');
    }

    public function destroy(TahunAjaran $tahunAjaran): RedirectResponse
    {
        if ($tahunAjaran->is_active) {
            return back()->with('error', 'Tidak dapat menghapus tahun ajaran yang sedang aktif.');
        }

        $tahunAjaran->delete();

        return back()->with('success', 'Tahun ajaran berhasil dihapus.');
    }

    /**
     * Set satu tahun ajaran sebagai aktif (yang lain jadi tidak aktif).
     */
    public function aktifkan(TahunAjaran $tahunAjaran): RedirectResponse
    {
        DB::transaction(function () use ($tahunAjaran) {
            TahunAjaran::query()->update(['is_active' => false]);
            $tahunAjaran->update(['is_active' => true]);
        });

        return back()->with('success', "Tahun ajaran {$tahunAjaran->label} sekarang aktif.");
    }
}
