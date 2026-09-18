<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\MuridImport;
use App\Models\Kelas;
use App\Models\Murid;
use App\Models\TahunAjaran;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class MuridController extends Controller
{
    public function index(Request $request): Response
    {
        $tahunAjaran = TahunAjaran::aktif();

        $query = Murid::with('kelas')
            ->where('tahun_ajaran_id', $request->get('tahun_ajaran_id', $tahunAjaran?->id))
            ->orderBy('kelas_id')
            ->orderBy('nama');

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->q . '%')
                  ->orWhere('nis', 'like', '%' . $request->q . '%');
            });
        }

        $murids = $query->paginate(20)->withQueryString();

        return Inertia::render('admin/murid/index', [
            'murids' => $murids->through(fn($m) => [
                'id'               => $m->id,
                'nama'             => $m->nama,
                'nis'              => $m->nis,
                'nisn'             => $m->nisn,
                'no_telp'          => $m->no_telp,
                'nama_kelas'       => $m->kelas->nama_kelas,
                'kelas_id'         => $m->kelas_id,
                'poin_pelanggaran' => $m->poinPelanggaran(),
                'poin_prestasi'    => $m->poinPrestasi(),
            ]),
            'filters'       => $request->only(['q', 'kelas_id', 'tahun_ajaran_id']),
            'kelas_list'    => Kelas::where('tahun_ajaran_id', $tahunAjaran?->id)->orderBy('nama_kelas')->get(['id', 'nama_kelas']),
            'tahun_ajarans' => TahunAjaran::orderByDesc('label')->get(['id', 'label']),
            'tahun_ajaran_aktif' => $tahunAjaran ? ['id' => $tahunAjaran->id, 'label' => $tahunAjaran->label] : null,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $tahunAjaran = TahunAjaran::aktif();

        $validated = $request->validate([
            'nama'     => ['required', 'string', 'max:100'],
            'nis'      => ['nullable', 'string', 'max:20'],
            'nisn'     => ['nullable', 'string', 'max:20'],
            'no_telp'  => ['nullable', 'string', 'max:20'],
            'kelas_id' => ['required', 'exists:kelas,id'],
        ], [
            'nama.required'     => 'Nama murid harus diisi.',
            'kelas_id.required' => 'Kelas harus dipilih.',
        ]);

        Murid::create([
            ...$validated,
            'tahun_ajaran_id' => $tahunAjaran->id,
        ]);

        return back()->with('success', 'Murid berhasil ditambahkan.');
    }

    public function update(Request $request, Murid $murid): RedirectResponse
    {
        $validated = $request->validate([
            'nama'     => ['required', 'string', 'max:100'],
            'nis'      => ['nullable', 'string', 'max:20'],
            'nisn'     => ['nullable', 'string', 'max:20'],
            'no_telp'  => ['nullable', 'string', 'max:20'],
            'kelas_id' => ['required', 'exists:kelas,id'],
        ]);

        $murid->update($validated);

        return back()->with('success', 'Data murid berhasil diperbarui.');
    }

    public function destroy(Murid $murid): RedirectResponse
    {
        $murid->delete();

        return back()->with('success', 'Murid berhasil dihapus.');
    }

    public function importForm(): Response
    {
        $tahunAjaran = TahunAjaran::aktif();
        return Inertia::render('admin/murid/import', [
            'kelas_list'   => Kelas::where('tahun_ajaran_id', $tahunAjaran?->id)->orderBy('nama_kelas')->get(['id', 'nama_kelas']),
            'tahun_ajaran' => $tahunAjaran ? ['id' => $tahunAjaran->id, 'label' => $tahunAjaran->label] : null,
            'preview'      => Session::get('import_preview'),
            'errors_import'=> Session::get('import_errors'),
        ]);
    }

    public function importProcess(Request $request): RedirectResponse
    {
        $request->validate([
            'file'     => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
            'kelas_id' => ['required', 'exists:kelas,id'],
        ], [
            'file.required' => 'File Excel harus diunggah.',
            'kelas_id.required' => 'Kelas tujuan harus dipilih.',
        ]);

        $tahunAjaran = TahunAjaran::aktif();

        // Baca preview dulu, jangan langsung insert
        $import = new MuridImport($tahunAjaran->id, $request->kelas_id);
        $import->preview($request->file('file'));

        Session::put('import_preview', $import->getPreviewData());
        Session::put('import_errors', $import->getErrors());
        Session::put('import_kelas_id', $request->kelas_id);
        Session::put('import_tahun_ajaran_id', $tahunAjaran->id);

        return redirect()->route('admin.murid.import.form');
    }

    public function importConfirm(Request $request): RedirectResponse
    {
        $kelasId      = Session::get('import_kelas_id');
        $tahunAjaranId= Session::get('import_tahun_ajaran_id');
        $previewData  = Session::get('import_preview', []);

        if (empty($previewData) || ! $kelasId || ! $tahunAjaranId) {
            return redirect()->route('admin.murid.import.form')
                ->with('error', 'Sesi import telah kedaluwarsa. Silakan upload ulang.');
        }

        $imported = 0;
        $skipped  = 0;

        foreach ($previewData as $row) {
            if ($row['status'] !== 'valid') {
                $skipped++;
                continue;
            }

            // Deteksi duplikat: nama + kelas + NISN
            $exists = Murid::where('nama', $row['nama'])
                ->where('kelas_id', $kelasId)
                ->where('tahun_ajaran_id', $tahunAjaranId)
                ->when(!empty($row['nisn']), fn($q) => $q->where('nisn', $row['nisn']))
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            Murid::create([
                'nama'            => $row['nama'],
                'nis'             => $row['nis'] ?? null,
                'nisn'            => $row['nisn'] ?? null,
                'kelas_id'        => $kelasId,
                'tahun_ajaran_id' => $tahunAjaranId,
            ]);
            $imported++;
        }

        Session::forget(['import_preview', 'import_errors', 'import_kelas_id', 'import_tahun_ajaran_id']);

        return redirect()->route('admin.murid.index')
            ->with('success', "Import selesai: {$imported} murid ditambahkan, {$skipped} dilewati.");
    }
}
