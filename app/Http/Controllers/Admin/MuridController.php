<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Imports\MuridImport;
use App\Models\Kelas;
use App\Models\Murid;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

class MuridController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->get('status', 'aktif');

        $query = Murid::with('kelas')
            ->orderBy('kelas_id')
            ->orderBy('nama');

        if ($status === 'alumni') {
            $query->where('status', 'alumni');
        } elseif ($status === 'semua') {
            // Tampilkan semua
        } else {
            $query->where('status', 'aktif');
        }

        if ($request->filled('kelas_id')) {
            $query->where('kelas_id', $request->kelas_id);
        }
        if ($request->filled('q')) {
            $query->where(function ($q) use ($request) {
                $q->where('nama', 'like', '%' . $request->q . '%')
                  ->orWhere('nis', 'like', '%' . $request->q . '%')
                  ->orWhere('nisn', 'like', '%' . $request->q . '%');
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
                'no_ortu'          => $m->no_ortu,
                'status'                 => $m->status,
                'nama_kelas'             => $m->kelas?->nama_kelas ?? ($m->status === 'alumni' ? 'Alumni' : '—'),
                'kelas_id'               => $m->kelas_id,
                'poin_pelanggaran'       => $m->poinPelanggaran(),
                'poin_pelanggaran_kotor' => $m->poinPelanggaranKotor(),
                'poin_prestasi'          => $m->poinPrestasi(),
                'poin_akumulasi'         => $m->poinAkumulasi(),
            ]),
            'filters'       => $request->only(['q', 'kelas_id', 'status']),
            'kelas_list'    => Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas', 'tingkat']),
            'summary'       => [
                'total_aktif'  => Murid::where('status', 'aktif')->count(),
                'total_alumni' => Murid::where('status', 'alumni')->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'nama'     => ['required', 'string', 'max:100'],
            'nis'      => ['nullable', 'string', 'max:20'],
            'nisn'     => ['nullable', 'string', 'max:20'],
            'no_telp'  => ['nullable', 'string', 'max:20'],
            'no_ortu'  => ['required', 'string', 'max:20'],
            'kelas_id' => ['required', 'exists:kelas,id'],
        ], [
            'nama.required'     => 'Nama murid harus diisi.',
            'no_ortu.required'  => 'Nomor HP/WA Orang Tua/Wali harus diisi.',
            'kelas_id.required' => 'Kelas harus dipilih.',
        ]);

        Murid::create([
            ...$validated,
            'status' => 'aktif',
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
            'no_ortu'  => ['required', 'string', 'max:20'],
            'status'   => ['nullable', 'in:aktif,alumni'],
            'kelas_id' => ['nullable', 'exists:kelas,id'],
        ], [
            'nama.required'     => 'Nama murid harus diisi.',
            'no_ortu.required'  => 'Nomor HP/WA Orang Tua/Wali harus diisi.',
        ]);

        $murid->update($validated);

        return back()->with('success', 'Data murid berhasil diperbarui.');
    }

    public function destroy(Murid $murid): RedirectResponse
    {
        $murid->delete();

        return back()->with('success', 'Murid berhasil dihapus.');
    }

    /**
     * Proses Kenaikan Kelas Massal & Kelulusan Alumni SMKN 69.
     * Alur:
     * 1. Siswa tingkat akhir (XIII SIJA, XII OTO, XII MEKA) -> Menjadi ALUMNI (kelas_id = null)
     * 2. XII SIJA -> XIII SIJA
     * 3. XI -> XII (SIJA, OTO, MEKA)
     * 4. X -> XI (SIJA, OTO, MEKA)
     * Hasil: Seluruh kelas X kosong dan siap diisi murid baru.
     */
    public function naikKelas(Request $request): RedirectResponse
    {
        $result = DB::transaction(function () {
            $kelasMap = Kelas::pluck('id', 'nama_kelas')->all();

            // 1. Siswa tingkat akhir (XIII SIJA 1/2, XII TO 1/2, XII TM 1/2, serta fallback OTO/MEKA) -> Menjadi ALUMNI
            $alumniClasses = [
                'XIII SIJA 1', 'XIII SIJA 2',
                'XII TO 1', 'XII TO 2',
                'XII TM 1', 'XII TM 2',
                'XII OTO 1', 'XII OTO 2',
                'XII MEKA 1', 'XII MEKA 2',
            ];
            $alumniClassIds = array_filter(array_map(fn($nama) => $kelasMap[$nama] ?? null, $alumniClasses));

            $graduatedCount = Murid::whereIn('kelas_id', $alumniClassIds)
                ->where('status', 'aktif')
                ->update([
                    'status'   => 'alumni',
                    'kelas_id' => null,
                ]);

            // 2. Kenaikan kelas berjenjang (dari jenjang tertinggi ke terendah)
            $promotions = [
                // XII -> XIII (SIJA 4 Tahun)
                'XII SIJA 1' => 'XIII SIJA 1',
                'XII SIJA 2' => 'XIII SIJA 2',

                // XI -> XII
                'XI SIJA 1'  => 'XII SIJA 1',
                'XI SIJA 2'  => 'XII SIJA 2',
                'XI TO 1'    => 'XII TO 1',
                'XI TO 2'    => 'XII TO 2',
                'XI TM 1'    => 'XII TM 1',
                'XI TM 2'    => 'XII TM 2',
                'XI OTO 1'   => 'XII OTO 1',
                'XI OTO 2'   => 'XII OTO 2',
                'XI MEKA 1'  => 'XII MEKA 1',
                'XI MEKA 2'  => 'XII MEKA 2',

                // X -> XI
                'X SIJA 1'   => 'XI SIJA 1',
                'X SIJA 2'   => 'XI SIJA 2',
                'X TO 1'     => 'XI TO 1',
                'X TO 2'     => 'XI TO 2',
                'X TM 1'     => 'XI TM 1',
                'X TM 2'     => 'XI TM 2',
                'X OTO 1'    => 'XI OTO 1',
                'X OTO 2'    => 'XI OTO 2',
                'X MEKA 1'   => 'XI MEKA 1',
                'X MEKA 2'   => 'XI MEKA 2',
            ];

            $promotedCount = 0;
            foreach ($promotions as $fromName => $toName) {
                $fromId = $kelasMap[$fromName] ?? null;
                $toId   = $kelasMap[$toName] ?? null;

                if ($fromId && $toId) {
                    $count = Murid::where('kelas_id', $fromId)
                        ->where('status', 'aktif')
                        ->update(['kelas_id' => $toId]);
                    $promotedCount += $count;
                }
            }

            return [
                'promoted'  => $promotedCount,
                'graduated' => $graduatedCount,
            ];
        });

        return back()->with(
            'success',
            "Proses Naik Kelas Massal Berhasil! {$result['promoted']} siswa berhasil naik kelas, dan {$result['graduated']} siswa tingkat akhir dinyatakan lulus menjadi ALUMNI. Seluruh kelas tingkat X sekarang kosong dan siap diisi murid baru."
        );
    }

    public function downloadTemplate()
    {
        return \Maatwebsite\Excel\Facades\Excel::download(
            new \App\Exports\MuridTemplateExport(),
            'template-import-murid.xlsx'
        );
    }

    public function importForm(Request $request): Response
    {
        if ($request->has('reset')) {
            Session::forget(['import_preview', 'import_errors', 'import_kelas_id']);
        }

        return Inertia::render('admin/murid/import', [
            'kelas_list'   => Kelas::orderBy('nama_kelas')->get(['id', 'nama_kelas', 'tingkat']),
            'preview'      => Session::get('import_preview'),
            'errors_import'=> Session::get('import_errors'),
        ]);
    }

    public function importCancel(): RedirectResponse
    {
        Session::forget(['import_preview', 'import_errors', 'import_kelas_id']);
        return redirect()->route('admin.murid.import.form');
    }

    public function importProcess(Request $request): RedirectResponse
    {
        $request->validate([
            'file'     => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
            'kelas_id' => ['required', 'exists:kelas,id'],
        ], [
            'file.required'     => 'File Excel harus diunggah.',
            'file.file'         => 'File yang diunggah tidak valid.',
            'file.uploaded'     => 'File gagal diunggah. Kemungkinan ukuran melebihi batas upload server.',
            'file.mimes'        => 'Format file harus berupa file spreadsheet (.xlsx, .xls) atau .csv.',
            'file.max'          => 'Ukuran file Excel tidak boleh melebihi 5 MB.',
            'kelas_id.required' => 'Kelas tujuan harus dipilih.',
            'kelas_id.exists'   => 'Kelas tujuan tidak ditemukan.',
        ]);

        $import = new MuridImport(0, $request->kelas_id);
        $import->preview($request->file('file'));

        Session::put('import_preview', $import->getPreviewData());
        Session::put('import_errors', $import->getErrors());
        Session::put('import_kelas_id', $request->kelas_id);

        return redirect()->route('admin.murid.import.form');
    }

    public function importConfirm(Request $request): RedirectResponse
    {
        $kelasId      = Session::get('import_kelas_id');
        $previewData  = Session::get('import_preview', []);

        if (empty($previewData) || ! $kelasId) {
            return redirect()->route('admin.murid.import.form')
                ->with('error', 'Sesi import telah kedaluwarsa atau sudah diproses. Silakan upload ulang.');
        }

        // Segera hapus session untuk menjamin Idempotency (mencegah klik ganda memproses ulang)
        Session::forget(['import_preview', 'import_errors', 'import_kelas_id']);

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
                'no_telp'         => $row['no_telp'] ?? null,
                'no_ortu'         => !empty($row['no_ortu']) ? $row['no_ortu'] : null,
                'status'          => 'aktif',
                'kelas_id'        => $kelasId,
            ]);
            $imported++;
        }

        Session::forget(['import_preview', 'import_errors', 'import_kelas_id']);

        return redirect()->route('admin.murid.index')
            ->with('success', "Import selesai: {$imported} murid ditambahkan ke kelas, {$skipped} dilewati.");
    }
}
