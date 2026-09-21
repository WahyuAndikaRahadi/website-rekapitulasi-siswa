<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\GuruController as AdminGuruController;
use App\Http\Controllers\Admin\KelasController as AdminKelasController;
use App\Http\Controllers\Admin\LaporanController as AdminLaporanController;

use App\Http\Controllers\Admin\MuridController as AdminMuridController;
use App\Http\Controllers\Admin\TahunAjaranController as AdminTahunAjaranController;
use App\Http\Controllers\Admin\ExportController as AdminExportController;
use App\Http\Controllers\Admin\SuratPanggilanController as AdminSuratPanggilanController;
use App\Http\Controllers\Guru\DashboardController as GuruDashboardController;
use App\Http\Controllers\Guru\LaporanController as GuruLaporanController;
use App\Http\Controllers\Guru\RekapKelasController as GuruRekapKelasController;
use Illuminate\Support\Facades\Route;

// Root redirect ke login
Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

// ── Guru ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:guru'])->prefix('guru')->name('guru.')->group(function () {
    Route::get('/dashboard', [GuruDashboardController::class, 'index'])->name('dashboard');

    // Laporan
    Route::get('/laporan/buat',           [GuruLaporanController::class, 'create'])->name('laporan.create');
    Route::post('/laporan',               [GuruLaporanController::class, 'store'])->name('laporan.store');
    Route::get('/laporan/riwayat',        [GuruLaporanController::class, 'riwayat'])->name('laporan.riwayat');
    Route::get('/laporan/{laporan}/edit', [GuruLaporanController::class, 'edit'])->name('laporan.edit');
    Route::put('/laporan/{laporan}',      [GuruLaporanController::class, 'update'])->name('laporan.update');

    // Autocomplete murid (JSON)
    Route::get('/murid/search', [GuruLaporanController::class, 'searchMurid'])->name('murid.search');

    // Rekap kelas (wali kelas saja — diproteksi di controller)
    Route::get('/kelas/rekap', [GuruRekapKelasController::class, 'index'])->name('kelas.rekap');
});

// ── Admin ─────────────────────────────────────────────────────────────────────
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Laporan
    Route::get('/laporan',                          [AdminLaporanController::class, 'index'])->name('laporan.index');
    Route::get('/laporan/{laporan}',                [AdminLaporanController::class, 'show'])->name('laporan.show');
    Route::patch('/laporan/{laporan}/status',       [AdminLaporanController::class, 'updateStatus'])->name('laporan.update-status');
    Route::patch('/laporan/{laporan}/tindaklanjut', [AdminLaporanController::class, 'tindakLanjut'])->name('laporan.tindaklanjut');


    // Kelas tidak punya halaman show/create terpisah — gunakan only() agar route tidak dibuat
    Route::resource('/kelas', AdminKelasController::class)->only(['index', 'store', 'update', 'destroy'])->names('kelas');

    // Murid
    Route::post('/murid/naik-kelas', [AdminMuridController::class, 'naikKelas'])->name('murid.naik-kelas');
    Route::resource('/murid', AdminMuridController::class)->only(['index', 'store', 'update', 'destroy'])->names('murid');
    Route::get('/murid-import',  [AdminMuridController::class, 'importForm'])->name('murid.import.form');
    Route::get('/murid-import/template', [AdminMuridController::class, 'downloadTemplate'])->name('murid.import.template');
    Route::post('/murid-import', [AdminMuridController::class, 'importProcess'])->name('murid.import.process');
    Route::post('/murid-import/confirm', [AdminMuridController::class, 'importConfirm'])->name('murid.import.confirm');
    Route::post('/murid-import/cancel',  [AdminMuridController::class, 'importCancel'])->name('murid.import.cancel');

    // Guru
    Route::resource('/guru', AdminGuruController::class)->names('guru');
    Route::get('/guru/{guru}/mapping-kelas',  [AdminGuruController::class, 'mappingKelas'])->name('guru.mapping-kelas');
    Route::post('/guru/{guru}/mapping-kelas', [AdminGuruController::class, 'syncMappingKelas'])->name('guru.mapping-kelas.sync');

    // Export
    Route::get('/export', [AdminExportController::class, 'index'])->name('export.index');
    Route::post('/export/laporan', [AdminExportController::class, 'exportLaporan'])->name('export.laporan');
    Route::post('/export/murid',   [AdminExportController::class, 'exportMurid'])->name('export.murid');
    Route::post('/export/kelas',   [AdminExportController::class, 'exportKelas'])->name('export.kelas');

    // Surat Pemanggilan Orang Tua
    Route::get('/surat-panggilan', [AdminSuratPanggilanController::class, 'index'])->name('surat-panggilan.index');
    Route::post('/surat-panggilan', [AdminSuratPanggilanController::class, 'store'])->name('surat-panggilan.store');
    Route::get('/surat-panggilan/info-murid/{murid}', [AdminSuratPanggilanController::class, 'infoMurid'])->name('surat-panggilan.info-murid');
    Route::get('/surat-panggilan/{suratPanggil}/pdf', [AdminSuratPanggilanController::class, 'previewPdf'])->name('surat-panggilan.pdf');
    Route::get('/surat-panggilan/{suratPanggil}/download', [AdminSuratPanggilanController::class, 'downloadPdf'])->name('surat-panggilan.download');
    Route::delete('/surat-panggilan/{suratPanggil}', [AdminSuratPanggilanController::class, 'destroy'])->name('surat-panggilan.destroy');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
