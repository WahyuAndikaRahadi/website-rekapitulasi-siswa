<?php

namespace App\Http\Controllers\Admin;

use App\Exports\KelasExport;
use App\Exports\LaporanExport;
use App\Exports\MuridExport;
use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\TahunAjaran;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function index(): Response
    {
        $tahunAjaran = TahunAjaran::aktif();

        return Inertia::render('admin/export/index', [
            'kelas_list'    => Kelas::where('tahun_ajaran_id', $tahunAjaran?->id)->orderBy('nama_kelas')->get(['id', 'nama_kelas']),
            'tahun_ajarans' => TahunAjaran::orderByDesc('label')->get(['id', 'label']),
            'tahun_ajaran_aktif' => $tahunAjaran ? ['id' => $tahunAjaran->id, 'label' => $tahunAjaran->label] : null,
        ]);
    }

    public function exportLaporan(Request $request)
    {
        $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'kelas_id'        => ['nullable', 'exists:kelas,id'],
            'dari'            => ['nullable', 'date'],
            'sampai'          => ['nullable', 'date'],
        ]);

        $filename = 'laporan-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new LaporanExport(
            $request->tahun_ajaran_id,
            $request->kelas_id,
            $request->dari,
            $request->sampai,
        ), $filename);
    }

    public function exportMurid(Request $request)
    {
        $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'kelas_id'        => ['nullable', 'exists:kelas,id'],
        ]);

        $filename = 'murid-skor-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new MuridExport(
            $request->tahun_ajaran_id,
            $request->kelas_id,
        ), $filename);
    }

    public function exportKelas(Request $request)
    {
        $request->validate([
            'tahun_ajaran_id' => ['required', 'exists:tahun_ajarans,id'],
            'kelas_id'        => ['nullable', 'exists:kelas,id'],
        ]);

        $filename = 'kelas-akumulasi-skor-' . now()->format('Ymd-His') . '.xlsx';

        return Excel::download(new KelasExport(
            $request->tahun_ajaran_id,
            $request->kelas_id,
        ), $filename);
    }
}

